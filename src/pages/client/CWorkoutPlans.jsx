import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import BrowseExercises from "../Exercises";

function LargeModal({ open, onClose, children, width = "70vw", height = "85vh" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-6 overflow-y-auto"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ClientWorkoutPlans(){
  const [isPopOpen, setPopOpen] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isBrowsePopOpen, setBrowsePopOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState(null); 
  const [assigningDay, setAssigningDay] = useState(null);

  const [activeDays, setActiveDays] = useState([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [exerciseDayContext, setExerciseDayContext] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  const [currentWeight, setCurrentWeight] = useState(null);

  const [newPlan, setNewPlan] = useState({
    name: "", 
    description: "", 
    is_public: false,
  });

  const [assignData, setAssignData] = useState({
  start_date: "",
  end_date: "",
});

  const [newDayByPlan, setNewDayByPlan] = useState({});

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
}, []);

  const fetchExer = async () => {
    try {
      const res = await api.get("/workouts/exercises");
      setExer(res.data.exercises || []);
    } catch (err) {
      console.error("Failed to fetch exercises:", err.response?.data || err);
    }
  };

  const handleDayChange = (planId, field, value) => {
  setNewDayByPlan(prev => ({
    ...prev,
    [planId]: {
      ...prev[planId],
      [field]: value
    }
    }));
  };

const handleAssign = async () => {
  if (!selectedPlan || !assignData.start_date || !assignData.end_date) {
    alert("Please select a plan and dates.");
    return;
  }

  try {
    await api.post(
      `/workouts/plans/${selectedPlan.plan_id}/assignments`,
      {
        start_date: assignData.start_date,
        end_date: assignData.end_date,
        repeat_rule: "weekly",
      }
    );

    const start = new Date(assignData.start_date);
    const end = new Date(assignData.end_date);

    const scheduled = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const weekday = d.getDay();

      const matchingDay = selectedPlan.days.find(
        (day) => Number(day.weekday) === weekday
      );

      if (matchingDay) {
        scheduled.push({
          date: new Date(d),
          day: matchingDay,
        });
      }
    }

    setActiveDays(scheduled);

    alert("Plan scheduled!");
    fetchPlans();
  } catch (err) {
    console.error(err);
  }
};

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const selectedWorkouts =
  selectedDate &&
  plans.flatMap(plan =>
    plan.days?.filter(d =>
      d.occurrences?.some(o =>
        new Date(o.scheduled_start).toDateString() === selectedDate.toDateString()
      )
    ) || []
  );

  const handleSelectPlan = async (plan_id) => {
    try {
      const res = await api.get(`/workouts/plans/${plan_id}`);
      const plan = res.data;

      setSelectedPlan(plan);

      setEditData({
        name: plan.name,
        description: plan.description,
        is_public: plan.is_public,
      });
      setPopOpen("details");
    } catch (err) {
      console.error("Failed to fetch plan details:", err);
    }
  };

  useEffect(() => {
  fetchPlans();
}, []);

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
  const dayData = newDayByPlan[plan_id] || {};
  const plan = plans.find(p => p.plan_id === plan_id);
  const nextOrder = (plan?.days?.length || 0) + 1;

  try {
    await api.post(`/workouts/plans/${plan_id}/days`, {
      day_label: dayData.day_label || `Day ${nextOrder}`,
      sort_order: nextOrder,
      weekday: Number(dayData.weekday) || 0,
      session_time: dayData.session_time || null,
    });

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

  const handleUpdate = async () => {
  try {
    await api.patch(
      `/workouts/plans/${selectedPlan.plan_id}`,
      editData
    );

    fetchPlans();
    handleSelectPlan(selectedPlan.plan_id);
  } catch (err) {
    console.error("Update failed:", err.response?.data || err);
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
                  const hasWorkout = activeDays.some(
  (d) => d.date.toDateString() === day.toDateString()
);

                  return (
                    <div
                      key={i}
                      className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                        ${isSelected ? "bg-primary text-white" 
                          : isToday ? "bg-neutral text-white" 
                          : hasWorkout ? "bg-secondary text-white" 
                          : "bg-base-200"}`}
                      onClick={() => {
  setSelectedDate(day);

  const matchedPlanDay = selectedPlan?.days?.find(
    (d) => Number(d.weekday) === day.getDay()
  );

  setSelectedCalendarDay(day);
  setExerciseDayContext(matchedPlanDay || null);
  setAssigningDay(matchedPlanDay || null);
}}
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
                      onClick={() => handleSelectPlan(plan.plan_id)}
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
                <button className="btn btn-primary bg-blue-800 btn-sm">
                  Browse Plans
                </button>
              </div>
            </div>

            {/* CREATE */}
            <div className="card bg-base-300 p-4 rounded-box w-64 h-30 mx-auto flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">
                Create New Workout Plan
              </h2>
                <button
                  className="btn btn-primary bg-blue-800 btn-sm mt-auto"
                  onClick={() => setPopOpen("create")}
                >
                  Create New
                </button>
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

            <button className="btn btn-primary bg-blue-800 mt-2" type="submit">
              Create
            </button>
          </form>
        )}
        {isPopOpen === "details" && selectedPlan && (
        <div className="bg-base-200 p-4 rounded-box max-w-md w-full flex flex-col gap-4">

          <h2 className="text-lg font-bold">{selectedPlan.name}</h2>

          <input
            className="input input-sm"
            name="name"
            value={editData.name}
            onChange={(e) => handleChange(e, setEditData)}
          />

          <input
            className="input input-sm"
            name="description"
            value={editData.description}
            onChange={(e) => handleChange(e, setEditData)}
          />

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="is_public"
              checked={editData.is_public}
              onChange={(e) => handleChange(e, setEditData)}
            />
            Public
          </label>

          <button
            className="btn btn-primary bg-blue-800 btn-sm"
            onClick={handleUpdate}
          >
            Save Changes
            </button>
            <div className="mt-2">
              <h3 className="font-bold">Days</h3>

              {selectedPlan.days?.length === 0 ? (
                <p className="text-xs opacity-70">No days yet</p>
              ) : (
                selectedPlan.days.map((day) => (
                  <div key={day.day_id} className="border p-2 rounded mt-2">
                    <p className="font-semibold">
                      {day.day_label} (Day {day.weekday})
                    </p>

                    {day.exercises?.length > 0 ? (
                      <ul className="ml-4 list-disc text-sm">
                        {day.exercises.map((ex, idx) => (
                          <li key={idx}>
                            {ex.name} — {ex.sets}x{ex.reps}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs opacity-70">No exercises</p>
                    )}
                  </div>
                ))
              )}
              {!assigningDay && (
                <p className="text-xs opacity-60 mt-2">
                  Click a calendar date to add exercises
                </p>
              )}
              {assigningDay && (
                <button
                  className="btn btn-primary bg-blue-800 btn-sm mt-2"
                  onClick={() => setBrowsePopOpen(true)}
                >
                  Add Exercise
                </button>
              )}
            </div>

            <div className="mt-3">
              <h3 className="font-bold">Schedule Plan</h3>

{/* DATE RANGE INPUTS (unchanged but we enhance them) */}
<input
  type="date"
  className="input input-sm"
  value={assignData.start_date}
  onChange={(e) =>
    setAssignData(prev => ({
      ...prev,
      start_date: e.target.value
    }))
  }
/>

<input
  type="date"
  className="input input-sm"
  value={assignData.end_date}
  onChange={(e) =>
    setAssignData(prev => ({
      ...prev,
      end_date: e.target.value
    }))
  }
/>

{/* NEW: CALENDAR PREVIEW (ONLY SHOWS AFTER DATES SELECTED) */}
{assignData.start_date && assignData.end_date && (() => {
  const start = new Date(assignData.start_date);
  const end = new Date(assignData.end_date);

  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return (
    <div className="mt-3">
      <p className="font-bold mb-2">Click days to activate workouts</p>

      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {days.map((day, i) => {
          const isSelected =
            selectedCalendarDay?.toDateString() === day.toDateString();

          const hasWorkout = activeDays.some(
            (d) => d.date.toDateString() === day.toDateString()
          );

          return (
            <div
              key={i}
              onClick={() => {
                setSelectedCalendarDay(day);

                const matchedDay = selectedPlan?.days?.find(
                  (d) => Number(d.weekday) === day.getDay()
                );

                setExerciseDayContext(matchedDay || null);
              }}
              className={`h-10 flex items-center justify-center rounded cursor-pointer
                ${isSelected ? "bg-primary text-white"
                  : hasWorkout ? "bg-secondary text-white"
                  : "bg-base-200"}`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
})()}

{/* BUTTON UNCHANGED */}
<button
  className="btn btn-primary bg-blue-800 btn-sm mt-2"
  onClick={handleAssign}
>
  Assign Plan
</button>
            </div>

          </div>
        )}
      </PopUp>
      {isBrowsePopOpen && (
  <LargeModal
  open={isBrowsePopOpen}
  onClose={() => setBrowsePopOpen(false)}
>
  <div className="w-full h-full flex flex-col">
    <h2 className="text-xl font-bold mb-4">
      Add Exercise {exerciseDayContext ? `(${exerciseDayContext.day_label})` : ""}
    </h2>

    <BrowseExercises
      planId={selectedPlan?.plan_id}
      dayId={assigningDay?.day_id}
      onExerciseAdded={(exercise) => {
  setSelectedPlan((prev) => {
    const updatedDays = prev.days.map((day) => {
      if (day.day_id === assigningDay?.day_id) {
        return {
          ...day,
          exercises: [...(day.exercises || []), exercise],
        };
      }
      return day;
    });

    return { ...prev, days: updatedDays };
  });

  setBrowsePopOpen(false);
  setAssigningDay(null);
}}
      onClose={() => setBrowsePopOpen(false)}
    />
  </div>
</LargeModal>
)}
    </div>
    
  );
}

export default ClientWorkoutPlans;