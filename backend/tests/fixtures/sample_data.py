"""
Test fixtures for UX presentation tests.
Sample data for papers, themes, methodologies, and reports.
"""
import json
from datetime import datetime

# Sample papers with all fields populated
SAMPLE_PAPERS = [
    {
        "paper_id": "p1",
        "title": "Deep Learning for Natural Language Processing: A Survey",
        "abstract": "This paper surveys recent advances in deep learning methods for natural language processing tasks. We cover neural architectures including RNNs, LSTMs, and Transformers, and their applications in translation, summarization, and question answering.",
        "authors": ["John Smith", "Jane Doe", "Bob Johnson"],
        "year": 2023,
        "citation_count": 450,
        "url": "https://example.com/paper1",
        "venue": "ACL 2023",
        "relevance_score": 0.95,
        "theme": "Deep Learning",
        "methodology": "Survey",
        "final_rank": 1
    },
    {
        "paper_id": "p2",
        "title": "Transformer Models in Computer Vision",
        "abstract": "We explore the application of transformer architectures, originally designed for NLP, to computer vision tasks. Our experiments show state-of-the-art results on image classification and object detection.",
        "authors": ["Alice Wang", "Charlie Brown"],
        "year": 2022,
        "citation_count": 320,
        "url": "https://example.com/paper2",
        "venue": "CVPR 2022",
        "relevance_score": 0.88,
        "theme": "Computer Vision",
        "methodology": "Experimental",
        "final_rank": 2
    },
    {
        "paper_id": "p3",
        "title": "Meta-Learning for Few-Shot Classification",
        "abstract": "This work presents a novel meta-learning approach for few-shot classification tasks. We demonstrate that our method achieves superior performance with limited training data across multiple domains.",
        "authors": ["Emma Davis", "Frank Miller", "Grace Lee"],
        "year": 2023,
        "citation_count": 180,
        "url": "https://example.com/paper3",
        "venue": "ICML 2023",
        "relevance_score": 0.82,
        "theme": "Meta-Learning",
        "methodology": "Experimental",
        "final_rank": 3
    },
    {
        "paper_id": "p4",
        "title": "Reinforcement Learning in Robotics: Current Trends",
        "abstract": "We review recent developments in applying reinforcement learning to robotics applications. Topics include sim-to-real transfer, multi-agent systems, and safety-critical control.",
        "authors": ["Henry Wilson", "Ivy Chen"],
        "year": 2023,
        "citation_count": 250,
        "url": "https://example.com/paper4",
        "venue": "IROS 2023",
        "relevance_score": 0.79,
        "theme": "Reinforcement Learning",
        "methodology": "Survey",
        "final_rank": 4
    },
    {
        "paper_id": "p5",
        "title": "Graph Neural Networks for Molecular Property Prediction",
        "abstract": "This paper introduces a graph neural network architecture specifically designed for predicting molecular properties. We achieve state-of-the-art results on benchmark datasets.",
        "authors": ["Jack Taylor", "Kate Anderson"],
        "year": 2022,
        "citation_count": 190,
        "url": "https://example.com/paper5",
        "venue": "NeurIPS 2022",
        "relevance_score": 0.75,
        "theme": "Graph Neural Networks",
        "methodology": "Experimental",
        "final_rank": 5
    }
]

# Sample themes with grouped papers
SAMPLE_THEMES = {
    "Deep Learning": [SAMPLE_PAPERS[0]],
    "Computer Vision": [SAMPLE_PAPERS[1]],
    "Meta-Learning": [SAMPLE_PAPERS[2]],
    "Reinforcement Learning": [SAMPLE_PAPERS[3]],
    "Graph Neural Networks": [SAMPLE_PAPERS[4]]
}

# Sample methodologies with grouped papers
SAMPLE_METHODOLOGIES = {
    "Survey": [SAMPLE_PAPERS[0], SAMPLE_PAPERS[3]],
    "Experimental": [SAMPLE_PAPERS[1], SAMPLE_PAPERS[2], SAMPLE_PAPERS[4]]
}

# Sample report
SAMPLE_REPORT = {
    "query": "machine learning",
    "total_papers": 5,
    "papers_by_theme": {
        "Deep Learning": 1,
        "Computer Vision": 1,
        "Meta-Learning": 1,
        "Reinforcement Learning": 1,
        "Graph Neural Networks": 1
    },
    "papers_by_methodology": {
        "Survey": 2,
        "Experimental": 3
    },
    "top_papers": SAMPLE_PAPERS[:3],
    "synthesis": """# Literature Review: Machine Learning

## Executive Summary
This review covers 5 key papers in machine learning, spanning topics from deep learning to graph neural networks.

## Key Themes
### Deep Learning
Deep learning methods continue to dominate NLP tasks, with transformer architectures showing remarkable performance.

### Computer Vision
Transformers have been successfully adapted to vision tasks, achieving state-of-the-art results.

### Meta-Learning
Few-shot learning approaches enable models to adapt quickly with limited data.

## Methodology Analysis
The papers employ two main approaches:
- **Survey papers (40%)**: Comprehensive reviews of specific subfields
- **Experimental papers (60%)**: Novel methods with empirical validation

## Top Papers
1. Deep Learning for NLP (95% relevance, 450 citations)
2. Transformers in Vision (88% relevance, 320 citations)
3. Meta-Learning (82% relevance, 180 citations)

## Conclusion
The field is rapidly evolving with transformers and meta-learning showing particular promise.""",
    "metadata": {
        "generated_by": "LitReview AI",
        "version": "1.0.0"
    },
    "generated_at": datetime.now().isoformat()
}

def save_fixtures():
    """Save fixtures to JSON files."""
    import os
    fixture_dir = os.path.dirname(__file__)
    
    with open(os.path.join(fixture_dir, 'papers.json'), 'w') as f:
        json.dump(SAMPLE_PAPERS, f, indent=2)
    
    with open(os.path.join(fixture_dir, 'themes.json'), 'w') as f:
        json.dump(SAMPLE_THEMES, f, indent=2)
    
    with open(os.path.join(fixture_dir, 'methodologies.json'), 'w') as f:
        json.dump(SAMPLE_METHODOLOGIES, f, indent=2)
    
    with open(os.path.join(fixture_dir, 'report.json'), 'w') as f:
        json.dump(SAMPLE_REPORT, f, indent=2)
    
    print(f"Fixtures saved to {fixture_dir}")

if __name__ == "__main__":
    save_fixtures()
