import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { Paper } from '@/types/pipeline.types';
import { useUIStore } from '@/stores/uiStore';

interface PaperCardProps {
  paper: Paper;
  showRank?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, showRank = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkMode } = useUIStore();
  
  const hasAbstract = paper.abstract && paper.abstract.length > 0;
  const abstractPreview = paper.abstract 
    ? paper.abstract.slice(0, 150) + (paper.abstract.length > 150 ? '...' : '')
    : 'No abstract available';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        group relative backdrop-blur-xl rounded-2xl p-6 border
        transition-all duration-300 hover:shadow-xl
        ${isDarkMode
          ? 'bg-white/5 border-white/10 hover:bg-white/8'
          : 'bg-white/60 border-primary/20 hover:bg-white/80'
        }
      `}
    >
      {/* Rank badge */}
      {showRank && paper.final_rank && (
        <div className={`
          absolute top-4 right-4 w-10 h-10 rounded-full
          flex items-center justify-center font-bold text-sm
          ${paper.final_rank <= 3
            ? paper.final_rank === 1
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
              : paper.final_rank === 2
                ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
            : isDarkMode
              ? 'bg-white/10 text-gray-300'
              : 'bg-gray-100 text-gray-600'
          }
        `}>
          #{paper.final_rank}
        </div>
      )}
      
      {/* Title */}
      <h3 className={`
        text-xl font-bold mb-3 pr-12 group-hover:text-primary transition-colors
        ${isDarkMode ? 'text-white' : 'text-gray-900'}
      `}>
        {paper.url ? (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            {paper.title}
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          paper.title
        )}
      </h3>
      
      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        {paper.authors && paper.authors.length > 0 && (
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span>{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 && ` +${paper.authors.length - 3}`}</span>
          </div>
        )}
        {paper.year && (
          <div className="flex items-center gap-1 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{paper.year}</span>
          </div>
        )}
        {paper.venue && (
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{paper.venue}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-amber-400">
          <Award className="w-4 h-4" />
          <span className="font-semibold">{paper.citation_count} citations</span>
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {paper.relevance_score !== undefined && (
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${paper.relevance_score >= 0.8
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : paper.relevance_score >= 0.6
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }
          `}>
            Relevance: {(paper.relevance_score * 100).toFixed(0)}%
          </span>
        )}
        {paper.theme && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {paper.theme}
          </span>
        )}
        {paper.methodology && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {paper.methodology}
          </span>
        )}
      </div>
      
      {/* Abstract */}
      {hasAbstract && (
        <div className="relative">
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isExpanded ? paper.abstract : abstractPreview}
          </p>
          
          {paper.abstract && paper.abstract.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`
                mt-2 flex items-center gap-1 text-sm font-medium
                transition-colors
                ${isDarkMode ? 'text-primary hover:text-primary-light' : 'text-primary-dark hover:text-primary'}
              `}
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary-light/0 group-hover:from-primary/5 group-hover:to-primary-light/5 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};
