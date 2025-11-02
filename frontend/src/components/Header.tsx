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
        backdrop-blur-xl rounded-3xl p-8 border shadow-2xl mb-8
        ${isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/50 border-primary/20'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className={`text-5xl font-bold mb-2 bg-gradient-to-r ${
              isDarkMode
                ? 'from-primary-light to-accent'
                : 'from-primary-dark to-primary'
            } bg-clip-text text-transparent`}
          >
            LitReview
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Automated Academic Literature Review System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Download PDF button */}
          {pdfPath && (
            <motion.a
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              href={`http://localhost:8000${pdfPath.replace('./output', '/output')}`}
              download
              className={`
                p-4 rounded-2xl backdrop-blur-sm border transition-all
                flex items-center gap-2 font-medium
                ${isDarkMode
                  ? 'bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30'
                  : 'bg-green-500/10 border-green-500/20 text-green-700 hover:bg-green-500/20'
                }
              `}
            >
              <Download className="w-5 h-5" />
              Download PDF
            </motion.a>
          )}
          
          {/* Reset button */}
          {!isRunning && (
            <button
              onClick={reset}
              className={`
                p-4 rounded-2xl backdrop-blur-sm border transition-all hover:scale-110 active:scale-95
                ${isDarkMode
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }
              `}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}
          
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className={`
              p-4 rounded-2xl backdrop-blur-sm border transition-all hover:scale-110 active:scale-95
              ${isDarkMode
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
              }
            `}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
