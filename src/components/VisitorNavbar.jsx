import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function VisitorNavbar() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token")

        const { user, loading } = useAuth();

        if (loading) return null; 

        const getDashboardPath = () => {
            if (!user) return "/login";
            const role = String(user.roles[0]);
            if (role === "1") return "/client/dashboard";
            if (role === "2") return "/coach/dashboard";
            return "/admin/dashboard";
        };
    

return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-[100] w-full py-2 px-4 lg:px-10">

        <div className="navbar-start">
            <Link to="/" className="btn btn-ghost text-3xl font-semibold">FitNet</Link>
        </div>


        <div className="navbar-center">
            <ul className="menu menu-horizontal gap-x-15 px-6 text-xl">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about-us">About Us</Link></li>
                <li><Link to="/coaches">Coaches</Link></li>
                { user && <li><Link to={getDashboardPath()}>My Space</Link></li>}

            </ul>
        </div>

        <div className=" navbar-end">
            <ul className="  menu menu-horizontal text-lg">
                <li className=" dropdown dropdown-end">
                    <details>
                        <summary className=" bg-blue-800 btn btn-primary h-12 min-h-0 px- text-lg">
                            Sign In / Sign Up
                        </summary>
                        <ul className="dropdown-content menu bg-base-100 rounded-box z-[100] w-52 p-2 shadow-xl border border-base-200 text-lg">
                            <li><Link to="/login">Log In</Link></li>
                            <li><Link to="/signup">Sign Up</Link></li>
                        </ul>
                    </details>
                </li>
            </ul>
        </div>

    </div>
);
}

export default VisitorNavbar;