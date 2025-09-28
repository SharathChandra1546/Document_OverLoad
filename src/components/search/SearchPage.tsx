'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecentDocuments } from '@/contexts/RecentDocumentsContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { documents } = useRecentDocuments();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Client-side search over RecentDocuments
    const q = query.toLowerCase();
    const results = documents
      .map(doc => {
        const haystack = [doc.title || '', doc.fileName || '', doc.textContent || ''].join(' ').toLowerCase();
        const matched = haystack.includes(q);
        if (!matched) return null;
        const relevanceScore = Math.min(1, Math.max(0.5, q.length / Math.max(10, haystack.length)));
        const snippetSource = (doc.textContent || '').toLowerCase();
        const idx = snippetSource.indexOf(q);
        const snippet = idx >= 0
          ? (doc.textContent || '').slice(Math.max(0, idx - 60), idx + q.length + 60)
          : (doc.textContent || '').slice(0, 120);
        return {
          document: {
            id: doc.id,
            title: doc.title,
            fileType: doc.fileType,
            fileSize: doc.size,
          },
          snippet,
          relevanceScore,
          matchedTerms: [query],
        };
      })
      .filter(Boolean);

    setSearchResults(results as any[]);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'danger';
  };

  const getRelevanceText = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Document Search
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Search through your documents using natural language queries
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search documents... (e.g., 'financial report', 'safety policies', 'contract agreement')"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery('financial report')}
              >
                Financial Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery('safety policies')}
              >
                Safety Policies
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery('contract')}
              >
                Contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery('technical')}
              >
                Technical
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search Results
            </h2>
            {!isSearching && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {isSearching ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Searching through documents...
                </p>
              </CardContent>
            </Card>
          ) : searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 005.291-1.709" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try different keywords or check your spelling
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <Card key={index} hover>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {result.document.title}
                          </h3>
                          
                          <Badge variant={getRelevanceColor(result.relevanceScore) as any}>
                            {getRelevanceText(result.relevanceScore)} Relevance
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {result.snippet}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span>Size: {result.document.fileSize}</span>
                        </div>
                        
                        
                        
                        {result.matchedTerms.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Matched terms: 
                            </span>
                            <div className="inline-flex flex-wrap gap-1 ml-2">
                              {result.matchedTerms.map((term: string, termIndex: number) => (
                                <span key={termIndex} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                                  {term}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {result.document.fileType}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {result.document.fileType} • {result.document.fileSize}
                        </span>
                      </div>
                      
                      <Link href={`/document/${result.document.id}`}>
                        <Button variant="primary" size="sm">
                          View Document
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Tips
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Natural Language Queries
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• "Show me all financial reports from 2024"</li>
                <li>• "Find documents about safety policies"</li>
                <li>• "Contract agreements that are expiring soon"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Advanced Search
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use quotes for exact phrases</li>
                <li>• Combine keywords with AND/OR</li>
                <li>• Filter by language, date, or tags</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPage;
