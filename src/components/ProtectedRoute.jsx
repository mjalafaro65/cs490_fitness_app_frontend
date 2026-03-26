import { Navigate ,Outlet} from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../axios.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try{
                const response = await api.get("/auth/me");
                setUser(response.data);
                console.log(response.data)
            } catch(err){
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        

    }, []);
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

   if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasAccess = !allowedRoles || user.roles.some(role => 
    allowedRoles.map(String).includes(String(role))
    );

    if (!hasAccess) {
        console.warn("Access Denied. User roles:", user.roles, "Required:", allowedRoles);
        return <Navigate to="/landing" replace />;
    }

    return <Outlet context={{ user }} />;
};

export default ProtectedRoute;