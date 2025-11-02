import { useEffect, useRef, useCallback } from 'react';
import { StageUpdate } from '@/types/pipeline.types';
import { usePipelineStore } from '@/stores/pipelineStore';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (sessionId: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { 
    updateStage, 
    setReport, 
    setPdfPath, 
    setError,
    setPapers,
    setThemes,
    setMethodologies,
    setRankedPapers
  } = usePipelineStore();
  
  const handleMessage = useCallback((event: MessageEvent) => {
    const update: StageUpdate = JSON.parse(event.data);
    
    console.log('WebSocket message:', update);
    
    switch (update.type) {
      case 'connected':
        console.log('WebSocket connected:', update);
        break;
        
      case 'stage_update':
        if (update.stage) {
          updateStage(update.stage, {
            status: 'running',
            progress: update.progress || 0,
            message: update.message || 'Processing...',
            startTime: Date.now(),
          });
        }
        break;
        
      case 'stage_complete':
        if (update.stage) {
          updateStage(update.stage, {
            status: 'completed',
            progress: 100,
            message: 'Completed',
            result: update.result,
            endTime: Date.now(),
          });
          
          // Store stage-specific data
          if (update.stage === 1 && update.data?.papers) {
            // Stage 1: Papers fetched
            setPapers(update.data.papers);
            console.log('Stored papers:', update.data.papers.length);
          }
          
          if (update.stage === 3 && update.data?.themes) {
            // Stage 3: Themes clustered
            setThemes(update.data.themes);
            console.log('Stored themes:', Object.keys(update.data.themes).length);
          }
          
          if (update.stage === 4 && update.data?.methodologies) {
            // Stage 4: Methodologies grouped
            setMethodologies(update.data.methodologies);
            console.log('Stored methodologies:', Object.keys(update.data.methodologies).length);
          }
          
          if (update.stage === 5 && update.data?.ranked_papers) {
            // Stage 5: Papers ranked
            setRankedPapers(update.data.ranked_papers);
            console.log('Stored ranked papers:', update.data.ranked_papers.length);
          }
          
          if (update.stage === 6 && update.data?.report) {
            // Stage 6: Report generated
            setReport(update.data.report);
            console.log('Report generated');
          }
          
          if (update.stage === 7 && update.result?.pdf_path) {
            // Stage 7: PDF generated
            setPdfPath(update.result.pdf_path);
            console.log('PDF generated:', update.result.pdf_path);
          }
        }
        break;
        
      case 'error':
        const errorMessage = update.error || 'Unknown error occurred';
        setError(errorMessage);
        if (update.stage) {
          updateStage(update.stage, {
            status: 'error',
            message: errorMessage,
          });
        }
        break;
    }
  }, [updateStage, setReport, setPdfPath, setError, setPapers, setThemes, setMethodologies, setRankedPapers]);
  
  const connect = useCallback(() => {
    if (!sessionId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const ws = new WebSocket(`${WS_BASE_URL}/ws/${sessionId}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);
      
      ws.addEventListener('close', () => clearInterval(pingInterval));
    };
    
    ws.onmessage = handleMessage;
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
      wsRef.current = null;
      
      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 2000);
    };
    
    wsRef.current = ws;
  }, [sessionId, handleMessage]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (sessionId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);
  
  return { connect, disconnect };
};
