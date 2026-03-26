import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";
import { Link } from "react-router-dom";


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

  return (

    <div className="p-4">

      {isPublic ? (
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

      <h1 className="text-2xl font-bold mb-4">
        {isPublic ? "Our Expert Coaches" : "Find Your New Trainer"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <div key={coach.id} className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body items-center text-center">

              <h2 className="card-title ">{coach.name}</h2>
               <img
                                    src={coach.image}
                                    alt={coach.name}
                                    className="w-32 h-32 object-cover rounded-full mb-2"
            />

              <p>{coach.bio}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">
                  {isPublic ? "Sign up to Hire" : "View Profile"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coaches;