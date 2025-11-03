import React from 'react';
import { PipelineStage } from '@/types/pipeline.types';
import { BarChart3, TrendingUp, Hash, FileText } from 'lucide-react';

interface StageDataPreviewProps {
  stage: PipelineStage;
  isDark: boolean;
}

export const StageDataPreview: React.FC<StageDataPreviewProps> = ({ stage, isDark }) => {
  // Always show for running stages with data
  if (!stage.result && stage.status !== 'running') {
    return null;
  }

  const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const accentColor = isDark ? 'text-primary-light' : 'text-primary';
  const bgColor = isDark ? 'bg-primary/10' : 'bg-primary/5';
  const completedColor = isDark ? 'text-success' : 'text-success';
  const completedBg = isDark ? 'bg-success/10' : 'bg-success/5';

  // Stage 1: Papers Fetched
  if (stage.id === 1 && stage.result && stage.result.papers_count) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>Papers Retrieved</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-2`}>
          {stage.result.papers_count}
        </div>
        {stage.result.sources && (
          <div className={`text-xs ${textColor} opacity-75`}>
            From {stage.result.sources} sources
          </div>
        )}
      </div>
    );
  }

  // Stage 2: Relevance Scoring
  if (stage.id === 2 && stage.result && stage.result.scored) {
    const avgScore = stage.result.average_score || 0;
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>Relevance Analysis</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={`text-2xl font-bold ${textColor}`}>{stage.result.scored}</div>
            <div className={`text-xs ${textColor} opacity-75`}>Papers scored</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${textColor}`}>{(avgScore * 100).toFixed(0)}%</div>
            <div className={`text-xs ${textColor} opacity-75`}>Avg relevance</div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 3: Themes
  if (stage.id === 3 && stage.result && stage.result.themes_found) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <Hash className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>Theme Clusters</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-3`}>
          {stage.result.themes_found}
        </div>
        {stage.result.themes && (
          <div className="space-y-1">
            {Object.entries(stage.result.themes).slice(0, 3).map(([theme, count]) => (
              <div key={theme} className="flex justify-between items-center">
                <span className={`text-xs ${textColor} truncate flex-1`}>{theme}</span>
                <span className={`text-xs font-semibold ${completedColor} ml-2`}>{String(count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stage 4: Methodologies
  if (stage.id === 4 && stage.result && stage.result.methodologies_found) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <Hash className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>Methodologies</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-3`}>
          {stage.result.methodologies_found}
        </div>
        {stage.result.methodologies && (
          <div className="space-y-1">
            {Object.entries(stage.result.methodologies).slice(0, 3).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center">
                <span className={`text-xs ${textColor} truncate flex-1`}>{method}</span>
                <span className={`text-xs font-semibold ${completedColor} ml-2`}>{String(count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stage 5: Ranking
  if (stage.id === 5 && stage.result && stage.result.papers_ranked) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>Final Rankings</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-2`}>
          {stage.result.papers_ranked}
        </div>
        <div className={`text-xs ${textColor} opacity-75`}>
          Papers ranked by relevance
        </div>
      </div>
    );
  }

  // Stage 6: Synthesis - Show detailed sub-task progress
  if (stage.id === 6) {
    const data = stage.data || {};
    const subTask = data.sub_task || 'initialization';
    const isComplete = stage.status === 'completed';
    const displayBg = isComplete ? completedBg : bgColor;
    const displayAccent = isComplete ? completedColor : accentColor;
    
    // Sub-task labels and progress estimates
    const subTasks = [
      { id: 'initialization', label: 'Initialization', progress: 5 },
      { id: 'overview', label: 'Overview', progress: 20 },
      { id: 'theme_analysis', label: 'Theme Analysis', progress: 55 },
      { id: 'methodology_grouping', label: 'Methodology Grouping', progress: 68 },
      { id: 'top_papers_compilation', label: 'Top Papers', progress: 75 },
      { id: 'synthesis_writing', label: 'AI Synthesis', progress: 90 },
      { id: 'finalization', label: 'Finalization', progress: 95 },
    ];
    
    const currentSubTaskObj = subTasks.find(st => st.id === subTask);
    const currentProgress = stage.progress || 0;
    
    return (
      <div className={`mt-4 p-4 rounded-xl ${displayBg} border ${isComplete ? 'border-success/20' : 'border-primary/20'}`}>
        <div className="flex items-center gap-3 mb-3">
          <FileText className={`w-5 h-5 ${displayAccent}`} />
          <span className={`text-sm font-semibold ${displayAccent}`}>
            {isComplete ? 'Report Generated' : 'Generating Report'}
          </span>
        </div>
        
        {!isComplete && currentSubTaskObj && (
          <div className="space-y-3">
            {/* Current sub-task */}
            <div>
              <div className={`text-sm font-medium ${textColor} mb-2`}>
                {currentSubTaskObj.label}
              </div>
              {data.current_theme && (
                <div className={`text-xs ${textColor} opacity-75 truncate`}>
                  Processing: {data.current_theme}
                </div>
              )}
              {data.current_method && (
                <div className={`text-xs ${textColor} opacity-75 truncate`}>
                  Processing: {data.current_method}
                </div>
              )}
              {data.status === 'loading_model' && (
                <div className={`text-xs ${textColor} opacity-75`}>
                  Loading AI model...
                </div>
              )}
              {data.status === 'running_inference' && (
                <div className={`text-xs ${textColor} opacity-75`}>
                  Running inference... ({data.input_length} chars)
                </div>
              )}
            </div>
            
            {/* Sub-task progress indicators */}
            <div className="grid grid-cols-2 gap-2">
              {data.theme_count && (
                <div>
                  <div className={`text-xs ${textColor} opacity-75`}>Themes</div>
                  <div className={`text-lg font-bold ${displayAccent}`}>{data.theme_count}</div>
                </div>
              )}
              {data.method_count && (
                <div>
                  <div className={`text-xs ${textColor} opacity-75`}>Methods</div>
                  <div className={`text-lg font-bold ${displayAccent}`}>{data.method_count}</div>
                </div>
              )}
              {data.total_papers && (
                <div>
                  <div className={`text-xs ${textColor} opacity-75`}>Papers</div>
                  <div className={`text-lg font-bold ${displayAccent}`}>{data.total_papers}</div>
                </div>
              )}
              {data.sections && (
                <div>
                  <div className={`text-xs ${textColor} opacity-75`}>Sections</div>
                  <div className={`text-lg font-bold ${displayAccent}`}>{data.sections}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isComplete && stage.result && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className={`text-2xl font-bold ${textColor}`}>{stage.result.sections}</div>
              <div className={`text-xs ${textColor} opacity-75`}>Sections</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${textColor}`}>
                {Math.round((stage.result.total_length || 0) / 1000)}k
              </div>
              <div className={`text-xs ${textColor} opacity-75`}>Characters</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stage 7: PDF
  if (stage.id === 7 && stage.result && stage.result.pdf_generated) {
    const sizeMB = stage.result.file_size_kb ? (stage.result.file_size_kb / 1024).toFixed(2) : '0';
    return (
      <div className={`mt-4 p-4 rounded-xl ${completedBg} border border-success/20`}>
        <div className="flex items-center gap-3 mb-3">
          <FileText className={`w-5 h-5 ${completedColor}`} />
          <span className={`text-sm font-semibold ${completedColor}`}>PDF Ready</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={`text-2xl font-bold ${textColor}`}>{stage.result.pages || '—'}</div>
            <div className={`text-xs ${textColor} opacity-75`}>Pages</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${textColor}`}>{sizeMB} MB</div>
            <div className={`text-xs ${textColor} opacity-75`}>File size</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
