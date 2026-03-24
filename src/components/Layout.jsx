import { Link, Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();
  const hideNavBar = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/initialsurvey";
  /* may not be the most ideal, but for now can just put the names of pages where you don't want
  the navigation bar showing*/

  return (
    <div>
      <h1 style ={{ color: "black", padding: "10px" }}>FitNet</h1>
      {!hideNavBar && (
        <header>
          <nav style={{ marginTop: "15px", marginBottom: "15px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap"}}>
            <Link to="/dashboard" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Dashboard</Link>
            <Link to="/clientprofile" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Profile</Link>
            <Link to="/mycoach" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>My Coach</Link>
            <Link to="/clientsettings" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Settings</Link>
            <Link to="/clientworkoutplans" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Workout Plans</Link>
            <Link to="/progresslogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Progress Logs</Link>
            <Link to="/meallogs" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Meal Logs</Link>
            <Link to="/messages" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Messages</Link>
            <Link to="/notifications" style={{  color: "#000000", border: "1px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Notifications</Link>
          </nav>
        </header>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
