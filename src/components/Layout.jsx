import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Layout({user}) {
  const location = useLocation();
  const hideNavBar = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/initialsurvey";

  return (
    <div>
      <h1 style ={{ color: "black", padding: "10px" }}>FitNet</h1>
      <aside className="sidebar">
        <nav>
          {!hideNavBar && (
            <>
            <Link to="/messages">Messages</Link>
            <Link to="/notifications">Notifications</Link>
            </>
          )}
          {user?.role === 'client' && (
            <>
              <Link to="/client/dashboard">Dashboard</Link>
              <Link to="/client/profile">Profile</Link>
              <Link to="/mycoach">My Coach</Link>
              <Link to="/client/settings">Settings</Link>
              <Link to="/client/workoutplans">Workout Plans</Link>
              <Link to="/progresslogs">Progress Logs</Link>
              <Link to="/meallogs">Meal Logs</Link>
            </>
          )}
          {user?.role === 'coach' && (
            <>
              {/* <Link to="/dashboard" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Dashboard</Link>
              <Link to="/clientprofile" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Profile</Link>
              <Link to="/mycoach" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>My Coach</Link>
              <Link to="/clientsettings" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Settings</Link>
              <Link to="/clientworkoutplans" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Workout Plans</Link>
              <Link to="/progresslogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Progress Logs</Link>
              <Link to="/meallogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Meal Logs</Link>
              <Link to="/messages" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Messages</Link>
              <Link to="/notifications" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Notifications</Link> */}
            </>
          )}
          {user?.role === 'admin' && (
            <>
               {/* <Link to="/dashboard" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Dashboard</Link>
              <Link to="/clientprofile" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Profile</Link>
              <Link to="/mycoach" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>My Coach</Link>
              <Link to="/clientsettings" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Settings</Link>
              <Link to="/clientworkoutplans" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Workout Plans</Link>
              <Link to="/progresslogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Progress Logs</Link>
              <Link to="/meallogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Meal Logs</Link>
              <Link to="/messages" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Messages</Link>
              <Link to="/notifications" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Notifications</Link> */}
            </>
          )}
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
