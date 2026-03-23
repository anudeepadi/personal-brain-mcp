# Personal Brain API Architecture

## System Overview Diagram

```mermaid
graph TB
    subgraph "User Interfaces"
        CD[Claude Desktop]
        WEB[Web Browser]
        API[API Clients]
    end

    subgraph "Personal Brain API Core"
        subgraph "FastAPI Server (main.py)"
            REST[REST Endpoints]
            DOCS[Auto-Generated Docs]
        end
        
        subgraph "MCP Server (mcp_server.py)"
            MCPTOOLS[MCP Tools]
            MCPRES[MCP Resources]
        end
        
        subgraph "Business Logic (services.py)"
            PARSE[File Parsers]
            CHAT[Chat Management]
            SEARCH[Search Engine]
            LLM[LLM Integration]
        end
        
        subgraph "Data Models (models.py)"
            PYDANTIC[Pydantic Models]
        end
        
        subgraph "Configuration (config.py)"
            ENV[Environment Variables]
            SETTINGS[Settings Management]
        end
    end

    subgraph "External Services"
        PINECONE[Pinecone Vector DB]
        GOOGLE[Google Gemini API]
        ANTHROPIC[Anthropic Claude API]
    end

    subgraph "Data Storage"
        VECTOR[Vector Embeddings]
        META[Metadata Store]
        LOGS[Log Files]
    end

    %% User Interface Connections
    CD --> MCPTOOLS
    WEB --> REST
    API --> REST

    %% Internal Connections
    REST --> CHAT
    REST --> SEARCH
    REST --> PARSE
    MCPTOOLS --> CHAT
    MCPTOOLS --> SEARCH
    MCPTOOLS --> PARSE
    
    %% Service Dependencies
    CHAT --> LLM
    SEARCH --> LLM
    PARSE --> VECTOR
    
    %% Configuration
    CHAT --> SETTINGS
    SEARCH --> SETTINGS
    LLM --> SETTINGS
    
    %% External API Calls
    LLM --> GOOGLE
    LLM --> ANTHROPIC
    VECTOR --> PINECONE
    
    %% Data Storage
    PINECONE --> VECTOR
    PINECONE --> META
    MCPTOOLS --> LOGS
    REST --> LOGS

    %% Styling
    classDef userInterface fill:#e1f5fe
    classDef coreService fill:#f3e5f5
    classDef externalService fill:#fff3e0
    classDef storage fill:#e8f5e8
    
    class CD,WEB,API userInterface
    class REST,MCPTOOLS,CHAT,SEARCH,PARSE,LLM coreService
    class PINECONE,GOOGLE,ANTHROPIC externalService
    class VECTOR,META,LOGS storage
```

## Detailed Component Architecture

```mermaid
flowchart TB
    subgraph "Claude Desktop Integration"
        CD[Claude Desktop Client]
        MCP[MCP Protocol Handler]
    end
    
    subgraph "Personal Brain MCP Server"
        subgraph "Tools Layer"
            T1[search_documents]
            T2[save_chat]
            T3[retrieve_saved_chats]
            T4[import_chat_export]
            T5[ask_with_citations]
            T6[list_all_documents]
            T7[get_document_details]
            T8[search_chat_history]
            T9[process_chat_command]
        end
        
        subgraph "Resources Layer"
            R1[documents://list]
            R2[documents://{id}]
            R3[chats://saved]
            R4[chats://{id}]
        end
    end
    
    subgraph "FastAPI Web Server"
        subgraph "Core Endpoints"
            E1[POST /upsert]
            E2[POST /archive/chat]
            E3[GET /search]
            E4[POST /chat/enhanced]
        end
        
        subgraph "Chat Management Endpoints"
            E5[POST /import/chat]
            E6[POST /chats/save]
            E7[POST /chats/retrieve]
            E8[GET /chats]
            E9[DELETE /chats/{id}]
            E10[POST /command/save_chat]
            E11[POST /command/retrieve_chat]
        end
        
        subgraph "Document Endpoints"
            E12[GET /search/documents]
            E13[GET /documents]
            E14[GET /documents/{id}]
        end
    end
    
    subgraph "Service Layer Functions"
        subgraph "File Processing"
            F1[parse_pdf]
            F2[parse_image]
            F3[parse_audio]
            F4[parse_text_export]
            F5[parse_claude_export]
            F6[parse_chatgpt_export]
        end
        
        subgraph "Chat Management"
            C1[save_chat_conversation]
            C2[retrieve_chat_conversations]
            C3[archive_chat_session]
            C4[process_save_chat_command]
            C5[process_retrieve_chat_command]
        end
        
        subgraph "Search & Retrieval"
            S1[search_documents_enhanced]
            S2[search_archived_chats_enhanced]
            S3[generate_enhanced_response]
            S4[get_all_documents]
            S5[get_document_with_chunks]
        end
        
        subgraph "Vector Operations"
            V1[process_and_store_enhanced]
            V2[vectorstore operations]
            V3[embedding generation]
        end
    end
    
    subgraph "Data Models"
        M1[ChatMessage]
        M2[DocumentReference]
        M3[SearchResult]
        M4[ArchiveRequest]
        M5[SaveChatRequest]
        M6[DocumentMetadata]
        M7[EnhancedChatResponse]
    end
    
    subgraph "External Integrations"
        EXT1[Pinecone Vector DB]
        EXT2[Google Gemini API]
        EXT3[Anthropic Claude API]
        EXT4[Tesseract OCR]
        EXT5[SpeechRecognition]
    end
    
    %% Connections
    CD --> MCP
    MCP --> T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9
    MCP --> R1 & R2 & R3 & R4
    
    T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 --> S1 & S2 & S3 & C1 & C2
    R1 & R2 & R3 & R4 --> S4 & S5 & C2
    
    E1 & E2 & E3 & E4 --> F1 & F2 & F3 & C3 & S1 & S3
    E5 & E6 & E7 & E8 & E9 --> F5 & F6 & C1 & C2 & C4 & C5
    E10 & E11 --> C4 & C5
    E12 & E13 & E14 --> S1 & S4 & S5
    
    F1 & F2 & F3 --> V1
    F4 & F5 & F6 --> C1 & C3
    S1 & S2 & S3 --> V2 & V3
    C1 & C2 & C3 --> V2
    
    V2 --> EXT1
    V3 --> EXT2
    S3 --> EXT2 & EXT3
    F2 --> EXT4
    F3 --> EXT5
    
    %% All components use models
    T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 -.-> M1 & M2 & M3 & M4 & M5 & M6 & M7
    E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8 & E9 & E10 & E11 & E12 & E13 & E14 -.-> M1 & M2 & M3 & M4 & M5 & M6 & M7
    
    %% Styling
    classDef client fill:#e3f2fd
    classDef mcpLayer fill:#f3e5f5
    classDef apiLayer fill:#e8f5e8
    classDef serviceLayer fill:#fff3e0
    classDef modelLayer fill:#fce4ec
    classDef external fill:#f1f8e9
    
    class CD,MCP client
    class T1,T2,T3,T4,T5,T6,T7,T8,T9,R1,R2,R3,R4 mcpLayer
    class E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,E11,E12,E13,E14 apiLayer
    class F1,F2,F3,F4,F5,F6,C1,C2,C3,C4,C5,S1,S2,S3,S4,S5,V1,V2,V3 serviceLayer
    class M1,M2,M3,M4,M5,M6,M7 modelLayer
    class EXT1,EXT2,EXT3,EXT4,EXT5 external
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User as Claude Desktop User
    participant MCP as MCP Server
    participant API as FastAPI Server
    participant Services as Business Logic
    participant Pinecone as Vector Database
    participant LLM as AI Models

    %% Chat Save Flow
    Note over User,LLM: Chat Save Flow
    User->>MCP: save_chat "ML Discussion" with tags ai,research
    MCP->>Services: process_save_chat_command()
    Services->>Services: parse_command_parameters()
    Services->>Services: create_chat_messages()
    Services->>Pinecone: store_conversation_chunks()
    Services->>MCP: return success result
    MCP->>User: "Chat saved successfully"

    %% Document Upload Flow
    Note over User,LLM: Document Upload Flow
    User->>API: POST /upsert (PDF file)
    API->>Services: parse_pdf()
    Services->>Services: extract_text_content()
    Services->>Services: chunk_document()
    Services->>LLM: generate_embeddings()
    LLM-->>Services: embedding_vectors
    Services->>Pinecone: store_document_chunks()
    Services->>API: return DocumentMetadata
    API->>User: upload success response

    %% Search & Retrieval Flow
    Note over User,LLM: Search & Retrieval Flow
    User->>MCP: search_documents "neural networks"
    MCP->>Services: search_documents_enhanced()
    Services->>LLM: generate_query_embedding()
    LLM-->>Services: query_vector
    Services->>Pinecone: similarity_search()
    Pinecone-->>Services: relevant_chunks
    Services->>Services: create_references()
    Services->>MCP: return SearchResults
    MCP->>User: formatted search results

    %% Chat with Citations
    Note over User,LLM: Chat with Citations Flow
    User->>MCP: ask_with_citations "explain transformers"
    MCP->>Services: generate_enhanced_response()
    Services->>Pinecone: retrieve_relevant_docs()
    Pinecone-->>Services: context_documents
    Services->>LLM: generate_response_with_context()
    LLM-->>Services: cited_response
    Services->>Services: create_document_references()
    Services->>MCP: return EnhancedChatResponse
    MCP->>User: response with citations

    %% Chat Import Flow
    Note over User,LLM: Chat Import Flow
    User->>API: POST /import/chat (Claude JSON)
    API->>Services: parse_chat_export()
    Services->>Services: detect_export_format()
    Services->>Services: parse_claude_export()
    Services->>Services: create_archive_request()
    Services->>Pinecone: store_chat_chunks()
    Services->>API: return import_result
    API->>User: import success response
```

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend/Clients"
        A1[Claude Desktop]
        A2[Web Browser]
        A3[API Clients]
    end
    
    subgraph "Application Layer"
        B1[FastAPI]
        B2[FastMCP]
        B3[Pydantic]
        B4[Uvicorn]
    end
    
    subgraph "AI/ML Services"
        C1[LangChain]
        C2[Google Gemini]
        C3[Anthropic Claude]
        C4[Embeddings]
    end
    
    subgraph "Document Processing"
        D1[PyPDF2]
        D2[Tesseract OCR]
        D3[SpeechRecognition]
        D4[Pillow]
        D5[pydub]
    end
    
    subgraph "Data Storage"
        E1[Pinecone Vector DB]
        E2[File System Logs]
    end
    
    subgraph "Infrastructure"
        F1[Python 3.12]
        F2[Anaconda Environment]
        F3[Environment Variables]
        F4[JSON Configuration]
    end
    
    A1 & A2 & A3 --> B1 & B2
    B1 & B2 --> C1
    C1 --> C2 & C3 & C4
    B1 & B2 --> D1 & D2 & D3 & D4 & D5
    C1 & C4 --> E1
    B1 & B2 --> E2
    B1 & B2 & C1 --> F1
    F1 --> F2
    B1 & B2 & C1 --> F3 & F4
```

## File Structure

```
python-mcp/
├── main.py                    # FastAPI server with REST endpoints
├── mcp_server.py             # MCP server for Claude Desktop
├── services.py               # Business logic and AI integrations
├── models.py                 # Pydantic data models
├── config.py                 # Configuration and settings
├── requirements.txt          # Python dependencies
├── start_mcp_server.sh      # MCP server startup script
├── test_setup.py            # Setup verification script
├── test_mcp_startup.py      # MCP server test script
├── claude_desktop_config.json    # Claude Desktop configuration
├── claude_desktop_config_alternative.json  # Alternative config
├── .env.template            # Environment variables template
├── CLAUDE.md                # Development documentation
├── setup_mcp.md            # MCP setup guide
├── CHAT_MANAGEMENT_COMPLETE.md  # Complete usage guide
├── CLAUDE_DESKTOP_SETUP.md  # Claude Desktop setup guide
├── SETUP_SUCCESS.md         # Success confirmation guide
└── ARCHITECTURE_DIAGRAM.md  # This file
```

This architecture provides a comprehensive, scalable personal knowledge management system with seamless Claude Desktop integration and powerful AI-driven search and chat capabilities.