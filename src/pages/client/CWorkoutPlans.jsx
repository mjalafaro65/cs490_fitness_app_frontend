import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

//put calender in here-- have to import a package to get 

function ClientWorkoutPlans() {
  const [isPopOpen, setPopOpen] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [currentWeight, setCurrentWeight] = useState(null);
  const [exer, setExer] = useState([])


  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  const [newDay, setNewDay] = useState({
    day_label: "",
    sort_order: 0,
    weekday: 0,
    session_time: "",
  });

  const [newDayExercise, setNewDayExercise] = useState({
    exercise_id: 0,
    sets: 1,
    reps: 1,
    weight: 0,
    duration_minutes: 0,
    notes: "",
    sort_order: 0,
  });

  const fetchPlans = async () => {
    try {
      const res = await api.get("/workouts/plans/mine");

      console.log("My plans:", res.data);
      setPlans(res.data.plans);
    } catch (err) {
      console.error("Failed to fetch plans:", err.response?.data || err);
    }
  };


  useEffect(() => {
    const fetchDailySurvey = async () => {
      try {
        const res = await api.get("/client/daily-survey");
        setCurrentWeight(res.data.weight_lbs || null);
      } catch (err) {
        console.error("No survey today or fetch failed:", err.response?.data || err);
        setCurrentWeight(null);
      }
    };

    fetchDailySurvey();

    const loadInitialData = async () => {
      await fetchPlans();
      await fetchExer();
    };

    loadInitialData();
  }, []);

  const fetchExer = async () => {
    try {
      const res = await api.get("/workouts/exercises");
      setExer(res.data.exercises || []);
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
    }
  };

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;

    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const selectedWorkouts = selectedDate && plans.flatMap((plan) =>
    plan.days?.filter(d =>
      d.session_time &&
      new Date(d.session_time).toDateString() === selectedDate.toDateString()
    ) || []
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/workouts/plans", newPlan);
      setPopOpen(null);
      setNewPlan({ name: "", description: "", is_public: false });
      fetchPlans();
    } catch (err) {
      console.error("Create failed:", err.response?.data || err);
    }
  };

  const handleAddDay = async (plan_id) => {
    try {
      await api.post(`/workouts/plans/${plan_id}/days`, newDay);
      setNewDay({ day_label: "", sort_order: 0, weekday: 0, session_time: "" });
      fetchPlans();
    } catch (err) {
      console.error("Create failed:", err.response?.data || err);
    }
  };

  const handleAddDayExercise = async (plan_id, day_id) => {
    try {
      await api.post(`/workouts/plans/${plan_id}/days/${day_id}/exercises`, newDayExercise);
      setNewDayExercise({
        exercise_id: 0,
        sets: 1,
        reps: 1,
        weight: 0,
        duration_minutes: 0,
        notes: "",
        sort_order: 0,
      });
      fetchPlans();
    } catch (err) {
      console.error("Add exercise failed:", err.response?.data || err);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Workout Plans</div>

          <div className="flex w-full grow flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Current Weight</h2>
              <p className="text-m">
                {currentWeight !== null ? `${currentWeight} lbs` : "No data yet"}
              </p>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Goal Weight</h2>
            </div>
          </div>

          {/* Plan list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.plan_id} className="card bg-base-300 p-4 rounded-box">
                <h2 className="font-bold">{plan.name}</h2>
                <p className="text-xs opacity-70">{plan.description || "No description"}</p>

                {/* Add Day */}
                <button className="btn btn-sm mt-2" onClick={() => handleAddDay(plan.plan_id)}>
                  Add Day
                </button>

                {/* Add Exercise to first day as example */}
                {plan.days?.[0] && (
                  <button
                    className="btn btn-sm mt-2"
                    onClick={() => handleAddDayExercise(plan.plan_id, plan.days[0].day_id)}
                  >
                    Add Exercise
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Calendar + Upcoming Workouts */}
          <div className="flex w-full gap-4 mt-6">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Upcoming Workout</h2>

              {!selectedDate ? (
                <p className="text-sm opacity-70">Select a date on the calendar</p>
              ) : selectedWorkouts.length === 0 ? (
                <p className="text-sm opacity-70">No workouts planned for this day.</p>
              ) : (
                selectedWorkouts.map(day => (
                  <div key={day.day_id} className="mb-2 p-2 border rounded">
                    <p className="font-semibold">{day.day_label || "Unnamed Day"}</p>
                    {day.exercises && day.exercises.length > 0 ? (
                      <ul className="ml-4 list-disc">
                        {day.exercises.map((ex, idx) => (
                          <li key={idx}>
                            {ex.name} - {ex.sets} sets x {ex.reps} reps
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs opacity-70">No exercises added</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="card bg-base-300 rounded-box w-1/2 p-4">
              <h2 className="text-lg font-bold mb-2">Calendar</h2>

              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <button className="btn btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  ←
                </button>

                <span className="font-semibold text-lg">
                  {monthName} {year}
                </span>

                <button className="btn btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="font-bold text-xs opacity-70">{d}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = new Date(year, month, i + 1);
                  const isToday = new Date().toDateString() === day.toDateString();
                  const isSelected =
                    selectedDate &&
                    selectedDate.toDateString() === day.toDateString();
                  const hasWorkout = plans.some(plan =>
                    plan.days?.some(d => d.session_time && new Date(d.session_time).toDateString() === day.toDateString())
                  );

                  return (
                    <div
                      key={i}
                      className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                        ${isSelected ? "bg-primary text-white"
                          : isToday ? "bg-neutral text-white"
                            : hasWorkout ? "bg-secondary text-white"
                              : "bg-base-200"}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">My Workout Plans</h2>
              {plans.length === 0 ? (
                <span className="text-sm opacity-70">
                  No plans yet
                </span>
              ) : (
                <div className="flex flex-col gap-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.plan_id}
                      className="p-2 bg-base-200 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">{plan.name}</p>
                        <p className="text-xs opacity-70">
                          {plan.description || "No description"}
                        </p>
                      </div>

                      <span className="text-xs">
                        {plan.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto flex justify-center mt-3">
                <button className="btn btn-primary btn-sm">
                  Browse Plans
                </button>
              </div>
            </div>

            {/* CREATE */}
            <div className="card bg-base-300 grow p-4">
              <h2 className="text-lg font-bold mb-2">
                Create New Workout Plan
              </h2>

              <div className="mt-auto flex justify-center">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setPopOpen("create")}
                >
                  Create New
                </button>
              </div>
            </div>

            {/* EDIT (placeholder) */}
            <div className="card bg-base-300 w-1/4 grow p-4">
              <h2 className="text-lg font-bold mb-2">
                Edit Workout Plans
              </h2>

              <span className="text-sm opacity-70">
                Select a plan to edit
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* POPUP */}
      <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
        {isPopOpen === "create" && (
          <form
            onSubmit={handleCreate}
            className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
          >
            <h2>Create a Workout Plan</h2>

            <label className="label">
              Name:
              <input
                className="input"
                type="text"
                name="name"
                value={newPlan.name}
                onChange={(e) => handleChange(e, setNewPlan)}
                required
              />
            </label>

            <label className="label">
              Description:
              <input
                className="input"
                type="text"
                name="description"
                value={newPlan.description}
                onChange={(e) => handleChange(e, setNewPlan)}
              />
            </label>

            <label className="label flex items-center gap-2">
              <input
                type="checkbox"
                name="is_public"
                checked={newPlan.is_public}
                onChange={(e) => handleChange(e, setNewPlan)}
              />
              Public
            </label>

            <button className="btn btn-primary mt-2" type="submit">
              Create
            </button>
          </form>
        )}
      </PopUp>
    </div>
  );
}

export default ClientWorkoutPlans;