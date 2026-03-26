import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../axios.jsx";

const ProtectedRoute = ({ allowedRoles, children }) => {
    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try{
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch(err){
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children(user);
};

export default ProtectedRoute;