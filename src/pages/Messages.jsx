// import { useState, useEffect } from "react";
// import "../App.css";
// import api from "../axios";
// import { useAuth } from "../AuthContext";
// import { useLocation } from "react-router-dom";
// function Messages() {
//   const { fetchUser } = useAuth();
//   const location = useLocation();


//   const [conversations, setConversations] = useState([]);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [newConversationUserId, setNewConversationUserId] = useState("");

//   const [relationships, setRelationships] = useState([]);

//   // Fetch all conversations
//   const fetchConversations = async () => {
//     try {
//       const res = await api.get("/messaging/conversations");
//       setConversations(res.data);
//     } catch (err) {
//       console.error("Failed to fetch conversations:", err);
//     }
//   };

//   // Fetch messages for selected conversation
//   const fetchMessages = async (conversationId) => {
//     try {
//       const res = await api.get(`/messaging/conversations/${conversationId}/messages`);
//       setMessages(res.data);
//     } catch (err) {
//       console.error("Failed to fetch messages:", err);
//     }
//   };

//   // Send a new message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !selectedConversation) return;
//     try {
//       await api.post(`/messaging/conversations/${selectedConversation.conversation_id}/messages`, {
//         body: newMessage,
//         message_type: "text",
//       });
//       setNewMessage("");
//       fetchMessages(selectedConversation.conversation_id);
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     }
//   };

//   // Mark a message as read
//   const markMessageRead = async (messageId) => {
//     try {
//       await api.put(`/messaging/messages/${messageId}/read`);
//       fetchConversations();
//     } catch (err) {
//       console.error("Failed to mark message as read:", err);
//     }
//   };

//   // Fetch online users
//   const fetchOnlineUsers = async () => {
//     try {
//       const res = await api.get("/messaging/users/online");
//       setOnlineUsers(res.data);
//     } catch (err) {
//       console.error("Failed to fetch online users:", err);
//     }
//   };

//   // Select conversation
//   const handleSelectConversation = (conversation) => {
//     setSelectedConversation(conversation);
//     fetchMessages(conversation.conversation_id);
//   };

//   // Create new conversation
//   const handleCreateConversation = async (e) => {
//     e.preventDefault();
//     if (!newConversationUserId) return;

//     try {
//       const res = await api.post("/messaging/conversations", {
//         relationship_id: 0, // adjust if you need a real relationship ID
//         conversation_type: "direct",
//         participant_ids: [Number(newConversationUserId)],
//       });

//       // Add new conversation to the list and select it
//       setConversations(prev => [res.data, ...prev]);
//       setSelectedConversation(res.data);
//       setNewConversationUserId("");

//       // Fetch messages for new conversation
//       fetchMessages(res.data.conversation_id);
//     } catch (err) {
//       console.error("Failed to create conversation:", err);
//     }
//   };

//   useEffect(() => {

//     const fetchRelationships = async () => {
//       try {
//         const res = await api.get("/messaging/relationships");
//         setRelationships(res.data);
//       } catch (err) {
//         console.error("Failed to fetch relationships:", err);
//       }
//     };

//     fetchConversations();
//     fetchOnlineUsers();
//     fetchRelationships();
//   }, []);

//   useEffect(() => {
//     if (!selectedConversation) return;

//     const interval = setInterval(() => {
//       fetchMessages(selectedConversation.conversation_id);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [selectedConversation]);

//   useEffect(() => {
//     if (location.state?.conversation) {
//       const convo = location.state.conversation;

//       setSelectedConversation(convo);
//       fetchMessages(convo.conversation_id);
//     }
//   }, [location.state]);

//   const handleStartFromRelationship = async (rel) => {
//     try {
//       const otherUserId =
//         rel.role === "client"
//           ? rel.coach.user_id
//           : rel.client.user_id;

//       // create or reuse conversation
//       const res = await api.post("/messaging/conversations", {
//         relationship_id: rel.relationship_id,
//         conversation_type: "direct",
//         participant_ids: [otherUserId],
//       });

//       const convo = res.data;

//       setSelectedConversation(convo);
//       fetchMessages(convo.conversation_id);

//       setConversations((prev) => {
//         const exists = prev.find(
//           (c) => c.conversation_id === convo.conversation_id
//         );
//         return exists ? prev : [convo, ...prev];
//       });

//     } catch (err) {
//       console.error("Failed to start conversation:", err);
//     }
//   };


//   return (
//     <div className="drawer lg:drawer-open">
//       <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
//       <div className="drawer-content p-6 flex flex-col gap-6">
//         <h2 className="text-2xl font-bold mb-6">Messages</h2>

//         {/* New Conversation Form */}
//         <div className="mb-4">
//           <h3 className="font-semibold mb-2">
//             Start a Chat with Your Coach / Client
//           </h3>

//           <div className="flex flex-col gap-2">
//             {relationships.map((rel) => {
//               const otherUser =
//                 rel.role === "client" ? rel.coach : rel.client;

//               return (
//                 <button
//                   key={rel.relationship_id}
//                   className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-left"
//                   onClick={() => handleStartFromRelationship(rel)}
//                 >
//                   Chat with {otherUser.first_name} {otherUser.last_name}
//                   <div className="text-xs text-gray-500">
//                     Role: {rel.role}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Online Users */}
//         <div className="mt-6">
//           <h3 className="font-semibold mb-2">Online Users</h3>
//           <div className="flex gap-4 flex-wrap">
//             {onlineUsers.map((user) => (
//               <div
//                 key={user.user_id}
//                 className={`p-2 rounded ${user.is_online ? "bg-green-200" : "bg-gray-200"}`}
//               >
//                 User {user.user_id} {user.is_online ? "(Online)" : "(Offline)"}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex gap-6">
//           {/* Conversations List */}
//           <div className="w-1/4 border-r pr-4">
//             <h3 className="font-semibold mb-2">Conversations</h3>
//             {conversations.map((conv) => (
//               <div
//                 key={conv.conversation_id}
//                 className="p-2 cursor-pointer hover:bg-gray-100 rounded"
//                 onClick={() => handleSelectConversation(conv)}
//               >
//                 {conv.participants?.map((p) => p.user?.first_name).join(", ")}
//                 <div className="text-sm text-gray-500">
//                   {conv.last_message?.body || "No messages yet"}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Selected Conversation Messages */}
//           <div className="w-3/4 flex flex-col h-screen gap-4">
//             {selectedConversation ? (
//               <>
//                 <div className="overflow-y-auto border p-4 rounded-lg min-h-[500px] max-h-[600px]">
//                   {messages.map((msg) => (
//                     <div key={msg.message_id} className="mb-2">
//                       <span className="font-semibold">{msg.sender.first_name}: </span>
//                       <span>{msg.body}</span>
//                       {!msg.is_read && (
//                         <button
//                           onClick={() => markMessageRead(msg.message_id)}
//                           className="ml-2 text-xs bg-blue-800"
//                         >
//                           Mark as read
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <form className="flex gap-2 mt-2" onSubmit={handleSendMessage}>
//                   <input
//                     type="text"
//                     className="input flex-1"
//                     placeholder="Type a message..."
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                   />
//                   <button className="btn btn-primary bg-blue-800" type="submit">
//                     Send
//                   </button>
//                 </form>
//               </>
//             ) : (
//               <div className="text-gray-500">Select a conversation to see messages</div>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>

//   );

// }
// export default Messages;

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

  // ---------------- FETCH ----------------

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

  const fetchRelationships = async () => {
    const res = await api.get("/messaging/relationships");
    console.log(res.data)
    setRelationships(res.data);
  };

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
    fetchConversations();
    // fetchOnlineUsers();
    fetchRelationships();
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

        {/* RELATIONSHIPS */}
        <div>
          <h3 className="font-semibold mb-2">
            Start Chat from Relationship
          </h3>

          <div className="flex flex-col gap-2">
            {relationships.map((rel) => {
              const otherUser =
                rel.relationship_role === "client"
                  ? rel.coach
                  : rel.client;

              return (
                <button
                  key={rel.relationship_id}
                  onClick={() => handleStartFromRelationship(rel)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-left"
                >
                  Chat with {otherUser.first_name} {otherUser.last_name}
                  <div className="text-xs text-gray-500">
                    {/* Role: {rel.relationship_role} */}
                     Role: coach


                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ONLINE USERS */}
        <div>
          <h3 className="font-semibold mb-2">Online Users</h3>

          <div className="flex gap-2 flex-wrap">
            {onlineUsers.map((u) => (
              <div
                key={u.user_id}
                className={`p-2 rounded ${
                  u.is_online ? "bg-green-200" : "bg-gray-200"
                }`}
              >
                User {u.user_id}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">

          {/* CONVERSATIONS */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-semibold mb-2">Conversations</h3>

            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => handleSelectConversation(conv)}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded"
              >
                {conv.participants?.map((p) => p.user?.first_name).join(", ")}

                <div className="text-xs text-gray-500">
                  {conv.last_message?.body || "No messages yet"}
                </div>
              </div>
            ))}
          </div>

          {/* MESSAGES */}
          <div className="flex-1 flex flex-col">

            {selectedConversation ? (
              <>
                <div className="border p-4 rounded h-[500px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.message_id} className="mb-2">
                      <b>{msg.sender.first_name}: </b>
                      {msg.body}
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 mt-2"
                >
                  <input
                    className="input flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                  />
                  <button className="btn btn-primary bg-blue-800">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="text-gray-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;