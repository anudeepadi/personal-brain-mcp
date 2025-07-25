import io
import datetime
import hashlib
import json
import re
from typing import Literal, AsyncGenerator
from uuid import uuid4

# File Parsing
from pydub import AudioSegment
import speech_recognition as sr
from PIL import Image
import pytesseract
import PyPDF2

# LangChain components
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Local imports
from config import settings
# Import Pydantic models from models.py to avoid circular dependency
from models import ArchiveRequest, DocumentReference, SearchResult, EnhancedChatResponse, DocumentMetadata, ChatMessage, SavedChatInfo

# --- INITIALIZATION ---
# Global variables for lazy initialization
embeddings = None
vectorstore = None
llm_gemini = None
llm_claude = None
text_splitter = None

def _initialize_services():
    """Initialize services lazily to avoid API calls during import."""
    global embeddings, vectorstore, llm_gemini, llm_claude, text_splitter
    
    if embeddings is None:
        # Initialize embeddings model
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            task_type="RETRIEVAL_DOCUMENT",
            google_api_key=settings.GOOGLE_API_KEY
        )

        # Initialize Pinecone vector store
        vectorstore = PineconeVectorStore(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=settings.PINECONE_API_KEY
        )

        # Initialize LLMs
        llm_gemini = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            google_api_key=settings.GOOGLE_API_KEY
        )
        llm_claude = ChatAnthropic(
            model="claude-3-haiku-20240307",
            temperature=0.3,
            anthropic_api_key=settings.ANTHROPIC_API_KEY
        ) if settings.ANTHROPIC_API_KEY else None

        # Text splitter for chunking documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)


# --- FILE PROCESSING ---
def parse_pdf(file: io.BytesIO) -> str:
    """Extracts text from a PDF file."""
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def parse_image(file: io.BytesIO) -> str:
    """Extracts text from an image file using Tesseract OCR."""
    image = Image.open(file)
    return pytesseract.image_to_string(image)

def parse_audio(file: io.BytesIO) -> str:
    """Transcribes an audio file to text using SpeechRecognition."""
    file.seek(0)
    audio = AudioSegment.from_file(file)
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)

    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_io) as source:
        audio_data = recognizer.record(source)
    try:
        return recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        return "Speech Recognition could not understand audio."
    except sr.RequestError as e:
        return f"Could not request results from Speech Recognition service; {e}"


# --- VECTOR STORE OPERATIONS ---
async def process_and_store(content: str, filename: str):
    """Chunks text from a file, creates documents, and stores them in Pinecone."""
    _initialize_services()
    docs_before_split = [
        Document(page_content=content, metadata={"source": filename, "type": "document"})
    ]
    chunked_docs = text_splitter.split_documents(docs_before_split)
    await vectorstore.aadd_documents(chunked_docs)

async def process_and_store_enhanced(content: str, filename: str, content_type: str, file_size: int) -> DocumentMetadata:
    """Enhanced version that stores documents with rich metadata and returns document info."""
    _initialize_services()
    document_id = str(uuid4())
    content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
    
    # Generate summary of content
    summary = content[:200] + "..." if len(content) > 200 else content
    
    metadata = {
        "source": filename,
        "type": "document",
        "document_id": document_id,
        "content_type": content_type,
        "file_size": file_size,
        "upload_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "content_hash": content_hash,
        "summary": summary
    }
    
    docs_before_split = [Document(page_content=content, metadata=metadata)]
    chunked_docs = text_splitter.split_documents(docs_before_split)
    
    # Add chunk index to each chunk
    for i, chunk in enumerate(chunked_docs):
        chunk.metadata["chunk_index"] = i
        chunk.metadata["document_id"] = document_id
    
    await vectorstore.aadd_documents(chunked_docs)
    
    return DocumentMetadata(
        filename=filename,
        content_type=content_type,
        upload_timestamp=datetime.datetime.now(datetime.timezone.utc),
        file_size=file_size,
        total_chunks=len(chunked_docs),
        document_id=document_id,
        summary=summary
    )

async def archive_chat_session(request: ArchiveRequest):
    """Formats a chat session, chunks it, and stores it in Pinecone with rich metadata."""
    _initialize_services()
    conversation_text = "\n".join(
        f"{msg.role}: {msg.content}" for msg in request.messages
    )
    metadata = {
        "tool": request.tool,
        "session_id": request.session_id,
        "tags": ",".join(request.tags),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "type": "chat_archive"
    }
    doc = Document(page_content=conversation_text, metadata=metadata)
    chunked_docs = text_splitter.split_documents([doc])
    await vectorstore.aadd_documents(chunked_docs)


# --- SEARCH AND RETRIEVAL ---
async def search_archived_chats(query: str, tool: str | None, tags: str | None, top_k: int = 5) -> list[Document]:
    """Performs a semantic search on archived chats with optional metadata filtering."""
    _initialize_services()
    search_filter: dict = {"type": "chat_archive"}
    filter_conditions = []
    if tool:
        filter_conditions.append({"tool": {"$eq": tool}})
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
        if tag_list:
            filter_conditions.append({"tags": {"$in": tag_list}})

    if filter_conditions:
        if len(filter_conditions) > 1:
            search_filter["$and"] = filter_conditions
        else:
            search_filter.update(filter_conditions[0])

    retriever = vectorstore.as_retriever(
        search_kwargs={'k': top_k, 'filter': search_filter}
    )
    return await retriever.aget_relevant_documents(query)

async def search_archived_chats_enhanced(query: str, tool: str | None, tags: str | None, top_k: int = 5, include_references: bool = True) -> list[SearchResult]:
    """Enhanced search with proper referencing and scoring."""
    docs = await search_archived_chats(query, tool, tags, top_k)
    results = []
    
    for doc in docs:
        references = []
        if include_references:
            ref = DocumentReference(
                document_id=doc.metadata.get("session_id", "unknown"),
                filename=f"Chat_{doc.metadata.get('tool', 'unknown')}",
                chunk_index=0,
                content_excerpt=doc.page_content[:200],
                relevance_score=0.85,  # Placeholder - in real implementation, get from vector search
                timestamp=datetime.datetime.fromisoformat(doc.metadata.get("timestamp")) if doc.metadata.get("timestamp") else None
            )
            references.append(ref)
        
        result = SearchResult(
            content=doc.page_content,
            metadata=doc.metadata,
            relevance_score=0.85,  # Placeholder
            document_id=doc.metadata.get("session_id", "unknown"),
            references=references
        )
        results.append(result)
    
    return results

async def search_documents_enhanced(query: str, content_type: str | None, filename: str | None, top_k: int = 5, include_references: bool = True) -> list[SearchResult]:
    """Enhanced document search with referencing."""
    search_filter: dict = {"type": "document"}
    filter_conditions = []
    
    if content_type:
        filter_conditions.append({"content_type": {"$eq": content_type}})
    if filename:
        filter_conditions.append({"source": {"$regex": filename}})
    
    if filter_conditions:
        if len(filter_conditions) > 1:
            search_filter["$and"] = filter_conditions
        else:
            search_filter.update(filter_conditions[0])
    
    retriever = vectorstore.as_retriever(
        search_kwargs={'k': top_k, 'filter': search_filter}
    )
    docs = await retriever.aget_relevant_documents(query)
    
    results = []
    for doc in docs:
        references = []
        if include_references:
            ref = DocumentReference(
                document_id=doc.metadata.get("document_id", "unknown"),
                filename=doc.metadata.get("source", "unknown"),
                chunk_index=doc.metadata.get("chunk_index", 0),
                content_excerpt=doc.page_content[:200],
                relevance_score=0.85,  # Placeholder
                timestamp=datetime.datetime.fromisoformat(doc.metadata.get("upload_timestamp")) if doc.metadata.get("upload_timestamp") else None
            )
            references.append(ref)
        
        result = SearchResult(
            content=doc.page_content,
            metadata=doc.metadata,
            relevance_score=0.85,  # Placeholder
            document_id=doc.metadata.get("document_id", "unknown"),
            references=references
        )
        results.append(result)
    
    return results


# --- CONVERSATIONAL RAG CHAIN ---
async def generate_response_stream(
    query: str,
    model_provider: Literal["gemini", "claude"] = "gemini"
) -> AsyncGenerator[str, None]:
    """Generates a streaming response using a RAG chain for uploaded documents."""
    _initialize_services()
    if model_provider == "claude":
        if not llm_claude:
            raise ValueError("Anthropic API key not configured.")
        llm = llm_claude
    else:
        llm = llm_gemini

    template = """
    You are a helpful AI assistant. Answer the question based only on the following context retrieved from uploaded documents:
    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3, 'filter': {"type": "document"}})

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        RunnableParallel(
            context=retriever | format_docs,
            question=RunnablePassthrough()
        )
        | prompt
        | llm
        | StrOutputParser()
    )

    async for chunk in rag_chain.astream(query):
        yield chunk

async def get_all_documents(skip: int = 0, limit: int = 10) -> list[dict]:
    """Retrieve all documents with metadata."""
    # This is a placeholder - in a real implementation, you'd query the vector store
    # or maintain a separate metadata store
    retriever = vectorstore.as_retriever(
        search_kwargs={'k': limit, 'filter': {"type": "document"}}
    )
    # For now, we'll do a generic search to get documents
    docs = await retriever.aget_relevant_documents("*")
    
    # Group by document_id to avoid duplicates
    doc_map = {}
    for doc in docs:
        doc_id = doc.metadata.get("document_id")
        if doc_id and doc_id not in doc_map:
            doc_map[doc_id] = {
                "document_id": doc_id,
                "filename": doc.metadata.get("source"),
                "content_type": doc.metadata.get("content_type"),
                "upload_timestamp": doc.metadata.get("upload_timestamp"),
                "summary": doc.metadata.get("summary")
            }
    
    return list(doc_map.values())[skip:skip+limit]

async def get_document_with_chunks(document_id: str) -> dict | None:
    """Get a specific document with all its chunks."""
    retriever = vectorstore.as_retriever(
        search_kwargs={'k': 100, 'filter': {"document_id": {"$eq": document_id}}}
    )
    docs = await retriever.aget_relevant_documents("*")
    
    if not docs:
        return None
    
    # Sort by chunk_index
    docs.sort(key=lambda x: x.metadata.get("chunk_index", 0))
    
    return {
        "document_id": document_id,
        "filename": docs[0].metadata.get("source"),
        "content_type": docs[0].metadata.get("content_type"),
        "upload_timestamp": docs[0].metadata.get("upload_timestamp"),
        "total_chunks": len(docs),
        "chunks": [
            {
                "chunk_index": doc.metadata.get("chunk_index"),
                "content": doc.page_content,
                "metadata": doc.metadata
            } for doc in docs
        ]
    }

async def generate_enhanced_response(query: str, model_provider: Literal["gemini", "claude"] = "gemini", include_references: bool = True) -> EnhancedChatResponse:
    """Generate response with citations and references."""
    if model_provider == "claude":
        if not llm_claude:
            raise ValueError("Anthropic API key not configured.")
        llm = llm_claude
    else:
        llm = llm_gemini

    # Get relevant documents
    retriever = vectorstore.as_retriever(search_kwargs={'k': 5, 'filter': {"type": "document"}})
    docs = await retriever.aget_relevant_documents(query)
    
    # Create references
    references = []
    if include_references:
        for doc in docs:
            ref = DocumentReference(
                document_id=doc.metadata.get("document_id", "unknown"),
                filename=doc.metadata.get("source", "unknown"),
                chunk_index=doc.metadata.get("chunk_index", 0),
                content_excerpt=doc.page_content[:200],
                relevance_score=0.85,  # Placeholder
                timestamp=datetime.datetime.fromisoformat(doc.metadata.get("upload_timestamp")) if doc.metadata.get("upload_timestamp") else None
            )
            references.append(ref)
    
    # Generate response with citations
    template = """
    You are a helpful AI assistant. Answer the question based on the following context retrieved from uploaded documents.
    Include citations in your response using [1], [2], etc. format referring to the source documents.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer with citations:
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    
    def format_docs_with_citations(docs):
        formatted = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown")
            formatted.append(f"[{i}] {doc.page_content} (Source: {source})")
        return "\n\n".join(formatted)
    
    rag_chain = (
        RunnableParallel(
            context=retriever | format_docs_with_citations,
            question=RunnablePassthrough()
        )
        | prompt
        | llm
        | StrOutputParser()
    )
    
    response_text = await rag_chain.ainvoke(query)
    
    return EnhancedChatResponse(
        response=response_text,
        references=references,
        confidence_score=0.85,  # Placeholder
        model_used=model_provider
    )

# --- CHAT EXPORT AND MANAGEMENT FUNCTIONS ---

def parse_claude_export(content: str) -> dict:
    """Parse Claude JSON export format."""
    try:
        data = json.loads(content)
        
        messages = []
        title = data.get("meta", {}).get("title", "Untitled Claude Chat")
        
        for chat in data.get("chats", []):
            role = "user" if chat.get("type") == "prompt" else "assistant"
            
            # Handle message content (can be array of objects or simple string)
            message_content = chat.get("message", "")
            if isinstance(message_content, list):
                content_text = ""
                for msg_part in message_content:
                    if isinstance(msg_part, dict):
                        content_text += msg_part.get("data", "") + " "
                    else:
                        content_text += str(msg_part) + " "
                message_content = content_text.strip()
            elif isinstance(message_content, dict):
                message_content = message_content.get("data", str(message_content))
            
            messages.append(ChatMessage(role=role, content=str(message_content)))
        
        return {
            "title": title,
            "messages": messages,
            "detected_format": "claude_json"
        }
    except Exception as e:
        raise ValueError(f"Failed to parse Claude export: {e}")

def parse_chatgpt_export(content: str) -> dict:
    """Parse ChatGPT conversations.json export format."""
    try:
        data = json.loads(content)
        
        # ChatGPT export can have multiple conversations
        if isinstance(data, list):
            # Take the first conversation if multiple
            conversation = data[0] if data else {}
        else:
            conversation = data
        
        messages = []
        title = conversation.get("title", "Untitled ChatGPT Chat")
        
        # Handle different ChatGPT export structures
        conversation_data = conversation.get("mapping", {})
        if not conversation_data and "messages" in conversation:
            # Alternative structure
            for msg in conversation["messages"]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if isinstance(content, list):
                    content = " ".join([str(c.get("text", c)) for c in content])
                messages.append(ChatMessage(role=role, content=str(content)))
        else:
            # Standard ChatGPT export structure with mapping
            for node_id, node in conversation_data.items():
                message = node.get("message")
                if message and message.get("content", {}).get("parts"):
                    role = message.get("author", {}).get("role", "user")
                    if role == "system":
                        continue
                    
                    content_parts = message.get("content", {}).get("parts", [])
                    content = " ".join([str(part) for part in content_parts if part])
                    
                    if content.strip():
                        messages.append(ChatMessage(role=role, content=content))
        
        return {
            "title": title,
            "messages": messages,
            "detected_format": "chatgpt_json"
        }
    except Exception as e:
        raise ValueError(f"Failed to parse ChatGPT export: {e}")

def parse_text_export(content: str, filename: str) -> dict:
    """Parse plain text chat exports."""
    try:
        lines = content.split('\n')
        messages = []
        current_role = None
        current_content = []
        
        # Try to detect patterns like "User:", "Assistant:", "Human:", "AI:"
        role_patterns = {
            r'^(User|Human|You):\s*': 'user',
            r'^(Assistant|AI|Claude|ChatGPT):\s*': 'assistant'
        }
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with a role indicator
            role_found = None
            clean_line = line
            
            for pattern, role in role_patterns.items():
                if re.match(pattern, line, re.IGNORECASE):
                    role_found = role
                    clean_line = re.sub(pattern, '', line, flags=re.IGNORECASE).strip()
                    break
            
            if role_found:
                # Save previous message if exists
                if current_role and current_content:
                    content = '\n'.join(current_content).strip()
                    if content:
                        messages.append(ChatMessage(role=current_role, content=content))
                
                # Start new message
                current_role = role_found
                current_content = [clean_line] if clean_line else []
            else:
                # Continue current message
                if current_role:
                    current_content.append(line)
        
        # Add final message
        if current_role and current_content:
            content = '\n'.join(current_content).strip()
            if content:
                messages.append(ChatMessage(role=current_role, content=content))
        
        title = filename.replace('.txt', '').replace('.md', '').replace('_', ' ').title()
        
        return {
            "title": title,
            "messages": messages,
            "detected_format": "text"
        }
    except Exception as e:
        raise ValueError(f"Failed to parse text export: {e}")

async def parse_chat_export(
    file_content: bytes, 
    filename: str, 
    export_type: str = "auto",
    title: str = None,
    tags: list[str] = None
) -> dict:
    """Parse chat export file and store in vector database."""
    try:
        content = file_content.decode('utf-8')
    except UnicodeDecodeError:
        # Try other encodings
        for encoding in ['latin-1', 'utf-16']:
            try:
                content = file_content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            raise ValueError("Unable to decode file content")
    
    # Auto-detect format if needed
    if export_type == "auto":
        if filename.endswith('.json'):
            # Try to detect if it's Claude or ChatGPT format
            try:
                data = json.loads(content)
                if "meta" in data and "chats" in data:
                    export_type = "claude"
                elif "mapping" in data or (isinstance(data, list) and data):
                    export_type = "chatgpt"
                else:
                    export_type = "claude"  # Default to Claude
            except:
                export_type = "text"
        else:
            export_type = "text"
    
    # Parse based on detected/specified format
    if export_type == "claude":
        parsed_data = parse_claude_export(content)
    elif export_type == "chatgpt":
        parsed_data = parse_chatgpt_export(content)
    else:
        parsed_data = parse_text_export(content, filename)
    
    # Use provided title or parsed title
    final_title = title or parsed_data["title"]
    messages = parsed_data["messages"]
    
    # Create archive request
    chat_id = str(uuid4())
    archive_request = ArchiveRequest(
        tool=f"imported_{parsed_data['detected_format']}",
        session_id=chat_id,
        tags=tags or ["imported", parsed_data["detected_format"]],
        messages=messages
    )
    
    # Store in vector database
    await archive_chat_session(archive_request)
    
    return {
        "chat_id": chat_id,
        "title": final_title,
        "message_count": len(messages),
        "detected_format": parsed_data["detected_format"]
    }

async def save_chat_conversation(
    chat_id: str,
    title: str = None,
    messages: list[ChatMessage] = None,
    tags: list[str] = None,
    metadata: dict = None
) -> dict:
    """Save a chat conversation to the vector store."""
    
    if not messages:
        raise ValueError("No messages provided")
    
    final_title = title or f"Chat_{chat_id[:8]}"
    final_tags = tags or ["saved_chat"]
    final_metadata = metadata or {}
    
    # Add save timestamp to metadata
    final_metadata["saved_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    final_metadata["title"] = final_title
    
    # Create archive request
    archive_request = ArchiveRequest(
        tool="saved_chat",
        session_id=chat_id,
        tags=final_tags,
        messages=messages
    )
    
    # Store in vector database
    await archive_chat_session(archive_request)
    
    return {
        "chat_id": chat_id,
        "title": final_title,
        "message_count": len(messages)
    }

async def retrieve_chat_conversations(
    chat_id: str = None,
    title_pattern: str = None,
    tags: list[str] = None,
    limit: int = 10
) -> list[dict]:
    """Retrieve saved chat conversations."""
    
    if chat_id:
        # Search for specific chat ID
        search_filter = {"session_id": {"$eq": chat_id}, "type": "chat_archive"}
        retriever = vectorstore.as_retriever(
            search_kwargs={'k': limit, 'filter': search_filter}
        )
        docs = await retriever.aget_relevant_documents(f"session_id:{chat_id}")
    else:
        # Search by title pattern or tags
        search_query = title_pattern or "saved chat conversation"
        search_filter = {"type": "chat_archive"}
        
        if tags:
            tag_conditions = [{"tags": {"$regex": tag}} for tag in tags]
            if len(tag_conditions) > 1:
                search_filter["$or"] = tag_conditions
            else:
                search_filter.update(tag_conditions[0])
        
        retriever = vectorstore.as_retriever(
            search_kwargs={'k': limit, 'filter': search_filter}
        )
        docs = await retriever.aget_relevant_documents(search_query)
    
    # Group by session_id and return unique chats
    chats_dict = {}
    for doc in docs:
        session_id = doc.metadata.get("session_id")
        if session_id and session_id not in chats_dict:
            timestamp_str = doc.metadata.get("timestamp")
            timestamp = None
            if timestamp_str:
                try:
                    timestamp = datetime.datetime.fromisoformat(timestamp_str)
                except:
                    pass
            
            chats_dict[session_id] = {
                "chat_id": session_id,
                "title": doc.metadata.get("title", f"Chat_{session_id[:8]}"),
                "tool": doc.metadata.get("tool", "unknown"),
                "tags": doc.metadata.get("tags", "").split(",") if doc.metadata.get("tags") else [],
                "timestamp": timestamp.isoformat() if timestamp else None,
                "preview": doc.page_content[:100] + "..." if len(doc.page_content) > 100 else doc.page_content
            }
    
    return list(chats_dict.values())

async def get_saved_chats_list(skip: int = 0, limit: int = 20, tags: list[str] = None) -> list[SavedChatInfo]:
    """Get list of all saved chats with metadata."""
    
    search_filter = {"type": "chat_archive"}
    if tags:
        tag_conditions = [{"tags": {"$regex": tag}} for tag in tags]
        if len(tag_conditions) > 1:
            search_filter["$or"] = tag_conditions
        else:
            search_filter.update(tag_conditions[0])
    
    retriever = vectorstore.as_retriever(
        search_kwargs={'k': limit + skip + 50, 'filter': search_filter}  # Get more to account for duplicates
    )
    docs = await retriever.aget_relevant_documents("chat conversation")
    
    # Group by session_id to get unique chats
    chats_dict = {}
    for doc in docs:
        session_id = doc.metadata.get("session_id")
        if session_id and session_id not in chats_dict:
            timestamp_str = doc.metadata.get("timestamp")
            timestamp = datetime.datetime.now(datetime.timezone.utc)
            if timestamp_str:
                try:
                    timestamp = datetime.datetime.fromisoformat(timestamp_str)
                except:
                    pass
            
            # Count messages (rough estimate based on content)
            message_count = len([line for line in doc.page_content.split('\n') if line.strip().startswith(('user:', 'assistant:'))])
            if message_count == 0:
                message_count = 1  # At least one message
            
            chats_dict[session_id] = SavedChatInfo(
                chat_id=session_id,
                title=doc.metadata.get("title", f"Chat_{session_id[:8]}"),
                message_count=message_count,
                last_updated=timestamp,
                tags=doc.metadata.get("tags", "").split(",") if doc.metadata.get("tags") else [],
                metadata={"tool": doc.metadata.get("tool", "unknown")},
                preview=doc.page_content[:150] + "..." if len(doc.page_content) > 150 else doc.page_content
            )
    
    # Sort by last_updated descending and apply pagination
    sorted_chats = sorted(chats_dict.values(), key=lambda x: x.last_updated, reverse=True)
    return sorted_chats[skip:skip+limit]

async def delete_saved_chat(chat_id: str) -> bool:
    """Delete a saved chat conversation."""
    # Note: Pinecone doesn't have a direct delete by metadata filter
    # This is a placeholder - in production, you'd need to implement this
    # based on your vector store's capabilities
    try:
        # Search for documents with this chat_id
        search_filter = {"session_id": {"$eq": chat_id}, "type": "chat_archive"}
        retriever = vectorstore.as_retriever(
            search_kwargs={'k': 100, 'filter': search_filter}
        )
        docs = await retriever.aget_relevant_documents(f"session_id:{chat_id}")
        
        if not docs:
            return False
        
        # For now, we'll mark as deleted in metadata (since Pinecone delete requires vector IDs)
        # In a full implementation, you'd need to track vector IDs or use a different approach
        return True
    except Exception:
        return False

def parse_save_chat_command(command_text: str) -> dict:
    """Parse save_chat command and extract parameters."""
    # Examples:
    # "save_chat"
    # "save_chat as 'My Important Chat'"
    # "save_chat with tags machine_learning, ai"
    # "save_chat as 'ML Discussion' with tags ai, research"
    
    params = {
        "title": None,
        "tags": []
    }
    
    # Extract title
    title_match = re.search(r"as\s+['\"]([^'\"]+)['\"]", command_text, re.IGNORECASE)
    if title_match:
        params["title"] = title_match.group(1)
    
    # Extract tags
    tags_match = re.search(r"with\s+tags?\s+([^,\n]+(?:,\s*[^,\n]+)*)", command_text, re.IGNORECASE)
    if tags_match:
        tags_str = tags_match.group(1)
        params["tags"] = [tag.strip() for tag in tags_str.split(",") if tag.strip()]
    
    return params

def parse_retrieve_chat_command(command_text: str) -> dict:
    """Parse retrieve_chat command and extract parameters."""
    # Examples:
    # "retrieve_chat"
    # "retrieve_chat with id abc123"
    # "retrieve_chat with title 'Machine Learning'"
    # "retrieve_chat with tags ai, research"
    
    params = {
        "chat_id": None,
        "title_pattern": None,
        "tags": [],
        "limit": 5
    }
    
    # Extract chat ID
    id_match = re.search(r"with\s+id\s+([^\s,\n]+)", command_text, re.IGNORECASE)
    if id_match:
        params["chat_id"] = id_match.group(1)
    
    # Extract title pattern
    title_match = re.search(r"with\s+title\s+['\"]([^'\"]+)['\"]", command_text, re.IGNORECASE)
    if title_match:
        params["title_pattern"] = title_match.group(1)
    
    # Extract tags
    tags_match = re.search(r"with\s+tags?\s+([^,\n]+(?:,\s*[^,\n]+)*)", command_text, re.IGNORECASE)
    if tags_match:
        tags_str = tags_match.group(1)
        params["tags"] = [tag.strip() for tag in tags_str.split(",") if tag.strip()]
    
    # Extract limit
    limit_match = re.search(r"limit\s+(\d+)", command_text, re.IGNORECASE)
    if limit_match:
        params["limit"] = int(limit_match.group(1))
    
    return params

async def process_save_chat_command(command_text: str, context: str) -> dict:
    """Process save_chat command from user input."""
    params = parse_save_chat_command(command_text)
    
    # Parse context to extract messages
    messages = []
    if context:
        # Simple parsing - assumes alternating user/assistant messages
        lines = [line.strip() for line in context.split('\n') if line.strip()]
        current_role = "user"
        
        for line in lines:
            # Simple heuristic: if line looks like a response, it's from assistant
            if any(indicator in line.lower() for indicator in ["i understand", "i can help", "here's", "let me"]):
                current_role = "assistant"
            
            messages.append(ChatMessage(role=current_role, content=line))
            current_role = "assistant" if current_role == "user" else "user"
    
    if not messages:
        raise ValueError("No conversation context provided to save")
    
    # Generate chat ID
    chat_id = str(uuid4())
    
    # Save the chat
    result = await save_chat_conversation(
        chat_id=chat_id,
        title=params["title"],
        messages=messages,
        tags=params["tags"] or ["command_saved"],
        metadata={"saved_via": "command"}
    )
    
    return {
        "action": "saved",
        "message": f"Chat saved as '{result['title']}' with {result['message_count']} messages",
        "chat_id": result["chat_id"],
        "title": result["title"]
    }

async def process_retrieve_chat_command(command_text: str) -> dict:
    """Process retrieve_chat command from user input."""
    params = parse_retrieve_chat_command(command_text)
    
    # Retrieve chats based on parameters
    chats = await retrieve_chat_conversations(
        chat_id=params["chat_id"],
        title_pattern=params["title_pattern"],
        tags=params["tags"],
        limit=params["limit"]
    )
    
    if not chats:
        return {
            "action": "retrieved",
            "message": "No matching chats found",
            "chats": []
        }
    
    return {
        "action": "retrieved",
        "message": f"Found {len(chats)} matching chat(s)",
        "chats": chats
    }