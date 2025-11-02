import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { PaperCard } from './PaperCard';

export const PapersListView: React.FC = () => {
  const { papers, searchTerm, setSearchTerm } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year'>('relevance');
  
  // Filter and sort papers
  const filteredPapers = useMemo(() => {
    let filtered = papers;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(term) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(term)) ||
        paper.authors.some(author => author.toLowerCase().includes(term))
      );
    }
    
    // Sort papers
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.relevance_score || 0) - (a.relevance_score || 0);
        case 'citations':
          return b.citation_count - a.citation_count;
        case 'year':
          return (b.year || 0) - (a.year || 0);
        default:
          return 0;
      }
    });
  }, [papers, searchTerm, sortBy]);
  
  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No papers available yet. Run a search to get started.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search input */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers by title, abstract, or author..."
              className={`
                w-full pl-12 pr-10 py-3 rounded-2xl border
                backdrop-blur-xl transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${isDarkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                  : 'bg-white/60 border-primary/20 text-gray-900 placeholder-gray-500'
                }
              `}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`
              px-4 py-3 rounded-2xl border backdrop-blur-xl
              cursor-pointer transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${isDarkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white/60 border-primary/20 text-gray-900'
              }
            `}
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="citations">Sort by Citations</option>
            <option value="year">Sort by Year</option>
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {filteredPapers.length} of {papers.length} papers
      </div>
      
      {/* Papers grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredPapers.map((paper, index) => (
          <motion.div
            key={paper.paper_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <PaperCard paper={paper} />
          </motion.div>
        ))}
      </motion.div>
      
      {filteredPapers.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No papers match your search.
          </p>
        </div>
      )}
    </div>
  );
};
