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
        glass-artistic rounded-3xl p-8 border shadow-2xl
        ${isDarkMode 
          ? 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 border-white/10 hover:from-white/12 hover:via-white/8 hover:to-white/5 hover:border-secondary/40' 
          : 'bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-secondary/30 hover:from-white/90 hover:via-white/80 hover:to-white/70 hover:border-primary/50'
        }
      `}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Keywords */}
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-primary-theme-dark' : 'text-primary-theme-light'
            }`}
          >
            Research Keywords
          </label>
          
          {/* Keyword tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword) => (
              <motion.span
                key={keyword}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                  backdrop-blur-md border transition-all shadow-lg
                  ${isDarkMode 
                    ? 'bg-gradient-to-r from-sunset-amber/35 to-sunset-gold/30 border-sunset-gold/40 text-horizon-cream hover:from-sunset-amber/45 hover:to-sunset-gold/40' 
                    : 'bg-gradient-to-r from-sunset-peach/50 to-sunset-gold/30 border-sunset-coral/40 text-twilight-navy hover:from-sunset-peach/60 hover:to-sunset-gold/40'
                  }
                `}
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:opacity-70 transition-opacity hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.span>
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
                flex-1 px-4 py-3 rounded-xl border backdrop-blur-md
                focus:outline-none focus:ring-2 transition-all
                ${isDarkMode
                  ? 'bg-white/8 border-white/15 text-white placeholder-gray-400 focus:ring-primary/50 focus:border-primary/40'
                  : 'bg-white/90 border-secondary/40 text-gray-900 placeholder-gray-500 focus:ring-primary/40 focus:border-primary/50'
                }
              `}
            />
            <motion.button
              type="button"
              onClick={addKeyword}
              disabled={!currentKeyword.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-md border
                ${isDarkMode
                  ? 'bg-gradient-to-r from-sunset-amber/35 to-sunset-gold/30 border-sunset-gold/40 text-horizon-cream hover:from-sunset-amber/45 hover:to-sunset-gold/40'
                  : 'bg-gradient-to-r from-sunset-peach/50 to-sunset-gold/30 border-sunset-coral/40 text-twilight-navy hover:from-sunset-peach/60 hover:to-sunset-gold/40'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Max papers */}
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-primary-theme-dark' : 'text-primary-theme-light'
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
        <motion.button
          type="submit"
          disabled={keywords.length === 0 || isLoading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`
            w-full px-8 py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3
            transition-all duration-300 shadow-lg backdrop-blur-md
            ${isDarkMode
              ? 'bg-gradient-to-r from-sunset-coral via-sunset-gold to-sunset-amber text-twilight-navy hover:shadow-[0_0_35px_rgba(255,157,92,0.5)]'
              : 'bg-gradient-to-r from-sunset-amber via-sunset-gold to-sunset-peach text-twilight-navy hover:shadow-[0_0_30px_rgba(255,184,77,0.4)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          <Search className="w-6 h-6" />
          {isLoading ? 'Starting Pipeline...' : 'Start Literature Review'}
        </motion.button>
      </form>
    </motion.div>
  );
};
