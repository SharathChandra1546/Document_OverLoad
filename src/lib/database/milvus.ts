import { MilvusClient, DataType, CreateCollectionReq, InsertReq, SearchReq } from '@zilliz/milvus2-sdk-node';
import { databaseConfig } from '../config/database';

export interface VectorChunk {
  id: string;
  document_id: string;
  vector: number[];
  chunk_index: number;
  content_snippet: string;
}

export interface SearchResult {
  id: string;
  document_id: string;
  score: number;
  content_snippet: string;
  chunk_index: number;
}

class MilvusConnection {
  private client: MilvusClient | null = null;
  private isConnected = false;
  private readonly collectionName = 'document_vectors';

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      // Only initialize if not in build mode
      if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Skipping Milvus initialization during build');
        return;
      }
      
      this.client = new MilvusClient({
        address: databaseConfig.milvus.address,
        username: databaseConfig.milvus.username,
        password: databaseConfig.milvus.password,
        database: databaseConfig.milvus.database,
        token: databaseConfig.milvus.token,
      });
      console.log('Milvus client initialized');
    } catch (error) {
      console.error('Failed to initialize Milvus client:', error);
      // Don't throw during build - just log the error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Milvus connection will be retried when needed');
      }
    }
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Milvus client not initialized');
    }

    try {
      // Test connection by checking server version
      const version = await this.client.getVersion();
      console.log('Connected to Milvus server version:', version);
      this.isConnected = true;
      
      // Ensure collection exists
      await this.ensureCollection();
    } catch (error) {
      console.error('Failed to connect to Milvus:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async ensureCollection(): Promise<void> {
    if (!this.client) {
      throw new Error('Milvus client not initialized');
    }

    try {
      // Check if collection exists
      const hasCollection = await this.client.hasCollection({
        collection_name: this.collectionName,
      });

      if (!hasCollection.value) {
        console.log('Creating Milvus collection:', this.collectionName);
        await this.createCollection();
      } else {
        console.log('Milvus collection already exists:', this.collectionName);
      }

      // Load collection into memory
      await this.client.loadCollection({
        collection_name: this.collectionName,
      });

    } catch (error) {
      console.error('Failed to ensure Milvus collection:', error);
      throw error;
    }
  }

  private async createCollection(): Promise<void> {
    if (!this.client) {
      throw new Error('Milvus client not initialized');
    }

    const collectionSchema: CreateCollectionReq = {
      collection_name: this.collectionName,
      description: 'Document vectors for semantic search',
      fields: [
        {
          name: 'id',
          description: 'Unique identifier for the vector chunk',
          data_type: DataType.VarChar,
          max_length: 36,
          is_primary_key: true,
        },
        {
          name: 'document_id',
          description: 'Reference to the document in PostgreSQL',
          data_type: DataType.VarChar,
          max_length: 36,
        },
        {
          name: 'vector',
          description: 'Document content embedding vector',
          data_type: DataType.FloatVector,
          dim: 1536, // OpenAI embedding dimension
        },
        {
          name: 'chunk_index',
          description: 'Index of the chunk within the document',
          data_type: DataType.Int32,
        },
        {
          name: 'content_snippet',
          description: 'Text snippet for this vector chunk',
          data_type: DataType.VarChar,
          max_length: 1000,
        },
      ],
    };

    try {
      await this.client.createCollection(collectionSchema);
      
      // Create index for vector field
      await this.client.createIndex({
        collection_name: this.collectionName,
        field_name: 'vector',
        index_type: 'IVF_FLAT',
        metric_type: 'COSINE',
        params: { nlist: 1024 },
      });

      console.log('Milvus collection created successfully');
    } catch (error) {
      console.error('Failed to create Milvus collection:', error);
      throw error;
    }
  }

  async insertVectors(vectors: VectorChunk[]): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Milvus client not connected');
    }

    if (vectors.length === 0) {
      return;
    }

    try {
      const insertData: InsertReq = {
        collection_name: this.collectionName,
        data: vectors.map(v => ({
          id: v.id,
          document_id: v.document_id,
          vector: v.vector,
          chunk_index: v.chunk_index,
          content_snippet: v.content_snippet,
        })),
      };

      const result = await this.client.insert(insertData);
      
      if (result.status.error_code !== 'Success') {
        throw new Error(`Milvus insert failed: ${result.status.reason}`);
      }

      console.log(`Inserted ${vectors.length} vectors into Milvus`);
    } catch (error) {
      console.error('Failed to insert vectors into Milvus:', error);
      throw error;
    }
  }

  async searchVectors(
    queryVector: number[],
    limit: number = 10,
    documentIds?: string[]
  ): Promise<SearchResult[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Milvus client not connected');
    }

    try {
      const searchParams: SearchReq = {
        collection_name: this.collectionName,
        vectors: [queryVector],
        vector_type: 101, // FloatVector type
        search_params: {
          anns_field: 'vector',
          topk: limit,
          metric_type: 'L2',
          params: JSON.stringify({ nprobe: 10 }),
        },
        output_fields: ['id', 'document_id', 'chunk_index', 'content_snippet'],
      };

      // Add document ID filter if specified
      if (documentIds && documentIds.length > 0) {
        searchParams.search_params.params = JSON.stringify({ 
          nprobe: 10,
          filter: `document_id in [${documentIds.map(id => `"${id}"`).join(',')}]`
        });
      }

      const result = await this.client.search(searchParams);

      if (result.status.error_code !== 'Success') {
        throw new Error(`Milvus search failed: ${result.status.reason}`);
      }

      return result.results.map((hit: any) => ({
        id: hit.id as string,
        document_id: hit.document_id as string,
        score: hit.score,
        content_snippet: hit.content_snippet as string,
        chunk_index: hit.chunk_index as number,
      }));

    } catch (error) {
      console.error('Failed to search vectors in Milvus:', error);
      throw error;
    }
  }

  async deleteVectors(documentId: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Milvus client not connected');
    }

    try {
      await this.client.delete({
        collection_name: this.collectionName,
        filter: `document_id == "${documentId}"`,
      });

      console.log(`Deleted vectors for document: ${documentId}`);
    } catch (error) {
      console.error('Failed to delete vectors from Milvus:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        // Release collection from memory
        await this.client.releaseCollection({
          collection_name: this.collectionName,
        });
        
        this.isConnected = false;
        console.log('Milvus connection closed');
      } catch (error) {
        console.error('Error closing Milvus connection:', error);
        throw error;
      }
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }
      
      const version = await this.client.getVersion();
      return !!version;
    } catch (error) {
      console.error('Milvus health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const milvus = new MilvusConnection();

// Helper function for vector operations
export const withVectorDB = async <T>(
  operation: (db: MilvusConnection) => Promise<T>
): Promise<T> => {
  try {
    if (!milvus.isHealthy()) {
      await milvus.connect();
    }
    return await operation(milvus);
  } catch (error) {
    console.error('Vector database operation failed:', error);
    throw error;
  }
};