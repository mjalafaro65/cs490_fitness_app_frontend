import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

function CDashboard(){
  const navigate = useNavigate();
  const [isPopOpen, setPopOpen] = useState(null);

  const [daily, setData] = useState({
    daily_goal: "",
    energy_level: "",
    target_focus: "", 
    water_oz: "",
    weight_lbs: "", 
    sleep_hours: "", 
    mood_score: ""
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/client/daily-survey", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;

        console.log("Response data:", data);

        setData({
          daily_goal: data.daily_goal || "",
          energy_level: data.energy_level || "",
          target_focus: data.target_focus || "",
          water_oz: data.water_oz || "",
          weight_lbs: data.weight_lbs || "", 
          sleep_hours: data.sleep_hours || "",
          mood_score: data.mood_score || ""
        });

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
      }
    }

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...daily,
      [name]:
        name === "energy_level" || name === "water_oz" || name === "weight_lbs" || name === "sleep_hours" || name === "mood_score"
          ? value === "" ? "" : Number(value)
          : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending:", daily);

      const response = await api.post("/client/daily-survey", daily, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log("SUCCESS:", response.data);

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
    }
  };

    return (
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <section className="p-6 flex flex-col gap-6">
                <div className="text-2xl font-bold mb-4">Dashboard</div>
                    <div className="flex w-full grow flex-1 gap-4">
                      <div className="card bg-base-300 rounded-box grow p-4">
                        <h2 className="text-xs mb-2">Hours of Sleep</h2>
                          <p className="text-xl font-bold">
                            {daily.sleep_hours || "—"}
                          </p>
                      </div>
                      <div className="card bg-base-300 rounded-box grow p-4">
                        <h2 className="text-xs mb-2">Mood</h2>
                          <p className="text-xl font-bold">
                            {daily.mood_score || "—"}
                          </p>
                      </div>
                      <div className="card bg-base-300 rounded-box grow p-4 flex">
                        <h2 className="text-xs mb-2">Water Intake</h2>
                          <p className="text-xl font-bold">
                            {daily.water_oz || "—"}
                          </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("log")}>Daily Wellness Log</button>
                      <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("view")}>View Today's Log</button>
                          
                    </div>
                  <div className="flex w-full grow flex-1 gap-4">
                  <div className="card bg-base-300 rounded-box grow p-4">
                    <h2 className="text-lg font-bold mb-2">Graph 1</h2>
                  </div>
                  <div className="card bg-base-300 rounded-box grow p-4">
                    <h2 className="text-lg font-bold mb-2">Graph 2</h2>
                  </div>
                  <div className="card bg-base-300 rounded-box grow p-4">
                    <h2 className="text-lg font-bold mb-2">Graph 3</h2>
                  </div>
                  </div>
                <div className="flex w-full h-60 flex-1 gap-4">
                  <div className="card bg-base-300 rounded-box flex-1 grow p-4">
                    <h2 className="text-lg font-bold mb-2">My Coach</h2>
                    <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                    <div className="mt-auto flex justify-center">
                      <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => navigate("/client/coaches")} 
                        >Browse Coaches</button>
                    </div>
                  </div>
                  <div className="card bg-base-300 rounded-box grow p-4">
                    <h2 className="text-lg font-bold mb-2">Upcoming Workout</h2>
                                        <span className="text-sm opacity-70 mb-3">No work outs assigned Today</span>
                  </div>
                </div>
              </section>
            </div>

    <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
      {isPopOpen === "log" && (
        <>
          <form onSubmit={handleSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>DAILY WELLNESS LOG</h2>
              <label className="label">
                Daily Goal:
                <input className = "input" type="text" name="daily_goal" value={daily.daily_goal} onChange={handleChange}/>
              </label>
              <label className="label">
                Energy Level:
                <input className="input" type="number" name="energy_level" value={daily.energy_level} onChange={handleChange}/>
              </label>
              <label className="label">
                Target Focus:
                <input className="input" type="text" name="target_focus" value={daily.target_focus} onChange={handleChange}/>
              </label>
              <label className="label">
                Water (in oz):
                <input className="input" type="number" name="water_oz" value={daily.water_oz} onChange={handleChange}/>
              </label>
              <label className="label">
                Weight (in lbs):
                <input className="input" type="number" name="weight_lbs" value={daily.weight_lbs} onChange={handleChange}/>
              </label>
              <label className="label">
                Hours of Sleep:
                <input className="input" type="number" name="sleep_hours" value={daily.sleep_hours} onChange={handleChange}/>
              </label>
              <label className="label">
                Mood (0-10):
                <input className="input" type="number" min="0" max ="10" name="mood_score" value={daily.mood_score} onChange={handleChange}/>
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Log</button>
          </form>
        </>
      )}

    {isPopOpen === "view" && (
      <>
          <fieldset onSubmit={handleSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>DAILY WELLNESS LOG</h2>
              <label className="label">
                Daily Goal:
                <input className = "input" type="text" name="daily_goal" onChange={handleChange} value={daily.daily_goal} />
              </label>
              <label className="label">
                Energy Level:
                <input className="input" type="number" name="energy_level" onChange={handleChange} value={daily.energy_level} />
              </label>
              <label className="label">
                Target Focus:
                <input className="input" type="text" name="target_focus" onChange={handleChange} value={daily.target_focus} />
              </label>
              <label className="label">
                Water (in oz):
                <input className="input" type="number" name="water_oz" onChange={handleChange} value={daily.water_oz} />
              </label>
              <label className="label">
                Weight (in lbs):
                <input className="input" type="number" name="weight_lbs" onChange={handleChange} value={daily.weight_lbs} />
              </label>
              <label className="label">
                Hours of Sleep:
                <input className="input" type="number" name="sleep_hours" onChange={handleChange} value={daily.sleep_hours} />
              </label>
              <label className="label">
                Mood (0-10):
                <input className="input" type="number" min="0" max ="10" name="mood_score" onChange={handleChange} value={daily.mood_score} />
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Update</button>
          </fieldset>
        </>
      )}
    </PopUp>
  </div>
)}
export default CDashboard;
