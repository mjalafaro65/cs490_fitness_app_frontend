import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../axios.jsx";
import VisitorNavbar from "../components/VisitorNavbar.jsx";
import { useAuth } from "../AuthContext.jsx";

const CoachPublicProfile = () => {
    const { user } = useAuth()
    const isLoggedIn = !!user;


    const { id } = useParams();
    const navigate = useNavigate();
    const [coach, setCoach] = useState(null);
    const [coachName, setCoachName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [payments, setPayments] = useState(null);


    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [autoPay, setAutoPay] = useState(false);
    const [hiring, setHiring] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        average: 0,
        total: 0
    });
    const [isFavorite, setIsFavorite] = useState(false);

    // State for interactive features
    const [activeTab, setActiveTab] = useState("about");
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);

    const typeStyles = {
        success:
            "bg-blue-800 text-white border border-blue-600 shadow-lg shadow-blue-900/40",

        error:
            "bg-red-600 text-white border border-red-400 shadow-lg shadow-red-900/40",

        warning:
            "bg-gray-800 text-white border border-gray-600 shadow-lg shadow-black/30",

        info:
            "bg-black text-white border border-gray-700 shadow-lg shadow-black/50"
    };
    const [showAlert, setShowAlert] = useState(false);
    const [type, setType] = useState("success");
    const [message, setMessage] = useState("");


    useEffect(() => {
        const fetchCoachProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/coach/coach-profile`, {
                    params: { coach_profile_id: id }
                });
                console.log(response.data)



                const response2 = await api.get(`/user/${response.data.user_id}`);

                console.log(response2.data)

                setCoach(
                    response.data,
                );

                setCoachName(
                    response2.data,
                );


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


        const fetchFavoriteStatus = async () => {
            try {
                const res = await api.get("/client/favorites/coaches");
                console.log(res.data)
                const favIds = res.data.map((c) => c.coach_profile_id);

                setIsFavorite(favIds.includes(coach.coach_profile_id));
            } catch (err) {
                console.log(err);
            }
        };


        const fetchAvailability = async () => {
            try {
                setAvailabilityLoading(true);

                const res = await api.get("/coach/availability", {
                    params: {
                        coach_profile_id: coach.coach_profile_id,
                    },
                });

                setAvailability(res.data || []);
            } catch (err) {
                console.log("Availability error:", err.response?.data || err);
                setAvailability([]);
            } finally {
                setAvailabilityLoading(false);
            }

        };

        fetchAvailability();
        if (isLoggedIn) {
            fetchFavoriteStatus();

        }

        fetchPaymentPlans();
    }, [coach]);

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await api.delete(`/client/favorites/coaches/${coach.coach_profile_id}`);
                setIsFavorite(false);
            } else {
                await api.post(`/client/favorites/coaches/${coach.coach_profile_id}`);
                setIsFavorite(true);
            }
        } catch (err) {
            console.log(err.response?.data);
        }
    };
    const hireCoach = async () => {
        try {
            setHiring(true);

            await api.post("/client/hire-request", {
                coach_profile_id: coach.coach_profile_id,
                payment_plan_id: selectedPlan.payment_plan_id,
                auto_pay_enabled: autoPay

            });

            showAlertMessage("Hire request sent!", "success");


            setShowHireModal(false);

        } catch (err) {
            console.error(err.response?.data || err);
            showAlertMessage("Failed to send hire request", "error");
        } finally {
            setHiring(false);
        }
    }


    const showAlertMessage = (msg, type = "success") => {
        setMessage(msg);
        setType(type);
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false);
        }, 3000);
    };

    if (loading) return <div className="p-10 text-center">Loading profile...</div>;
    if (error || !coach) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {!isLoggedIn ? <VisitorNavbar /> : (
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
                                    {coachName.first_name?.[0]}{coachName.last_name?.[0]}
                                </div>
                                <h1 className="text-2xl font-bold">{coachName.first_name} {coachName.last_name}</h1>
                                <div className="flex items-center gap-1 my-2">
                                    <span className="text-orange-500 text-lg">★</span>
                                    <span className="font-bold">{reviewStats.average}</span>
                                    <span className="text-gray-400 text-sm">({reviewStats.total})</span>
                                </div>
                                <p className="text-blue-900 font-medium mb-6">Certified Fitness Coach</p>

                                {!isLoggedIn || (<button
                                    onClick={toggleFavorite}
                                    className="btn w-full border-none bg-white text-black hover:opacity-90"
                                >
                                    {isFavorite ? "★ Favorited" : "☆ Add to Favorites"}
                                </button>)}

                                {isLoggedIn && (
                                    <button
                                        onClick={() => {
                                            // Navigate to messages page with coach info to start conversation
                                            navigate("/messages", {
                                                state: {
                                                    coachUser: {
                                                        user_id: coach.user.user_id,
                                                        first_name: coach.user.first_name,
                                                        last_name: coach.user.last_name,
                                                        coach_profile_id: coach.coach_profile_id
                                                    }
                                                }
                                            });
                                        }}
                                        className="btn w-full bg-blue-800 text-white hover:bg-blue-700 mt-2"
                                    >
                                        Message
                                    </button>
                                )}
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
                                                    <span className="badge bg-blue-800 badge-primary mb-2">
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


                                                    <button
                                                        className="btn btn-sm btn-block bg-blue-800 btn-primary"
                                                        onClick={() => {
                                                            if (!isLoggedIn) {
                                                                navigate("/login");
                                                                return;
                                                            }

                                                            setSelectedPlan(plan);
                                                            setShowHireModal(true);
                                                        }}
                                                    >
                                                        {" Hire Coach"}

                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* AVAILABILITY / CALENDAR SECTION */}
                            {activeTab === "availability" && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold mb-6">Availability</h3>

                                    {availabilityLoading ? (
                                        <div className="text-center py-10">
                                            <span className="loading loading-spinner"></span>
                                        </div>
                                    ) : availability.length === 0 ? (
                                        <p className="text-gray-400 text-center">
                                            No availability set yet
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {availability.map((slot, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 border rounded-lg bg-blue-50 text-center"
                                                >
                                                    <p className="font-semibold text-blue-800">
                                                        {new Date(slot.date).toLocaleDateString(undefined, {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        {slot.start_time} - {slot.end_time}
                                                    </p>

                                                    {/* <span className="text-xs text-gray-400">
                                                        {slot.is_booked ? "Booked" : "Available"}
                                                    </span> */}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showHireModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">

                                        <h2 className="text-xl font-bold mb-4">Hire Coach</h2>

                                        {/* example plan select (you can replace with real API plans later) */}
                                        <label className="block mb-2 text-sm font-semibold">
                                            Select Plan
                                        </label>

                                        <p className="mb-4 text-gray-700">
                                            Selected Plan: <b>{selectedPlan.name}</b>
                                        </p>

                                        <label className="flex items-center gap-2 mb-4">
                                            <input
                                                type="checkbox"
                                                checked={autoPay}
                                                onChange={(e) => setAutoPay(e.target.checked)}
                                            />
                                            Enable Auto Pay
                                        </label>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => setShowHireModal(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                disabled={hiring || !selectedPlan}
                                                onClick={() => hireCoach()}
                                            >
                                                {hiring ? "Sending..." : "Hire"}
                                            </button>
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

                                                        // Convert 1-5 star rating to 1-100 scale for backend
                                                        const ratingScale = (newRating / 5) * 100;

                                                        await api.post(`/client/review-coach/${coach.coach_profile_id}`, {
                                                            rating: Math.round(ratingScale),
                                                            comment: newComment
                                                        });

                                                        const res = await api.get(`/coach/${id}/reviews`);
                                                        setReviews(res.data);

                                                        setShowReviewModal(false);
                                                        setNewComment("");
                                                        setNewRating(5);

                                                    } catch (err) {
                                                        console.error("Review submission error:", err);
                                                        console.error("Error response:", err.response);
                                                        console.error("Error status:", err.response?.status);
                                                        console.error("Error data:", err.response?.data);

                                                        // Show more specific error message
                                                        if (err.response?.data?.msg) {
                                                            alert(`Failed to submit review: ${err.response.data.msg}`);
                                                        } else if (err.response?.status === 401) {
                                                            alert("Failed to submit review: Please log in again");
                                                        } else if (err.response?.status === 400) {
                                                            alert("Failed to submit review: Invalid data provided");
                                                        } else {
                                                            alert("Failed to submit review: Server error. Please try again.");
                                                        }
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
                            {showAlert && (
                                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
                                    <div className={`p-3 rounded-lg shadow-lg ${typeStyles[type]}`}>
                                        {message}
                                    </div>
                                </div>
                            )}



                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CoachPublicProfile;