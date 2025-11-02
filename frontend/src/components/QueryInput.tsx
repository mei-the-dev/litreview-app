import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { pipelineAPI } from '@/services/apiService';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';

export const QueryInput: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [maxPapers, setMaxPapers] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setSessionId, initializeStages, reset } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  const addKeyword = () => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setCurrentKeyword('');
    }
  };
  
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }
    
    setIsLoading(true);
    reset();
    
    try {
      const response = await pipelineAPI.startPipeline({
        keywords,
        max_papers: maxPapers,
      });
      
      setSessionId(response.session_id);
      initializeStages();
      
    } catch (error: any) {
      console.error('Failed to start pipeline:', error);
      alert('Failed to start pipeline: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        backdrop-blur-xl rounded-3xl p-8 border shadow-2xl
        ${isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/50 border-primary/20'
        }
      `}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Keywords */}
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Research Keywords
          </label>
          
          {/* Keyword tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  ${isDarkMode 
                    ? 'bg-primary/20 text-accent' 
                    : 'bg-primary/10 text-primary-dark'
                  }
                `}
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          
          {/* Keyword input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder="Enter keyword..."
              className={`
                flex-1 px-4 py-3 rounded-xl border backdrop-blur-sm
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${isDarkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'
                }
              `}
            />
            <button
              type="button"
              onClick={addKeyword}
              disabled={!currentKeyword.trim()}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all
                ${isDarkMode
                  ? 'bg-primary/20 text-accent hover:bg-primary/30'
                  : 'bg-primary/10 text-primary-dark hover:bg-primary/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Max papers */}
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Maximum Papers: {maxPapers}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={maxPapers}
            onChange={(e) => setMaxPapers(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={keywords.length === 0 || isLoading}
          className={`
            w-full px-8 py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3
            transition-all duration-300 shadow-lg
            ${isDarkMode
              ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-primary/50'
              : 'bg-gradient-to-r from-primary-dark to-primary text-white hover:shadow-primary-dark/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
          `}
        >
          <Search className="w-6 h-6" />
          {isLoading ? 'Starting Pipeline...' : 'Start Literature Review'}
        </button>
      </form>
    </motion.div>
  );
};
