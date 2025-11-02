import React from 'react';
import { motion } from 'framer-motion';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { StageBentoCard } from './StageBentoCard';

export const BentoGrid: React.FC = () => {
  const { stages } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  if (stages.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[200px]"
    >
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={
            // Stage 1 and 7 are larger (span 2 columns)
            stage.id === 1 || stage.id === 7
              ? 'md:col-span-2 lg:col-span-2'
              : 'col-span-1'
          }
        >
          <StageBentoCard stage={stage} isDark={isDarkMode} />
        </div>
      ))}
    </motion.div>
  );
};
