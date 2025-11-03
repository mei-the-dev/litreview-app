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
  'from-primary/20 via-secondary/15 to-primary-light/10',
  'from-purple-400/20 via-secondary-light/15 to-purple-500/10',
  'from-pink-400/20 via-secondary/15 to-pink-500/10',
  'from-orange-400/20 via-secondary-light/15 to-warning/10',
  'from-success/20 via-secondary/15 to-success/10',
  'from-info/20 via-secondary-light/15 to-info/10',
  'from-primary/25 via-secondary-dark/20 to-primary-light/15',
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
        relative group glass-artistic
        h-full w-full min-h-[300px]
        rounded-3xl p-6 border
        transition-all duration-500 cursor-pointer
        overflow-hidden
        ${isActive ? 'shadow-glass-lg' : 'shadow-glass'}
        ${isDark 
          ? 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 border-white/10 hover:from-white/12 hover:via-white/8 hover:to-white/5 hover:border-secondary/40' 
          : 'bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-secondary/30 hover:from-white/90 hover:via-white/80 hover:to-white/70 hover:border-primary/50'
        }
        ${stage.status === 'running' ? 'ring-2 ring-primary/60 shadow-glow animate-pulse-glow' : ''}
        ${stage.status === 'completed' ? 'ring-1 ring-success/40 shadow-[0_0_15px_rgba(139,195,74,0.2)]' : ''}
        ${stage.status === 'error' ? 'ring-2 ring-danger/60 shadow-[0_0_15px_rgba(255,112,67,0.3)]' : ''}
      `}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {/* Artistic gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl`}
        style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
      />
      
      {/* Enhanced shimmer effect on active with secondary gold */}
      {stage.status === 'running' && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
            animate={{ x: [-300, 600] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-l from-transparent via-secondary/10 to-transparent"
            animate={{ x: [600, -300] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className={`
              p-3 rounded-2xl backdrop-blur-md transition-all duration-500
              ${isDark 
                ? 'bg-gradient-to-br from-primary/40 via-secondary/30 to-primary-light/35 shadow-[0_0_20px_rgba(193,143,50,0.3)]' 
                : 'bg-gradient-to-br from-primary/30 via-secondary/40 to-primary-light/25 shadow-[0_0_15px_rgba(193,143,50,0.2)]'
              }
              ${isActive ? 'opacity-100 scale-105' : 'opacity-70 scale-100'}
              ${stage.status === 'running' ? 'animate-pulse-glow' : ''}
            `}
          >
            <Icon 
              className={`w-6 h-6 transition-colors duration-300 ${
                isDark ? 'text-secondary-light drop-shadow-[0_0_8px_rgba(244,231,195,0.5)]' : 'text-primary-dark'
              }`} 
            />
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-sm ${
            isDark ? 'bg-white/5' : 'bg-white/40'
          } ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-semibold capitalize">
              {stage.status}
            </span>
          </div>
        </div>
        
        {/* Stage info */}
        <div className="mt-auto">
          <h3 
            className={`text-sm font-medium mb-2 tracking-wide ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Stage {stage.id}
          </h3>
          <p 
            className={`text-2xl font-bold mb-2 bg-gradient-to-r ${
              isDark 
                ? 'from-white via-secondary-light to-primary-light text-golden-glow' 
                : 'from-gray-900 via-primary to-primary-dark'
            } bg-clip-text text-transparent transition-all duration-500`}
          >
            {stage.name}
          </p>
          <p 
            className={`text-sm leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {stage.message}
          </p>
        </div>
        
        {/* Enhanced progress bar with golden gradient */}
        {stage.status === 'running' && (
          <div className="mt-4">
            <div className={`h-2.5 rounded-full overflow-hidden border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-secondary/20'
            }`}>
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-secondary to-primary-light shadow-[0_0_10px_rgba(193,143,50,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${stage.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Progress
              </span>
              <span className={`text-xs font-bold ${isDark ? 'text-secondary-light' : 'text-primary-dark'}`}>
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
      
      {/* Decorative corner accent with pastel gold glow */}
      <div 
        className={`
          absolute bottom-0 right-0 w-32 h-32 rounded-tl-full 
          opacity-0 group-hover:opacity-100 transition-all duration-700
          ${isDark 
            ? 'bg-gradient-to-tl from-secondary/15 via-primary/10 to-transparent' 
            : 'bg-gradient-to-tl from-secondary/20 via-primary/8 to-transparent'
          }
        `}
      />
      
      {/* Inner border glow on active with artistic enhancement */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-3xl border border-primary/20 pointer-events-none" />
          <div className="absolute inset-0 rounded-3xl border border-secondary/10 pointer-events-none animate-pulse" />
        </>
      )}
    </motion.div>
  );
};
