import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import "../../App.css";

import PopUp from "../../components/PopUp";

import api from "../../axios";



function getWeekDays(anchorDate) {

  const d = new Date(anchorDate);

  const day = d.getDay();

  const monday = new Date(d);

  monday.setDate(d.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {

    const date = new Date(monday);

    date.setDate(monday.getDate() + i);

    return date;

  });

}



function isSameDay(a, b) {

  return (

    a.getFullYear() === b.getFullYear() &&

    a.getMonth() === b.getMonth() &&

    a.getDate() === b.getDate()

  );

}



const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];



function CDashboard() {

  const navigate = useNavigate();

  const [isPopOpen, setPopOpen] = useState(null);

  const [isUpdated, setIsUpdated] = useState(false);

  const [loading, setLoading] = useState(true);

  const [weekAnchor, setWeekAnchor] = useState(new Date());

  const weekDays = getWeekDays(weekAnchor);

  const [today] = useState(new Date());

  const [selectedDay, setSelectedDay] = useState(new Date());



  const [daily, setData] = useState({

    daily_goal: "",

    energy_level: "",

    target_focus: "",

    water_oz: "",

    weight_lbs: "",

    sleep_hours: "",

    mood_score: ""

  });



  const [scheduledWorkouts, setScheduledWorkouts] = useState([]);

  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);



  const fetchScheduledWorkouts = async () => {

    setIsLoadingWorkouts(true);

    try {

      const stored = localStorage.getItem('scheduledWorkouts');

      if (stored) {

        const parsed = JSON.parse(stored);

        setScheduledWorkouts(parsed);

        console.log(`Loaded ${parsed.length} workouts from localStorage`);

      }

      

      const plansRes = await api.get("/workouts/plans/mine");

      const userPlans = plansRes.data.plans || [];

      const allWorkouts = [];

      

      for (const plan of userPlans) {

        try {

          const planRes = await api.get(`/workouts/plans/${plan.plan_id}`);

          const planData = planRes.data;

          

          if (planData.days) {

            planData.days.forEach(day => {

              if (day.occurrences && day.occurrences.length > 0) {

                day.occurrences.forEach(occ => {

                  allWorkouts.push({

                    id: occ.id,

                    plan_id: plan.plan_id,

                    plan_name: plan.name,

                    day_label: day.day_label,

                    day_id: day.plan_day_id,

                    scheduled_start: occ.scheduled_start,

                    exercises: day.exercises || [],

                    date_str: new Date(occ.scheduled_start).toDateString()

                  });

                });

              }

            });

          }

        } catch (err) {

          console.error(`Failed to fetch plan ${plan.plan_id}:`, err);

        }

      }

      

      if (allWorkouts.length > 0) {

        setScheduledWorkouts(allWorkouts);

        localStorage.setItem('scheduledWorkouts', JSON.stringify(allWorkouts));

        console.log(`Loaded ${allWorkouts.length} workouts from backend`);

      }

    } catch (err) {

      console.error("Failed to fetch scheduled workouts:", err);

    } finally {

      setIsLoadingWorkouts(false);

    }

  };



  const getWorkoutsForDate = (date) => {

    if (!date) return [];

    const targetDateStr = date.toDateString();

    const workouts = [];

    

    scheduledWorkouts.forEach((workout) => {

      const workoutDate = new Date(workout.scheduled_start);

      if (workoutDate.toDateString() === targetDateStr) {

        const time = workoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        workouts.push({

          planName: workout.plan_name,

          planId: workout.plan_id,

          dayLabel: workout.day_label,

          dayId: workout.day_id,

          exercises: workout.exercises || [],

          scheduledStart: workout.scheduled_start,

          occurrenceId: workout.id,

          time: time

        });

      }

    });

    

    return workouts;

  };



  useEffect(() => {

    fetchScheduledWorkouts();

  }, []);



  useEffect(() => {

    const handleFocus = () => {

      fetchScheduledWorkouts();

    };

    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);

  }, []);



  const selectedWorkouts = getWorkoutsForDate(selectedDay);

  

  const dayLog = isSameDay(selectedDay, today) ? daily : null;



  useEffect(() => {

    async function fetchUser() {

      try {

        const response = await api.get("/client/daily-survey");

        const response2 = await api.get("/client/survey-status");



        const statusData = response2.data;

        setIsUpdated(statusData.updated || false);



        const data = response.data;



        console.log("GET response:", data, " ", statusData);



        setData({

          daily_goal: data.daily_goal ?? "",

          energy_level: data.energy_level ?? "",

          target_focus: data.target_focus ?? "",

          water_oz: data.water_oz ?? "",

          weight_lbs: data.weight_lbs ?? "",

          sleep_hours: data.sleep_hours ?? "",

          mood_score: data.mood_score ?? ""

        });

        localStorage.setItem("dailyData", JSON.stringify(data));

      } catch (err) {

        console.error("Failed to fetch user:", err.response?.data || err);

      } finally {

        setLoading(false);

      }

    }



    fetchUser();

  }, []);



  const handleChange = (e) => {

    const { name, value } = e.target;

    setData((prev) => ({

      ...prev,

      [name]: value === "" ? "" : value,

    }));

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    

    const submitData = {};

    Object.keys(daily).forEach(key => {

      if (daily[key] !== "" && daily[key] !== null) {

        submitData[key] = daily[key];

      }

    });



    try {

      console.log("Sending:", submitData);

      await api.post("/client/daily-survey", submitData);

      setIsUpdated(true);

      setPopOpen(null);

      console.log("Survey submitted successfully");

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

              <h2 className="text-xs font-semibold mb-2">Hours of Sleep</h2>

              <p className="text-xl font-bold">

                {daily.sleep_hours || "—"}

              </p>

            </div>

            <div className="card bg-base-300 rounded-box grow p-4">

              <h2 className="text-xs font-semibold mb-2">Mood</h2>

              <p className="text-xl font-bold">

                {daily.mood_score ? `${daily.mood_score} / 5` : "—"}

              </p>

            </div>

            <div className="card bg-base-300 rounded-box grow p-4 flex">

              <h2 className="text-xs font-semibold mb-2">Water Intake</h2>

              <p className="text-xl font-bold">

                {daily.water_oz ? `${daily.water_oz} oz` : "—"}

              </p>

            </div>

          </div>

          <div className="card bg-base-300 rounded-box p-4">

            <div className="flex items-center justify-between mb-4">

              <button

                className="btn btn-sm btn-ghost"

                onClick={() => {

                  const d = new Date(weekAnchor);

                  d.setDate(d.getDate() - 7);

                  setWeekAnchor(d);

                }}

              >

                ← Prev

              </button>

              <h2 className="text-base font-bold">

                {weekDays[0].toLocaleDateString("default", { month: "short", day: "numeric" })}

                {" — "}

                {weekDays[6].toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}

              </h2>

              <button

                className="btn btn-sm btn-ghost"

                onClick={() => {

                  const d = new Date(weekAnchor);

                  d.setDate(d.getDate() + 7);

                  setWeekAnchor(d);

                }}

              >

                Next →

              </button>

            </div>



            {isLoadingWorkouts ? (

              <div className="text-center py-8">

                <p className="text-sm opacity-70">Loading workouts...</p>

              </div>

            ) : (

              <div className="grid grid-cols-7 gap-2">

                {weekDays.map((date, i) => {

                  const isToday    = isSameDay(date, today);

                  const isSelected = isSameDay(date, selectedDay);

                  const sessions   = getWorkoutsForDate(date);

                  const hasSession = sessions.length > 0;

   

                  return (

                    <div

                      key={`wd-${i}`}

                      onClick={() => setSelectedDay(date)}

                      className={`

                        cursor-pointer rounded-xl p-2 flex flex-col gap-1 min-h-[110px] transition

                        border-2

                        ${isSelected

                          ? "border-primary bg-primary/10"

                          : isToday

                          ? "border-neutral bg-neutral/10"

                          : "border-transparent bg-base-200 hover:bg-base-100"}

                      `}

                    >

                      <div className="flex flex-col items-center mb-1">

                        <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">

                          {DAY_LABELS[i]}

                        </span>

                        <span

                          className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full

                            ${isToday ? "bg-neutral text-neutral-content" : ""}`}

                        >

                          {date.getDate()}

                        </span>

                      </div>

   

                      {hasSession ? (

                        sessions.map((s, si) => (

                          <div

                            key={`s-${si}`}

                            className="bg-blue-400/20 text-blue-400 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight truncate"

                            title={`${s.planName} — ${s.dayLabel}`}

                          >

                            {s.dayLabel || s.planName}

                          </div>

                        ))

                      ) : (

                        <span className="text-[10px] opacity-30 text-center mt-auto">Rest day</span>

                      )}



                    </div>

                  );

                })}

              </div>

            )}

          </div>

 

          <div className="flex gap-4">

            <div className="card bg-base-300 rounded-box grow p-4">

              <h2 className="text-base font-bold mb-3">

                {selectedDay.toLocaleDateString("default", {

                  weekday: "long", month: "long", day: "numeric",

                })}

              </h2>

 

              {isLoadingWorkouts ? (

                <p className="text-sm opacity-50">Loading workouts...</p>

              ) : selectedWorkouts.length === 0 ? (

                <p className="text-sm opacity-50">No workouts scheduled for this day.</p>

              ) : (

                selectedWorkouts.map((s, si) => (

                  <div key={`det-${si}`} className="mb-3 p-3 bg-base-200 rounded-lg">

                    <div className="flex justify-between items-start mb-1">

                      <p className="font-semibold text-sm">{s.planName} — {s.dayLabel}</p>

                      <span className="text-xs opacity-50">{s.time}</span>

                    </div>

                    {s.exercises.length > 0 ? (

                      <ul className="text-xs flex flex-col gap-0.5 ml-2">

                        {s.exercises.map((ex) => (

                          <li key={`ex-${ex.day_exercise_id ?? ex.de_id ?? ex.exercise_id}`} className="opacity-70">

                            • {ex.exercise?.name || ex.name}

                            {ex.sets && ex.reps ? ` — ${ex.sets}×${ex.reps}` : ""}

                            {ex.weight ? ` @ ${ex.weight} lbs` : ""}

                          </li>

                        ))}

                      </ul>

                    ) : (

                      <p className="text-xs opacity-40 ml-2">No exercises listed</p>

                    )}

                  </div>

                ))

              )}

            </div>



            <div className="card bg-base-300 rounded-box w-64 p-4 shrink-0">

              <h2 className="text-base font-bold mb-3">Wellness Log</h2>

              {isSameDay(selectedDay, today) && dayLog ? (

                <div className="flex flex-col gap-2 text-sm">

                  {[

                    { label: "Sleep",  value: dayLog.sleep_hours  ? `${dayLog.sleep_hours} hrs`  : null },

                    { label: "Mood",   value: dayLog.mood_score   ? `${dayLog.mood_score} / 5` : null },

                    { label: "Water",  value: dayLog.water_oz     ? `${dayLog.water_oz} oz`      : null },

                    { label: "Weight", value: dayLog.weight_lbs   ? `${dayLog.weight_lbs} lbs`   : null },

                    { label: "Goal",   value: dayLog.daily_goal   || null },

                    { label: "Energy", value: dayLog.energy_level ? `${dayLog.energy_level} / 5` : null },

                    { label: "Focus",  value: dayLog.target_focus || null },

                  ].map(({ label, value }) =>

                    value ? (

                      <div key={label} className="flex justify-between border-b border-base-content/10 pb-1">

                        <span className="opacity-60">{label}</span>

                        <span className="font-semibold">{value}</span>

                      </div>

                    ) : null

                  )}

                  {Object.values(dayLog).every((v) => !v) && (

                    <p className="text-xs opacity-40">Nothing logged yet today.</p>

                  )}

                </div>

              ) : (

                <p className="text-xs opacity-40">

                  {isSameDay(selectedDay, today)

                    ? "Nothing logged yet today."

                    : "Log history not available for past days."}

                </p>

              )}

              {isSameDay(selectedDay, today) && (

                <button

                  className="btn bg-blue-800 text-white btn-xs p-3 mt-4 w-full"

                  onClick={() => setPopOpen("update")}

                >

                  Update Today's Log

                </button>

              )}

            </div>

          </div>



          <div className="flex justify-end gap-2">

            {/*<button

              className="btn bg-blue-800 text-white btn-sm rounded-t"

              onClick={() => setPopOpen("log")}

            >

              Daily Wellness Log

            </button>

            <button className="btn bg-yellow-400 btn-sm rounded-t" onClick={() => setPopOpen("view")}>

              View Today's Log

            </button>

            */}

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

                <button className="btn bg-blue-800 text-white btn-sm" onClick={() => navigate("/client/reviews")}>

                  My Reviews

                </button>

              </div>

            </div>

            <div className="card bg-base-300 rounded-box grow p-4">

              <h2 className="text-lg font-bold mb-2">Upcoming Workout</h2>

              {isLoadingWorkouts ? (

                <span className="text-sm opacity-70">Loading...</span>

              ) : (() => {

                const todayWorkouts = getWorkoutsForDate(today);

                if (todayWorkouts.length > 0) {

                  const nextWorkout = todayWorkouts[0];

                  return (

                    <div>

                      <p className="text-sm font-semibold">{nextWorkout.planName}</p>

                      <p className="text-xs opacity-70">{nextWorkout.dayLabel} at {nextWorkout.time}</p>

                      {nextWorkout.exercises.length > 0 && (

                        <p className="text-xs opacity-50 mt-1">{nextWorkout.exercises.length} exercises</p>

                      )}

                    </div>

                  );

                } else {

                  const futureWorkouts = scheduledWorkouts.filter(w => new Date(w.scheduled_start) > today);

                  if (futureWorkouts.length > 0) {

                    const nextWorkout = futureWorkouts[0];

                    const nextDate = new Date(nextWorkout.scheduled_start);

                    return (

                      <div>

                        <p className="text-sm font-semibold">{nextWorkout.plan_name}</p>

                        <p className="text-xs opacity-70">{nextWorkout.day_label} on {nextDate.toLocaleDateString()}</p>

                        {nextWorkout.exercises.length > 0 && (

                          <p className="text-xs opacity-50 mt-1">{nextWorkout.exercises.length} exercises</p>

                        )}

                      </div>

                    );

                  }

                  return <span className="text-sm opacity-70">No workouts scheduled</span>;

                }

              })()}

            </div>

          </div>

        </section>

      </div>



      <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>

        {isPopOpen === "log" && (

          <form onSubmit={handleSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">

            <h2 className="text-xl font-bold mb-4">DAILY WELLNESS LOG</h2>

            <div className="space-y-3">

              <label className="label flex justify-between">

                Water (in oz):

                <input className="input input-bordered w-32" type="number" name="water_oz" value={daily.water_oz} onChange={handleChange} />

              </label>

              <label className="label flex justify-between">

                Weight (in lbs):

                <input className="input input-bordered w-32" type="number" name="weight_lbs" value={daily.weight_lbs} onChange={handleChange} />

              </label>

              <label className="label flex justify-between">

                Hours of Sleep:

                <input className="input input-bordered w-32" type="number" name="sleep_hours" value={daily.sleep_hours} onChange={handleChange} />

              </label>

            </div>

            <button className="btn bg-blue-800 mt-4 w-full text-white" type="submit">Log</button>

          </form>

        )}



        {isPopOpen === "update" && (

          <form onSubmit={handleSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">

            <h2 className="text-xl font-bold mb-4">DAILY WELLNESS LOG</h2>

            <div className="space-y-3">

              <label className="label flex justify-between">

                Water (in oz):

                <input className="input input-bordered w-32" type="number" name="water_oz" value={daily.water_oz} onChange={handleChange} />

              </label>

              <label className="label flex justify-between">

                Weight (in lbs):

                <input className="input input-bordered w-32" type="number" name="weight_lbs" value={daily.weight_lbs} onChange={handleChange} />

              </label>

              <label className="label flex justify-between">

                Hours of Sleep:

                <input className="input input-bordered w-32" type="number" name="sleep_hours" value={daily.sleep_hours} onChange={handleChange} />

              </label>

              <label className="label flex justify-between">

                Mood Score (1-5):

                <input className="input input-bordered w-32" type="number" name="mood_score" value={daily.mood_score} onChange={handleChange} min="1" max="5" />

              </label>

              <label className="label flex flex-col items-start gap-1">

                <span>Daily Goal:</span>

                <input className="input input-bordered w-full" type="text" name="daily_goal" value={daily.daily_goal} onChange={handleChange} />

              </label>

              <label className="label flex flex-col items-start gap-1">

                <span>Energy Level (1-5):</span>

                <input className="input input-bordered w-full" type="number" name="energy_level" value={daily.energy_level} onChange={handleChange} min="1" max="5" />

              </label>

              <label className="label flex flex-col items-start gap-1">

                <span>Target Focus:</span>

                <input className="input input-bordered w-full" type="text" name="target_focus" value={daily.target_focus} onChange={handleChange} />

              </label>

            </div>

            <button className="btn bg-blue-800 mt-4 w-full text-white" type="submit">Update</button>

          </form>

        )}



        {isPopOpen === "view" && (

          <div className="card bg-base-200 border-base-300 border p-6 rounded-box w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">Today's Wellness Log</h2>

            <div className="space-y-3">

              {[

                { key: "daily_goal", label: "Daily Goal" },

                { key: "energy_level", label: "Energy Level", suffix: "/5" },

                { key: "target_focus", label: "Target Focus" },

                { key: "water_oz", label: "Water Intake", suffix: " oz" },

                { key: "weight_lbs", label: "Weight", suffix: " lbs" },

                { key: "sleep_hours", label: "Sleep", suffix: " hrs" },

                { key: "mood_score", label: "Mood Score", suffix: "/5" }

              ].map(({ key, label, suffix }) => (

                <div key={key} className="flex justify-between border-b border-base-300 pb-2">

                  <span className="font-semibold text-base-content/70">{label}:</span>

                  <span className="text-primary font-medium">

                    {daily[key] || "N/A"}

                    {daily[key] && suffix ? suffix : ""}

                  </span>

                </div>

              ))}

            </div>

          </div>

        )}

      </PopUp>

    </div>

  );

}



export default CDashboard;