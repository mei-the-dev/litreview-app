# 🎮 GPU Quick Reference

## Current Configuration

```
Device: NVIDIA GeForce RTX 3060
VRAM: 12 GB (688 MB used, 10.9 GB free)
Mode: CUDA with FP16 mixed precision
Status: ✅ Fully Operational
```

## Models on GPU

1. **Embeddings**: `sentence-transformers/all-mpnet-base-v2`
   - 768 dimensions (upgraded from 384)
   - ~428 MB VRAM
   - Better quality for relevance scoring

2. **Summarization**: `facebook/bart-large-cnn`
   - State-of-the-art quality
   - 1-2 seconds per abstract
   - FP16 enabled

## Quick Commands

### Check GPU Status
```bash
nvidia-smi
```

### Test GPU Models
```bash
python test_gpu_models.py
```

### Test Full Pipeline
```bash
python test_pipeline_gpu.py
```

### Get GPU Stats from API
```bash
curl http://localhost:8000/api/monitoring/gpu-stats | jq
```

### Monitor GPU in Real-time
```bash
watch -n 1 nvidia-smi
```

### Run Dashboard with GPU Metrics
```bash
python dashboard.py
```

## Performance

- **Embedding Generation**: Fast, parallel on GPU
- **Summarization**: 1-2 seconds (was 30-120 seconds on CPU)
- **Stage 6**: ✅ No longer hangs
- **Overall**: 50-100x faster for AI tasks

## Environment Variables (Optional)

```bash
USE_GPU=true                # Auto-detect GPU (default: true)
ENABLE_FP16=true            # Mixed precision (default: true)
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
SUMMARIZATION_MODEL=facebook/bart-large-cnn
```

## Troubleshooting

### GPU Not Detected?
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Check CUDA Version
```bash
python -c "import torch; print(torch.version.cuda)"
```

### Out of Memory?
- Set `ENABLE_FP16=true` (reduces memory by ~50%)
- Reduce batch sizes in pipeline
- Or set `USE_GPU=false` to fall back to CPU

## Files

- 📋 `gpu-optimization-marko.json` - Planning doc
- 🧪 `test_gpu_models.py` - Test script
- 🧪 `test_pipeline_gpu.py` - Pipeline test
- 📖 `GPU_OPTIMIZATION_COMPLETE.md` - Full docs
- 📄 `GPU_OPTIMIZATION_SUMMARY.md` - Summary

---
✅ **GPU optimization complete!**  
Stage 6 no longer hangs.  
50-100x faster for AI operations.
