import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";

/*add input validation here */

function Initial_Survey() {
    const [initialData, setData] = useState({
        "daily_goal": "",
        "target_focus": "",
        "energy_level": 3,
        "mood_score": 3
    });

    const navigate = useNavigate();

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

    return (
        // Main Container with a modern subtle background
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            {/* Main Card */}
            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-200">
                <div className="card-body gap-6">

                    {/* Header Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-primary">Daily Check-in</h2>
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
                                <span className="badge badge-primary font-bold">{initialData.energy_level} / 5</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                name="energy_level"
                                value={initialData.energy_level}
                                className="range range-primary w-full  range-sm"
                                step="1"
                                onChange={handleChange}
                            />
                            <div className="flex w-full justify-between px-2 text-[10px] font-bold opacity-50 mt-1">
                                <span>LOW</span>
                                <span>MID</span>
                                <span>HIGH</span>
                            </div>
                        </div>
                        <label className="label font-semibold">Height: </label>
                        <input
                            className="input"
                            type="number"
                            name="inches"
                            placeholder=""
                            value={initialData.height}
                            onChange={handleChange}
                        />
                        <label className="label font-semibold">Weight: </label>
                        <input
                            className="input"
                            type="number"
                            name="weight"
                            min = "0"
                            max = "10000"
                            step = "1"
                            placeholder=""
                            value={initialData.weight}
                            onChange={handleChange}
                        />
                        <button className="btn btn-neutral mt-4" type="submit">Get Started!</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Initial_Survey;
