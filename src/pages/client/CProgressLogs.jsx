import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

function ProgressLogs(){
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await api.post("/client/daily-survey", daily);
      alert("Saved!");
    } catch(err){
      console.error("Failed to save survey:", err.response?.data || err)
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Progress/Analystics</div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("create")}>Create New Goal</button>
            <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("editGoal")}>Edit Goals</button>
            <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("editAct")}>Edit Activity</button> 
          </div>
              <div className="flex w-full grow gap-4">
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-m font-bold mb-2">Hours of Sleep</h2>
                    <p className="text-xl font-bold">
                      {daily.sleep_hours || "—"}
                    </p> 
                </div>
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-m font-bold mb-2">Mood</h2>
                    <p className="text-xl font-bold">
                      {daily.mood_score || "—"}
                    </p>
                </div>
                <div className="card bg-base-300 rounded-box grow p-4 flex">
                  <h2 className="text-m font-bold mb-2">Water Intake</h2>
                    <p className="text-xl font-bold">
                      {daily.water_oz || "—"}
                    </p>
                </div>
              </div>
               {/* <div className="flex w-full grow gap-4">-            
-            <div className="card bg-base-300 rounded-box grow p-4">
-              <h2 className="text-lg font-bold mb-2">Steps</h2>
-            </div>
-            </div> */}
          <div className="flex w-full h-60 gap-4">
            <div className="card bg-base-300 rounded-box flex-1 grow p-4">
              <h2 className="text-lg font-bold mb-2">Weight Tracking</h2>
            </div>
            <div className="card bg-base-300 w-1/4 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Today's Activity</h2>
                <span className="text-sm opacity-70 mb-3">Nothing logged for today</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => setPopOpen("log")}>Log Activity</button>
                </div>
            </div>
          </div>
        </section>
      </div>

    <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
      {isPopOpen === "create" && (
        <>
          <form className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>Create a New Goal</h2>
              <label className="label">
                Daily Goal:
                <input className = "input" type="text" name="daily_goal" value={daily.daily_goal} onChange={(e) => setData({...daily, daily_goal: e.target.value})}/>
              </label>
              <label className="label">
                Energy Level:
                <input className="input" type="number" name="energy_level" value={daily.energy_level} onChange={(e) => setData({...daily, energy_level: e.target.value})} />
              </label>
              <label className="label">
                Target Focus:
                <input className="input" type="text" name="target_focus" value={daily.target_focus} onChange={(e) => setData({...daily, target_focus: e.target.value})} />
              </label>
              <label className="label">
                Water (in oz):
                <input className="input" type="number" name="water_oz" value={daily.water_oz} onChange={(e) => setData({...daily, water_oz: e.target.value})}/>
              </label>
              <label className="label">
                Weight (in lbs):
                <input className="input" type="number" name="weight_lbs" value={daily.weight_lbs} onChange={(e) => setData({...daily, weight_lbs: e.target.value})}/>
              </label>
              <label className="label">
                Hours of Sleep:
                <input className="input" type="number" name="sleep_hours" value={daily.sleep_hours} onChange={(e) => setData({...daily, sleep_hours: e.target.value})} />
              </label>
              <button className="btn btn-primary" type="submit">Create</button>
          </form>
        </>
      )}
  
    {isPopOpen === "editGoal" && (
      <>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className = "fieldset-legend">Edit Goals</legend>
              <label className="label">
                Daily Goal  :
              <input className = "input" type="text" name="daily_goal" />
              </label>
              <label className="label">
                Energy Level:
                <input className="input" type="number" name="energy_level" />
              </label>
              <label className="label">
                Target Focus:
                <input className="input" type="text" name="target_focus" />
              </label>
              <label className="label">
                Water (in oz):
                <input className="input" type="number" name="water_oz" />
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Update</button>
        </fieldset>
      </>
      )}

    {isPopOpen === "editAct" && (
      <>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>Edit Activity</h2>
              <label className="label">
                Daily Goal:
                <input className = "input" type="text" name="daily_goal" />
              </label>
              <label className="label">
                Energy Level:
                <input className="input" type="number" name="energy_level" />
              </label>
              <label className="label">
                Target Focus:
                <input className="input" type="text" name="target_focus" />
              </label>
              <label className="label">
                Water (in oz):
                <input className="input" type="number" name="water_oz" />
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Update</button>
          </fieldset>
        </>
      )}

      {isPopOpen === "log" && (
      <>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className = "fieldset-legend">Log Activity</legend>
              <label className="label">
                Activity Name:
              <input className = "input" type="text" name="name" />
              </label>
              <label className="label">
                Sets/Reps:
                <input className="input" type="number" name="sets_reps" />
              </label>
              <button className="btn btn-primary" type="submit">Log</button>
        </fieldset>
      </>
      )}
    </PopUp>
  </div>

  );

}
export default ProgressLogs;
