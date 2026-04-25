import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";
import { Link } from "react-router-dom";
import VisitorNavbar from "../components/VisitorNavbar.jsx";
import { useAuth } from "../AuthContext.jsx";


const Coaches = ({ isPublic }) => {

  const [coaches, setCoaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true)
  const [favoritedCoaches, setFavoritedCoaches] = useState([]);

  const {user} = useAuth()
  const isLoggedIn = !!user;

  useEffect(() => {
    // Load favorited coaches from localStorage
    const favorites = JSON.parse(localStorage.getItem('favoritedCoaches') || '[]');
    setFavoritedCoaches(favorites);
  }, []);

  const toggleFavorite = (coachId) => {
    const favorites = JSON.parse(localStorage.getItem('favoritedCoaches') || '[]');
    const index = favorites.indexOf(coachId);
    
    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
    } else {
      // Add to favorites
      favorites.push(coachId);
    }
    
    localStorage.setItem('favoritedCoaches', JSON.stringify(favorites));
    setFavoritedCoaches(favorites);
  };

  const isFavorited = (coachId) => {
    return favoritedCoaches.includes(coachId);
  };

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await api.get("/coach/coachbrowse");
        setCoaches(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching coaches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (loading) return <div className="p-4">Loading coaches...</div>


  const filteredCoaches = coaches.filter((coach) =>
    `${coach.first_name} ${coach.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  return (

    <div >

      {!isLoggedIn ?
       (
        <VisitorNavbar />
      ) : (
        <div className="p-4 border-b border-base-300 flex items-center">
          <Link
            to="/client/mycoach"
            className="btn btn-ghost btn-sm gap-2 normal-case"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Coach
          </Link>
        </div>
      )}

      <h1 className=" p-8 text-4xl font-bold mb-4">
        {isLoggedIn ? "Find Your New Trainer" : "Our Expert Coaches"}
      </h1>
      <div className="px-16 mb-4">
        <input
          type="text"
          placeholder="Search coaches..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredCoaches.length === 0 && (
        <p className="px-16 text-gray-500">No coaches found.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 pl-16 pr-16">
        {filteredCoaches.map((coach) => (
          <div key={coach.coach_profile_id} className="card bg-base-100 shadow-xl border border-base-300 h-52 overflow-hidden relative flex flex-col">

            <button 
              className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2 z-10 hover:bg-base-200"
              onClick={() => toggleFavorite(coach.user_id)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={isFavorited(coach.user_id) ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className={`size-5 ${isFavorited(coach.user_id) ? "text-red-500" : "text-gray-500"}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>

            {/*  top section (Image and Bio side-by-side) */}
            <div className="flex flex-row items-center p-4 flex-grow">
              {/* Image on Left */}
              <div className="w-1/3 flex justify-center">
                <div className="w-20 h-20 rounded-full shadow-md bg-gray-200 flex items-center justify-center text-sm font-semibold">
                  {coach.first_name?.[0]}{coach.last_name?.[0]}
                </div>
              </div>

              {/* Name and Bio on Right */}
              <div className="w-2/3 pl-4 pr-6">
                <h2 className="card-title text-left text-lg leading-tight">
                  {coach.first_name} {coach.last_name}
                </h2>
                <p className="text-left text-xs line-clamp-3 text-gray-600 mt-1">
                  {coach.bio}
                </p>
              </div>
            </div>

            {/* 3. button*/}
            <div className="p-4 pt-0">
              {/* <Link
              
                to={`/client/coach/${coach.user_id}`}
                className="btn btn-primary btn-sm w-full bg-blue-800 border-none rounded-xl h-10 normal-case flex items-center justify-center"
              >
               View Profile
              </Link> */}

               <Link
                to={ isLoggedIn? `/client/coach/${coach.user_id}`: `/coach/${coach.user_id}`
                  
                }
                className="btn btn-primary btn-sm w-full bg-blue-800 border-none rounded-xl h-10 normal-case flex items-center justify-center"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coaches;