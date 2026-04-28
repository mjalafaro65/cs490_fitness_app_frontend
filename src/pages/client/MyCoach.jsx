import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import api from "../../axios";
import calendar from "daisyui/components/calendar";

function MyCoach() {
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestsInfo, setRequestsInfo] = useState([]);
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
          (req) => req.status == "pending"
        );

        const enrichedRequests = await Promise.all(
          pendingRequests.map(async (req) => {
            try {
              const res = await api.get(`coach/coach-profile`, {
                params: { coach_profile_id: req.coach_profile_id },
              });
              console.log(res.data)

              return {
                ...req,
                coach: res.data.user,
              };

            } catch (err) {
              return {
                ...req,
                coach: null,
              };
            }
          })
        );

        console.log(enrichedRequests)

        setRequestsInfo(enrichedRequests);



      } catch (err) {
        setError("Request does not exit or error");
      } finally {
        setLoading(false);
      }

    }

    const fetchReviews = async () => {
      try {
        const response = await api.get("/client/my-reviews");
        console.log(response.data)
        const reviews = response.data || [];

        // Fetch coach details for each review
        const reviewsWithCoachData = await Promise.all(
          reviews.map(async (review) => {
            try {
              // Get coach profile data
              const coachProfileResponse = await api.get(`/coach/coach-profile`, {
                params: { coach_profile_id: review.coach_profile_id }
              });

              // Get coach user data
              const userResponse = await api.get(`/user/${coachProfileResponse.data.user_id}`);

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

    const fetchCoach = async () => {
      try {
        const res = await api.get("client/my-coaches");
        console.log(res.data)
        setHiredCoaches(res.data.active_relationships)

      } catch (err) {
        console.log(err);
      }
    }

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
    fetchReviews();

    fetchFavoriteCoaches()
    fetchCoach()
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
      setRequestsInfo((prev) =>
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
    <div className="drawer lg:drawer-open bg-base-100">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <section className="p-6 space-y-8">

          <h1 className="text-3xl font-bold tracking-tight">My Coach</h1>

          {/* TOP ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* MY COACH */}
            <div className="card bg-base-200 shadow-lg border border-base-300 p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">My Coach</h2>

              <div className="flex-1 space-y-4">
                {hiredCoaches?.length ? (
                  hiredCoaches.map((rel) => (
                    <div key={rel.relationship_id} className="pb-3 border-b border-base-300">
                      <p className="font-semibold text-base-content">
                        {rel.coach_name}
                      </p>

                      <p className="text-sm text-base-content/70">
                        Specialty: {rel.specialty}
                      </p>

                      <p className="text-xs text-base-content/60 mt-1">
                        Since:{" "}
                        {rel.started_at
                          ? new Date(rel.started_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "—"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-base-content/60">
                    No coach assigned yet
                  </p>
                )}
              </div>

              <button
                className="btn bg-blue-800 hover:bg-blue-900 text-white mt-4"
                onClick={() => navigate("/coaches")}
              >
                Browse Coaches
              </button>
            </div>

            {/* REQUESTS */}
            <div className="card bg-base-200 shadow-lg border border-base-300 p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">My Requests</h2>

              <div className="flex-1 overflow-y-auto max-h-72 space-y-3">
                {loading ? (
                  <span className="text-sm text-base-content/60">Loading...</span>
                ) : !requestsInfo?.length ? (
                  <span className="text-sm text-base-content/60">
                    No requests yet
                  </span>
                ) : (
                  requestsInfo.map((req) => (
                    <div
                      key={req.request_id}
                      className="p-4 bg-base-100 rounded-xl border border-base-300"
                    >
                      <div className="flex flex-col gap-1">
                        {/* name + status */}
                        <div className="flex justify-between items-center">
                          <p className="font-medium">
                            {req.coach?.first_name} {req.coach?.last_name}
                          </p>

                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {req.status}
                          </span>
                        </div>

                        {/* date*/}
                        <p className="text-xs text-base-content/60">
                          Since:{" "}
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "—"}
                        </p>
                      </div>

                      <button
                        className="btn btn-xs mt-3 bg-blue-800 hover:bg-blue-900 text-white border-none"
                        onClick={() => deleteRequest(req.request_id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SAVED COACHES */}
            <div className="card bg-base-200 shadow-lg border border-base-300 p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Saved Coaches</h2>

              <div className="flex-1 overflow-y-auto max-h-72 space-y-3">
                {myFav?.length ? (
                  myFav.map((coach) => (
                    <div
                      key={coach.coach_profile_id}
                      className="p-4 bg-base-100 rounded-xl border border-base-300 flex justify-between items-center"
                    >
                      <p className="font-medium">
                        {coach.user.first_name} {coach.user.last_name}
                      </p>

                      <Link
                        to={`/coach/${coach.coach_profile_id}`}
                        className="btn btn-sm bg-blue-800 hover:bg-blue-900 text-white"
                      >
                        View
                      </Link>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-base-content/60">
                    No saved coaches
                  </span>
                )}
              </div>
            </div>

            {/* REVIEWS */}
            <div className="card bg-base-200 shadow-lg border border-base-300 p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">My Reviews</h2>

              <div className="flex-1 overflow-y-auto max-h-72 space-y-4">
                {reviewsLoading ? (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : userReviews.length ? (
                  userReviews.map((review) => (
                    <div key={review.review_id} className="p-4 bg-base-100 rounded-xl border border-base-300">
                      <p className="font-semibold">
                        {review.coach?.user?.first_name}{" "}
                        {review.coach?.user?.last_name}
                      </p>

                      <div className="rating rating-xs mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            className="mask mask-star-2 bg-blue-800"
                            checked={star <= review.rating}
                            readOnly
                          />
                        ))}
                      </div>

                      <p className="text-sm text-base-content/70 mt-2">
                        {review.comment}
                      </p>

                      <button
                        className="btn btn-xs mt-3 btn-outline"
                        onClick={() => openEditModal(review)}
                      >
                        Edit
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-base-content/60">
                    No reviews
                  </span>
                )}
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );

}
export default MyCoach;
