'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useRecentDocuments } from '@/contexts/RecentDocumentsContext';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const filterOptions = ['PDF', 'DOCX', 'TXT', 'XLS', 'PPT'];
const quickSearches = ['financial report', 'safety policies', 'contract', 'technical'];

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');

  const { documents } = useRecentDocuments();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

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
            uploadedAt: doc.uploadedAt
          },
          snippet,
          relevanceScore,
          matchedTerms: [query],
        };
      })
      .filter(Boolean) as any[];

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
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

  const filteredResults = searchResults.filter(result => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.includes(result.document.fileType);
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.document.uploadedAt || 0).getTime() - new Date(a.document.uploadedAt || 0).getTime();
      case 'name':
        return a.document.title.localeCompare(b.document.title);
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:px-12 md:py-12">
      {/* Header */}
      <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">Document Search</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Search through your documents using natural language queries
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Search documents... (e.g., 'financial report', 'safety policies', 'contract agreement')"
          className="w-full px-6 py-3 pr-16 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-emerald-500 focus:ring-4 focus:ring-opacity-20 dark:focus:ring-emerald-400 dark:focus:ring-opacity-20 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500 transition-shadow duration-300"
        />
        <Button
          onClick={handleSearch}
          variant="emerald"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-2xl"
          disabled={isSearching}
        >
          Search
        </Button>
      </div>

      {/* Quick Searches */}
      <div className="flex flex-wrap gap-3 mb-8">
        {quickSearches.map(searchTerm => (
          <Button
            key={searchTerm}
            variant="outline"
            onClick={() => setQuery(searchTerm)}
            className="h-10 px-4 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200"
          >
            {searchTerm}
          </Button>
        ))}
      </div>

      {/* Filters and Sort */}
      {hasSearched && (
        <section className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300">File Type Filters:</span>
            {filterOptions.map(filter => {
              const isSelected = selectedFilters.includes(filter);
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterToggle(filter)}
                  className={`px-5 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white border-transparent shadow-lg'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className="px-6 py-2 text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-700 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="max-w-xs">
            <label htmlFor="sortBy" className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-5 py-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
          </div>
        </section>
      )}

      {/* Search Results */}
      {hasSearched && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
            Search Results
            {!isSearching && (
              <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                ({sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} found)
              </span>
            )}
          </h2>

          {isSearching ? (
            <p className="text-slate-700 dark:text-slate-300">Searching through documents...</p>
          ) : sortedResults.length === 0 ? (
            <div className="text-center py-12 text-slate-700 dark:text-slate-400">
              <p className="mb-2 font-semibold">No results found</p>
              <p>Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedResults.map((result, index) => (
                <Card key={result.document.id} className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 truncate">{result.document.title}</h3>
                      <Badge type={getRelevanceColor(result.relevanceScore)}>{getRelevanceText(result.relevanceScore)} Relevance</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.snippet}</p>
                    <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600 dark:text-slate-400">
                      <span>{result.document.fileType} • {result.document.fileSize}</span>
                      <span>Score: {Math.round(result.relevanceScore * 100)}%</span>
                      {result.matchedTerms.length > 0 && (
                        <span className="flex gap-2 items-center">
                          Matched terms:
                          {result.matchedTerms.map((term: string, termIndex: number) => (
                            <Badge key={`${term}-${termIndex}`} type="info">{term}</Badge>
                          ))}
                        </span>
                      )}
                      <Link href={`/documents/${result.document.id}`} className="ml-auto text-emerald-600 hover:text-emerald-400 dark:hover:text-emerald-500 transition-colors" aria-label="View Document">
                        👁️ View Document
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <section className="mt-20 px-6 py-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-slate-900 dark:text-white max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Search Tips</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Natural Language Queries</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>"Show me all financial reports from 2024"</li>
              <li>"Find documents about safety policies"</li>
              <li>"Contract agreements that are expiring soon"</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use quotes for exact phrases</li>
              <li>Combine keywords with AND/OR</li>
              <li>Filter by file type or content</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
