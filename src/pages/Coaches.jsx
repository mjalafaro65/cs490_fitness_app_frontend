import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";
import { Link } from "react-router-dom";
import VisitorNavbar from "../components/VisitorNavbar.jsx";


const Coaches = ({ isPublic }) => {

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await api.get("/coach/coachbrowse");
        setCoaches(response.data);
      } catch (error) {
        console.error("Error fetching coaches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (loading) return <div className="p-4">Loading coaches...</div>

    const isNotLoggedIn = !localStorage.getItem("token")
  return (

    <div >
      
      {isNotLoggedIn ? (
        <VisitorNavbar />
      ) : (
        <div className="p-4 border-b border-base-300 flex items-center">
          <Link
            to="/client/dashboard"
            className="btn btn-ghost btn-sm gap-2 normal-case"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      )}

      <h1 className=" p-8 text-4xl font-bold mb-4">
        {isNotLoggedIn ? "Our Expert Coaches" : "Find Your New Trainer"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 pl-16 pr-16">
        {coaches.map((coach) => (
          <div key={coach.coach_profile_id} className="card bg-base-100 shadow-xl border border-base-300 h-52 overflow-hidden relative flex flex-col">

            {/* 1. SAVE BUTTON (Top Right) */}
            <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2 z-10 hover:bg-base-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>

            {/* 2. TOP SECTION (Image and Bio side-by-side) */}
            <div className="flex flex-row items-center p-4 flex-grow">
              {/* Image on Left */}
              <div className="w-1/3 flex justify-center">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-20 h-20 object-cover rounded-full shadow-md"
                />
              </div>

              {/* Name and Bio on Right */}
              <div className="w-2/3 pl-4 pr-6">
                <h2 className="card-title text-left text-lg leading-tight">{coach.name}</h2>
                <p className="text-left text-xs line-clamp-3 text-gray-600 mt-1">
                  {coach.bio}
                </p>
              </div>
            </div>

            {/* 3. BOTTOM BUTTON (Full Width under everything) */}
            <div className="p-4 pt-0">
              <button className="btn btn-primary btn-sm w-full bg-blue-800 border-none rounded-xl h-10 normal-case">
                {isNotLoggedIn ? "Sign up to Hire" : "View Profile"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coaches;