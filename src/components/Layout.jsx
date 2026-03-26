import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; 

function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null); 
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen"> 
      
      {/* Side Navigation */}
      <Navbar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 bg-base-100">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;