import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { PaperCard } from './PaperCard';

type SortColumn = 'rank' | 'relevance' | 'citations' | 'year';
type SortDirection = 'asc' | 'desc';

export const RankingTable: React.FC = () => {
  const { rankedPapers } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  const [sortColumn, setSortColumn] = useState<SortColumn>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  
  const sortedPapers = useMemo(() => {
    const papers = [...rankedPapers];
    papers.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'rank':
          comparison = (a.final_rank || 0) - (b.final_rank || 0);
          break;
        case 'relevance':
          comparison = (b.relevance_score || 0) - (a.relevance_score || 0);
          break;
        case 'citations':
          comparison = b.citation_count - a.citation_count;
          break;
        case 'year':
          comparison = (b.year || 0) - (a.year || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return papers;
  }, [rankedPapers, sortColumn, sortDirection]);
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };
  
  if (rankedPapers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No ranked papers available yet. The pipeline needs to complete stage 5.
        </p>
      </div>
    );
  }
  
  // Get top 10 for display
  const displayPapers = sortedPapers.slice(0, Math.min(10, sortedPapers.length));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Top {displayPapers.length} Papers
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Click column headers to sort
        </p>
      </div>
      
      {/* Responsive table */}
      <div className={`
        backdrop-blur-xl rounded-3xl border overflow-hidden
        ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
      `}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-primary/20'}`}>
                <th 
                  className={`px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-2">
                    Rank
                    <SortIcon column="rank" />
                  </div>
                </th>
                <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </th>
                <th 
                  className={`px-6 py-4 text-center cursor-pointer hover:bg-white/5 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('relevance')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Relevance
                    <SortIcon column="relevance" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-center cursor-pointer hover:bg-white/5 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('citations')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Citations
                    <SortIcon column="citations" />
                  </div>
                </th>
                <th 
                  className={`px-6 py-4 text-center cursor-pointer hover:bg-white/5 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => handleSort('year')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Year
                    <SortIcon column="year" />
                  </div>
                </th>
                <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Theme
                </th>
              </tr>
            </thead>
            <tbody>
              {displayPapers.map((paper, index) => {
                const isTopThree = (paper.final_rank || 0) <= 3;
                const isExpanded = expandedPaper === paper.paper_id;
                
                return (
                  <React.Fragment key={paper.paper_id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        border-b cursor-pointer transition-colors
                        ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-primary/10 hover:bg-white/40'}
                        ${isTopThree ? (isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50/50') : ''}
                      `}
                      onClick={() => setExpandedPaper(isExpanded ? null : paper.paper_id)}
                    >
                      <td className="px-6 py-4">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${paper.final_rank === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                            : paper.final_rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : paper.final_rank === 3
                                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                : isDarkMode
                                  ? 'bg-white/10 text-gray-300'
                                  : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {paper.final_rank}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="max-w-md">
                          <p className="font-semibold truncate">{paper.title}</p>
                          {paper.authors && paper.authors.length > 0 && (
                            <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && '...'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {paper.relevance_score !== undefined && (
                          <span className={`
                            px-3 py-1 rounded-full text-sm font-semibold inline-block
                            ${paper.relevance_score >= 0.8
                              ? 'bg-green-500/20 text-green-400'
                              : paper.relevance_score >= 0.6
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }
                          `}>
                            {(paper.relevance_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-center font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {paper.citation_count}
                      </td>
                      <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {paper.year || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {paper.theme && (
                          <span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400 inline-block truncate max-w-[150px]">
                            {paper.theme}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4">
                          <PaperCard paper={paper} showRank />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
