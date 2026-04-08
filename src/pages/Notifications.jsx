import { useState, useEffect } from "react";
import "../App.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../AuthContext";
import api from "../axios";

function Notifications() {
  // const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/all");
        setNotifications(res.data);
        console.log(res);
      } catch (error) {
        console.log(error.response);
      }


    }
    fetchNotifications();

  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-6">Notifications</h2>
          <div>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
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

                  {/* 2. Text Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-base-content">
                        {notification.title || "New Notification"}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium">
                        {notification.date || "Just now"}
                      </span>
                    </div>
                    <p className="text-sm opacity-70 leading-relaxed mt-0.5">
                      {notification.message}
                    </p>
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
