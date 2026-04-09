import { useState, useEffect } from "react";
import "../App.css";
import api from "../axios";
import { useAuth } from "../AuthContext";

function Messages(){
  const { fetchUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newConversationUserId, setNewConversationUserId] = useState("");

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get("/messaging/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/messaging/conversations/${conversationId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await api.post(`/messaging/conversations/${selectedConversation.conversation_id}/messages`, {
        body: newMessage,
        message_type: "text",
      });
      setNewMessage("");
      fetchMessages(selectedConversation.conversation_id);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Mark a message as read
  const markMessageRead = async (messageId) => {
    try {
      await api.put(`/messaging/messages/${messageId}/read`);
      fetchConversations();
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const res = await api.get("/messaging/users/online");
      setOnlineUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch online users:", err);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversation_id);
  };

  // Create new conversation
  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newConversationUserId) return;

    try {
      const res = await api.post("/messaging/conversations", {
        relationship_id: 0, // adjust if you need a real relationship ID
        conversation_type: "direct",
        participant_ids: [Number(newConversationUserId)],
      });

      // Add new conversation to the list and select it
      setConversations([res.data, ...conversations]);
      setSelectedConversation(res.data);
      setNewConversationUserId("");

      // Fetch messages for new conversation
      fetchMessages(res.data.conversation_id);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchOnlineUsers();
  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>

        {/* New Conversation Form */}
        <div className="mb-4">
          <form onSubmit={handleCreateConversation} className="flex gap-2">
            <input
              type="number"
              className="input flex-1"
              placeholder="Enter user ID to start chat"
              value={newConversationUserId}
              onChange={(e) => setNewConversationUserId(e.target.value)}
            />
            <button type="submit" className="btn btn-primary bg-blue-800">
              New Conversation
            </button>
          </form>
        </div>

                {/* Online Users */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Online Users</h3>
          <div className="flex gap-4 flex-wrap">
            {onlineUsers.map((user) => (
              <div
                key={user.user_id}
                className={`p-2 rounded ${user.is_online ? "bg-green-200" : "bg-gray-200"}`}
              >
                User {user.user_id} {user.is_online ? "(Online)" : "(Offline)"}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Conversations List */}
          <div className="w-1/4 border-r pr-4">
            <h3 className="font-semibold mb-2">Conversations</h3>
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => handleSelectConversation(conv)}
              >
                {conv.participants.map((p) => p.user.first_name).join(", ")}
                <div className="text-sm text-gray-500">
                  {conv.last_message?.body || "No messages yet"}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Conversation Messages */}
          <div className="w-3/4 flex flex-col h-screen gap-4">
            {selectedConversation ? (
              <>
                <div className="overflow-y-auto border p-4 rounded-lg min-h-[500px] max-h-[600px]">
                  {messages.map((msg) => (
                    <div key={msg.message_id} className="mb-2">
                      <span className="font-semibold">{msg.sender.first_name}: </span>
                      <span>{msg.body}</span>
                      {!msg.is_read && (
                        <button
                          onClick={() => markMessageRead(msg.message_id)}
                          className="ml-2 text-xs bg-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <form className="flex gap-2 mt-2" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button className="btn btn-primary bg-blue-800" type="submit">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="text-gray-500">Select a conversation to see messages</div>
            )}
          </div>
        </div>

      </div>
    </div>

  );

}
export default Messages;