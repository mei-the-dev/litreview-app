import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { PaperCard } from './PaperCard';

const COLORS = [
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F97316', // orange
];

export const ThemeClusterView: React.FC = () => {
  const { themes } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  
  const themeData = Object.entries(themes).map(([theme, papers], index) => ({
    name: theme,
    value: papers.length,
    papers: papers,
    color: COLORS[index % COLORS.length]
  }));
  
  if (themeData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No themes available yet. The pipeline needs to complete stage 3.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className={`
          backdrop-blur-xl rounded-3xl p-6 border
          ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-primary/20'}
        `}>
          <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Theme Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={themeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => {
                  setSelectedTheme(data.name);
                  setExpandedTheme(data.name);
                }}
                style={{ cursor: 'pointer' }}
              >
                {themeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={selectedTheme ? (selectedTheme === entry.name ? 1 : 0.3) : 1}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: isDarkMode ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {selectedTheme && (
            <button
              onClick={() => {
                setSelectedTheme(null);
                setExpandedTheme(null);
              }}
              className="mt-4 text-sm text-primary hover:text-primary-light transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
        
        {/* Stats */}
        <div className="space-y-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Theme Summary
          </h3>
          <div className="space-y-3">
            {themeData.map((theme) => (
              <motion.div
                key={theme.name}
                className={`
                  backdrop-blur-xl rounded-2xl p-4 border cursor-pointer
                  transition-all duration-300
                  ${selectedTheme === theme.name
                    ? 'border-primary/50 bg-primary/10'
                    : isDarkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white/40 border-primary/20 hover:bg-white/60'
                  }
                `}
                onClick={() => {
                  setSelectedTheme(theme.name);
                  setExpandedTheme(theme.name);
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {theme.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {theme.value} papers
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({((theme.value / themeData.reduce((sum, t) => sum + t.value, 0)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Expanded theme papers */}
      <AnimatePresence>
        {expandedTheme && themes[expandedTheme] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Papers in "{expandedTheme}"
              </h3>
              <button
                onClick={() => setExpandedTheme(null)}
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
              {themes[expandedTheme].map((paper) => (
                <PaperCard key={paper.paper_id} paper={paper} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
