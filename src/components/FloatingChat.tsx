import React from "react";
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
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? "w-80" : "w-auto"}`}
    >
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-2xl border animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Онлайн консультация</h3>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Icon name="X" className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {currentConversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "guest" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.role === "guest"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-8">
                <Icon name="MessageCircle" className="h-8 w-8 mx-auto mb-2" />
                <p>Начните диалог</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
              />
              <Button onClick={onSendMessage} size="sm">
                <Icon name="Send" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={onToggle}
          className="rounded-full h-14 w-14 bg-pink-500 hover:bg-pink-600 shadow-lg animate-pulse"
        >
          <Icon name="MessageCircle" className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default FloatingChat;
