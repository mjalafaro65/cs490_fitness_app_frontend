import { createContext, useState, useContext, useEffect } from "react";

import api from "./axios";

export const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        const res = await api.get("/messaging/inbox");
        console.log(res.data)

        const total = res.data.reduce(
            (sum, conv) => sum + (conv.unread_count || 0),
            0
        );

        setUnreadCount(total);
    };
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    return (
        <MessagingContext.Provider value={{ unreadCount, fetchUnreadCount }}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessaging = () => useContext(MessagingContext);