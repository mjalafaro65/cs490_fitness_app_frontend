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
    <div className="flex h-screen w-full overflow-hidden bg-base-100"> 
      
      {/* Side Navigation */}
      <Navbar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;