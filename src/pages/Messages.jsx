import { useState, useEffect } from "react";
import "../App.css";
import api from "../axios";
import { useAuth } from "../AuthContext";
import { useLocation } from "react-router-dom";

function Messages() {
  const { fetchUser } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [relationships, setRelationships] = useState([]);


  const fetchConversations = async () => {
    const res = await api.get("/messaging/conversations");
    console.log(res.data)
    setConversations(res.data);
  };

  const fetchMessages = async (conversationId) => {
    const res = await api.get(`/messaging/conversations/${conversationId}/messages`);
    console.log(res.data)
    setMessages(res.data);
  };

  // const fetchOnlineUsers = async () => {
  //   const res = await api.get("/messaging/users/online");
  //   setOnlineUsers(res.data);
  // };

  // const fetchRelationships = async () => {
  //   const res = await api.get("/messaging/relationships");
  //   console.log(res.data)
  //   setRelationships(res.data);
  // };

  // ---------------- ACTIONS ----------------

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.conversation_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    await api.post(
      `/messaging/conversations/${selectedConversation.conversation_id}/messages`,
      {
        body: newMessage,
        message_type: "text",
      }
    );

    setNewMessage("");
    fetchMessages(selectedConversation.conversation_id);
  };

  const handleStartFromRelationship = async (rel) => {
    const otherUserId =
      rel.relationship_role === ""
        ? rel.coach.user_id
        : rel.client.user_id;


    console.log(rel.relationship_id);

    const res = await api.post("/messaging/conversations", {
      relationship_id: rel.relationship_id,
      conversation_type: "direct",
      participant_ids: [rel.coach.user_id, rel.client.user_id],
    });
    const convo = res.data;
    console.log(convo)


    setSelectedConversation(convo);
    fetchMessages(convo.conversation_id);

    setConversations((prev) => {
      const exists = prev.find(
        (c) => c.conversation_id === convo.conversation_id
      );
      return exists ? prev : [convo, ...prev];
    });
  };

  // ---------------- EFFECTS ----------------

  useEffect(() => {

    const fetchRelationships = async () => {
      try {
        const res = await api.get(`/messaging/inbox`);
        setConversations(res.data)
        console.log(res.data)
      } catch (err) {
        console.error("Failed to fetch relationships:", err);
      }
    };

    fetchRelationships()
    fetchConversations();
    // fetchOnlineUsers();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation.conversation_id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (location.state?.conversation) {
      setSelectedConversation(location.state.conversation);
      fetchMessages(location.state.conversation.conversation_id);
    }
  }, [location.state]);

  console.log("ALL CONVERSATIONS:", conversations);

  // ---------------- UI ----------------

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content p-6 flex flex-col gap-6">

        <h2 className="text-2xl font-bold">Messages</h2>

        <div className="flex h-[80vh] border rounded-xl overflow-hidden shadow-lg bg-base-100">

          {/* ================= LEFT: INBOX ================= */}
          <div className="w-1/3 bg-base-200 border-r overflow-y-auto p-3 flex flex-col gap-2">
            <h3 className="font-semibold">Inbox</h3>

            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 cursor-pointer rounded-lg hover:bg-base-300 transition flex flex-col gap-1 ${selectedConversation?.conversation_id === conv.conversation_id
                    ? "bg-gray-300"
                    : ""
                  }`}
              >
                <div className="font-medium">
                  {conv.other_user?.first_name} {conv.other_user?.last_name}
                </div>

                <div className="text-xs text-gray-500">
                  {conv.last_message?.body || "No messages yet"}
                </div>
              </div>
            ))}
          </div>

          {/* ================= RIGHT: CHAT ================= */}
          <div className="flex-1 flex flex-col bg-base-50">

            {!selectedConversation ? (
              // EMPTY STATE
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a conversation to start chatting 💬
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="flex items-center justify-between p-3 border-b bg-base-100">
                  <h3 className="font-semibold">
                    {selectedConversation.other_user?.first_name}{" "}
                    {selectedConversation.other_user?.last_name}
                  </h3>

                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-xl font-bold px-3 py-1 hover:bg-gray-200 rounded"
                  >
                    ✕
                  </button>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.sender?.user_id === fetchUser?.user_id
                          ? "justify-end"
                          : "justify-start"
                        }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow ${msg.sender?.user_id === fetchUser?.user_id
                            ? "bg-blue-600 text-white"
                            : "bg-base-200"
                          }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  ))}
                </div>

                {/* INPUT */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t flex gap-2 bg-base-100"
                >
                  <input
                    className="input input-bordered flex-1 rounded-full px-4 py-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                  />
                  <button className="btn btn-primary rounded-full px-6">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;