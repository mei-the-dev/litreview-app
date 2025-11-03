export interface Paper {
  paper_id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
  citation_count: number;
  url: string | null;
  venue: string | null;
  relevance_score?: number;
  theme?: string;
  methodology?: string;
  final_rank?: number;
}

export interface PipelineRequest {
  keywords: string[];
  max_papers: number;
  filters?: Record<string, any>;
}

export interface PipelineResponse {
  session_id: string;
  status: string;
  message: string;
  websocket_url: string;
}

export interface StageUpdate {
  type: 'connected' | 'stage_update' | 'stage_complete' | 'error' | 'pong';
  stage?: number;
  progress?: number;
  message?: string;
  data?: any;
  result?: any;
  error?: string;
  timestamp: string;
}

export interface PipelineStage {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: any;
  data?: any;  // Added for real-time sub-task data
  startTime?: number;
  endTime?: number;
}

export interface LiteratureReviewReport {
  query: string;
  total_papers: number;
  papers_by_theme: Record<string, number>;
  papers_by_methodology: Record<string, number>;
  top_papers: Paper[];
  synthesis: string;
  metadata: Record<string, any>;
  generated_at: string;
}
