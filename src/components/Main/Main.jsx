import { Context } from "../../context/Context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useContext } from "react";
import { Image, Mic, Send, Sparkles, Copy } from "lucide-react";
import { assets } from "../../assets/assets";

const Main = () => {
    const {
        input,
        setInput,
        currentChat,
        showResult,
        setShowResult,
        loading,
        onSent,
    } = useContext(Context);

    const [listening, setListening] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [speaking, setSpeaking] = useState(false);

    /* 🎤 Voice */
    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) return alert("Speech not supported");

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.start();

        setListening(true);

        recognition.onresult = (e) => {
            setInput(e.results[0][0].transcript);
            setListening(false);
        };

        recognition.onend = () => setListening(false);
    };

    /* 🔊 Speak */
    const speakText = (text) => {
        if (!window.speechSynthesis) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);

        speechSynthesis.speak(utterance);
    };

    /* 📋 Copy */
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const copyFullChat = () => {
        const fullText = currentChat.messages
            .map((m) => `${m.role.toUpperCase()}:\n${m.text}`)
            .join("\n\n");
        navigator.clipboard.writeText(fullText);
    };

    /* 🖼 Image */
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);
    };

    /* 🔥 Auto Scroll */
    useEffect(() => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [currentChat, loading]);

    return (
        <div className="flex-1 h-screen bg-white dark:bg-slate-950 dark:text-gray-100 flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between font-semibold text-xl md:text-2xl p-4 text-gray-500 dark:text-gray-300">
                <p
                    onClick={() => setShowResult(false)}
                    className="cursor-pointer hover:opacity-70 transition"
                >
                    LLM Council
                </p>

                <div className="flex items-center gap-4">
                    {showResult && (
                        <Copy
                            size={20}
                            className="cursor-pointer hover:text-blue-500"
                            onClick={copyFullChat}
                            title="Copy Full Chat"
                        />
                    )}

                    <img
                        src={assets.user_icon}
                        alt="User"
                        className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-slate-600"
                    />
                </div>
            </div>

            {/* CHAT */}
            <div
                id="chat-container"
                className="flex-1 overflow-y-auto px-4 md:px-32 pb-20"
            >
                {!showResult ? (
                    <div className="mt-16">
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
                            Hello, User 👋
                        </p>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mt-3">
                            How can we help you today?
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 mt-6">
                        {currentChat?.messages.map((msg, index) => {
                            const isUser = msg.role === "user";

                            return (
                                <div
                                    key={index}
                                    className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {!isUser && (
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                                            <Sparkles size={18} />
                                        </div>
                                    )}

                                    <div
                                        className={`relative max-w-xl px-4 py-3 rounded-2xl shadow-sm ${isUser
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="uploaded"
                                                className="w-40 rounded-xl mb-2"
                                            />
                                        )}

                                        {isUser ? (
                                            <p>{msg.text}</p>
                                        ) : (
                                            <>
                                                {/* Copy Message */}
                                                <Copy
                                                    size={16}
                                                    className="absolute top-2 right-2 cursor-pointer opacity-60 hover:opacity-100"
                                                    onClick={() => copyToClipboard(msg.text)}
                                                />

                                                <button
                                                    onClick={() => speakText(msg.text)}
                                                    className="mb-2 text-xs px-2 py-1 bg-blue-500 text-white rounded-lg"
                                                >
                                                    {speaking ? "⏹ Stop" : "🔊 Speak"}
                                                </button>
                                                <div
                                                    className="
  prose dark:prose-invert max-w-none
  prose-p:leading-relaxed
  prose-headings:font-semibold
  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
  prose-ul:list-disc prose-ul:pl-5
  prose-ol:list-decimal prose-ol:pl-5
  prose-li:my-1
  prose-hr:hidden
  prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-xl prose-pre:p-4
  prose-p:text-gray-800 dark:prose-p:text-gray-200
  prose-code:bg-slate-800 prose-code:text-green-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
  "
                                                >

                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ inline, className, children }) {
                                                                return !inline ? (
                                                                    <div className="relative">
                                                                        <Copy
                                                                            size={14}
                                                                            className="absolute top-2 right-2 cursor-pointer text-white"
                                                                            onClick={() =>
                                                                                copyToClipboard(
                                                                                    String(children).replace(/\n$/, "")
                                                                                )
                                                                            }
                                                                        />
                                                                        <pre className="overflow-x-auto">
                                                                            <code>{children}</code>
                                                                        </pre>
                                                                    </div>
                                                                ) : (
                                                                    <code>{children}</code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isUser && (
                                        <img
                                            src={assets.user_icon}
                                            alt="User"
                                            className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-slate-600"
                                        />
                                    )}
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex justify-start items-end gap-3">
                                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                                    <Sparkles size={18} />
                                </div>
                                <div className="bg-gray-200 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* INPUT */}
            <div className="border-t dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
                <div className="max-w-4xl mx-auto bg-gray-200 dark:bg-slate-800 rounded-3xl p-3 flex flex-col gap-3">

                    {selectedImage && (
                        <div className="relative w-fit">
                            <img
                                src={selectedImage}
                                alt="preview"
                                className="w-32 rounded-xl"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter a prompt here"
                            rows={1}
                            className="flex-1 bg-transparent outline-none text-lg resize-none overflow-y-auto max-h-40"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault(); // prevent new line
                                    if (input.trim()) {
                                        const message = input;
                                        setInput("");
                                        onSent(message, selectedImage);
                                        setSelectedImage(null);
                                    }
                                }
                            }}
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                        />

                        <label className="cursor-pointer">
                            <Image size={22} />
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>

                        <Mic
                            size={22}
                            className="cursor-pointer"
                            onClick={startListening}
                            style={{ opacity: listening ? 0.5 : 1 }}
                        />

                        <Send
                            className="cursor-pointer"
                            onClick={() => {
                                if (input.trim()) {
                                    const message = input;
                                    setInput("");
                                    onSent(message, selectedImage);
                                    setSelectedImage(null);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;