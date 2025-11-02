import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';

export const ReportDisplay: React.FC = () => {
  const { report } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    if (report?.synthesis) {
      await navigator.clipboard.writeText(report.synthesis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!report) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No report available yet. The pipeline needs to complete stage 6.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Literature Review Report
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generated on {new Date(report.generated_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border
            transition-all duration-300
            ${isDarkMode
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              : 'bg-white/60 border-primary/20 text-gray-900 hover:bg-white/80'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Report
            </>
          )}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`
          backdrop-blur-xl rounded-2xl p-6 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Papers
          </p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary'}`}>
            {report.total_papers}
          </p>
        </div>
        <div className={`
          backdrop-blur-xl rounded-2xl p-6 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Themes Identified
          </p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary'}`}>
            {Object.keys(report.papers_by_theme || {}).length}
          </p>
        </div>
        <div className={`
          backdrop-blur-xl rounded-2xl p-6 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Methodologies
          </p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary'}`}>
            {Object.keys(report.papers_by_methodology || {}).length}
          </p>
        </div>
      </div>
      
      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          backdrop-blur-xl rounded-3xl p-8 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}
      >
        <div className={`
          prose prose-lg max-w-none
          ${isDarkMode 
            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-primary-light' 
            : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary'
          }
        `}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.synthesis}
          </ReactMarkdown>
        </div>
      </motion.div>
      
      {/* Theme Distribution */}
      {report.papers_by_theme && Object.keys(report.papers_by_theme).length > 0 && (
        <div className={`
          backdrop-blur-xl rounded-3xl p-6 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Papers by Theme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(report.papers_by_theme).map(([theme, count]) => (
              <div
                key={theme}
                className={`
                  p-4 rounded-xl border
                  ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-primary/10'}
                `}
              >
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {theme}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary'}`}>
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
