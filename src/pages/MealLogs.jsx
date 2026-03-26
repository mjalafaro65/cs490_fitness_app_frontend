import { useState, useEffect } from "react";
import "../App.css";
import PopUp from "../components/PopUp";
import Navbar from "../components/Navbar";

//put calender in here-- have to import a package to get + edit assignment button

function MealLogs(){
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <Navbar />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Meal Plans</div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("log")}>Log Meals</button>
                <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("browse")}>Browse Meals</button>
                <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("history")}>Meal History</button> 
              </div>
            <div className="flex w-full grow flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Active Meal Plans</h2>
            </div>
          </div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Create New Meal Plan</h2>
                <span className="text-sm opacity-70 mb-3">Nothing to see</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary btn-sm">Create New</button>
                </div>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">View Meal Plans</h2>
              <span className="text-sm opacity-70 mb-3">No currently existing plans</span>
            </div>
          </div>
        </section>
      </div>

    <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
      {isPopOpen === "log" && (
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
  
    {isPopOpen === "browse" && (
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

    {isPopOpen === "history" && (
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
export default MealLogs;
