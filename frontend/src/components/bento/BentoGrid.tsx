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
      className="w-full"
    >
      {/* Responsive Bento Grid - No Overlapping */}
      <div className="
        grid gap-4 sm:gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        auto-rows-auto
        w-full
      ">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            className={`
              ${stage.id === 1 || stage.id === 7
                ? 'sm:col-span-2 lg:col-span-2 xl:col-span-2'
                : 'col-span-1'
              }
              ${stage.id === 1 || stage.id === 7
                ? 'row-span-1'
                : 'row-span-1'
              }
              min-h-[280px]
              w-full
            `}
          >
            <StageBentoCard stage={stage} isDark={isDarkMode} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
