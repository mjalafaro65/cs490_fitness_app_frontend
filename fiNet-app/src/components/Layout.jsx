import { Link, Outlet } from "react-router-dom";

function Layout() {

  return (
    <div>
      <header style={{ padding: "30px", backgroundColor: "#FFF", color: "white", marginTop: "1px" }}>
        <h1 style ={{ display: "inline-block", border: "5px solid #f0f0f0", padding: "10px 16px" }}>SAKILA FILMS SHOP</h1>
        <nav style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "120px", flexWrap: "wrap"}}>
          <Link to="/" style={{ color: "#000000", border: "1px", padding: "10px 40px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Home</Link>
          <Link to="/dashboard" style={{  color: "#000000", border: "1px", padding: "10px 30px", borderRadius: "6px", backgroundColor: "#f0f0f0", size: "16px" }}>Dashboard</Link>
        </nav>
      </header>

      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
