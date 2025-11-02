import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { ResultsNavigation } from './ResultsNavigation';
import { PapersListView } from './PapersListView';
import { ThemeClusterView } from './ThemeClusterView';
import { MethodologyDistribution } from './MethodologyDistribution';
import { RankingTable } from './RankingTable';
import { ReportDisplay } from './ReportDisplay';
import { PDFViewer } from './PDFViewer';

export const ResultsView: React.FC = () => {
  const { selectedTab, setCurrentView } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  const renderContent = () => {
    switch (selectedTab) {
      case 'papers':
        return <PapersListView />;
      case 'themes':
        return <ThemeClusterView />;
      case 'methodologies':
        return <MethodologyDistribution />;
      case 'rankings':
        return <RankingTable />;
      case 'report':
        return <ReportDisplay />;
      case 'pdf':
        return <PDFViewer />;
      default:
        return <PapersListView />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('pipeline')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border
            transition-all duration-300
            ${isDarkMode
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              : 'bg-white/60 border-primary/20 text-gray-900 hover:bg-white/80'
            }
          `}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </button>
        <div>
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Results & Analysis
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore your literature review results
          </p>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <ResultsNavigation />
      
      {/* Content area with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
