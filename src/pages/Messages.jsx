import { useState, useEffect } from "react";
import "../App.css";
import api from "../axios";
import { useAuth } from "../AuthContext";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useMessaging } from "../MessagingContext";
import Alert from "../components/Alert";



function Messages() {
  const { fetchUser, user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    console.log("ALERT FUNCTION CALLED with:", message, type);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };


  const messagesEndRef = useRef(null);

  const { fetchUnreadCount } = useMessaging()



  const autoSelectedRef = useRef(false);

  useEffect(() => {
    if (!location.state?.userId || conversations.length === 0 || autoSelectedRef.current) return;

    const conv = conversations.find(c =>
      c.other_user?.user_id === location.state.userId
    );

    if (conv) {
      autoSelectedRef.current = true;
      handleSelectConversation(conv);
      window.history.replaceState({}, document.title);
    }
  }, [conversations, location.state]);


  const fetchMessages = async (conversationId) => {
    const res = await api.get(`/messaging/conversations/${conversationId}/messages`);
    console.log(res.data)
    setMessages(res.data);
  };

  const fetchOnlineUsers = async () => {
    const res = await api.get("/messaging/users/online");
    setOnlineUsers(res.data);
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
  }, []);
  useEffect(() => {
    fetchOnlineUsers();

    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(async () => {
      await fetchMessages(selectedConversation.conversation_id);

      await api.put(
        `/messaging/conversations/${selectedConversation.conversation_id}/read`
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (location.state?.conversation) {
      setSelectedConversation(location.state.conversation);
      fetchMessages(location.state.conversation.conversation_id);
    }

    // Handle starting conversation with coach from coach profile
    if (location.state?.coachUser) {
      handleStartConversationWithCoach(location.state.coachUser);
    }
  }, [location]);

  const handleStartConversationWithCoach = async (coachUser) => {
    try {
      // Check if conversation already exists with this coach
      const existingConversation = conversations.find(conv =>
        conv.participants?.some(participant => participant.user_id === coachUser.user_id)
      );

      if (existingConversation) {
        // Conversation already exists, select it
        setSelectedConversation(existingConversation);
        fetchMessages(existingConversation.conversation_id);
        return;
      }

      // Check for existing relationship with this coach
      try {
        const relationshipsRes = await api.get("/messaging/relationships");
        const relationships = relationshipsRes.data;

        // Find relationship with this coach
        const coachRelationship = relationships.find(rel =>
          (rel.coach?.user_id === coachUser.user_id || rel.client?.user_id === coachUser.user_id) &&
          rel.status === "active"
        );

        if (coachRelationship) {
          // Create conversation with existing relationship
          const response = await api.post("/messaging/conversations", {
            relationship_id: coachRelationship.relationship_id,
            conversation_type: "direct",
            participant_ids: [user.user_id, coachUser.user_id]
          });

          const newConversation = response.data;
          setSelectedConversation(newConversation);
          fetchMessages(newConversation.conversation_id);
          setConversations(prev => [newConversation, ...prev]);
        } else {
          // No relationship exists - show message to user
          showAlert("You need to have an active coaching relationship with this coach to send messages. Please hire the coach first.", "warning");
        }
      } catch (relError) {
        console.error("Error checking relationships:", relError);
        showAlert("Failed to check coaching relationship. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error starting conversation with coach:", "error");
      showAlert("Failed to start conversation with coach", "error");
    }
  };

  console.log("ALL CONVERSATIONS:", conversations);

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);

    // fetch messages
    await fetchMessages(conv.conversation_id);

    //  mark everything as read
    await api.put(`/messaging/conversations/${conv.conversation_id}/read`);
    await fetchUnreadCount();

    //  update UI (remove unread badge)
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === conv.conversation_id
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content p-6 flex flex-col gap-6">

        <h2 className="text-2xl font-bold">Messages</h2>

        <div className="flex h-[80vh] border rounded-xl overflow-hidden shadow-lg bg-base-100">

          {/* ================= LEFT: INBOX ================= */}
          <div className="w-1/3 bg-base-200 border-r overflow-y-auto p-3 flex flex-col gap-2">
            <h3 className="font-semibold">Inbox</h3>

            {conversations.map((conv) => {

              const isOnline = onlineUsers.some(
                (u) => u.user_id === conv.other_user?.user_id
              );

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 flex items-center gap-3 cursor-pointer rounded-lg hover:bg-base-200 transition ${selectedConversation?.conversation_id === conv.conversation_id
                    ? "bg-base-300"
                    : ""
                    }`}
                >
                  {/* PROFILE PIC */}
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={
                          conv.other_user?.profile_picture ||
                          "https://ui-avatars.com/api/?name=" +
                          conv.other_user?.first_name
                        }
                      />
                    </div>
                  </div>

                  {/* TEXT */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      {conv.other_user?.first_name} {conv.other_user?.last_name}

                      {/* ONLINE DOT */}
                      {isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>

                    <div className="text-xs text-gray-500 truncate w-40">
                      {conv.last_message || "No messages yet"}
                    </div>
                  </div>

                  {/* UNREAD BADGE */}
                  {conv.unread_count > 0 && (
                    <div className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              );
            })}
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
                  {messages.map((msg) => {
                    const isMine = msg.sender_user_id === user?.user_id;

                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow ${isMine
                            ? "bg-blue-800 text-white"
                            : "bg-base-200 text-gray-800"
                            }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
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
                  <button className="btn bg-blue-800 btn-primary text-white rounded-full px-6">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)} />
    </div>
  );
}

export default Messages;