import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";

/*add input validation here */

function Initial_Survey() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [initialData, setData] = useState({
        "daily_goal": "",
        "target_focus": "",
        "energy_level": 3,
        "mood_score": 3
    });
    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await api.get("/client/survey-status");
                if (response.data.completed) {
                    navigate("/client/dashboard");
                } else {
                    setLoading(false);
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setLoading(false);
                }
            }
        };
        checkStatus();
    }, [navigate]);



    const handleChange = (e) => {
        const { name, value } = e.target;

        const numericFields = ["energy_level", "mood_score"];
        const finalValue = numericFields.includes(name)
            ? (value === "" ? 0 : Number(value))
            : value;

        setData({
            ...initialData,
            [name]: finalValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/client/daily-survey", initialData);
            console.log("Form submitted:", response.data);
            console.log("STATUS:", response.status);

            if (response.status === 200 || response.status === 201) {
                navigate("/client/dashboard");
            }
        }
        catch (error) {
            console.error("Survey failed:", error.response?.data);
            alert("Survey failed, please try again");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        // Main Container with a modern subtle background
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            {/* Main Card */}
            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-200">
                <div className="card-body gap-6">

                    {/* Header Section */}
                    <div className="text-center">
                        <h2 className="text-3xl text-blue-800 font-bold ">Daily Check-in</h2>
                        <p className="text-base-content/60 mt-2">Let's set the tone for your workout today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Daily Goal Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">What is your main goal for today?</span>
                            </label>
                            <input
                                className="input input-bordered focus:input-primary w-full"
                                type="text"
                                name="daily_goal"
                                placeholder="e.g., Hit a new PR on squats"
                                value={initialData.daily_goal}
                                onChange={handleChange}

                            />
                        </div>

                        {/* Focus Area Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Primary Focus Area</span>
                            </label>
                            <input
                                className="input input-bordered focus:input-primary w-full"
                                type="text"
                                name="target_focus"
                                placeholder="e.g., Leg Day / Cardio"
                                value={initialData.target_focus}
                                onChange={handleChange}

                            />
                        </div>

                        <div className="divider">Your Stats</div>

                        {/* Energy Level Slider */}
                        <div className="form-control w-full">
                            <label className="label flex justify-between">
                                <span className="label-text font-bold">Energy Level</span>
                                <span className="badge badge-primary bg-blue-800  font-bold">{initialData.energy_level} / 5</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                name="energy_level"
                                value={initialData.energy_level}
                                className="range  border-blue-800  w-full  range-sm"
                                step="1"
                                onChange={handleChange}
                            />
                            <div className="flex w-full  justify-between px-2 text-[10px] font-bold opacity-50 mt-1">
                                <span>LOW</span>
                                <span>MID</span>
                                <span>HIGH</span>
                            </div>
                        </div>

                        {/* Mood Score Slider */}
                        <div className="form-control w-full">
                            <label className="label flex justify-between">
                                <span className="label-text font-bold ">Current Mood</span>
                                <span className="badge badge-primary bg-blue-800  font-bold">{initialData.mood_score} / 5</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                name="mood_score"
                                value={initialData.mood_score}
                                className="range range-sm w-full"
                                step="1"
                                onChange={handleChange}
                            />
                            <div className="flex w-full justify-between px-2 text-[10px] font-bold opacity-50 mt-1">
                                <span>TERRIBLE</span>
                                <span>NEUTRAL</span>
                                <span>AMAZING</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="card-actions mt-4">
                            <button className="btn btn-primary bg-blue-800  btn-block text-lg" type="submit">
                                Launch Workout
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Initial_Survey;
