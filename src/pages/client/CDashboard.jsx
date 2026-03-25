import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { Link } from 'react-router-dom';

function CDashboard(){
  const [isPopOpen, setPopOpen] = useState(false);

    return (
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Navbar */}
              <nav className="navbar w-full bg-base-300">
                <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                  {/* Sidebar toggle icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                </label>
                <div className="text-xl font-bold">FitNet</div>
              </nav>
              {/* Page content here */}
              <section className="p-6">
                <div className="text-2xl font-bold mb-6">Dashboard</div>
                    <div class="flex">
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
                  <div class="divider"></div>
                  <div className="flex w-full">
                  < div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-40 grow place-items-center">content</div>
                  </div>
                  <div class="divider"></div>
                    <div className="flex w-full">
                    <div className="card bg-base-300 rounded-box grid h-60 grow place-items-center">content</div>
                    <div className="divider divider-horizontal"></div>
                    <div className="card bg-base-300 rounded-box grid h-60 grow place-items-center">content</div>
                </div>
              </section>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
              <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
              <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                {/* Sidebar content here */}
                <ul className="menu w-full grow">
                  {/* List item */}
                  <li>
                    <Link
                      to="/"
                      className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center"
                      data-tip="Dashboard"
                    >
                      {/* Home icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                      <span className="is-drawer-close:hidden">Dashboard</span>
                    </Link>
                  </li>

                  {/* List item */}
                  <li>
                    <Link to="/client/profile" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Profile">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/mycoach" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="My Coach">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">My Coach</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/client/workoutplans" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Workout Plans">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Workout Plans</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/progresslogs" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Progress Logs">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Progress Logs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/meallogs" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Plans/Logs">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Meal Plans/Logs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/messages" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Messages">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Messages</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/client/settings" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
                      {/* Settings icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                      <span className="is-drawer-close:hidden">Settings</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
)}
export default CDashboard;
