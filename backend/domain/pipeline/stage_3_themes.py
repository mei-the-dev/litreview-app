"""Stage 3: Group papers by theme using clustering"""
from typing import List, Dict
import numpy as np
from sklearn.cluster import KMeans
from collections import Counter
from backend.api.models.paper_model import Paper
from backend.infrastructure.ai.huggingface_client import hf_client
from backend.core.websocket_manager import manager


async def execute(session_id: str, papers: List[Paper]) -> Dict[str, List[Paper]]:
    """Cluster papers into themes using embeddings + K-means"""
    
    await manager.send_stage_update(
        session_id,
        stage=3,
        progress=10,
        message="Analyzing paper content for themes..."
    )
    
    # Generate embeddings for clustering
    paper_texts = [
        f"{p.title} {p.abstract or ''}" for p in papers
    ]
    
    embeddings = await hf_client.get_embeddings(paper_texts)
    
    await manager.send_stage_update(
        session_id,
        stage=3,
        progress=50,
        message="Clustering papers into themes..."
    )
    
    # Determine optimal number of clusters (3-7 themes)
    n_clusters = min(max(3, len(papers) // 10), 7)
    
    # K-means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(embeddings)
    
    # Extract theme names from most common words in each cluster
    theme_names = _extract_theme_names(papers, cluster_labels, n_clusters)
    
    # Group papers by theme
    themes = {}
    for i, paper in enumerate(papers):
        theme = theme_names[cluster_labels[i]]
        paper.theme = theme
        
        if theme not in themes:
            themes[theme] = []
        themes[theme].append(paper)
    
    await manager.send_stage_complete(
        session_id,
        stage=3,
        result={
            "themes_found": len(themes),
            "themes": {
                theme: len(papers_list)
                for theme, papers_list in themes.items()
            }
        }
    )
    
    return themes


def _extract_theme_names(papers: List[Paper], labels: np.ndarray, n_clusters: int) -> Dict[int, str]:
    """Extract descriptive theme names from paper titles"""
    from collections import defaultdict
    import re
    
    cluster_words = defaultdict(list)
    
    # Collect words from each cluster
    for i, label in enumerate(labels):
        title = papers[i].title.lower()
        # Extract meaningful words (3+ chars, not common words)
        words = re.findall(r'\b[a-z]{4,}\b', title)
        common_words = {'with', 'from', 'using', 'based', 'analysis', 'study', 'research', 'paper'}
        words = [w for w in words if w not in common_words]
        cluster_words[label].extend(words)
    
    # Get most common word for each cluster
    theme_names = {}
    used_names = set()
    
    for label in range(n_clusters):
        if cluster_words[label]:
            word_counts = Counter(cluster_words[label])
            # Get most common unique word
            for word, count in word_counts.most_common():
                theme_name = word.capitalize()
                if theme_name not in used_names:
                    theme_names[label] = theme_name
                    used_names.add(theme_name)
                    break
            else:
                theme_names[label] = f"Theme {label + 1}"
        else:
            theme_names[label] = f"Theme {label + 1}"
    
    return theme_names
