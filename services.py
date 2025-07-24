import io
import datetime
import hashlib
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
# Import Pydantic models from main.py for type hinting, avoiding circular dependency
from main import ArchiveRequest, DocumentReference, SearchResult, EnhancedChatResponse, DocumentMetadata

# --- INITIALIZATION ---
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
    docs_before_split = [
        Document(page_content=content, metadata={"source": filename, "type": "document"})
    ]
    chunked_docs = text_splitter.split_documents(docs_before_split)
    await vectorstore.aadd_documents(chunked_docs)

async def process_and_store_enhanced(content: str, filename: str, content_type: str, file_size: int) -> DocumentMetadata:
    """Enhanced version that stores documents with rich metadata and returns document info."""
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