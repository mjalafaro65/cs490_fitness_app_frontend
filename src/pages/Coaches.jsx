import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";


const CoachList = ({ isPublic }) => {

  // In a real app, you would fetch() coaches here
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await api.get("/coaches"); 
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
      <h1 className="text-2xl font-bold mb-4">
        {isPublic ? "Our Expert Coaches" : "Find Your New Trainer"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <div key={coach.id} className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title">{coach.name}</h2>
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

export default CoachList;