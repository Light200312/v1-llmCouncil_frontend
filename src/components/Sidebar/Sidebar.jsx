import React, { useState, useContext } from "react";
import { Context } from "../../context/Context";
import {
  Menu,
  Plus,
  MessageCircle,
  HelpCircle,
  History,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const [extended, setExtended] = useState(true);

  const { chats, currentChat, newChat, openChat } =
    useContext(Context);

  return (
    <div
      className={`h-screen ${
        extended ? "w-64" : "w-20"
      } flex flex-col justify-between bg-slate-100 dark:bg-slate-900 p-4 transition-all duration-300 hidden md:flex`}
    >
      {/* TOP SECTION */}
      <div>
        {/* MENU BUTTON */}
        <button
          onClick={() => setExtended((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          <Menu size={20} />
        </button>

        {/* NEW CHAT */}
        <div
          onClick={newChat}
          className="mt-8 flex items-center gap-3 p-2 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition"
        >
          <Plus size={20} />
          {extended && <p className="text-sm">New Chat</p>}
        </div>

        {/* RECENT CHATS */}
        {extended && (
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Recent
            </p>

            {chats.length === 0 && (
              <p className="text-xs text-gray-400">
                No chats yet
              </p>
            )}

            <div className="space-y-2">
              {chats.map((chat) => {
                const firstMessage =
                  chat.messages?.find(
                    (m) => m.role === "user"
                  )?.text || "New Chat";

                const isActive =
                  currentChat?.id === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MessageCircle size={18} />
                    <p className="truncate text-sm">
                      {firstMessage.slice(0, 22)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition">
          <HelpCircle size={18} />
          {extended && <p className="text-sm">Help</p>}
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition">
          <History size={18} />
          {extended && <p className="text-sm">Activity</p>}
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition">
          <Settings size={18} />
          {extended && <p className="text-sm">Settings</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;