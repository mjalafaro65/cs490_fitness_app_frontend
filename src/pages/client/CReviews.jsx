import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios";
import Alert from "../../components/Alert";
import Confirm from "../../components/confirm";

import PopUp from "../../components/PopUp";

function CReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState("");
  const [popOpen, setPopOpen] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

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
    resolve: null,
  });

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

    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/client/my-reviews");
      console.log(response.data)
      setReviews(response.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {

    try {
      await api.delete(`/client/my-reviews/${reviewId}`);
      await fetchReviews();
//     try {
//       await api.delete(`/client/my-reviews/${reviewId}`);
//       setReviews(reviews.filter(review => review.review_id !== reviewId));
//       setPopOpen(null);
//       setReviewToDelete(null);
    } catch (err) {
      console.error("Failed to delete review:", err);
      setError("Failed to delete review");
    }
  };

  const openDeleteConfirm = (review) => {
    setReviewToDelete(review);
    setPopOpen("delete");
  };

  const handleEditReview = (review) => {
    console.log(review)
    setEditingReview(review);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    console.log(editingReview)

    try {
      const res = await api.patch(
        `/client/my-reviews/${editingReview.review_id}`,
        {
          rating: editingReview.rating,
          comment: editingReview.comment
        }
      );

      await fetchReviews();

      setEditingReview(null);
    } catch (err) {
      console.error("Failed to update review:", err);
      setError("Failed to update review");
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ));
  };
  const renderEditableStars = (rating) => {
    return [...Array(5)].map((_, i) => {
      const value = i + 1;

      return (
        <span
          key={value}
          onClick={() => setRating(Number(value))}
          className={`cursor-pointer text-2xl ${value <= rating ? "text-blue-800" : "text-gray-300"
            }`}
        >
          ★
        </span>
      );
    });
  };

  const setRating = (value) => {
    setEditingReview((prev) => ({
      ...prev,
      rating: Number(value)
    }));
  };

  useEffect(() => {
    if (error) {
      showAlert("Failed to edit review", "error");
    }
  }, [error]);

  if (loading) {
    return (
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <section className="p-6">
            <div className="text-center py-8">
              <div className="loading loading-spinner"></div>
              <p className="mt-4">Loading reviews...</p>
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                className="btn btn-ghost btn-sm gap-2 normal-case"
                onClick={() => navigate(-1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold">My Reviews</h1>
            </div>

          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
              <button
                className="btn bg-blue-800 btn-primary bg-blue-800"
                onClick={() => navigate("/coaches")}
              >
                Browse Coaches
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.review_id} className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{review.coach_first_name} {review.coach_last_name}</h3>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                        <div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">

                            <span>
                              Updated: {new Date(review.updated_at).toLocaleDateString()}
                            </span>

                            <span className="text-gray-300">•</span>
                            <span>
                              Reviewed: {new Date(review.created_at).toLocaleDateString()}
                            </span>


                          </div>

                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditReview(review)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-red-500"
                          onClick={async () => {
                            const ok = await confirm({
                              message: "Are you sure you want to delete this review?",
                              type: "cancel",
                            });

                            if (!ok) return;

                            await handleDeleteReview(review.review_id);
                          }}
//                           onClick={() => openDeleteConfirm(review)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingReview?.review_id === review.review_id && (

                      <form onSubmit={handleUpdateReview} className="space-y-3">
                        <h3 className="text-lg font-semibold">Editing review :</h3>
                        <div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Rating</p>
                            <div className="flex gap-1">
                              {renderEditableStars(editingReview.rating)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="label">Review:</label>
                          <textarea
                            className="textarea textarea-bordered w-full"
                            rows="3"
                            value={editingReview.comment}
                            onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="btn btn-primary bg-blue-800">
                            Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setEditingReview(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))}

              {confirmState.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                  <div className="bg-white p-4 rounded w-80">

                    <p className="text-sm mb-4">
                      {confirmState.message}
                    </p>

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-xs"
                        onClick={() => {
                          confirmState.onResolve(false);
                          setConfirmState({ ...confirmState, open: false });
                        }}
                      >
                        No
                      </button>

                      <button
                        className={`btn btn-xs text-white ${confirmState.type === "cancel"
                          ? "bg-red-600"
                          : "bg-blue-700"
                          }`}
                        onClick={() => {
                          confirmState.onResolve(true);
                          setConfirmState({ ...confirmState, open: false });
                        }}
                      >
                        Yes
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
          <Alert
            isOpen={alert}
            message={alertMsg}
            type={alertType}
            onClose={() => setShowAlert(false)} />
        </section>
      </div>


      <PopUp isOpen={popOpen === "delete"} onClose={() => {
        setPopOpen(null);
        setReviewToDelete(null);
      }}>
          <fieldset className="fieldset bg-base-200 border-gray-500 rounded-box w-s border p-4">
              <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">
                  Delete review
              </legend>
              <p className="text-gray-700 font-semibold my-2">
                  Are you sure you want to delete this review?
              </p>
              <div className="flex gap-4 mt-4">
                  <button
                      className="btn bg-red-600 btn-neutral ml-auto"
                      type="button"
                      onClick={() => handleDeleteReview(reviewToDelete?.review_id)}
                  >
                      Yes
                  </button>
                  <button
                      className="btn bg-blue-800 btn-neutral"
                      type="button"
                      onClick={() => {
                        setPopOpen(null);
                        setReviewToDelete(null);
                      }}
                  >
                      Cancel
                  </button>
              </div>
          </fieldset>
      </PopUp>
    </div>
  );
}

export default CReviews;
