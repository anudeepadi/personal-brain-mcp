// ===== Configuration =====
const API_BASE_URL = window.location.origin;

// ===== Utility Functions =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(contentType) {
    if (!contentType) return '📄';
    if (contentType.includes('pdf')) return '📕';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('audio')) return '🎵';
    if (contentType.includes('text')) return '📝';
    return '📄';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#FF3B30' : type === 'success' ? '#34C759' : '#007AFF'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Chat Functionality =====
class ChatManager {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputElement = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-btn');
        this.modelSelect = document.getElementById('model-select');
        this.citationsToggle = document.getElementById('citations-toggle');

        this.init();
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.inputElement.addEventListener('input', () => {
            this.inputElement.style.height = 'auto';
            this.inputElement.style.height = this.inputElement.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const query = this.inputElement.value.trim();
        if (!query) return;

        const model = this.modelSelect.value;
        const includeCitations = this.citationsToggle.checked;

        // Clear input
        this.inputElement.value = '';
        this.inputElement.style.height = 'auto';

        // Remove welcome message if exists
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Add user message
        this.addMessage('user', query);

        // Disable send button
        this.sendButton.disabled = true;

        try {
            if (includeCitations) {
                await this.sendEnhancedChat(query, model);
            } else {
                await this.sendStreamingChat(query, model);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('assistant', 'Sorry, an error occurred. Please try again.');
            showNotification('Failed to send message', 'error');
        } finally {
            this.sendButton.disabled = false;
        }
    }

    async sendEnhancedChat(query, model) {
        const formData = new FormData();
        formData.append('query', query);
        formData.append('model_provider', model);
        formData.append('include_references', 'true');

        const response = await fetch(`${API_BASE_URL}/chat/enhanced`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Chat request failed');
        }

        const data = await response.json();
        this.addMessage('assistant', data.response, data.references);
    }

    async sendStreamingChat(query, model) {
        const formData = new FormData();
        formData.append('query', query);
        formData.append('model_provider', model);

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Chat request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        const messageElement = this.addMessage('assistant', '', null, true);
        const contentElement = messageElement.querySelector('.message-content');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullResponse += chunk;
            contentElement.textContent = fullResponse;

            // Auto-scroll
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    addMessage(role, content, references = null, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        let html = `
            <div class="message-header">
                <span class="message-role">${role === 'user' ? 'You' : 'Assistant'}</span>
            </div>
            <div class="message-content">${content}</div>
        `;

        if (references && references.length > 0) {
            html += '<div class="message-citations"><strong>Sources:</strong>';
            references.forEach((ref, index) => {
                html += `<span class="citation">[${index + 1}] ${ref.filename || ref.document_id} (Score: ${(ref.score * 100).toFixed(0)}%)</span>`;
            });
            html += '</div>';
        }

        messageDiv.innerHTML = html;
        this.messagesContainer.appendChild(messageDiv);

        // Auto-scroll
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        return messageDiv;
    }
}

// ===== Document Management =====
class DocumentManager {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.documentsGrid = document.getElementById('documents-grid');

        this.init();
    }

    init() {
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.uploadFiles(files);
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.uploadFiles(files);
        });

        // Load documents on init
        this.loadDocuments();
    }

    async uploadFiles(files) {
        if (files.length === 0) return;

        showNotification(`Uploading ${files.length} file(s)...`, 'info');

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${API_BASE_URL}/upsert`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const data = await response.json();
                console.log('Uploaded:', data);
                showNotification(`✓ ${file.name} uploaded successfully`, 'success');
            } catch (error) {
                console.error('Upload error:', error);
                showNotification(`✗ Failed to upload ${file.name}`, 'error');
            }
        }

        // Reload documents
        this.loadDocuments();

        // Clear file input
        this.fileInput.value = '';
    }

    async loadDocuments() {
        this.documentsGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading documents...</p>
            </div>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/documents?limit=50`);
            if (!response.ok) {
                throw new Error('Failed to load documents');
            }

            const documents = await response.json();

            if (documents.length === 0) {
                this.documentsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📁</div>
                        <h3>No documents yet</h3>
                        <p>Upload your first document to get started</p>
                    </div>
                `;
                return;
            }

            this.documentsGrid.innerHTML = '';
            documents.forEach(doc => this.renderDocument(doc));
        } catch (error) {
            console.error('Load documents error:', error);
            this.documentsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Failed to load documents</h3>
                    <p>Please try again</p>
                </div>
            `;
        }
    }

    renderDocument(doc) {
        const card = document.createElement('div');
        card.className = 'document-card';

        const icon = getFileIcon(doc.content_type);
        const date = doc.upload_date ? formatDate(doc.upload_date) : 'Unknown';
        const size = doc.file_size ? formatFileSize(doc.file_size) : '';

        card.innerHTML = `
            <div class="document-header">
                <div class="document-icon">${icon}</div>
            </div>
            <div class="document-title">${doc.filename || doc.document_id}</div>
            <div class="document-meta">
                ${date}${size ? ` • ${size}` : ''}
            </div>
        `;

        card.addEventListener('click', () => this.viewDocument(doc.document_id));

        this.documentsGrid.appendChild(card);
    }

    async viewDocument(documentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            const doc = await response.json();

            // Create modal to show document details
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            `;

            content.innerHTML = `
                <button onclick="this.closest('[style]').remove()" style="position: absolute; top: 16px; right: 16px; background: #f5f5f7; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px;">×</button>
                <h2 style="margin-bottom: 16px;">${doc.filename || doc.document_id}</h2>
                <div style="margin-bottom: 16px; color: #6e6e73;">
                    ${doc.upload_date ? formatDate(doc.upload_date) : ''} • ${doc.file_size ? formatFileSize(doc.file_size) : ''} • ${doc.chunks?.length || 0} chunks
                </div>
                ${doc.summary ? `<p style="margin-bottom: 16px; padding: 16px; background: #f5f5f7; border-radius: 8px;">${doc.summary}</p>` : ''}
                <h3 style="margin-bottom: 12px;">Content Preview</h3>
                <div style="white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.6;">
                    ${doc.chunks?.slice(0, 3).map(chunk => chunk.content).join('\n\n---\n\n') || 'No content available'}
                </div>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('View document error:', error);
            showNotification('Failed to load document details', 'error');
        }
    }
}

// ===== Search Functionality =====
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-btn');
        this.searchResults = document.getElementById('search-results');
        this.searchType = document.getElementById('search-type');
        this.searchLimit = document.getElementById('search-limit');

        this.init();
    }

    init() {
        this.searchButton.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            showNotification('Please enter a search query', 'error');
            return;
        }

        const type = this.searchType.value;
        const limit = this.searchLimit.value || 5;

        this.searchResults.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Searching...</p>
            </div>
        `;

        try {
            const endpoint = type === 'documents' ? '/search/documents' : '/search';
            const response = await fetch(`${API_BASE_URL}${endpoint}?q=${encodeURIComponent(query)}&top_k=${limit}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const results = await response.json();
            this.renderResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.searchResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Search Failed</h3>
                    <p>Please try again</p>
                </div>
            `;
            showNotification('Search failed', 'error');
        }
    }

    renderResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No Results Found</h3>
                    <p>Try a different search query</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = '';
        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'result-card';

            const score = result.score ? (result.score * 100).toFixed(0) : 'N/A';
            const title = result.filename || result.metadata?.filename || result.metadata?.session_id || 'Untitled';

            card.innerHTML = `
                <div class="result-header">
                    <div class="result-title">${title}</div>
                    <div class="result-score">${score}%</div>
                </div>
                <div class="result-content">${result.content || result.text || 'No content'}</div>
                ${result.metadata ? `<div class="result-meta">${JSON.stringify(result.metadata).slice(0, 100)}...</div>` : ''}
            `;

            this.searchResults.appendChild(card);
        });
    }
}

// ===== Navigation =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            scrollToSection(targetId);
        });
    });
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    window.chatManager = new ChatManager();
    window.documentManager = new DocumentManager();
    window.searchManager = new SearchManager();

    // Setup navigation
    setupNavigation();

    console.log('Personal Brain UI initialized');
});

// Make loadDocuments globally accessible for refresh button
function loadDocuments() {
    if (window.documentManager) {
        window.documentManager.loadDocuments();
    }
}
