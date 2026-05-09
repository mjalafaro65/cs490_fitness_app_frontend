import { useState, useEffect } from "react";
import "../App.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../AuthContext";
import api from "../axios";

function Notifications() {
  // const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [markingAsRead, setMarkingAsRead] = useState({});

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/all");
        setNotifications(res.data);
        console.log("notifications:", res);
        console.log("notifi:", res.data);
      } catch (error) {
        console.log(error.response);
      }


    }
    fetchNotifications();

  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));

      const response = await api.patch("/notifications/mark-read", {
        notification_id: notificationId
      });

      if (response.status === 200) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.notification_id === notificationId
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
    }
  };


  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

    return past.toLocaleDateString();
  };

  const grouped = notifications.reduce((acc, notif) => {
    const key = `${notif.title}||${notif.body}`; // fallback = single

    if (!acc[key]) {
      acc[key] = {
        key,
        type: notif.type_slug ? "group" : "single",
        title: notif.title,
        ids: notif.type_slug ? [notif.notification_id] : null,
        notification_id: notif.notification_id,
        is_read: notif.is_read,
        created_at: notif.created_at
      };
    } else {
      acc[key].ids.push(notif.notification_id);

      acc[key].is_read = acc[key].is_read && notif.is_read;

      if (new Date(notif.created_at) > new Date(acc[key].created_at)) {
        acc[key].created_at = notif.created_at;
      }
    }

    return acc;
  }, {});
  const groupedList = Object.values(grouped);


  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-6">Notifications</h2>
          <div>
            {groupedList && groupedList.length > 0 ? (
              groupedList.map((notification) => (
                <div
                  key={notification.notification_id}
                  className="flex items-start gap-4 p-4 mb-3 rounded-xl bg-base-200/50 border border-base-300 hover:bg-base-200 transition-colors"
                >
                  {/* 1. Lighter Icon Circle */}
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-primary">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-base-content">
                          {notification.title || "New Notification"}
                        </h4>
                        <p className="text-sm opacity-70 leading-relaxed mt-0.5">
                          {notification.body || ""}
                        </p>
                      </div>

                      {/* Time and Button - pushed to the right */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </span>

                        {!notification.is_read && (
                          <button
                            className="btn btn-xs btn-primary bg-blue-800 text-white"
                            onClick={() => {
                              if (notification.type === "group") {
                                handleMarkAsReadGroup(notification.ids);
                              } else {
                                handleMarkAsRead(notification.notification_id);
                              }
                            }}
                            disabled={markingAsRead[notification.notification_id]}
                          >
                            {markingAsRead[notification.notification_id] ? "..." : "Mark as read"}
                          </button>
                        )}

                        {notification.is_read && (
                          <span className="text-xs text-blue-800 font-medium">
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50 italic">
                No new notifications
              </div>
            )}
          </div>
        </section>
      </div>
    </div>

  );

}
export default Notifications;
