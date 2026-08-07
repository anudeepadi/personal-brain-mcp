# HybridRAG Enhancement Instructions for Claude Code

## Project Context
You are enhancing an existing **Personal Brain MCP system** (FastAPI-based multimodal RAG) by implementing **HybridRAG architecture** that combines Knowledge Graphs with Vector Retrieval. The current system uses Pinecone for vector storage and supports document upload, search, and chat functionality.

## Implementation Plan

### Phase 1: Foundation Setup (Priority: High)

**Task 1: Install Required Dependencies**
```bash
# Add these to requirements.txt and install
pip install neo4j networkx spacy transformers
```

**Task 2: Create Knowledge Graph Schema**
Create `graph_schema.py` with:
- EntityType enum (person, organization, technology, project, concept, document, location, event)
- RelationType enum (works_on, uses_technology, collaborates_with, part_of, related_to, mentions, created_by, occurred_in)
- Entity and Relation dataclasses with proper typing

**Task 3: Update Configuration**
Enhance `config.py` to add:
- Neo4j connection settings (URI, username, password)
- Graph processing parameters (max triplets per chunk, confidence thresholds)
- Feature flags for enabling/disabling graph functionality

### Phase 2: Core Graph Service (Priority: High)

**Task 4: Implement Graph Service**
Create `graph_service.py` with these key methods:

1. **Entity Extraction Method**
   - Use the existing LLM (Gemini/Claude) to extract entities and relationships from text
   - Create a structured prompt that returns JSON with entities and relations
   - Focus on technical concepts, people, organizations, and projects
   - Filter results by confidence threshold

2. **Graph Storage Method**
   - Use NetworkX for in-memory graph operations
   - Optionally integrate Neo4j for persistent storage
   - Store entities as nodes with properties
   - Store relationships as edges with confidence scores

3. **Graph Traversal Method**
   - Implement multi-hop relationship discovery
   - Create path-based relationship scoring
   - Support configurable hop limits (1-3 hops)
   - Return results with relevance scoring

4. **Entity Search Method**
   - Text-based entity lookup by name/properties
   - Support partial matching and fuzzy search
   - Return ranked results with relevance scores

### Phase 3: Enhanced Document Processing (Priority: High)

**Task 5: Modify Document Processing Pipeline**
Enhance the existing `services.py` document processing:

1. **Add Graph Processing to Document Upload**
   - After existing vector processing, extract entities/relations from each chunk
   - Store graph metadata alongside vector embeddings
   - Track entity counts and relationship counts per document

2. **Preserve Existing Functionality**
   - Keep all current vector processing intact
   - Make graph processing optional via configuration
   - Ensure backward compatibility with existing endpoints

### Phase 4: Hybrid Search Implementation (Priority: High)

**Task 6: Create Hybrid Search Service**
Create `hybrid_search.py` with:

1. **Hybrid Search Method**
   - Execute vector and graph searches in parallel
   - Implement result fusion with configurable weights
   - Support different search strategies (vector-only, graph-only, hybrid)

2. **Vector Search Integration**
   - Use existing `search_documents_enhanced` function
   - Maintain current vector search quality

3. **Graph Search Implementation**
   - Find entities matching the query text
   - Perform multi-hop traversal from matching entities
   - Score results based on relevance and relationship confidence

4. **Result Fusion Algorithm**
   - Combine vector and graph results with weighted scoring
   - Remove duplicates and rank by hybrid score
   - Maintain result diversity and relevance

### Phase 5: API Enhancement (Priority: Medium)

**Task 7: Add New Endpoints to main.py**

1. **Enhanced Upload Endpoint**
   - `/upsert/hybrid` - Document upload with graph processing
   - Include graph extraction statistics in response

2. **Hybrid Search Endpoint**
   - `/search/hybrid` - Combined vector and graph search
   - Support configurable weights and hop limits
   - Return both vector and graph results with fusion scores

3. **Graph Exploration Endpoints**
   - `/graph/entities` - List entities with filtering
   - `/graph/relations/{entity_id}` - Explore entity relationships

**Task 8: Enhance MCP Server**
Update `mcp_server.py` to add:
- `search_documents_hybrid` tool for enhanced search
- `explore_entity_relationships` tool for graph traversal
- Proper error handling and result formatting

### Phase 6: Testing and Optimization (Priority: Medium)

**Task 9: Create Test Suite**
Develop `test_hybridrag.py` with:
- Entity extraction accuracy tests
- Graph traversal correctness tests
- Hybrid search performance tests
- Integration tests with existing functionality

**Task 10: Performance Optimization**
Create `optimize_hybridrag.py` to:
- Benchmark different search strategies
- Analyze latency vs. accuracy tradeoffs
- Generate optimization recommendations
- Implement caching for frequent graph queries

### Phase 7: Documentation and Monitoring (Priority: Low)

**Task 11: Update Documentation**
Enhance `CLAUDE.md` with:
- HybridRAG architecture explanation
- New endpoint documentation
- Configuration options guide
- Performance tuning tips

**Task 12: Add Monitoring**
Implement logging and metrics for:
- Entity extraction success rates
- Graph traversal performance
- Search result quality metrics
- System resource usage

## Key Implementation Guidelines

### Entity Extraction Prompt Strategy
Use structured prompts that request JSON output with specific entity types and relationship categories. Focus on domain-specific entities (technical concepts, projects, people) and clear relationship types.

### Graph Storage Strategy
Start with NetworkX for development and testing. Consider Neo4j for production if graph size exceeds memory limits or if persistent storage is required.

### Search Fusion Strategy
Implement multiple fusion strategies:
- **Weighted Linear Combination**: Combine scores with configurable weights
- **Rank-based Fusion**: Merge based on result rankings
- **Threshold-based Selection**: Use different retrieval methods based on query characteristics

### Performance Optimization Focus
- Cache frequent entity lookups
- Implement parallel graph traversal
- Optimize vector embedding batch processing
- Use graph indexing for faster entity search

### Error Handling Strategy
- Graceful degradation: Fall back to vector-only search if graph processing fails
- Comprehensive logging for debugging entity extraction issues
- User-friendly error messages that don't expose system internals

## Success Metrics

1. **Technical Metrics**
   - Entity extraction accuracy > 80%
   - Graph search latency < 500ms for 2-hop queries
   - Hybrid search relevance improvement > 15% vs vector-only

2. **System Metrics**
   - Zero breaking changes to existing functionality
   - Backward compatibility maintained
   - Memory usage increase < 50% for typical workloads

3. **User Experience Metrics**
   - Improved search result relevance
   - Better relationship discovery
   - Enhanced knowledge exploration capabilities

## Implementation Priority
1. **Week 1**: Tasks 1-3 (Foundation)
2. **Week 2**: Tasks 4-6 (Core Implementation)
3. **Week 3**: Tasks 7-8 (API Enhancement)
4. **Week 4**: Tasks 9-12 (Testing & Optimization)

Start with the foundation setup and core graph service, then progressively add hybrid search capabilities while maintaining system stability.