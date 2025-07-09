import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import { ChatConversation, ChatMessage } from "@/types";

interface ModeratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  setConversations: (conversations: ChatConversation[]) => void;
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}

const ModeratorPanel: React.FC<ModeratorPanelProps> = ({
  isOpen,
  onClose,
  conversations,
  selectedConversation,
  setSelectedConversation,
  newMessage,
  setNewMessage,
  onSendMessage,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "moderator":
        return "bg-blue-100 text-blue-700";
      case "guest":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Панель модератора</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Диалоги с гостями</h4>
            {conversations.map((conversation) => (
              <div
                key={conversation.guestId}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedConversation === conversation.guestId
                    ? "bg-blue-50 border-blue-300"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedConversation(conversation.guestId)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{conversation.guestName}</span>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {
                    conversation.messages[conversation.messages.length - 1]
                      ?.message
                  }
                </p>
              </div>
            ))}
          </div>
          <div className="md:col-span-2">
            {selectedConversation ? (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                  {conversations
                    .find((c) => c.guestId === selectedConversation)
                    ?.messages.map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {msg.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {msg.user}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRoleColor(msg.role)}`}
                            >
                              {msg.role === "admin"
                                ? "Админ"
                                : msg.role === "moderator"
                                  ? "Модератор"
                                  : "Гость"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ответить гостю..."
                    onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
                  />
                  <Button onClick={onSendMessage} size="sm">
                    <Icon name="Send" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Выберите диалог для просмотра
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeratorPanel;
