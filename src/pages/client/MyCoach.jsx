import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import api from "../../axios";
import calendar from "daisyui/components/calendar";
import Alert from "../../components/Alert.jsx";

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

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    console.log("ALERT FUNCTION CALLED with:", message, type);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };


  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    type: "default",
    onResolve: null,
  });


  const [firedCoaches, setFiredCoaches] = useState([]);
  const [isFiring, setIsFiring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningData, setWarningData] = useState(null);
  const [firingReason, setFiringReason] = useState("");
  const [pendingFireData, setPendingFireData] = useState(null);

  const confirm = ({ message, type = "default" }) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        message,
        type,
        onResolve: resolve,
      });
    });
  };

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
      showAlert("Coach request cancelled!", "success");
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

  const initiateFireCoach = async (relationshipId, coachName, coachProfileId) => {
    setIsFiring(true);

    try {
      const response = await api.post("/client/initiate-fire-coach", {
        relationship_id: relationshipId
      });

      showAlert("Coach firing process initiated", "success");

      console.log("Initiate response:", response.data);

      setWarningData({
        relationshipId,
        coachName,
        coachProfileId,
        warning: response.data.warning,
        consequences: response.data.consequences || [],
        proceed_to_confirmation: response.data.proceed_to_confirmation
      });
      setShowWarningModal(true);

    } catch (error) {
      console.error("ERROR occurred:", error);
      showAlert(error.response?.data?.message || "Failed to initiate firing process", "error");
    } finally {
      setIsFiring(false);
    }
  };

  const openEditModal = (review) => {

    setEditingReview(review);
    setEditData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const proceedToConfirmation = () => {
    setShowWarningModal(false);
    setPendingFireData({
      relationshipId: warningData.relationshipId,
      coachName: warningData.coachName,
      coachProfileId: warningData.coachProfileId
    });
    setShowConfirmModal(true);
  };

  const confirmFireCoach = async () => {
    if (!pendingFireData) return;

    try {
      const response = await api.post("/client/confirm-fire-coach", {
        relationship_id: pendingFireData.relationshipId,
        reason: firingReason || "No reason provided"
      });

      console.log("SUCCESS:", response.data);
      showAlert(`${pendingFireData.coachName} has been fired successfully`, "success");

      const firedCoach = hiredCoaches.find(
        coach => coach.relationship_id === pendingFireData.relationshipId
      );
      if (firedCoach) {
        setFiredCoaches(prev => [...prev, {
          ...firedCoach,
          coach_profile_id: pendingFireData.coachProfileId,
          fired_date: new Date().toISOString(),
          reason: firingReason
        }]);
      }

      setShowConfirmModal(false);
      setFiringReason("");
      setPendingFireData(null);

    } catch (error) {
      console.error("ERROR occurred:", error);
      showAlert(error.response?.data?.message || "Failed to confirm firing", "error");
    } finally {
      setIsFiring(false);
    }
  };


  const cancelFireCoach = () => {
    setShowWarningModal(false);
    setShowConfirmModal(false);
    setFiringReason("");
    setWarningData(null);
    setPendingFireData(null);
  };



  const updateReview = async (reviewId, updatedData) => {
    try {
      console.log(reviewId, updatedData)
      const response = await api.patch(
        `/client/my-reviews/${reviewId}`,
        updatedData
      );

      console.log(response.data);

      setUserReviews((prev) =>
        prev.map((r) =>
          r.review_id === reviewId ? { ...r, ...response.data } : r
        )
      );

    } catch (err) {
      console.log(err.response?.data);
    }
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
  const setRating = (value) => {
    setEditData((prev) => ({
      ...prev,
      rating: value
    }));
  };


  const rehireCoach = async (relationshipId, coachName) => {
    const confirmed = window.confirm(`Would you like to rehire ${coachName}?`);

    if (!confirmed) return;

    try {
      const response = await api.post("/client/rehire-coach", {
        relationship_id: relationshipId
      });

      console.log("Rehire request sent:", response.data);
      showAlert(`Rehire request sent to ${coachName}`, "success");

      setFiredCoaches(prev => prev.filter(coach => coach.relationship_id !== relationshipId));

    } catch (error) {
      console.error("Error rehiring coach:", error);
      showAlert(error.response?.data?.message || "Failed to send rehire request", "error");
    }
  };

  const activeCoachId = hiredCoaches?.[0]?.coach_id;



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
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          {rel.coach_profile_id ? (
                            <Link
                              to={`/coach/${rel.coach_profile_id}`}
                              className="font-semibold text-base-content hover:text-blue-800 cursor-pointer underline"
                            >
                              {rel.coach_name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-base-content">
                              {rel.coach_name}
                            </span>
                          )}

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
                        <button
                          className="btn btn-sm border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => initiateFireCoach(rel.relationship_id, rel.coach_name, rel.coach_profile_id)}
                          disabled={isFiring}
                        >
                          {isFiring ? "Processing..." : "Fire Coach"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-base-content/60">
                    No coach assigned yet
                  </p>
                )}
                {firedCoaches?.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-base-content/70 mt-4">Past Coaches</h3>
                    {firedCoaches.map((rel) => (
                      <div key={rel.relationship_id} className="pb-3 border-b border-base-300 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-base-content">
                              {rel.coach_name}
                            </p>
                            <p className="text-sm text-base-content/70">
                              Specialty: {rel.specialty}
                            </p>
                            <p className="text-xs text-base-content/60 mt-1">
                              Previously hired: {rel.started_at ? new Date(rel.started_at).toLocaleDateString() : "â"}
                            </p>
                            {rel.fired_date && (
                              <p className="text-xs text-red-600 mt-1">
                                Fired on: {new Date(rel.fired_date).toLocaleDateString()}
                              </p>
                            )}
                            {rel.reason && (
                              <p className="text-xs text-gray-500 mt-1">
                                Reason: {rel.reason}
                              </p>
                            )}
                          </div>
                          <button
                            className="btn btn-sm border-blue-800 text-gray-200 hover:bg-blue-800"
                            onClick={() => rehireCoach(rel.relationshipId, rel.coach_name)}
                          >
                            Rehire Coach
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
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
              <div className="space-y-4">
                {userReviews
                  .filter(review => review.coach_id === activeCoachId)
                  .map(review => (
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
                  ))}

                <div className="mt-auto flex justify-center">

                  <button className="btn bg-blue-800 text-white btn-sm" onClick={() => navigate("/client/reviews")}>

                    Go to my Reviews

                  </button>

                </div>
              </div>

              {/* <div className="flex-1 overflow-y-auto max-h-72 space-y-4">
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
              </div> */}

            </div>
          </div>

        </section>
      </div>

      {showWarningModal && warningData && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 w-96 max-w-md">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-center">{warningData.warning}</h3>
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-2">Consequences of firing {warningData.coachName}:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {warningData.consequences?.map((consequence, index) => (
                  <li key={index}>{consequence}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={cancelFireCoach}>
                Cancel
              </button>
              <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={proceedToConfirmation}>
                I Understand, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && pendingFireData && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Fire Coach</h3>

            <p className="mb-4">
              Are you sure you want to fire <span className="font-semibold">{pendingFireData.coachName}</span>?
              This action cannot be undone.
            </p>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Reason for firing (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Please provide a reason for firing this coach..."
                value={firingReason}
                onChange={(e) => setFiringReason(e.target.value)}
                rows="3"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={cancelFireCoach}>
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={confirmFireCoach}
              >
                Confirm Fire
              </button>
            </div>
          </div>
        </div>
      )}


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
      )
      }
      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)} />
    </div>
  );

}
export default MyCoach;
