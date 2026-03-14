import { Link, Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();
  const hideNavBar = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/survey";
  /* may not be the most ideal, but for now can just put the names of pages where you don't want
  the navigation bar showing*/

  return (
    <div>
      <h1 style ={{ color: "black", padding: "10px" }}>FitNet</h1>
      {!hideNavBar && (
        <header>
          <nav style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "120px", flexWrap: "wrap"}}>
            <Link to="/dashboard" style={{  color: "#000000", border: "1px", padding: "10px 30px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Dashboard</Link>
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
