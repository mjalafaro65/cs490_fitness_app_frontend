import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../axios.jsx";
import VisitorNavbar from "../components/VisitorNavbar.jsx";

const CoachPublicProfile = ({ isPublic }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [payments, setPayments] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        average: 0,
        total: 0
    });

    // State for interactive features
    const [activeTab, setActiveTab] = useState("about");

    const isNotLoggedIn = !localStorage.getItem("token");

    useEffect(() => {
        const fetchCoachProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/coach/coach-profile`, {
                    params: { user_id: id }
                });

                const response2 = await api.get(`/user/${id}`);

                setCoach({
                    ...response.data,
                    user: response2.data
                });

                console.log(response.data);
                console.log(response2.data);

            } catch (err) {
                setError("Coach not found or an error occurred.");
            } finally {
                setLoading(false);
            }
        };
        const fetchReviews = async () => {
            try {
                const reviewsRes = await api.get(`/coach/${id}/reviews`);

                const data = reviewsRes.data;

                setReviews(data);

                const total = data.length;
                const avg =
                    total > 0
                        ? data.reduce((sum, r) => sum + r.rating, 0) / total
                        : 0;

                setReviewStats({
                    total,
                    average: avg
                });

            } catch (err) {
                console.error("Failed to load reviews", err);
            }
        };

        fetchCoachProfile();
        fetchReviews();

    }, [id]);

    useEffect(() => {
        if (!coach) return;

        const fetchPaymentPlans = async () => {
            try {
                const response = await api.get(
                    `/client/coach-payment-plans/${coach.coach_profile_id}`
                );
                console.log(response.data)
                setPayments(response.data);
            } catch {
                setError("Payment Plans not found or an error occurred.");
            }
        };

        fetchPaymentPlans();
    }, [coach]);

    if (loading) return <div className="p-10 text-center">Loading profile...</div>;
    if (error || !coach) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {isNotLoggedIn || isPublic ? <VisitorNavbar /> : (
                <div className="p-4 border-b bg-white flex items-center">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">Back</button>
                </div>
            )}

            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Sticky Profile Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card bg-white shadow-xl p-6 sticky top-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full bg-blue-800 text-white flex items-center justify-center text-4xl font-bold mb-4 shadow-lg">
                                    {coach.user.first_name?.[0]}{coach.user.last_name?.[0]}
                                </div>
                                <h1 className="text-2xl font-bold">{coach.user.first_name} {coach.user.last_name}</h1>
                                <div className="flex items-center gap-1 my-2">
                                    <span className="text-orange-500 text-lg">★</span>
                                    <span className="font-bold">4.9</span>
                                    <span className="text-gray-400 text-sm">(42 Reviews)</span>
                                </div>
                                <p className="text-blue-900 font-medium mb-6">Certified Fitness Coach</p>

                                <button className="btn btn-primary w-full bg-blue-800 mb-3">
                                    {isNotLoggedIn ? "Sign up to Message" : "Message Coach"}
                                </button>
                                <button className="btn btn-outline btn-block border-gray-300">Hire Coach</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Content Tabs */}
                    <div className="lg:col-span-2">
                        {/* Tab Navigation */}
                        <div className="tabs tabs-boxed bg-white p-2 mb-6 shadow-sm">
                            <button className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
                            <button className={`tab ${activeTab === 'pricing' ? 'tab-active' : ''}`} onClick={() => setActiveTab('pricing')}>Plans</button>
                            <button className={`tab ${activeTab === 'availability' ? 'tab-active' : ''}`} onClick={() => setActiveTab('availability')}>Availability</button>
                            <button className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-[400px]">

                            {/* ABOUT SECTION */}
                            {activeTab === 'about' && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold mb-4">Biography</h3>
                                    <p className="text-gray-600 leading-relaxed mb-6 italic">"{coach.bio}"</p>
                                    <h3 className="text-xl font-bold mb-4">Specialty</h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {coach.specialty_name?.split(',').map((s, i) => (
                                            <span key={i} className="badge badge-lg bg-blue-50 text-blue-700 border-none px-4 py-2">{s.trim()}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">Experience</h3>
                                    <p className="text-gray-600">{coach.years_experience}</p>
                                </div>
                            )}
                            {activeTab === 'pricing' && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold mb-6">Choose Your Plan</h3>

                                    {!payments || payments.length === 0 ? (
                                        <p className="text-gray-400 text-center">No plans available</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {payments.map((plan) => (
                                                <div
                                                    key={plan.payment_plan_id}
                                                    className="border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-500 transition-all"
                                                >
                                                    <span className="badge badge-primary mb-2">
                                                        {plan.billing_type}
                                                    </span>


                                                    <h4 className="text-lg font-bold">
                                                        {plan.name || "Coaching Plan"}
                                                    </h4>

                                                    <p className="text-3xl font-black my-4">
                                                        ${plan.amount}
                                                        <span className="text-sm font-normal text-gray-400">
                                                            {plan.billing_type === "monthly"
                                                                ? "/mo"
                                                                : plan.billing_type === "session"
                                                                    ? "/session"
                                                                    : ""}
                                                        </span>
                                                    </p>

                                                    {/* Features (if you store them as comma string) */}
                                                    {plan.features && (
                                                        <ul className="text-sm space-y-2 mb-6">
                                                            {plan.features.split(",").map((f, i) => (
                                                                <li key={i}>✓ {f.trim()}</li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    <button className="btn btn-sm btn-block btn-primary">
                                                        Purchase Plan
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* AVAILABILITY / CALENDAR SECTION */}
                            {activeTab === 'availability' && (
                                <div className="animate-fadeIn text-center">
                                    <h3 className="text-xl font-bold mb-6 text-left">Schedule a Session</h3>
                                    <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl">
                                        {/* Placeholder for real calendar component like react-calendar */}
                                        <p className="text-gray-500">Interactive Calendar Integration</p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                                <div key={day} className="p-3 bg-gray-50 rounded-lg w-16">
                                                    <span className="text-xs block text-gray-400">{day}</span>
                                                    <span className="font-bold text-green-600">Open</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* REVIEWS SECTION */}


                            {activeTab === 'reviews' && (
                                <div>
                                    <button
                                        className="btn btn-primary bg-blue-800 btn-sm mb-4"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        Write a Review
                                    </button>

                                    {reviews.length === 0 ? (
                                        <p className="text-gray-400 text-center py-10">
                                            No reviews yet
                                        </p>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review.review_id} className="group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="rating rating-xs mb-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <input
                                                                    key={s}
                                                                    type="radio"
                                                                    className="mask mask-star-2 bg-blue-700"
                                                                    disabled
                                                                    checked={s <= review.rating}
                                                                />
                                                            ))}
                                                        </div>

                                                        <h4 className="font-bold text-gray-900">
                                                            Review
                                                        </h4>
                                                    </div>

                                                    <span className="text-xs text-gray-400 italic">
                                                        {review.created_at
                                                            ? new Date(review.created_at).toLocaleDateString()
                                                            : ""}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 leading-relaxed italic border-l-4 border-blue-100 pl-4">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {showReviewModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">

                                        <h2 className="text-xl font-bold mb-4">Write a Review</h2>

                                        {/* Stars */}
                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setNewRating(star)}
                                                    className={`text-2xl ${star <= newRating ? "text-yellow-400" : "text-gray-300"}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>

                                        {/* Comment */}
                                        <textarea
                                            className="w-full border p-2 rounded mb-4"
                                            rows="4"
                                            placeholder="Write your experience..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />

                                        {/* Buttons */}
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => setShowReviewModal(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={async () => {
                                                    try {
                                                        setSubmitting(true);

                                                        await api.post(`/client/review-coach/${id}`, {
                                                            rating: newRating,
                                                            comment: newComment
                                                        });

                                                        const res = await api.get(`/coach/${id}/reviews`);
                                                        setReviews(res.data);

                                                        setShowReviewModal(false);
                                                        setNewComment("");
                                                        setNewRating(5);

                                                    } catch (err) {
                                                        console.error(err.response);
                                                        alert("Failed to submit review");
                                                    } finally {
                                                        setSubmitting(false);
                                                    }
                                                }}
                                            >
                                                {submitting ? "Submitting..." : "Submit"}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachPublicProfile;