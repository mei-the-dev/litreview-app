import axios from 'axios';
import { PipelineRequest, PipelineResponse } from '@/types/pipeline.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pipelineAPI = {
  async startPipeline(request: PipelineRequest): Promise<PipelineResponse> {
    const response = await apiClient.post<PipelineResponse>('/api/pipeline/start', request);
    return response.data;
  },
  
  async getPipelineStatus(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/api/pipeline/status/${sessionId}`);
    return response.data;
  },
  
  async getPipelineResult(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/api/pipeline/result/${sessionId}`);
    return response.data;
  },
};
