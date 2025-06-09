const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'deepseek/deepseek-r1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mental health counselor system prompt
const SYSTEM_PROMPT = `You are a compassionate and professional AI mental health counselor. Your role is to:

1. Provide empathetic, supportive, and non-judgmental responses
2. Use active listening techniques and validate the user's feelings
3. Offer coping strategies and practical mental health advice
4. Encourage professional help when appropriate
5. Maintain appropriate boundaries while being warm and caring
6. Ask thoughtful follow-up questions to understand the user's situation better
7. Provide crisis resources if someone expresses suicidal ideation or self-harm

Important guidelines:
- Always prioritize user safety and well-being
- Be culturally sensitive and inclusive
- Avoid giving medical diagnoses or prescribing medication
- Encourage professional mental health treatment when needed
- If someone is in crisis, provide emergency resources immediately
- Keep responses supportive, hopeful, and solution-focused
- Use person-first language and avoid stigmatizing terms

Remember: You are not replacing professional therapy but providing supportive conversation and basic mental health guidance.`;

// Store conversation history (in production, use a proper database)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and sessionId are required' });
        }

        // Get or create conversation history
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, [
                { role: 'system', content: SYSTEM_PROMPT }
            ]);
        }

        const conversation = conversations.get(sessionId);
        
        // Add user message to conversation
        conversation.push({ role: 'user', content: message });

        // Prepare request to OpenRouter API
        const requestBody = {
            model: MODEL_NAME,
            messages: conversation,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        };

        // Make request to OpenRouter API
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'MannKoboli Mental Health AI'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', response.status, errorData);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        const aiResponse = data.choices[0].message.content;

        // Add AI response to conversation history
        conversation.push({ role: 'assistant', content: aiResponse });

        // Limit conversation history to last 20 messages (10 exchanges)
        if (conversation.length > 21) { // +1 for system message
            conversation.splice(1, conversation.length - 21);
        }

        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        
        // Provide a fallback response for common mental health scenarios
        const fallbackResponse = getFallbackResponse(req.body.message);
        
        res.status(500).json({
            error: 'I apologize, but I\'m having trouble connecting right now. However, I want you to know that your feelings are valid and you\'re not alone.',
            fallbackResponse: fallbackResponse,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        model: MODEL_NAME
    });
});

// Clear conversation endpoint
app.post('/api/clear-conversation', (req, res) => {
    const { sessionId } = req.body;
    
    if (sessionId && conversations.has(sessionId)) {
        conversations.delete(sessionId);
    }
    
    res.json({ message: 'Conversation cleared successfully' });
});

// Fallback responses for when API is unavailable
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all')) {
        return "I'm really concerned about you right now. Please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. Your life has value and there are people who want to help you through this difficult time.";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
        return "I hear that you're feeling anxious, and that's completely understandable. Anxiety is very common and treatable. Try taking slow, deep breaths - in for 4 counts, hold for 4, out for 4. Focus on what you can control right now. Would it help to talk about what's making you feel anxious?";
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
        return "I'm sorry you're going through such a difficult time. Depression can make everything feel overwhelming, but please know that these feelings can change and improve. You've taken a brave step by reaching out. Small steps like getting sunlight, gentle movement, or connecting with someone you trust can help. Have you been able to talk to a professional about how you're feeling?";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
        return "Feeling stressed and overwhelmed is really challenging. It sounds like you have a lot on your plate right now. Let's try to break things down into smaller, manageable pieces. What's the most pressing thing you're dealing with today? Sometimes talking through priorities can help reduce that feeling of being overwhelmed.";
    }
    
    if (lowerMessage.includes('panic') || lowerMessage.includes('panic attack')) {
        return "Panic attacks are frightening but they will pass. Right now, try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Breathe slowly and deeply. You're safe, and this feeling will pass. If panic attacks are frequent, please consider speaking with a healthcare provider.";
    }
    
    return "Thank you for sharing with me. I want you to know that I'm here to listen and support you. Your feelings are valid, and it's okay to not be okay sometimes. What would be most helpful for you to talk about right now?";
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Something went wrong on our end. Please try again.',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MannKoboli Mental Health Server running on http://localhost:${PORT}`);
    console.log(`📱 Using model: ${MODEL_NAME}`);
    console.log(`🔐 API Key configured: ${OPENROUTER_API_KEY ? 'Yes' : 'No'}`);
});
