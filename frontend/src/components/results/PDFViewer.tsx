import React from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';

export const PDFViewer: React.FC = () => {
  const { pdfPath } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  const downloadUrl = pdfPath ? `http://localhost:8000${pdfPath}` : null;
  
  if (!pdfPath) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No PDF available yet. The pipeline needs to complete stage 7.
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
            Generated PDF Report
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your beautifully formatted academic literature review
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <a
          href={downloadUrl!}
          download
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-xl border
            font-semibold transition-all duration-300 shadow-lg hover:shadow-xl
            ${isDarkMode
              ? 'bg-primary/30 border-primary/50 text-white hover:bg-primary/40'
              : 'bg-primary/80 border-primary/30 text-white hover:bg-primary'
            }
          `}
        >
          <Download className="w-5 h-5" />
          Download PDF
        </a>
        <a
          href={downloadUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-xl border
            font-semibold transition-all duration-300
            ${isDarkMode
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              : 'bg-white/60 border-primary/20 text-gray-900 hover:bg-white/80'
            }
          `}
        >
          <ExternalLink className="w-5 h-5" />
          Open in New Tab
        </a>
      </div>
      
      {/* PDF Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          backdrop-blur-xl rounded-3xl p-6 border overflow-hidden
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}
      >
        <div className="aspect-[8.5/11] bg-gray-100 rounded-xl overflow-hidden">
          <iframe
            src={downloadUrl!}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      </motion.div>
      
      {/* Info card */}
      <div className={`
        backdrop-blur-xl rounded-2xl p-6 border
        ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
      `}>
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-xl
            ${isDarkMode ? 'bg-primary/20' : 'bg-primary/10'}
          `}>
            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-primary-light' : 'text-primary'}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              About this PDF
            </h3>
            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This PDF contains your complete literature review with:
            </p>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>Executive summary and key findings</li>
              <li>Comprehensive analysis of all papers</li>
              <li>Theme and methodology breakdowns</li>
              <li>Top-ranked papers with justifications</li>
              <li>References and citations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
