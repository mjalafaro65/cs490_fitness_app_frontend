import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";

//put calender in here-- have to import a package to get 

function CoWorkoutPlans(){
  const [isPopOpen, setPopOpen] = useState(null);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Workout Plans</div>
              <div className="flex w-full grow flex-1 gap-4">
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-xs mb-2">Current Weight</h2>
                </div>
                <div className="card bg-base-300 rounded-box grow p-4">
                  <h2 className="text-xs mb-2">Goal Weight</h2>
                </div>
              </div>
            <div className="flex w-full grow flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Upcoming Workout</h2>
            </div>
            </div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">My Workout Plans</h2>
                <span className="text-sm opacity-70 mb-3">Nothing exercises currently set</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary btn-sm">Browse Plans</button>
                </div>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Create New Workout Plan</h2>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary btn-sm" onClick={() => setPopOpen("create")}>Create New</button>
                </div>
            </div>
            <div className="card bg-base-300 w-1/4 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Edit Workout Plans</h2>
              <span className="text-sm opacity-70 mb-3">No currently existing plans</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary btn-sm" onClick={() => setPopOpen("editPlan")}>Edit Plans</button>
                </div>
            </div>
          </div>
        </section>
      </div>

{/* have to edit these to match the buttons*/}
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
  
    {isPopOpen === "editPlan" && (
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
    </PopUp>
  </div>

  );

}
export default CoWorkoutPlans;
