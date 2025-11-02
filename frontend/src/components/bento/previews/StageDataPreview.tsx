import React from 'react';
import { PipelineStage } from '@/types/pipeline.types';
import { BarChart3, TrendingUp, Hash, FileText } from 'lucide-react';

interface StageDataPreviewProps {
  stage: PipelineStage;
  isDark: boolean;
}

export const StageDataPreview: React.FC<StageDataPreviewProps> = ({ stage, isDark }) => {
  if (!stage.result || stage.status !== 'completed') {
    return null;
  }

  const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const accentColor = isDark ? 'text-green-400' : 'text-green-600';
  const bgColor = isDark ? 'bg-green-500/10' : 'bg-green-100';

  // Stage 1: Papers Fetched
  if (stage.id === 1 && stage.result.papers_count) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Papers Retrieved</span>
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
  if (stage.id === 2 && stage.result.scored) {
    const avgScore = stage.result.average_score || 0;
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Relevance Analysis</span>
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
  if (stage.id === 3 && stage.result.themes_found) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <Hash className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Theme Clusters</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-3`}>
          {stage.result.themes_found}
        </div>
        {stage.result.themes && (
          <div className="space-y-1">
            {Object.entries(stage.result.themes).slice(0, 3).map(([theme, count]) => (
              <div key={theme} className="flex justify-between items-center">
                <span className={`text-xs ${textColor} truncate flex-1`}>{theme}</span>
                <span className={`text-xs font-semibold ${accentColor} ml-2`}>{String(count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stage 4: Methodologies
  if (stage.id === 4 && stage.result.methodologies_found) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <Hash className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Methodologies</span>
        </div>
        <div className={`text-3xl font-bold ${textColor} mb-3`}>
          {stage.result.methodologies_found}
        </div>
        {stage.result.methodologies && (
          <div className="space-y-1">
            {Object.entries(stage.result.methodologies).slice(0, 3).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center">
                <span className={`text-xs ${textColor} truncate flex-1`}>{method}</span>
                <span className={`text-xs font-semibold ${accentColor} ml-2`}>{String(count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stage 5: Ranking
  if (stage.id === 5 && stage.result.papers_ranked) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Final Rankings</span>
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

  // Stage 6: Synthesis
  if (stage.id === 6 && stage.result.report_generated) {
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <FileText className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>Report Generated</span>
        </div>
        {stage.result.sections && (
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
  if (stage.id === 7 && stage.result.pdf_generated) {
    const sizeMB = stage.result.file_size_kb ? (stage.result.file_size_kb / 1024).toFixed(2) : '0';
    return (
      <div className={`mt-4 p-4 rounded-xl ${bgColor} border border-green-500/20`}>
        <div className="flex items-center gap-3 mb-3">
          <FileText className={`w-5 h-5 ${accentColor}`} />
          <span className={`text-sm font-semibold ${accentColor}`}>PDF Ready</span>
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
