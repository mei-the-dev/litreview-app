import React from 'react';
import { motion } from 'framer-motion';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { Activity, FileText, Network } from 'lucide-react';

export const StatsFooter: React.FC = () => {
  const { stages, report, isRunning } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`
        mt-8 backdrop-blur-xl rounded-3xl p-6 border shadow-2xl
        flex justify-around items-center
        ${isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/50 border-primary/20'
        }
      `}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className={`w-5 h-5 ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Pipeline Progress
          </p>
        </div>
        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {totalStages > 0 ? `${completedStages}/${totalStages}` : '0/7'}
        </p>
      </div>
      
      <div className={`w-px h-12 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className={`w-5 h-5 ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Papers Analyzed
          </p>
        </div>
        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {report?.total_papers || 0}
        </p>
      </div>
      
      <div className={`w-px h-12 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Network className={`w-5 h-5 ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Status
          </p>
        </div>
        <p className={`text-2xl font-bold ${
          isRunning
            ? 'text-blue-400'
            : completedStages === totalStages && totalStages > 0
            ? 'text-green-400'
            : isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {isRunning ? 'Running' : completedStages === totalStages && totalStages > 0 ? 'Complete' : 'Ready'}
        </p>
      </div>
    </motion.div>
  );
};
