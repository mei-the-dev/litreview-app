import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Download, RotateCcw } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { usePipelineStore } from '@/stores/pipelineStore';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { pdfPath, reset, isRunning } = usePipelineStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        glass-artistic rounded-3xl p-8 border shadow-2xl mb-8
        ${isDarkMode 
          ? 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 border-white/10' 
          : 'bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-secondary/30'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className={`text-5xl font-bold mb-2 bg-gradient-to-r ${
              isDarkMode
                ? 'from-primary-light via-secondary-light to-primary text-golden-glow'
                : 'from-primary-dark via-primary to-secondary-dark'
            } bg-clip-text text-transparent`}
          >
            LitReview
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Automated Academic Literature Review System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Download PDF button */}
          {pdfPath && (
            <motion.a
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`http://localhost:8000${pdfPath.replace('./output', '/output')}`}
              download
              className={`
                p-4 rounded-2xl backdrop-blur-md border transition-all shadow-lg
                flex items-center gap-2 font-semibold
                ${isDarkMode
                  ? 'bg-gradient-to-r from-success/25 to-success/20 border-success/40 text-success hover:from-success/35 hover:to-success/30 shadow-[0_0_15px_rgba(139,195,74,0.3)]'
                  : 'bg-gradient-to-r from-success/15 to-success/10 border-success/30 text-success hover:from-success/25 hover:to-success/20 shadow-[0_0_10px_rgba(139,195,74,0.2)]'
                }
              `}
            >
              <Download className="w-5 h-5" />
              Download PDF
            </motion.a>
          )}
          
          {/* Reset button */}
          {!isRunning && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -90 }}
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              className={`
                p-4 rounded-2xl backdrop-blur-md border transition-all
                ${isDarkMode
                  ? 'bg-white/8 border-white/15 text-secondary-light hover:bg-white/12 hover:border-secondary/40'
                  : 'bg-white/90 border-secondary/40 text-primary hover:bg-white hover:border-primary/50'
                }
              `}
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
          )}
          
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`
              p-4 rounded-2xl backdrop-blur-md border transition-all
              ${isDarkMode
                ? 'bg-gradient-to-br from-primary/30 to-secondary/25 border-primary/40 text-secondary-light hover:from-primary/40 hover:to-secondary/35'
                : 'bg-gradient-to-br from-secondary/40 to-white/80 border-secondary/50 text-primary-dark hover:from-secondary/50 hover:to-white'
              }
            `}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
