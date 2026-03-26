import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import Navbar from "../../components/Navbar";

function ProgressLogs(){
  const [isPopOpen, setPopOpen] = useState(null);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Progress/Analystics</div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("create")}>Create New Goal</button>
            <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("editGoal")}>Edit Goals</button>
            <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("editAct")}>Edit Activity</button> 
          </div>
              <div className="flex w-full grow gap-4">
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-xs mb-2">Steps Today</h2>
                </div>
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-xs mb-2">Calories Today</h2>
                </div>
                <div className="card bg-base-300 rounded-box grow p-4 flex">
                  <h2 className="text-xs mb-2">Water Intake</h2>
                </div>
              </div>
            <div className="flex w-full grow gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Water Intake</h2>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Mood</h2>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Steps</h2>
            </div>
            </div>
          <div className="flex w-full h-60 gap-4">
            <div className="card bg-base-300 rounded-box flex-1 grow p-4">
              <h2 className="text-lg font-bold mb-2">Weight Tracking</h2>
            </div>
            <div className="card bg-base-300 w-1/4 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Today's Activity</h2>
                <span className="text-sm opacity-70 mb-3">Nothing logged for today</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary btn-sm">Log Activity</button>
                </div>
            </div>
          </div>
        </section>
      </div>

    <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
      {isPopOpen === "create" && (
        <>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>Create a New Goal</h2>
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
              <label className="label">
                Weight (in lbs):
                <input className="input" type="number" name="weight_lbs" />
              </label>
              <label className="label">
                Hours of Sleep:
                <input className="input" type="number" name="sleep_hours" />
              </label>
              <button className="btn btn-primary" type="submit">Create</button>
          </fieldset>
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
              <button className="btn btn-primary" type="submit">Update</button>
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
              <button className="btn btn-primary" type="submit">Update</button>
          </fieldset>
        </>
      )}
    </PopUp>
  </div>

  );

}
export default ProgressLogs;
