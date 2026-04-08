import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";


function Navbar() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");


        navigate("/", { replace: true });

        window.location.reload();
    };

    const Icons = {
        Dashboard: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
        Profile: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Coach: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" /><path d="M2 20h20" /><path d="M14 12v.01" /><path d="M10 12v.01" /><path d="M10 16v.01" /><path d="M14 16v.01" /></svg>,
        Workout: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="m6.5 6.5 11 11" /><path d="m21 21-4.3-4.3" /><path d="m3 3 4.3 4.3" /><path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M1 20v-1a7 7 0 0 1 7-7" /><path d="M23 4v1a7 7 0 0 1-7 7" /></svg>,
        Messages: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
        Notifications: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
        Settings: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
        Logs: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
        LogOut:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /> <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
        Meal: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"> <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /> <path d="M7 2v20" /> <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
</svg>
    };  
    const pages = [
        {
            to: "/messages", label: "Messages", icon: (Icons.Messages)
        },
        {
            to: "/notifications", label: "Notifications", icon: (Icons.Notifications)
        },
        {
            label: "Log Out",
            onClick: handleLogout,
            isButton: true,
            icon: (Icons.LogOut
                
            )
        },
    ];

    const clientPages = [
        {
            to: "/client/dashboard", label: "Dashboard", icon: (Icons.Dashboard)
        },
        {
            to: "/client/profile", label: "Profile", icon: (Icons.Profile)
        },
        {
            to: "/client/mycoach", label: "My Coach", icon: (Icons.Coach)
        },
        {
            to: "/client/workoutplans", label: "Workout Plans", icon: (Icons.Workout)
        },
        {
            to: "/client/progresslogs", label: "Progress Logs", icon: (Icons.Logs)
        },
        {
            to: "/client/meallogs", label: "Meal Logs", icon: (Icons.Meal)
        },
        {
            to: "/client/settings", label: "Settings", icon: (Icons.Settings)
        },
    ];

    const coachPages = [
        {
            to: "/coach/dashboard", label: "Dashboard", icon: (Icons.Dashboard)
        },
        {
            to: "/coach/profile", label: "Profile", icon: (Icons.Profile)
        },
        {
            to: "/coach/workoutplans", label: "Workout Plans", icon: (Icons.Workout)
        },
        {
            to: "/coach/progresslogs", label: "Progress Logs", icon:(Icons.Logs)
        },
        {
            to: "/coach/meallogs", label: "Meal Logs", icon: (Icons.Logs)
        },
        {
            to: "/coach/settings", label: "Settings", icon: (Icons.Settings)
        },
    ];

    const adminPages = [
        {
            to: "/admin/dashboard", label: "Dashboard", icon: (Icons.Dashboard)
        },
        {
            to: "/admin/profile", label: "Profile", icon: (Icons.Profile)
        },
        {
            to: "/admin/coach", label: "Coach", icon: (Icons.Coach)
        },
        {
            to: "/admin/workouts", label: "Workouts", icon: (Icons.Workout)
        },
        // {
        //     to: "/admin/progresslogs", label: "Progress Logs", icon: (
        //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
        //             <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        //             <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        //         </svg>
        //     )
        // },
        // {
        //     to: "/admin/meallogs", label: "Meal Logs", icon: (
        //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
        //             <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        //             <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        //         </svg>
        //     )
        // },
        {
            to: "/admin/settings", label: "Settings", icon: (Icons.Settings)
        },
    ];

    let allPages = [];

    if (user?.roles?.includes(3)) {
        allPages = [...adminPages, ...pages];
    }
    else if (user?.roles?.includes(2)) {
        allPages = [...coachPages, ...pages];
    }
    else if (user?.roles?.includes(1)) {
        allPages = [...clientPages, ...pages];
    }
    else {
        allPages = [...pages];
    }

    return (
        <div className="group flex flex-col h-page  bg-base-200 w-14 hover:w-64 transition-all duration-300 overflow-hidden">
            <ul className="menu flex-1 p-2">
                {allPages.map((tab, index) => (
                    <li key={index} className="my-2.5">
                        {tab.isButton ? (
                            /* RENDER AS BUTTON FOR LOGOUT */
                            <button
                                onClick={tab.onClick}
                                className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full text-left"
                                data-tip={tab.label}
                            >
                                {tab.icon}
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {tab.label}
                                </span>
                            </button>
                        ) : (
                            /* RENDER AS LINK FOR EVERYTHING ELSE */
                            <Link
                                to={tab.to}
                                className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center"
                                data-tip={tab.label}
                            >
                                {tab.icon}
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {tab.label}
                                </span>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default Navbar;