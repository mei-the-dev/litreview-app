import React from 'react';
import { motion } from 'framer-motion';
import { PipelineStage } from '@/types/pipeline.types';
import { 
  Search, 
  Target, 
  Network, 
  Microscope, 
  TrendingUp, 
  FileText, 
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StageDataPreview } from './previews/StageDataPreview';

interface StageBentoCardProps {
  stage: PipelineStage;
  isDark: boolean;
}

const STAGE_ICONS = [
  Search,
  Target,
  Network,
  Microscope,
  TrendingUp,
  FileText,
  FileCheck
];

const STAGE_COLORS = [
  'from-primary/20 via-primary-light/15 to-primary/10',
  'from-purple-500/20 via-purple-400/15 to-purple-600/10',
  'from-pink-500/20 via-pink-400/15 to-pink-600/10',
  'from-orange-500/20 via-orange-400/15 to-orange-600/10',
  'from-success/20 via-green-400/15 to-success/10',
  'from-cyan-500/20 via-cyan-400/15 to-cyan-600/10',
  'from-primary/25 via-primary-light/20 to-primary-dark/15',
];

export const StageBentoCard: React.FC<StageBentoCardProps> = ({ stage, isDark }) => {
  const Icon = STAGE_ICONS[stage.id - 1];
  const gradientColor = STAGE_COLORS[stage.id - 1];
  
  const getStatusIcon = () => {
    switch (stage.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (stage.status) {
      case 'running':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-danger';
      default:
        return 'text-gray-400';
    }
  };
  
  const isActive = stage.status === 'running' || stage.status === 'completed';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1
      }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      className={`
        relative group
        h-full w-full min-h-[300px]
        backdrop-blur-2xl rounded-3xl p-6 border
        transition-all duration-300 cursor-pointer
        overflow-hidden
        ${isActive ? 'shadow-glass-lg' : 'shadow-glass'}
        ${isDark 
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30' 
          : 'bg-white/60 border-primary/20 hover:bg-white/80 hover:border-primary/40'
        }
        ${stage.status === 'running' ? 'ring-2 ring-primary/50 shadow-glow animate-pulse-glow' : ''}
        ${stage.status === 'completed' ? 'ring-1 ring-success/30' : ''}
        ${stage.status === 'error' ? 'ring-2 ring-danger/50' : ''}
      `}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Shimmer effect on active */}
      {stage.status === 'running' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          animate={{ x: [-200, 400] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className={`
              p-3 rounded-2xl backdrop-blur-sm transition-all duration-300
              ${isDark ? 'bg-primary/30 shadow-glow' : 'bg-primary/20'}
              ${isActive ? 'opacity-100 scale-105' : 'opacity-60'}
              ${stage.status === 'running' ? 'animate-pulse-glow' : ''}
            `}
          >
            <Icon className={`w-6 h-6 ${isDark ? 'text-primary-light' : 'text-primary'} transition-colors`} />
          </div>
          
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-semibold capitalize">
              {stage.status}
            </span>
          </div>
        </div>
        
        {/* Stage info */}
        <div className="mt-auto">
          <h3 
            className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Stage {stage.id}
          </h3>
          <p 
            className={`text-2xl font-bold mb-2 bg-gradient-to-r ${
              isDark 
                ? 'from-white via-primary-light to-white' 
                : 'from-gray-900 via-primary to-gray-900'
            } bg-clip-text text-transparent`}
          >
            {stage.name}
          </p>
          <p 
            className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {stage.message}
          </p>
        </div>
        
        {/* Progress bar */}
        {stage.status === 'running' && (
          <div className="mt-4">
            <div className={`h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-light"
                initial={{ width: 0 }}
                animate={{ width: `${stage.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Progress
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stage.progress}%
              </span>
            </div>
          </div>
        )}
        
        {/* Completion time */}
        {stage.status === 'completed' && stage.startTime && stage.endTime && (
          <div className="mt-4 text-xs text-gray-400">
            Completed in {((stage.endTime - stage.startTime) / 1000).toFixed(1)}s
          </div>
        )}
        
        {/* Enhanced Result preview with StageDataPreview component */}
        <StageDataPreview stage={stage} isDark={isDark} />
      </div>
      
      {/* Decorative corner accent with golden glow */}
      <div 
        className={`
          absolute bottom-0 right-0 w-32 h-32 rounded-tl-full 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
          ${isDark ? 'bg-primary/10' : 'bg-primary/8'}
        `}
      />
      
      {/* Inner border glow on active */}
      {isActive && (
        <div className="absolute inset-0 rounded-3xl border border-primary/20 pointer-events-none" />
      )}
    </motion.div>
  );
};
