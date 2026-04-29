import { createContext, useState, useContext, useEffect } from "react";

import api from "./axios";
import { useAuth } from "./AuthContext";

export const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const { user, loading } = useAuth();


    const fetchUnreadCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/messaging/inbox");
        console.log(res.data)

        const total = res.data.reduce(
            (sum, conv) => sum + (conv.unread_count || 0),
            0
        );

        setUnreadCount(total);
    };
    useEffect(() => {
        if (!user || loading) return;

        fetchUnreadCount(); 

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 20000);

        return () => clearInterval(interval);
    }, [user, loading]);


    return (
        <MessagingContext.Provider value={{ unreadCount, fetchUnreadCount }}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessaging = () => useContext(MessagingContext);