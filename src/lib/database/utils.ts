import { QueryResult } from 'pg';
import { postgres } from './postgres';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class DatabaseUtils {
  /**
   * Execute a paginated query
   */
  static async paginatedQuery<T>(
    baseQuery: string,
    countQuery: string,
    params: any[] = [],
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = options.offset ?? (page - 1) * limit;

    try {
      // Get total count
      const countResult = await postgres.query(countQuery, params);
      const total = parseInt(countResult.rows[0]?.count || '0');

      // Get paginated data
      const dataQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const dataResult = await postgres.query(dataQuery, [...params, limit, offset]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Paginated query failed:', error);
      throw error;
    }
  }

  /**
   * Build WHERE clause from filters
   */
  static buildWhereClause(
    filters: Record<string, any>,
    startParamIndex: number = 1
  ): { whereClause: string; params: any[]; nextParamIndex: number } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = startParamIndex;

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            conditions.push(`${key} = ANY(ARRAY[${placeholders}])`);
            params.push(...value);
          }
        } else if (typeof value === 'string' && value.includes('%')) {
          conditions.push(`${key} ILIKE $${paramIndex++}`);
          params.push(value);
        } else {
          conditions.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    return {
      whereClause,
      params,
      nextParamIndex: paramIndex,
    };
  }

  /**
   * Build ORDER BY clause
   */
  static buildOrderByClause(
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    allowedColumns: string[] = []
  ): string {
    if (!sortBy || !allowedColumns.includes(sortBy)) {
      return '';
    }

    return `ORDER BY ${sortBy} ${sortOrder}`;
  }

  /**
   * Execute query with retry logic
   */
  static async queryWithRetry(
    query: string,
    params: any[] = [],
    maxRetries: number = 3
  ): Promise<QueryResult> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await postgres.query(query, params);
      } catch (error) {
        lastError = error as Error;
        console.error(`Query attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Check if a record exists
   */
  static async exists(
    table: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    const { whereClause, params } = this.buildWhereClause(conditions);
    const query = `SELECT 1 FROM ${table} ${whereClause} LIMIT 1`;
    
    try {
      const result = await postgres.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Exists check failed:', error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   */
  static async findById<T>(
    table: string,
    id: string,
    columns: string = '*'
  ): Promise<T | null> {
    const query = `SELECT ${columns} FROM ${table} WHERE id = $1 LIMIT 1`;
    
    try {
      const result = await postgres.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Find by ID failed:', error);
      throw error;
    }
  }

  /**
   * Insert a record and return it
   */
  static async insert<T>(
    table: string,
    data: Record<string, any>,
    returningColumns: string = '*'
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returningColumns}
    `;
    
    try {
      const result = await postgres.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Insert failed:', error);
      throw error;
    }
  }

  /**
   * Update a record by ID and return it
   */
  static async updateById<T>(
    table: string,
    id: string,
    data: Record<string, any>,
    returningColumns: string = '*'
  ): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $1
      RETURNING ${returningColumns}
    `;
    
    try {
      const result = await postgres.query(query, [id, ...values]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Update by ID failed:', error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  static async deleteById(table: string, id: string): Promise<boolean> {
    const query = `DELETE FROM ${table} WHERE id = $1`;
    
    try {
      const result = await postgres.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Delete by ID failed:', error);
      throw error;
    }
  }

  /**
   * Soft delete a record by ID (set status to 'deleted')
   */
  static async softDeleteById(table: string, id: string): Promise<boolean> {
    const query = `UPDATE ${table} SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
    
    try {
      const result = await postgres.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Soft delete by ID failed:', error);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  static async transaction<T = any>(
    operations: Array<{ query: string; params?: any[] }>
  ): Promise<T[]> {
    return await postgres.transaction(async (client) => {
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await client.query(operation.query, operation.params || []);
        results.push(result.rows[0] as T);
      }
      
      return results;
    });
  }
}

// Export commonly used database operations
export const {
  paginatedQuery,
  buildWhereClause,
  buildOrderByClause,
  queryWithRetry,
  exists,
  findById,
  insert,
  updateById,
  deleteById,
  softDeleteById,
  transaction,
} = DatabaseUtils;