import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
    fetch("/api/me")
        .then(res => {
        if (!res.ok) return null;
            return res.json();
        })
        .then(data => {
            setUser(data);
        })
        .catch(() => {
            setUser(null);
        });
    }, []);

    if (user === undefined) {
        return <div>Loading...</div>;
    }

    if (user === null) {
        return <Navigate to="/landing" />;
    }

    return children(user);
};

export default ProtectedRoute;