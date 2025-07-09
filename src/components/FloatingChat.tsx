import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { ChatConversation, User } from "@/types";

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: ChatConversation[];
  currentUser: User;
  selectedConversation: string | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

const FloatingChat: React.FC<FloatingChatProps> = ({
  isOpen,
  onToggle,
  conversations,
  currentUser,
  selectedConversation,
  newMessage,
  setNewMessage,
  onSendMessage,
}) => {
  const getCurrentConversation = () => {
    if (currentUser.role === "guest") {
      return conversations.find((c) => c.guestId === "current_guest");
    }
    return conversations.find((c) => c.guestId === selectedConversation);
  };

  const currentConversation = getCurrentConversation();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-80 bg-white rounded-xl shadow-2xl border mb-4"
          >
            <div className="bg-pink-600 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Онлайн консультация</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggle}
                  className="text-white hover:bg-pink-700 p-1 rounded"
                >
                  <Icon name="X" className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-pink-50 to-white">
              <AnimatePresence>
                {currentConversation?.messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.role === "guest" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        msg.role === "guest"
                          ? "bg-pink-600 text-white"
                          : "bg-white text-gray-800 border"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!currentConversation?.messages.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 py-12"
                >
                  <Icon
                    name="MessageCircle"
                    className="h-12 w-12 mx-auto mb-3 text-pink-300"
                  />
                  <p>Здравствуйте! Как могу помочь?</p>
                  <p className="text-xs mt-2">Напишите ваш вопрос</p>
                </motion.div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Напишите ваш вопрос..."
                  onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
                  className="border-pink-200 focus:border-pink-500"
                />
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={onSendMessage}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    ➤
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onToggle}
          className="rounded-full h-14 w-14 bg-pink-600 hover:bg-pink-700 shadow-lg"
        >
          <Icon name="MessageCircle" className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
};

export default FloatingChat;
