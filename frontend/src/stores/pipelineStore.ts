import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PipelineStage, LiteratureReviewReport, Paper } from '@/types/pipeline.types';

type ViewMode = 'pipeline' | 'results';
type ResultTab = 'papers' | 'themes' | 'methodologies' | 'rankings' | 'report' | 'pdf';

interface PipelineHistory {
  sessionId: string;
  query: string;
  timestamp: string;
  stages: PipelineStage[];
  report: LiteratureReviewReport | null;
  pdfPath: string | null;
  totalDuration?: number;
}

interface PipelineState {
  sessionId: string | null;
  stages: PipelineStage[];
  report: LiteratureReviewReport | null;
  pdfPath: string | null;
  isRunning: boolean;
  error: string | null;
  
  // Result data
  papers: Paper[];
  themes: Record<string, Paper[]>;
  methodologies: Record<string, Paper[]>;
  rankedPapers: Paper[];
  
  // View state
  currentView: ViewMode;
  selectedTab: ResultTab;
  searchTerm: string;
  filterTheme: string | null;
  filterMethodology: string | null;
  
  // Pipeline history
  pipelineHistory: PipelineHistory[];
  maxHistorySize: number;
  
  // Actions
  setSessionId: (id: string) => void;
  initializeStages: () => void;
  updateStage: (stageId: number, update: Partial<PipelineStage>) => void;
  setReport: (report: LiteratureReviewReport) => void;
  setPdfPath: (path: string) => void;
  setError: (error: string) => void;
  setPapers: (papers: Paper[]) => void;
  setThemes: (themes: Record<string, Paper[]>) => void;
  setMethodologies: (methodologies: Record<string, Paper[]>) => void;
  setRankedPapers: (papers: Paper[]) => void;
  setCurrentView: (view: ViewMode) => void;
  setSelectedTab: (tab: ResultTab) => void;
  setSearchTerm: (term: string) => void;
  setFilterTheme: (theme: string | null) => void;
  setFilterMethodology: (methodology: string | null) => void;
  archivePipeline: (query: string) => void;
  loadPipelineFromHistory: (sessionId: string) => void;
  clearHistory: () => void;
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

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set) => ({
      sessionId: null,
      stages: [],
      report: null,
      pdfPath: null,
      isRunning: false,
      error: null,
      
      // Result data
      papers: [],
      themes: {},
      methodologies: {},
      rankedPapers: [],
      
      // View state
      currentView: 'pipeline',
      selectedTab: 'papers',
      searchTerm: '',
      filterTheme: null,
      filterMethodology: null,
      
      // Pipeline history
      pipelineHistory: [],
      maxHistorySize: 10,
      
      setSessionId: (id) => set({ sessionId: id, isRunning: true }),
      
      initializeStages: () => set({
        stages: STAGE_NAMES.map((name, index) => ({
          id: index + 1,
          name,
          status: 'pending',
          progress: 0,
          message: 'Waiting...',
          updateHistory: [],  // Initialize empty history
        })),
        currentView: 'pipeline'
      }),
      
      updateStage: (stageId, update) => set((state) => {
        const timestamp = new Date().toISOString();
        
        return {
          stages: state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;
            
            // Create history entry for this update
            const historyEntry = {
              timestamp,
              progress: update.progress ?? stage.progress,
              message: update.message ?? stage.message,
              data: update.data,
            };
            
            // Accumulate history (limit to 50 entries)
            const newHistory = [...(stage.updateHistory || []), historyEntry];
            if (newHistory.length > 50) {
              newHistory.shift(); // Remove oldest entry
            }
            
            return {
              ...stage,
              ...update,
              updateHistory: newHistory,
              lastUpdate: historyEntry,
            };
          })
        };
      }),
      
      setReport: (report) => set({ report }),
      
      setPdfPath: (path) => {
        console.log('✅ setPdfPath called with:', path);
        set({ pdfPath: path, isRunning: false, currentView: 'results' });
        console.log('✅ Navigation: Switched to results view');
      },
      
      setError: (error) => set({ error, isRunning: false }),
      
      setPapers: (papers) => set({ papers }),
      
      setThemes: (themes) => set({ themes }),
      
      setMethodologies: (methodologies) => set({ methodologies }),
      
      setRankedPapers: (rankedPapers) => set({ rankedPapers }),
      
      setCurrentView: (currentView) => set({ currentView }),
      
      setSelectedTab: (selectedTab) => set({ selectedTab }),
      
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      
      setFilterTheme: (filterTheme) => set({ filterTheme }),
      
      setFilterMethodology: (filterMethodology) => set({ filterMethodology }),
      
      archivePipeline: (query: string) => set((state) => {
        const history: PipelineHistory = {
          sessionId: state.sessionId || 'unknown',
          query,
          timestamp: new Date().toISOString(),
          stages: state.stages,
          report: state.report,
          pdfPath: state.pdfPath,
        };
        
        const newHistory = [history, ...state.pipelineHistory].slice(0, state.maxHistorySize);
        
        console.log('📦 Pipeline archived:', history.sessionId);
        return { pipelineHistory: newHistory };
      }),
      
      loadPipelineFromHistory: (sessionId: string) => set((state) => {
        const history = state.pipelineHistory.find(h => h.sessionId === sessionId);
        if (!history) {
          console.warn('⚠️  Pipeline not found in history:', sessionId);
          return {};
        }
        
        console.log('📂 Loading pipeline from history:', sessionId);
        return {
          sessionId: history.sessionId,
          stages: history.stages,
          report: history.report,
          pdfPath: history.pdfPath,
          currentView: 'results',
          isRunning: false,
        };
      }),
      
      clearHistory: () => set({ pipelineHistory: [] }),
      
      reset: () => set({
        sessionId: null,
        stages: [],
        report: null,
        pdfPath: null,
        isRunning: false,
        error: null,
        papers: [],
        themes: {},
        methodologies: {},
        rankedPapers: [],
        currentView: 'pipeline',
        selectedTab: 'papers',
        searchTerm: '',
        filterTheme: null,
        filterMethodology: null,
      }),
    }),
    {
      name: 'litreview-pipeline-storage',
      partialize: (state) => ({
        pipelineHistory: state.pipelineHistory,
        maxHistorySize: state.maxHistorySize,
      }),
    }
  )
);
