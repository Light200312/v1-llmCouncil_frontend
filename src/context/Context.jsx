import { createContext, useState, useEffect } from "react";
import { callOpenRouter } from "../utils/openrouter";
import { api } from "../api"; 
import axios from "axios";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  // ==========================================
  // AUTH STATE
  // ==========================================
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("council_user")) || null);

  // ==========================================
  // NORMAL CHAT STATE
  // ==========================================
  const [input, setInput] = useState("");
  const [PageView, setPageView] = useState("llm-chat"); 
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    id: Date.now(),
    messages: [],
  });
  const [chats, setChats] = useState([]);

  // ==========================================
  // LLM COUNCIL STATE
  // ==========================================
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLLMLoading, setIsLLMLoading] = useState(false);

  // ==========================================
  // AUTH FUNCTIONS
  // ==========================================
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8001/api/auth/login", { email, password });
      setUser(res.data);
      localStorage.setItem("council_user", JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || "Login failed" };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post("http://localhost:8001/api/auth/register", { username, email, password });
      return await login(email, password); 
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setConversations([]);
    setCurrentConversation(null);
    localStorage.removeItem("council_user");
  };

  // ==========================================
  // LLM CHAT FUNCTIONS (Updated for MongoDB)
  // ==========================================
 const loadConversations = async () => {
  if (!user?.id) return; // Use user.id from your login response
  try {
    const convs = await api.listConversations(user.id);
    setConversations(convs);
  } catch (error) {
    console.error("Sidebar load failed:", error);
  }
};

  const loadConversation = async (id) => {
    try {
      const conv = await api.getConversation(id);
      setCurrentConversation(conv);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;
    try {
      const newConv = await api.createConversation(user.id); // Pass user.id
      setConversations((prev) => [
        { id: newConv.id, created_at: newConv.created_at, message_count: 0, title: newConv.title },
        ...prev,
      ]);
      await loadConversations();
      setCurrentConversationId(newConv.id);
      setCurrentConversation(newConv);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  // Auto-load sidebar when user changes
  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  // Load specific conversation content when ID changes
  useEffect(() => {
    if (currentConversationId) loadConversation(currentConversationId);
  }, [currentConversationId]);

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
  };

  const handleSendLLMMessage = async (content) => {
    if (!currentConversationId || !user) return;

    setIsLLMLoading(true);
    
    try {
      // Optimistically add user message to UI
     const baseConversation = currentConversation || { messages: [] };
  const userMessage = { role: "user", content: content };

  // 1. Update UI with User Message
  setCurrentConversation({
    ...baseConversation,
    messages: [...baseConversation.messages, userMessage]
  });

      // Initializing the complex multi-stage assistant object
      const assistantMessage = {
        role: "assistant",
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: { stage1: true, stage2: false, stage3: false },
      };

      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), assistantMessage],
      }));

      // Streaming from Backend
      await api.sendMessageStream(currentConversationId, content, (eventType, event) => {
        setCurrentConversation((prev) => {
          const messages = [...prev.messages];
          const lastIdx = messages.length - 1;

          switch (eventType) {
            case "stage1_complete":
              messages[lastIdx].stage1 = event.data;
              messages[lastIdx].loading.stage1 = false;
              messages[lastIdx].loading.stage2 = true;
              break;
            case "stage2_complete":
              messages[lastIdx].stage2 = event.data;
              messages[lastIdx].metadata = event.metadata;
              messages[lastIdx].loading.stage2 = false;
              messages[lastIdx].loading.stage3 = true;
              break;
            case "stage3_complete":
              messages[lastIdx].stage3 = event.data;
              messages[lastIdx].loading.stage3 = false;
              break;
            case "title_complete":
              loadConversations(); // Refresh sidebar title
              break;
            case "complete":
              setIsLLMLoading(false);
              break;
            case "error":
              setIsLLMLoading(false);
              break;
          }
          return { ...prev, messages };
        });
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLLMLoading(false);
    }
  };

  // ==========================================
  // NORMAL CHAT FUNCTIONS (Stayed similar)
  // ==========================================
const onSent = async (prompt, image = null) => {
    if (!prompt && !image) return;

    // 1. Create User Message
    const userMessage = { role: "user", text: prompt, image: image };

    // 2. Add to UI immediately
    setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
    }));

    setLoading(true);
    setInput("");

    try {
        // 3. Use the callOpenRouter function you provided
        // We pass the entire history including the new message
        const history = [...currentChat.messages, userMessage];
        const response = await callOpenRouter(history);

        const botMessage = { role: "assistant", text: response };

        // 4. Update Chat with Bot Response
        setCurrentChat(prev => {
            const updatedChat = {
                ...prev,
                messages: [...prev.messages, botMessage]
            };
            
            // 5. Update the sidebar history list
            setChats(prevChats => {
                const exists = prevChats.find(c => c.id === updatedChat.id);
                if (exists) {
                    return prevChats.map(c => c.id === updatedChat.id ? updatedChat : c);
                }
                return [updatedChat, ...prevChats];
            });

            return updatedChat;
        });

    } catch (error) {
        console.error("OpenRouter Error:", error);
    } finally {
        setLoading(false);
    }
};

const newChat = () => {
    setPageView("normal-chat"); // Force switch to normal view
    setCurrentChat({ id: Date.now(), messages: [] });
    setShowResult(false);
    setInput("");
};

  const openChat = (chat) => {
    setCurrentChat(chat);
    setShowResult(true);
  };

  const value = {
    user, login, register, logout,
    input, setInput,
    loading, showResult, setShowResult,
    onSent, currentChat, chats,
    newChat, openChat,
    PageView, setPageView,
    conversations, currentConversationId, currentConversation, isLLMLoading,
    loadConversations ,loadConversation, handleNewConversation, handleSelectConversation, handleSendLLMMessage
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;