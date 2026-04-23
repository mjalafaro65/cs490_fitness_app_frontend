import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import api from "../../axios";

function MyCoach(){
  const navigate = useNavigate();
  const [hiredCoaches, setHiredCoaches] = useState([]);
  const [coachDetails, setCoachDetails] = useState([]);
  const [favoritedCoaches, setFavoritedCoaches] = useState([]);
  const [favoriteDetails, setFavoriteDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get hired coach IDs from localStorage
        const hiredCoachIds = JSON.parse(localStorage.getItem('hiredCoaches') || '[]');
        setHiredCoaches(hiredCoachIds);
        
        // Get favorited coach IDs from localStorage
        const favoritedCoachIds = JSON.parse(localStorage.getItem('favoritedCoaches') || '[]');
        setFavoritedCoaches(favoritedCoachIds);
        
        // Fetch hired coaches details
        if (hiredCoachIds.length > 0) {
          const coachPromises = hiredCoachIds.map(async (coachId) => {
            try {
              const response = await api.get(`/coach/coach-profile`, {
                params: { user_id: coachId }
              });
              const userResponse = await api.get(`/user/${coachId}`);
              
              return {
                ...response.data,
                user: userResponse.data
              };
            } catch (error) {
              console.error(`Failed to fetch coach ${coachId}:`, error);
              return null;
            }
          });
          
          const coaches = await Promise.all(coachPromises);
          setCoachDetails(coaches.filter(coach => coach !== null));
        }
        
        // Fetch favorited coaches details
        if (favoritedCoachIds.length > 0) {
          const favoritePromises = favoritedCoachIds.map(async (coachId) => {
            try {
              const response = await api.get(`/coach/coach-profile`, {
                params: { user_id: coachId }
              });
              const userResponse = await api.get(`/user/${coachId}`);
              
              return {
                ...response.data,
                user: userResponse.data
              };
            } catch (error) {
              console.error(`Failed to fetch favorite coach ${coachId}:`, error);
              return null;
            }
          });
          
          const favorites = await Promise.all(favoritePromises);
          setFavoriteDetails(favorites.filter(coach => coach !== null));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <section className="p-6">
            <div className="text-2xl font-bold mb-6">My Coach</div>
            <div className="text-center py-8">
              <div className="loading loading-spinner"></div>
              <p className="mt-4">Loading your coaches...</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6">
          <div className="text-2xl font-bold mb-6">My Coach</div>
              <div className="flex w-full">
                <div className="card bg-base-300 rounded-box flex-1 p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Coaches</h2>
                  {coachDetails.length > 0 ? (
                    <div className="flex-1 overflow-y-auto max-h-48 space-y-3">
                      {coachDetails.map((coach) => (
                        <div key={coach.user.user_id} className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {coach.user.first_name?.[0]}{coach.user.last_name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {coach.user.first_name} {coach.user.last_name}
                            </h3>
                            <p className="text-xs opacity-70 truncate">{coach.specialty_name}</p>
                          </div>
                          <button 
                            className="btn btn-ghost btn-xs flex-shrink-0"
                            onClick={() => navigate(`/coach/${coach.user.user_id}`)}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="text-sm opacity-70 mb-3">No coaches hired yet</span>
                      <div className="mt-auto flex justify-center">
                        <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/coaches")} >Browse Coaches</button>
                      </div>
                    </>
                  )}
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="card bg-base-300 rounded-box flex-1 p-4 flex">
                  <h2 className="text-lg font-bold mb-2">My Requests</h2>
                  </div>
              </div>
            <div className="divider"></div>
              <div className="flex w-full h-60 flex-1 gap-4">
                <div className="card bg-base-300 rounded-box flex-1 p-4 flex">
                  <h2 className="text-lg font-bold mb-2">Favorited Coaches</h2>
                  {favoriteDetails.length > 0 ? (
                    <div className="flex-1 overflow-y-auto max-h-48 space-y-3">
                      {favoriteDetails.map((coach) => (
                        <div key={coach.user.user_id} className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {coach.user.first_name?.[0]}{coach.user.last_name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {coach.user.first_name} {coach.user.last_name}
                            </h3>
                            <p className="text-xs opacity-70 truncate">{coach.specialty_name}</p>
                          </div>
                          <button 
                            className="btn btn-ghost btn-xs flex-shrink-0"
                            onClick={() => navigate(`/coach/${coach.user.user_id}`)}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="text-sm opacity-70 mb-3">No favorited coaches</span>
                      <div className="mt-auto flex justify-center">
                        <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/coaches")}>Browse Coaches</button>
                      </div>
                    </>
                  )}
                </div>
                <div className="card bg-base-300 rounded-box flex-1 p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Reviews</h2>
                  <span className="text-sm opacity-70 mb-3">No reviews</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/reviews")}>My Reviews</button>
                  </div>
                </div>
              </div>
        </section>
      </div>
    </div>

  );

}
export default MyCoach;
