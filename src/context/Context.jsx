import { createContext, useState } from "react";
import { callOpenRouter } from "../utils/openrouter";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [currentChat, setCurrentChat] = useState({
    id: Date.now(),
    messages: [],
  });

  const [chats, setChats] = useState([]);

  /* ✅ Send Prompt With Controlled Streaming */
  const onSent = async (prompt, image = null) => {
    if (!prompt && !image) return;

    setShowResult(true);
    setLoading(true);

    const userMessage = {
      role: "user",
      text: prompt,
      image: image || null,
    };

    const updatedMessages = [...currentChat.messages, userMessage];

    // Show user message instantly
    setCurrentChat({
      id: currentChat.id,
      messages: updatedMessages,
    });

    try {
      const reply = await callOpenRouter(updatedMessages);

      const words = reply.split(" ");
      let typedText = "";

      // Cap total animation time to 5 seconds
      const maxDuration = 5000;
      const delay = Math.max(
        10,
        Math.min(40, maxDuration / words.length)
      );

      // Show empty assistant message first
      setCurrentChat({
        id: currentChat.id,
        messages: [
          ...updatedMessages,
          { role: "assistant", text: "" },
        ],
      });

      // Stream words
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        typedText += words[i] + " ";

        setCurrentChat({
          id: currentChat.id,
          messages: [
            ...updatedMessages,
            { role: "assistant", text: typedText },
          ],
        });
      }

      // Final stable version
      const finalMessages = [
        ...updatedMessages,
        { role: "assistant", text: reply },
      ];

      const updatedChat = {
        id: currentChat.id,
        messages: finalMessages,
      };

      // Update chat list safely
      setChats((prev) => {
        const exists = prev.find(
          (chat) => chat.id === updatedChat.id
        );

        if (exists) {
          return prev.map((chat) =>
            chat.id === updatedChat.id ? updatedChat : chat
          );
        }

        return [...prev, updatedChat];
      });

    } catch (err) {
      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          text: "Something went wrong.",
        },
      ];

      setCurrentChat({
        id: currentChat.id,
        messages: errorMessages,
      });
    }

    setLoading(false);
  };

  /* ✅ Start New Chat */
  const newChat = () => {
    if (
      currentChat.messages.length > 0 &&
      !chats.find((chat) => chat.id === currentChat.id)
    ) {
      setChats((prev) => [...prev, currentChat]);
    }

    setCurrentChat({
      id: Date.now(),
      messages: [],
    });

    setShowResult(false);
    setInput("");
  };

  /* ✅ Open Old Chat */
  const openChat = (chat) => {
    setCurrentChat(chat);
    setShowResult(true);
  };

  const value = {
    input,
    setInput,
    loading,
    showResult,
    setShowResult,
    onSent,
    currentChat,
    chats,
    newChat,
    openChat,
  };

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;