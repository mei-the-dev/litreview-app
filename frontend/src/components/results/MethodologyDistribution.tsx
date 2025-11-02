import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { PaperCard } from './PaperCard';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export const MethodologyDistribution: React.FC = () => {
  const { methodologies } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  const [expandedMethodology, setExpandedMethodology] = useState<string | null>(null);
  const [selectedMethodology, setSelectedMethodology] = useState<string | null>(null);
  
  const methodologyData = Object.entries(methodologies)
    .map(([methodology, papers], index) => ({
      name: methodology,
      count: papers.length,
      papers: papers,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.count - a.count);
  
  if (methodologyData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No methodologies available yet. The pipeline needs to complete stage 4.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Bar Chart */}
      <div className={`
        backdrop-blur-xl rounded-3xl p-6 border
        ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
      `}>
        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Methodology Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={methodologyData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffffff20' : '#00000020'} />
            <XAxis type="number" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={90}
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '12px',
                color: isDarkMode ? '#fff' : '#000'
              }}
              cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              onClick={(data) => {
                setSelectedMethodology(data.name);
                setExpandedMethodology(data.name);
              }}
              style={{ cursor: 'pointer' }}
            >
              {methodologyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={selectedMethodology ? (selectedMethodology === entry.name ? 1 : 0.3) : 0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {selectedMethodology && (
          <button
            onClick={() => {
              setSelectedMethodology(null);
              setExpandedMethodology(null);
            }}
            className="mt-4 text-sm text-primary hover:text-primary-light transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>
      
      {/* Methodology cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methodologyData.map((methodology) => (
          <motion.button
            key={methodology.name}
            onClick={() => {
              setSelectedMethodology(methodology.name);
              setExpandedMethodology(methodology.name);
            }}
            className={`
              backdrop-blur-xl rounded-2xl p-6 border text-left
              transition-all duration-300
              ${selectedMethodology === methodology.name
                ? 'border-primary/50 bg-primary/10 scale-105'
                : isDarkMode
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white/40 border-primary/20 hover:bg-white/60'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: methodology.color }}
              />
              <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {methodology.name}
              </h4>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-primary-light' : 'text-primary'}`}>
              {methodology.count}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              papers ({((methodology.count / methodologyData.reduce((sum, m) => sum + m.count, 0)) * 100).toFixed(1)}%)
            </p>
          </motion.button>
        ))}
      </div>
      
      {/* Expanded methodology papers */}
      <AnimatePresence>
        {expandedMethodology && methodologies[expandedMethodology] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Papers using "{expandedMethodology}"
              </h3>
              <button
                onClick={() => setExpandedMethodology(null)}
                className={`
                  px-4 py-2 rounded-xl backdrop-blur-xl border transition-all
                  ${isDarkMode
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    : 'bg-white/60 border-primary/20 text-gray-900 hover:bg-white/80'
                  }
                `}
              >
                Collapse
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {methodologies[expandedMethodology].map((paper) => (
                <PaperCard key={paper.paper_id} paper={paper} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
