import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Network, 
  Microscope, 
  TrendingUp, 
  FileCheck,
  List
} from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';

type ResultTab = 'papers' | 'themes' | 'methodologies' | 'rankings' | 'report' | 'pdf';

interface Tab {
  id: ResultTab;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number | string;
}

export const ResultsNavigation: React.FC = () => {
  const { 
    selectedTab, 
    setSelectedTab,
    papers,
    themes,
    methodologies,
    rankedPapers
  } = usePipelineStore();
  
  const tabs: Tab[] = [
    {
      id: 'papers',
      label: 'All Papers',
      icon: List,
      badge: papers.length
    },
    {
      id: 'themes',
      label: 'By Theme',
      icon: Network,
      badge: Object.keys(themes).length
    },
    {
      id: 'methodologies',
      label: 'By Methodology',
      icon: Microscope,
      badge: Object.keys(methodologies).length
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: TrendingUp,
      badge: rankedPapers.length > 0 ? `Top ${Math.min(10, rankedPapers.length)}` : undefined
    },
    {
      id: 'report',
      label: 'Report',
      icon: FileText
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: FileCheck
    }
  ];
  
  return (
    <div className="relative mb-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-2xl
                backdrop-blur-xl border transition-all duration-300
                whitespace-nowrap group
                ${isActive
                  ? 'bg-primary/30 border-primary/50 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/20 text-primary'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
