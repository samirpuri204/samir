
// Frontend JavaScript for MannKoboli Mental Health Website

class MentalHealthChat {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.isConnected = false;
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    init() {
        this.checkConnection();
        this.setupEventListeners();
        this.setupScrollAnimation();
    }

    async checkConnection() {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                this.isConnected = true;
                this.updateConnectionStatus('Connected - Ready to chat', 'connected');
                this.enableChat();
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.isConnected = false;
            this.updateConnectionStatus('Connection issue - Limited functionality', 'disconnected');
            this.enableChat(); // Still allow chat with fallback responses
        }
    }

    updateConnectionStatus(message, status) {
        this.connectionStatus.textContent = message;
        this.connectionStatus.className = `connection-status ${status}`;
    }

    enableChat() {
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.placeholder = "Type your message here...";
        this.messageInput.focus();
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea functionality
        this.messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });
    }

    setupScrollAnimation() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Clear input and disable temporarily
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.setLoading(true);

        // Add user message to chat
        this.addMessage(message, 'user');

        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Add AI response to chat
                this.addMessage(data.response, 'bot');
            } else {
                // Handle error with fallback response
                if (data.fallbackResponse) {
                    this.addMessage(data.fallbackResponse, 'bot');
                } else {
                    this.addMessage(data.error || 'I apologize, but I\'m having trouble responding right now. Please try again.', 'bot');
                }
            }
        } catch (error) {
            console.error('Send message error:', error);
            this.addMessage('I\'m having trouble connecting right now. Please check your internet connection and try again. If you\'re in crisis, please call 988 or your local emergency services.', 'bot');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(new Date());

        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    setLoading(isLoading) {
        this.sendButton.disabled = isLoading;
        this.messageInput.disabled = isLoading;
        
        if (isLoading) {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.addTypingIndicator();
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            this.removeTypingIndicator();
            this.messageInput.focus();
        }
    }

    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    clearConversation() {
        if (confirm('Are you sure you want to clear the conversation? This action cannot be undone.')) {
            // Clear frontend messages
            const messages = this.chatMessages.querySelectorAll('.message:not(:first-child)');
            messages.forEach(message => message.remove());

            // Clear backend conversation
            fetch('/api/clear-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            }).catch(error => console.error('Clear conversation error:', error));

            // Generate new session ID
            this.sessionId = this.generateSessionId();
        }
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add CSS for typing indicator
const style = document.createElement('style');
style.textContent = `
    .typing-indicator .message-content {
        background: white !important;
        color: #333 !important;
    }
    
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 5px 0;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #667eea;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .connection-status.connected {
        color: #22c55e;
    }
    
    .connection-status.disconnected {
        color: #ef4444;
    }
`;
document.head.appendChild(style);

// Initialize the chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mentalHealthChat = new MentalHealthChat();
    
    // Add clear conversation button functionality
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Chat';
    clearButton.className = 'btn-secondary';
    clearButton.style.cssText = 'position: absolute; top: 20px; right: 20px; padding: 8px 16px; font-size: 0.9rem;';
    clearButton.onclick = () => window.mentalHealthChat.clearConversation();
    
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.style.position = 'relative';
        chatContainer.appendChild(clearButton);
    }
    
    // Add emergency resources quick access
    const emergencyButton = document.createElement('div');
    emergencyButton.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
            <button id="emergency-btn" style="
                background: linear-gradient(45deg, #ff6b6b, #ff8e53);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 15px 20px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                transition: all 0.3s ease;
            ">
                🆘 Emergency Help
            </button>
        </div>
    `;
    document.body.appendChild(emergencyButton);
    
    document.getElementById('emergency-btn').addEventListener('click', () => {
        alert(`🆘 EMERGENCY RESOURCES 🆘

If you're in immediate danger or having thoughts of self-harm:

📞 Call 988 - Suicide & Crisis Lifeline
📱 Text HOME to 741741 - Crisis Text Line
🚨 Call 911 for immediate emergency

You are not alone. Help is available 24/7.`);
    });
});

// Add smooth scrolling behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';
