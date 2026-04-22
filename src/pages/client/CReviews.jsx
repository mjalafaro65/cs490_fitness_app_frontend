import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios";

function CReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/client/my-reviews");
        setReviews(response.data || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await api.delete(`/client/my-reviews/${reviewId}`);
      setReviews(reviews.filter(review => review.review_id !== reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
      setError("Failed to delete review");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/client/my-reviews/${editingReview.review_id}`, {
        rating: editingReview.rating,
        comment: editingReview.comment
      });
      
      setReviews(reviews.map(review => 
        review.review_id === editingReview.review_id ? editingReview : review
      ));
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
                onClick={() => navigate("/client/mycoach")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to My Coach
              </button>
              <h1 className="text-3xl font-bold">My Reviews</h1>
            </div>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
              <button 
                className="btn btn-primary bg-blue-800"
                onClick={() => navigate("/client/coaches")}
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
                        <h3 className="text-lg font-semibold">{review.coach_name}</h3>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
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
                          onClick={() => handleDeleteReview(review.review_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {editingReview?.review_id === review.review_id ? (
                      <form onSubmit={handleUpdateReview} className="space-y-3">
                        <div>
                          <label className="label">Rating (1-5):</label>
                          <select 
                            className="select select-bordered w-full"
                            value={editingReview.rating}
                            onChange={(e) => setEditingReview({...editingReview, rating: parseInt(e.target.value)})}
                          >
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Review:</label>
                          <textarea 
                            className="textarea textarea-bordered w-full"
                            rows="3"
                            value={editingReview.comment}
                            onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
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
                    ) : (
                      <div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">
                          Reviewed on {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CReviews;
