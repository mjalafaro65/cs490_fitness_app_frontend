import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import api from "../../axios";
import calendar from "daisyui/components/calendar";

function MyCoach() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
    const [hiredCoaches, setHiredCoaches] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [editData, setEditData] = useState({
    rating: "",
    comment: ""
  });
  const [myFav, setMyFav] = useState([]);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get(`/client/hire-requests`);

        console.log(response.data)
        const pendingRequests = response.data.filter(
          (req) => req.status === "pending"
        );

        setRequests(pendingRequests);


      } catch (err) {
        setError("Request does not exit or error");
      } finally {
        setLoading(false);
      }

    }

    const fetchMyReviews = async () => {
      try {
        const response = await api.get(`/client/my-reviews`);

        console.log(response.data);

        setMyReviews(response.data);


      } catch (err) {
        setError("Request does not exit or error");
        console.log(err.data)
      } finally {
        setLoading(false);
      }

    }
    const fetchFavoriteCoaches = async () => {
      try {
        const favRes = await api.get("/client/favorites/coaches");

        const coachesWithUsers = await Promise.all(
          favRes.data.map(async (coach) => {
            const userRes = await api.get(`/user/${coach.user_id}`);

            return {
              ...coach,
              user: userRes.data
            };
          })
        );
        console.log(coachesWithUsers)

        setMyFav(coachesWithUsers);
      } catch (err) {
        console.log(err);
      }
    };
    
//     const fetchData = async () => {
//       try {
//         // Get hired coach IDs from localStorage
//         const hiredCoachIds = JSON.parse(localStorage.getItem('hiredCoaches') || '[]');
//         setHiredCoaches(hiredCoachIds);
        
//         // Get favorited coach IDs from localStorage
//         const favoritedCoachIds = JSON.parse(localStorage.getItem('favoritedCoaches') || '[]');
//         setFavoritedCoaches(favoritedCoachIds);
        
//         // Fetch hired coaches details
//         if (hiredCoachIds.length > 0) {
//           const coachPromises = hiredCoachIds.map(async (coachId) => {
//             try {
//               const response = await api.get(`/coach/coach-profile`, {
//                 params: { user_id: coachId }
//               });
//               const userResponse = await api.get(`/user/${coachId}`);
              
//               return {
//                 ...response.data,
//                 user: userResponse.data
//               };
//             } catch (error) {
//               console.error(`Failed to fetch coach ${coachId}:`, error);
//               return null;
//             }
//           });
          
//           const coaches = await Promise.all(coachPromises);
//           setCoachDetails(coaches.filter(coach => coach !== null));
//         }
//       }
    



    fetchRequests()
    fetchMyReviews()
    fetchFavoriteCoaches()
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


  const deleteRequest = async (id) => {
    try {
      const response = await api.delete(`/client/hire-request/${id}`)

      console.log(response.data)
      setRequests((prev) =>
        prev.filter((req) => req.request_id !== id)
      );


    } catch (err) {
      setError("Error while deleting request");
      console.log(err.response.data);
    } finally {
      setLoading(false);
    }

  }

  const updateReview = async (reviewId, updatedData) => {
    try {
      const response = await api.patch(
        `/client/my-reviews/${reviewId}`,
        updatedData
      );

      console.log(response.data);

      // update UI locally
      setMyReviews((prev) =>
        prev.map((r) =>
          r.review_id === reviewId ? { ...r, ...response.data } : r
        )
      );

    } catch (err) {
      console.log(err.response?.data);
    }
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setEditData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const closeModal = () => {
    setEditingReview(null);
  };

  const handleSave = async () => {
    await updateReview(editingReview.review_id, editData);
    closeModal();
  };

  const renderStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-blue-800" : "text-gray-300"}>
          ★
        </span>
      );
    }

    return stars;
  };
  const setRating = (value) => {
    setEditData((prev) => ({
      ...prev,
      rating: value
    }));
  };
  const renderEditableStars = (rating) => {
    return [...Array(5)].map((_, i) => {
      const value = i + 1;

      return (
        <span
          key={value}
          onClick={() => setRating(value)}
          className={`cursor-pointer text-2xl ${value <= rating ? "text-blue-800" : "text-gray-300"
            }`}
        >
          ★
        </span>
      );
    });
  };
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
                <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => navigate("/client/coaches")} >Browse Coaches</button>
              </div>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="card bg-base-300 rounded-box grid grow p-4 flex">
              <h2 className="text-lg font-bold mb-2">My Requests</h2>
              {loading ? (
                <span className="text-sm opacity-70">Loading...</span>
              ) : !requests || requests.length == 0 ? (
                <span className="text-sm opacity-70">No requests Yet</span>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.request_id} className="p-2 bg-white rounded shadow-sm">
                      <p className="font-medium">
                        Coach Request

                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {req.status}

                      </p>
                      <button className="btn" onClick={() => deleteRequest(req.request_id)}>Delete Request</button>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="divider"></div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
              <h2 className="text-lg font-bold mb-2">Saved Coaches</h2>
              {myFav? (myFav.map((coach) => (
                <div
                  key={coach.coach_profile_id}
                  className="p-2 border rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {coach.user.first_name} {coach.user.last_name}
                    </p>
                  </div>

                  <Link
                    to={`/client/coach/${coach.user.user_id}`}
                    className="btn btn-sm btn-primary"
                  >
                    View Profile
                  </Link>
                </div>
              ))):(
                  <span className="text-sm opacity-70 mb-3">No coach assigned</span>

              )}
              <div className="mt-auto flex justify-center">
                <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => navigate("/client/coaches")}>Browse Coaches</button>
              </div>
            </div>
            <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
              <h2 className="text-lg font-bold mb-2">My Reviews</h2>
              {myReviews.map((review) => (
                <div
                  key={review.review_id}
                  className="flex justify-between items-center p-3 bg-white text-black border border-gray-200 rounded"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-1 text-lg">
                      Rating : {renderStars(review.rating)}
                    </p>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>

                  <button
                    className="btn btn-sm bg-blue-800 text-white border-none hover:scale-105 transition-transform"
                    onClick={() => openEditModal(review)}
                  >
                    Edit
                  </button>
                </div>
              ))}

              {editingReview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <div className="bg-white text-black p-6 rounded-lg w-80 shadow-lg border border-gray-200">

                    <h2 className="text-lg font-bold mb-4 text-blue-800">
                      Edit Review
                    </h2>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Rating</p>
                      <div className="flex gap-1">
                        {renderEditableStars(editData.rating)}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={editData.comment}
                      onChange={(e) =>
                        setEditData({ ...editData, comment: e.target.value })
                      }
                      className="input input-sm w-full mb-4 bg-white border border-gray-300 text-black"
                      placeholder="Comment"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm bg-gray-200 text-black border-none hover:bg-gray-300"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>

                      <button
                        className="btn btn-sm bg-blue-800 text-white border-none hover:opacity-85"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-auto flex justify-center">
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

  );

}
export default MyCoach;
