import { create } from 'zustand';
import { PipelineStage, LiteratureReviewReport, Paper } from '@/types/pipeline.types';

type ViewMode = 'pipeline' | 'results';
type ResultTab = 'papers' | 'themes' | 'methodologies' | 'rankings' | 'report' | 'pdf';

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
  
  setSessionId: (id) => set({ sessionId: id, isRunning: true }),
  
  initializeStages: () => set({
    stages: STAGE_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      status: 'pending',
      progress: 0,
      message: 'Waiting...',
    })),
    currentView: 'pipeline'
  }),
  
  updateStage: (stageId, update) => set((state) => ({
    stages: state.stages.map((stage) =>
      stage.id === stageId ? { ...stage, ...update } : stage
    )
  })),
  
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
}));
