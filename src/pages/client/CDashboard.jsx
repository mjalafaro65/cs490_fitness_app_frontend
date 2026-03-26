import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "../../App.css";
import PopUp from "../../components/PopUp";
import Navbar from "../../components/Navbar";

function CDashboard(){
  const [isPopOpen, setPopOpen] = useState(null);

    return (
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <section className="p-6 flex flex-col gap-6">
                <div className="text-2xl font-bold mb-4">Dashboard</div>
                    <div className="flex w-full grow flex-1 gap-4">
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
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("log")}>Daily Wellness Log</button>
                      <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("view")}>View Today's Log</button>
                      <button className="btn btn-primary btn-sm rounded-t" onClick={() => setPopOpen("edit")}>Edit Today's Log</button>
                          
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
                      <button className="btn btn-primary btn-sm">Browse Coaches</button>
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
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>DAILY WELLNESS LOG</h2>
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
              <label className="label">
                Mood (0-10):
                <input className="input" type="number" min="0" max ="10" name="mood_score" />
              </label>
              <button className="btn btn-primary" type="submit">Log</button>
          </fieldset>
        </>
      )}
  
    {isPopOpen === "view" && (
      <>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className = "fieldset-legend">DAILY WELLNESS LOG</legend>
        </fieldset>
      </>
      )}

    {isPopOpen === "edit" && (
      <>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>DAILY WELLNESS LOG</h2>
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
              <label className="label">
                Mood (0-10):
                <input className="input" type="number" min="0" max ="10" name="mood_score" />
              </label>
              <button className="btn btn-primary" type="submit">Update</button>
          </fieldset>
        </>
      )}
    </PopUp>
  </div>
)}
export default CDashboard;
