import { useState } from "react";
import { ChatConversation, ChatMessage, User } from "@/types";

const useChat = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      guestId: "guest1",
      guestName: "Анна",
      messages: [
        {
          id: 1,
          user: "Анна",
          message: "Здравствуйте! Есть ли у вас розы?",
          timestamp: new Date(),
          role: "guest",
          guestId: "guest1",
        },
        {
          id: 2,
          user: "Модератор",
          message: "Да, конечно! У нас большой выбор роз. Что вас интересует?",
          timestamp: new Date(),
          role: "moderator",
        },
      ],
      unreadCount: 1,
    },
    {
      guestId: "guest2",
      guestName: "Михаил",
      messages: [
        {
          id: 3,
          user: "Михаил",
          message: "Можете подготовить букет к завтрашнему дню?",
          timestamp: new Date(),
          role: "guest",
          guestId: "guest2",
        },
      ],
      unreadCount: 1,
    },
  ]);

  const sendMessage = (currentUser: User) => {
    if (newMessage.trim()) {
      const guestId =
        currentUser.role === "guest" ? "current_guest" : selectedConversation;

      if (currentUser.role === "guest") {
        // Гость отправляет сообщение
        let conversation = conversations.find(
          (c) => c.guestId === "current_guest",
        );
        if (!conversation) {
          conversation = {
            guestId: "current_guest",
            guestName: "Посетитель",
            messages: [],
            unreadCount: 0,
          };
          setConversations([...conversations, conversation]);
        }

        const message: ChatMessage = {
          id: Date.now(),
          user: currentUser.name,
          message: newMessage,
          timestamp: new Date(),
          role: currentUser.role,
          guestId: "current_guest",
        };

        conversation.messages.push(message);
        conversation.unreadCount += 1;

        setConversations([...conversations]);
      } else if (selectedConversation) {
        // Модератор отвечает
        const conversation = conversations.find(
          (c) => c.guestId === selectedConversation,
        );
        if (conversation) {
          const message: ChatMessage = {
            id: Date.now(),
            user: currentUser.name,
            message: newMessage,
            timestamp: new Date(),
            role: currentUser.role,
            guestId: selectedConversation,
          };

          conversation.messages.push(message);
          conversation.unreadCount = 0;

          setConversations([...conversations]);
        }
      }

      setNewMessage("");
    }
  };

  return {
    chatOpen,
    setChatOpen,
    newMessage,
    setNewMessage,
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
    sendMessage,
  };
};

export default useChat;
