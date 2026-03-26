import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { Link } from 'react-router-dom';
import Navbar from "../../components/Navbar";

function CDashboard(){
  const [isPopOpen, setPopOpen] = useState(false);

    return (
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <Navbar />
            <div className="drawer-content">
              <section className="p-6">
                <div className="text-2xl font-bold mb-6">Dashboard</div>
                    <div className="flex">
                      <div className="card bg-base-300 rounded-box grid h-20 w-1/4 place-items-center">content</div>
                      <div className="divider divider-horizontal"></div>
                      <div className="card bg-base-300 rounded-box grid h-20 w-1/4 place-items-center">content</div>
                      <div className="divider divider-horizontal"></div>
                      <div className="card bg-base-300 rounded-box grid h-20 w-1/4 place-items-center">content</div>
                    </div>
                    <button className="btn btn-primary rounded-t" onClick={() => setPopOpen(true)}>Daily Wellness Log</button>
                          <PopUp isOpen={isPopOpen} onClose={() => setPopOpen(false)}>
                            <h2>DAILY WELLNESS LOG</h2>
                            <form>
                              <label>
                                Daily Goal:
                                <input type="text" name="daily_goal" />
                              </label>
                              <br />
                              <label>
                                Energy Level:
                                <input type="number" name="energy_level" />
                              </label>
                              <br />
                              <label>
                                Target Focus:
                                <input type="text" name="target_focus" />
                              </label>
                              <br />
                              <label>
                                Water (in oz):
                                <input type="number" name="water_oz" />
                              </label>
                              <br />
                              <label>
                                Weight (in lbs):
                                <input type="number" name="weight_lbs" />
                              </label>
                              <br />
                              <label>
                                Hours of Sleep:
                                <input type="number" name="sleep_hours" />
                              </label>
                              <br />
                              <label>
                                Mood:
                                <input type="number" min="0" max ="10" name="mood_score" />
                              </label>
                              <br />
                              <button type="submit">Submit</button>
                            </form>
                          </PopUp>
                  <div className="divider"></div>
                  <div className="flex w-full">
                  < div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                  </div>
                  <div className="divider"></div>
                    <div className="flex w-full">
                    <div className="card bg-base-300 rounded-box grid h-60 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-60 grow place-items-center">content</div>
                </div>
              </section>
            </div>
          </div>
)}
export default CDashboard;
