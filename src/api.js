/**
 * API client for the LLM Council backend.
 * Updated for MongoDB & User-specific conversations.
 */

const API_BASE = 'http://localhost:8001'; // Matches your FastAPI uvicorn port

export const api = {
  /**
   * List all conversations for a specific user.
   * @param {string} userId - The ID of the logged-in user.
   */
  async listConversations(userId) {
    if (!userId) throw new Error('User ID is required to list conversations');
    
    const response = await fetch(`${API_BASE}/api/conversations?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to list conversations');
    }
    return response.json();
  },

  /**
   * Create a new conversation linked to a user.
   * @param {string} userId - The ID of the logged-in user.
   */
  async createConversation(userId) {
    if (!userId) throw new Error('User ID is required to create a conversation');

    const response = await fetch(`${API_BASE}/api/conversations?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
  },

  /**
   * Get a specific conversation with all messages.
   */
  async getConversation(conversationId) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}`
    );
    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }
    return response.json();
  },

  /**
   * Send a message and receive streaming updates via SSE.
   */
  async sendMessageStream(conversationId, content, onEvent) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/message/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to connect to stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // Buffer to handle partial JSON chunks

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append new chunk to buffer and split by double newlines (SSE standard)
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      
      // Keep the last partial part in the buffer
      buffer = parts.pop();

      for (const part of parts) {
        const line = part.trim();
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const event = JSON.parse(dataStr);
            onEvent(event.type, event);
          } catch (e) {
            console.error('Failed to parse SSE event:', e, 'Data:', dataStr);
          }
        }
      }
    }
  },
};