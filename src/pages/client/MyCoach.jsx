import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import api from "../../axios";

function MyCoach(){
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/client/my-reviews");
        const reviews = response.data || [];
        
        // Fetch coach details for each review
        const reviewsWithCoachData = await Promise.all(
          reviews.map(async (review) => {
            try {
              // Get coach profile data
              const coachProfileResponse = await api.get(`/coach/coach-profile`, {
                params: { user_id: review.coach_profile_id }
              });
              
              // Get coach user data
              const userResponse = await api.get(`/user/${review.coach_profile_id}`);
              
              return {
                ...review,
                coach: {
                  ...coachProfileResponse.data,
                  user: userResponse.data
                }
              };
            } catch (coachErr) {
              console.error(`Failed to fetch coach data for review ${review.review_id}:`, coachErr);
              return review;
            }
          })
        );
        
        setUserReviews(reviewsWithCoachData);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setUserReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6">
          <div className="text-2xl font-bold mb-6">My Coach</div>
              <div className="flex w-full">
                <div className="card bg-base-300 rounded-box grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Coach</h2>
                  <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/coaches")} >Browse Coaches</button>
                  </div>
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="card bg-base-300 rounded-box grid grow p-4 flex">
                  <h2 className="text-lg font-bold mb-2">My Requests</h2>
                  </div>
              </div>
            <div className="divider"></div>
              <div className="flex w-full h-60 flex-1 gap-4">
                <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">Saved Coaches</h2>
                  <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/coaches")}>Browse Coaches</button>
                  </div>
                </div>
                <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Reviews</h2>
                  {reviewsLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="loading loading-sm"></div>
                    </div>
                  ) : userReviews.length > 0 ? (
                    <div className="flex-1 overflow-y-auto max-h-48 space-y-3">
                      {userReviews.map((review) => {
                        // Use coach data from the nested coach object we fetched
                        const coachFirstName = review.coach?.user?.first_name;
                        const coachLastName = review.coach?.user?.last_name;
                        const coachId = review.coach_profile_id;
                        
                        return (
                        <div key={review.review_id} className="p-3 bg-base-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {coachFirstName?.[0] || 'C'}{coachLastName?.[0] || ''}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <button 
                                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left w-full"
                                    onClick={() => navigate(`/client/coach/${coachId}`)}
                                  >
                                    {coachFirstName && coachLastName ? 
                                      `${coachFirstName} ${coachLastName}` :
                                      coachFirstName || 'Unknown Coach'
                                    }
                                  </button>
                                  <div className="rating rating-xs mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <input
                                        key={star}
                                        type="radio"
                                        className="mask mask-star-2 bg-orange-400"
                                        disabled
                                        checked={star <= review.rating}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs opacity-50 whitespace-nowrap ml-2">
                                  {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <span className="text-sm opacity-70 mb-3">No reviews</span>
                      <div className="mt-auto flex justify-center">
                        <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/reviews")}>Manage Reviews</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
        </section>
      </div>
    </div>

  );

}
export default MyCoach;
