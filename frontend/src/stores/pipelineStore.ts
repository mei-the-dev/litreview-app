import { create } from 'zustand';
import { PipelineStage, LiteratureReviewReport } from '@/types/pipeline.types';

interface PipelineState {
  sessionId: string | null;
  stages: PipelineStage[];
  report: LiteratureReviewReport | null;
  pdfPath: string | null;
  isRunning: boolean;
  error: string | null;
  
  // Actions
  setSessionId: (id: string) => void;
  initializeStages: () => void;
  updateStage: (stageId: number, update: Partial<PipelineStage>) => void;
  setReport: (report: LiteratureReviewReport) => void;
  setPdfPath: (path: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const STAGE_NAMES = [
  'Fetching Papers',
  'Relevance Scoring',
  'Theme Clustering',
  'Methodology Grouping',
  'Final Ranking',
  'Synthesis Report',
  'PDF Generation'
];

export const usePipelineStore = create<PipelineState>((set) => ({
  sessionId: null,
  stages: [],
  report: null,
  pdfPath: null,
  isRunning: false,
  error: null,
  
  setSessionId: (id) => set({ sessionId: id, isRunning: true }),
  
  initializeStages: () => set({
    stages: STAGE_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      status: 'pending',
      progress: 0,
      message: 'Waiting...',
    }))
  }),
  
  updateStage: (stageId, update) => set((state) => ({
    stages: state.stages.map((stage) =>
      stage.id === stageId ? { ...stage, ...update } : stage
    )
  })),
  
  setReport: (report) => set({ report }),
  
  setPdfPath: (path) => set({ pdfPath, isRunning: false }),
  
  setError: (error) => set({ error, isRunning: false }),
  
  reset: () => set({
    sessionId: null,
    stages: [],
    report: null,
    pdfPath: null,
    isRunning: false,
    error: null,
  }),
}));
