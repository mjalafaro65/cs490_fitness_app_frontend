import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import BrowseExercises from "../Exercises";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";

function LargeModal({ open, onClose, children, width = "80vw", height = "85vh" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-6 overflow-y-auto relative"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 
                            text-white rounded-md w-8 h-8 flex items-center justify-center transition-colors 
                            duration-200 z-10 shadow-md cursor-pointer"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}

function ClientWorkoutPlans() {
  const [isPopOpen, setPopOpen] = useState(null);
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  const [logData, setLogData] = useState({
    calendar_workout_id: 0,
    plan_day_exercise_id: 0,
    exercise_id: 0,
    sets: 0,
    reps: 0, 
    weight: 0,
    rpe: 0, 
    distance: 0, 
    duration_minutes: 0, 
    notes: ""
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

  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  const [tempActiveDays, setTempActiveDays] = useState([]);
  const [tempSelectedCalendarDay, setTempSelectedCalendarDay] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [selectedScheduledWorkout, setSelectedScheduledWorkout] = useState(null);
  const [isBrowsePopOpen, setBrowsePopOpen] = useState(false);
  const [calendarWorkouts, setCalendarWorkouts] = useState([]);
  const [selectedCalendarWorkout, setSelectedCalendarWorkout] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [selectedWorkoutLog, setSelectedWorkoutLog] = useState(null);
  const [calendarView, setCalendarView] = useState("week");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const fetchCalendarWorkouts = async (date = null, view = "week") => {
    try {
      const params = {};
      if (date) {
        params.date = date instanceof Date ? date.toISOString().split('T')[0] : date;
      }
      if (view) {
        params.view = view;
      }
      
      const response = await api.get("/workouts/calendar-workouts-view", { params });
      setCalendarWorkouts(response.data || []);
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch calendar workouts:", err);
      showAlert("Failed to fetch calendar workouts", "error");
      return [];
    }
  };

  const fetchCalendarWorkoutDetails = async (calendarWorkoutId) => {
    try {
      const response = await api.get(`/workouts/calendar-workouts/${calendarWorkoutId}`);
      setSelectedCalendarWorkout(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch calendar workout details:", err);
      showAlert("Failed to fetch workout details", "error");
      return null;
    }
  };

  const fetchWorkoutLogs = async (clientId = null, calendarWorkoutId = null) => {
    try {
      const params = {};
      if (clientId) params.client_id = clientId;
      if (calendarWorkoutId) params.calendar_workout_id = calendarWorkoutId;
      
      const response = await api.get("/workouts/workout-logs", { params });
      setWorkoutLogs(response.data || []);
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch workout logs:", err);
      showAlert("Failed to fetch workout logs", "error");
      return [];
    }
  };

  const fetchWorkoutLogEntry = async (entryId) => {
    try {
      const response = await api.get(`/workouts/workout-log-entries/${entryId}`);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch workout log entry:", err);
      showAlert("Failed to fetch log entry", "error");
      return null;
    }
  };

  const createWorkoutLogEntry = async (logEntryData) => {
    try {
      const response = await api.post("/workouts/workout-logs", logEntryData);
      showAlert("Workout logged successfully!", "success");
      return response.data;
    } catch (err) {
      console.error("Failed to save workout log:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to log workout", "error");
      return null;
    }
  };

  const updateWorkoutLogEntry = async (entryId, updateData) => {
    try {
      const response = await api.patch(`/workouts/workout-log-entries/${entryId}`, updateData);
      showAlert("Workout log updated successfully!", "success");
      return response.data;
    } catch (err) {
      console.error("Failed to update workout log:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to update workout log", "error");
      return null;
    }
  };

  const deleteWorkoutLogEntry = async (entryId) => {
    try {
      await api.delete(`/workouts/workout-log-entries/${entryId}`);
      showAlert("Workout log entry deleted successfully!", "success");
      return true;
    } catch (err) {
      console.error("Failed to delete workout log:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to delete workout log", "error");
      return false;
    }
  };

  const fetchPlansWithDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/workouts/plans/mine");
      const userPlans = res.data.plans || [];
      
      const plansWithDetails = await Promise.all(
        userPlans.map(async (plan) => {
          const planRes = await api.get(`/workouts/plans/${plan.plan_id}`);
          return planRes.data;
        })
      );
      
      setPlans(plansWithDetails);
      return plansWithDetails;
    } catch (err) {
      console.error("Failed to fetch plans:", err.response?.data || err);
      showAlert("Failed to fetch plans", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (plan_id) => {
    if (!window.confirm("Are you sure you want to delete this entire workout plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}`);
      await fetchPlansWithDetails();
      await fetchCalendarWorkouts(currentViewDate, calendarView);
  
      if (selectedPlan?.plan_id === plan_id) {
        setPopOpen(null);
        setSelectedPlan(null);
      }
      showAlert("Plan deleted successfully.", "success");
    } catch (err) {
      console.error("Delete plan failed:", err.response?.data || err);
      showAlert(`Failed to delete plan: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchPlansWithDetails();
      await fetchCalendarWorkouts(currentViewDate, calendarView);
      await fetchWorkoutLogs();
    };
    initialize();
  }, []);

  useEffect(() => {
    const fetchDailySurvey = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCurrentWeight(null);
        return;
      }
      
      try {
        const res = await api.get("/client/daily-survey");
        setCurrentWeight(res.data.weight_lbs || null);
      } catch (err) {
        setCurrentWeight(null);
      }
    };
    fetchDailySurvey();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/workouts/plans", newPlan);
      setPopOpen(null);
      setNewPlan({ name: "", description: "", is_public: false });
      await fetchPlansWithDetails();
      showAlert("New plan successfully created!", "success");
      
      if (response.data.plan_id) {
        await handleSelectPlan(response.data.plan_id);
      }
    } catch (err) {
      showAlert(err.response?.data || "Failed to create plan", "error");
      console.error("Create plan failed:", err.response?.data || err);
    }
  };

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
      setAssignData({ start_date: "", end_date: "" });
      setTempActiveDays([]);
      setShowScheduleCalendar(false);
      setPopOpen("details");
    } catch (err) {
      console.error("Failed to fetch plan details:", err);
      showAlert("Failed to fetch plan details", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/workouts/plans/${selectedPlan.plan_id}`, editData);
      await fetchPlansWithDetails();
      await handleSelectPlan(selectedPlan.plan_id);
      showAlert("Plan updated successfully!", "success");
    } catch (err) {
      showAlert(err.response?.data || "Failed to update plan", "error");
      console.error("Update plan failed:", err.response?.data || err);
    }
  };

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const handleShowScheduleCalendar = () => {
    if (!assignData.start_date || !assignData.end_date) {
      alert("Please select start and end dates first.");
      return;
    }
    const start = parseLocalDate(assignData.start_date);
    const end = parseLocalDate(assignData.end_date);
    if (start > end) {
      alert("Start date must be before end date.");
      return;
    }
    setShowScheduleCalendar(true);
  };

  const handleAssignPlan = async () => {
    if (tempActiveDays.length === 0) {
      alert("Please assign at least one workout day to a date.");
      return;
    }

    try {
      const assignmentResponse = await api.post(`/workouts/plans/${selectedPlan.plan_id}/assignments`, {
        start_date: assignData.start_date,
        end_date: assignData.end_date,
        repeat_rule: "weekly",
      });

      const occurrences = tempActiveDays.map(({ date, day }) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const dayNum = date.getDate();
        
        let startHour = 9, startMin = 0;
        if (day.session_time) {
          const [h, m] = day.session_time.split(":").map(Number);
          startHour = isNaN(h) ? 9 : h;
          startMin = isNaN(m) ? 0 : m;
        }

        const start = new Date(Date.UTC(year, month, dayNum, startHour, startMin, 0));
        const end = new Date(Date.UTC(year, month, dayNum, startHour + 1, startMin, 0));
        
        return {
          plan_day_id: day.plan_day_id,
          scheduled_start: start.toISOString(),
          scheduled_end: end.toISOString(),
        };
      });

      await api.post(`/workouts/plans/${selectedPlan.plan_id}/calendar`, {
        occurrences: occurrences
      });
      
      showAlert(`Successfully scheduled ${occurrences.length} workout(s). You can now add exercises to each scheduled day.`, "success");
      
      setShowScheduleCalendar(false);
      setTempActiveDays([]);
      setTempSelectedCalendarDay(null);
      
      await fetchPlansWithDetails();
      await fetchCalendarWorkouts(currentViewDate, calendarView);
      await handleSelectPlan(selectedPlan.plan_id);
      
    } catch (err) {
      console.error("Schedule failed:", err.response?.data);
      showAlert(err.response?.data || "Failed to schedule plan", "error");
    }
  };

  const handleAddExercisesToScheduledWorkout = async (calendarWorkout) => {
    setSelectedScheduledWorkout(calendarWorkout);
    setBrowsePopOpen(true);
  };

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogChange = (e) => {
    setLogData({
      ...logData, 
      [e.target.name]: e.target.type === "number" ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const result = await createWorkoutLogEntry(logData);
    if (result) {
      setPopOpen(null);
      setLogData({
        calendar_workout_id: 0,
        plan_day_exercise_id: 0,
        exercise_id: 0,
        sets: 0,
        reps: 0, 
        weight: 0,
        rpe: 0, 
        distance: 0, 
        duration_minutes: 0, 
        notes: ""
      });
      await fetchWorkoutLogs();
      await fetchCalendarWorkouts(currentViewDate, calendarView);
    }
  };

  const handleViewWorkoutDetails = async (calendarWorkoutId) => {
    const details = await fetchCalendarWorkoutDetails(calendarWorkoutId);
    if (details) {
      setPopOpen("workoutDetails");
    }
  };

  const handleViewWorkoutLogs = async (calendarWorkoutId) => {
    const logs = await fetchWorkoutLogs(null, calendarWorkoutId);
    if (logs.length > 0) {
      setSelectedWorkoutLog(logs[0]);
      setPopOpen("viewLogs");
    } else {
      showAlert("No logs found for this workout", "info");
    }
  };

  const changeViewDate = (direction) => {
    const newDate = new Date(currentViewDate);
    if (calendarView === "week") {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentViewDate(newDate);
    fetchCalendarWorkouts(newDate, calendarView);
  };

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const groupWorkoutsByDate = () => {
    const grouped = {};
    calendarWorkouts.forEach(workout => {
      const date = new Date(workout.scheduled_start).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(workout);
    });
    return grouped;
  };

  const workoutsByDate = groupWorkoutsByDate();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Workout Plans</div>

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">Current Weight</h2>
              <p className="text-m">
                {currentWeight !== null ? `${currentWeight} lbs` : "No data yet"}
              </p>
            </div>
            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">Goal Weight</h2>
              <p className="text-m">Not set</p>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="card bg-base-300 rounded-box p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Workout Calendar</h2>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm bg-blue-800 text-white"
                  onClick={() => changeViewDate(-1)}
                >
                  Previous {calendarView === "week" ? "Week" : "Month"}
                </button>
                <button 
                  className="btn btn-sm bg-blue-800 text-white"
                  onClick={() => {
                    const today = new Date();
                    setCurrentViewDate(today);
                    fetchCalendarWorkouts(today, calendarView);
                  }}
                >
                  Today
                </button>
                <button 
                  className="btn btn-sm bg-blue-800 text-white"
                  onClick={() => changeViewDate(1)}
                >
                  Next {calendarView === "week" ? "Week" : "Month"}
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  className={`btn btn-sm ${calendarView === "week" ? "btn-primary bg-blue-800" : "btn-ghost"}`}
                  onClick={() => {
                    setCalendarView("week");
                    fetchCalendarWorkouts(currentViewDate, "week");
                  }}
                >
                  Week
                </button>
                <button 
                  className={`btn btn-sm ${calendarView === "month" ? "btn-primary bg-blue-800" : "btn-ghost"}`}
                  onClick={() => {
                    setCalendarView("month");
                    fetchCalendarWorkouts(currentViewDate, "month");
                  }}
                >
                  Month
                </button>
              </div>
            </div>
            
            <div className="text-center mb-2">
              <span className="font-semibold">
                {currentViewDate.toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long',
                  ...(calendarView === "week" && { day: 'numeric' })
                })}
              </span>
            </div>

            {/* Scheduled Workouts Section */}
            {Object.keys(workoutsByDate).length > 0 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {Object.entries(workoutsByDate).map(([dateStr, workouts]) => (
                  <div key={dateStr} className="border rounded-lg p-3 bg-base-200">
                    <h3 className="font-semibold text-md mb-2">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <div className="space-y-2">
                      {workouts.map(workout => (
                        <div key={workout.calendar_workout_id} className="flex justify-between items-center bg-base-100 rounded p-2">
                          <div className="flex-1">
                            <p className="font-medium">{workout.plan_day?.plan?.name || "Workout"}</p>
                            <p className="text-xs opacity-70">
                              {workout.plan_day?.day_label || "Workout"} • 
                              {new Date(workout.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {workout.plan_day?.exercises && workout.plan_day.exercises.length > 0 && (
                              <p className="text-xs mt-1">{workout.plan_day.exercises.length} exercise(s)</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-xs bg-blue-800 text-white"
                              onClick={() => handleViewWorkoutDetails(workout.calendar_workout_id)}
                            >
                              View Details
                            </button>
                            <button 
                              className="btn btn-xs bg-green-700 text-white"
                              onClick={() => handleViewWorkoutLogs(workout.calendar_workout_id)}
                            >
                              View Logs
                            </button>
                            <button 
                              className="btn btn-xs bg-purple-700 text-white"
                              onClick={() => handleAddExercisesToScheduledWorkout(workout)}
                            >
                              {workout.plan_day?.exercises && workout.plan_day.exercises.length > 0 ? "Edit Exercises" : "Add Exercises"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Plans Section */}
          <div className="card bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">My Workout Plans</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm opacity-70">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm opacity-70">No workout plans yet.</p>
                <p className="text-xs opacity-50 mt-2">Click "Create New Plan" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.plan_id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-base-200 cursor-pointer hover:bg-base-100 transition flex justify-between items-center"
                      onClick={() => setExpandedPlan(expandedPlan === plan.plan_id ? null : plan.plan_id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-mono">{expandedPlan === plan.plan_id ? "▼" : "▶"}</span>
                          <div>
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            {plan.description && (
                              <p className="text-xs opacity-70 mt-1">{plan.description}</p>
                            )}
                            <p className="text-xs opacity-70 mt-1">
                              {plan.days?.length || 0} workout days • {plan.is_public ? "Public" : "Private"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-xs bg-blue-800 text-white"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleSelectPlan(plan.plan_id);
                          }}
                        >
                          Edit/Schedule Plan
                        </button>
                        <button 
                          className="btn btn-xs bg-red-700 text-white"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleDeletePlan(plan.plan_id);
                          }}
                        >
                          Delete Plan
                        </button>
                      </div>
                    </div>

                    {expandedPlan === plan.plan_id && (
                      <div className="p-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Workout Days:</h4>
                          <div className="flex flex-wrap gap-2">
                            {plan.days?.map(day => (
                              <div key={day.plan_day_id} className="badge badge-lg badge-outline">
                                {day.day_label} ({WEEKDAY_NAMES[day.weekday]})
                                {day.session_time && ` @ ${day.session_time}`}
                              </div>
                            ))}
                            {(!plan.days || plan.days.length === 0) && (
                              <p className="text-xs opacity-70">No days added yet. Click "Edit/Schedule Plan" to add days and schedule workouts.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => navigate("/plans")} 
                  className="btn bg-blue-800 btn-sm w-full text-white"
                >
                  Browse Public Plans
                </button>
                <button 
                  className="btn btn-primary bg-blue-800 btn-sm w-full"
                  onClick={() => setPopOpen("create")}
                >
                  Create New Plan
                </button>
                <button 
                  className="btn btn-primary bg-green-700 btn-sm w-full"
                  onClick={() => setPopOpen("log")}
                >
                  Log Workout
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Create Plan Popup */}
      <PopUp isOpen={isPopOpen === "create"} onClose={() => setPopOpen(null)}>
        <div className="bg-base-200 p-6 rounded-box">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Workout Plan</h2>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-control mb-3">
              <label className="label">Name</label>
              <input className="input input-bordered w-full" type="text" name="name" value={newPlan.name} onChange={(e) => handleChange(e, setNewPlan)} required />
            </div>
            <div className="form-control mb-3">
              <label className="label">Description</label>
              <input className="input input-bordered w-full" type="text" name="description" value={newPlan.description} onChange={(e) => handleChange(e, setNewPlan)} />
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" name="is_public" checked={newPlan.is_public} onChange={(e) => handleChange(e, setNewPlan)} />
              Public
            </label>
            <button className="btn bg-blue-800 text-white w-full" type="submit">Create</button>
          </form>
        </div>
      </PopUp>

      {/* Log Workout Popup */}
      <PopUp isOpen={isPopOpen === "log"} onClose={() => setPopOpen(null)}>
        <form onSubmit={handleLogSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Log Workout</h2>
          </div>
          <label className="label">
            Calendar Workout ID:
            <input className="input" type="number" value={logData.calendar_workout_id} name="calendar_workout_id" onChange={handleLogChange} required />
          </label>
          <label className="label">
            Plan Day Exercise ID:
            <input className="input" type="number" value={logData.plan_day_exercise_id} name="plan_day_exercise_id" onChange={handleLogChange} required />
          </label>
          <label className="label">
            Exercise ID:
            <input className="input" type="number" value={logData.exercise_id} name="exercise_id" onChange={handleLogChange} required />
          </label>
          <label className="label">
            Sets:
            <input className="input" type="number" value={logData.sets} name="sets" onChange={handleLogChange} required />
          </label>
          <label className="label">
            Reps:
            <input className="input" type="number" value={logData.reps} name="reps" onChange={handleLogChange} required />
          </label>
          <label className="label">
            Weight (lbs):
            <input className="input" type="number" value={logData.weight} name="weight" onChange={handleLogChange} />
          </label>
          <label className="label">
            RPE:
            <input className="input" type="number" step="0.5" value={logData.rpe} name="rpe" onChange={handleLogChange} />
          </label>
          <label className="label">
            Distance (miles):
            <input className="input" type="number" step="0.01" value={logData.distance} name="distance" onChange={handleLogChange} />
          </label>
          <label className="label">
            Duration (minutes):
            <input className="input" type="number" value={logData.duration_minutes} name="duration_minutes" onChange={handleLogChange} />
          </label>
          <label className="label">
            Notes:
            <textarea className="textarea" value={logData.notes} name="notes" onChange={handleLogChange} rows="3" />
          </label>
          <button className="btn btn-primary bg-blue-800" type="submit">Log</button>
        </form>
      </PopUp>

      {/* Workout Details Popup */}
      <LargeModal open={isPopOpen === "workoutDetails"} onClose={() => { setPopOpen(null); setSelectedCalendarWorkout(null); }}>
        {selectedCalendarWorkout && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Workout Details</h2>
            <div className="space-y-4">
              <div className="bg-base-300 p-4 rounded">
                <p><strong>Plan:</strong> {selectedCalendarWorkout.plan_day?.plan?.name}</p>
                <p><strong>Workout Day:</strong> {selectedCalendarWorkout.plan_day?.day_label}</p>
                <p><strong>Scheduled Time:</strong> {new Date(selectedCalendarWorkout.scheduled_start).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedCalendarWorkout.status}</p>
              </div>
              
              {selectedCalendarWorkout.plan_day?.exercises && selectedCalendarWorkout.plan_day.exercises.length > 0 && (
                <div className="bg-base-300 p-4 rounded">
                  <h3 className="font-bold mb-3">Exercises</h3>
                  <div className="space-y-3">
                    {selectedCalendarWorkout.plan_day.exercises.map((exercise, idx) => (
                      <div key={idx} className="border-b pb-2">
                        <p className="font-semibold">{exercise.exercise?.name}</p>
                        <p className="text-sm">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
                          {exercise.duration_minutes > 0 && ` • ${exercise.duration_minutes} min`}
                        </p>
                        {exercise.notes && <p className="text-xs opacity-70">Notes: {exercise.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </LargeModal>

      {/* View Logs Popup */}
      <LargeModal open={isPopOpen === "viewLogs"} onClose={() => { setPopOpen(null); setSelectedWorkoutLog(null); }}>
        {selectedWorkoutLog && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Workout Logs</h2>
            <div className="bg-base-300 p-4 rounded">
              <p><strong>Log ID:</strong> {selectedWorkoutLog.workout_log_id}</p>
              {selectedWorkoutLog.notes && <p><strong>Notes:</strong> {selectedWorkoutLog.notes}</p>}
              
              <h3 className="font-bold mt-4 mb-2">Exercise Entries</h3>
              <div className="space-y-3">
                {selectedWorkoutLog.entries?.map((entry, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <p><strong>Exercise ID:</strong> {entry.exercise_id}</p>
                    <p className="text-sm">
                      {entry.sets} sets × {entry.reps} reps
                      {entry.weight > 0 && ` @ ${entry.weight} lbs`}
                      {entry.rpe > 0 && ` • RPE: ${entry.rpe}`}
                      {entry.distance > 0 && ` • Distance: ${entry.distance} miles`}
                      {entry.duration_minutes > 0 && ` • Duration: ${entry.duration_minutes} min`}
                    </p>
                    {entry.notes && <p className="text-xs opacity-70">Notes: {entry.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </LargeModal>

      <LargeModal open={isPopOpen === "details"} onClose={() => setPopOpen(null)}>
        {selectedPlan && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => handleDeletePlan(selectedPlan.plan_id)}
                >
                  Delete Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-base-300 p-4 rounded-box">
                  <h3 className="font-bold mb-3">Plan Settings</h3>
                  <div className="space-y-3">
                    <input className="input input-sm w-full" name="name" value={editData.name} onChange={(e) => handleChange(e, setEditData)} placeholder="Plan name" />
                    <textarea className="textarea textarea-sm w-full" name="description" value={editData.description} onChange={(e) => handleChange(e, setEditData)} placeholder="Description" rows="2" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="is_public" checked={editData.is_public} onChange={(e) => handleChange(e, setEditData)} />
                      Public
                    </label>
                    <button className="btn btn-primary btn-sm w-full" onClick={handleUpdate}>Save Changes</button>
                  </div>
                </div>

                <div className="bg-base-300 p-4 rounded-box">
                  <h3 className="font-bold mb-3">Add Workout Days (Templates)</h3>
                  <p className="text-xs opacity-70 mb-3">These are templates for scheduling. You'll assign specific dates to these days.</p>
                  
                  {selectedPlan.days?.length === 0 ? (
                    <p className="text-sm opacity-70 text-center py-4">No day templates added yet. Add a day template below.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                      {selectedPlan.days.map((day) => (
                        <div key={day.plan_day_id} className="border rounded-lg p-3 bg-base-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-md">{day.day_label}</span>
                              <span className="text-xs opacity-60 ml-2">({WEEKDAY_NAMES[day.weekday]})</span>
                              {day.session_time && <span className="text-xs opacity-60 ml-2">{day.session_time}</span>}
                            </div>
                            <button className="btn btn-xs btn-error btn-outline" onClick={() => {
                              if (window.confirm("Delete this day template?")) {
                                api.delete(`/workouts/plans/${selectedPlan.plan_id}/days/${day.plan_day_id}`)
                                  .then(() => {
                                    fetchPlansWithDetails();
                                    handleSelectPlan(selectedPlan.plan_id);
                                    showAlert("Day template deleted", "success");
                                  });
                              }
                            }}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-base-100 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Add New Day Template</p>
                    <div className="space-y-2">
                      <input className="input input-xs w-full" placeholder="Day name (e.g., 'Upper Body', 'Lower Body')" id="new_day_label" />
                      <select className="select select-xs w-full" id="new_day_weekday">
                        <option value="">Select Weekday</option>
                        {WEEKDAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                      </select>
                      <input className="input input-xs w-full" type="time" placeholder="Session Time (optional)" id="new_day_time" />
                      <button className="btn btn-xs btn-primary w-full" onClick={() => {
                        const label = document.getElementById('new_day_label').value;
                        const weekday = document.getElementById('new_day_weekday').value;
                        const session_time = document.getElementById('new_day_time').value;
                        
                        if (!label || !weekday) {
                          alert("Please provide day name and select a weekday");
                          return;
                        }
                        
                        const nextOrder = (selectedPlan.days?.length || 0) + 1;
                        api.post(`/workouts/plans/${selectedPlan.plan_id}/days`, {
                          day_label: label,
                          sort_order: nextOrder,
                          weekday: Number(weekday),
                          session_time: session_time || null,
                        }).then(() => {
                          document.getElementById('new_day_label').value = '';
                          document.getElementById('new_day_weekday').value = '';
                          document.getElementById('new_day_time').value = '';
                          fetchPlansWithDetails();
                          handleSelectPlan(selectedPlan.plan_id);
                          showAlert("Day template added!", "success");
                        }).catch(err => {
                          showAlert("Failed to add day template", "error");
                        });
                      }}>Add Day Template</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Schedule Plan */}
              <div className="bg-base-300 p-4 rounded-box">
                <h3 className="font-bold mb-3">Schedule Workouts</h3>
                <p className="text-xs opacity-70 mb-3">Select a date range and assign day templates to specific dates.</p>
                
                {!showScheduleCalendar ? (
                  <>
                    <div className="space-y-3 mb-3">
                      <div>
                        <label className="text-xs opacity-70">Start Date</label>
                        <input type="date" className="input input-sm input-bordered w-full" value={assignData.start_date} onChange={(e) => setAssignData({...assignData, start_date: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs opacity-70">End Date</label>
                        <input type="date" className="input input-sm input-bordered w-full" value={assignData.end_date} onChange={(e) => setAssignData({...assignData, end_date: e.target.value})} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm w-full" onClick={handleShowScheduleCalendar}>Set Schedule Dates</button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Schedule: {assignData.start_date} to {assignData.end_date}</p>
                    <div className="mb-3">
                      <p className="text-xs opacity-70 mb-2">Click on a date to assign a day template:</p>
                      <div className="grid grid-cols-7 gap-1 max-h-64 overflow-y-auto p-2 bg-base-200 rounded">
                        {(() => {
                          const start = parseLocalDate(assignData.start_date);
                          const end = parseLocalDate(assignData.end_date);
                          const dates = [];
                          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            dates.push(new Date(d));
                          }
                          return dates.map((date, idx) => {
                            const isAssigned = tempActiveDays.some(d => d.date.toDateString() === date.toDateString());
                            const weekday = date.getDay();
                            const matchingDays = selectedPlan?.days?.filter(day => day.weekday === weekday) || [];
                            const hasMatchingDays = matchingDays.length > 0;
                            return (
                              <div key={idx} className="relative">
                                <button className={`w-full p-2 text-xs rounded transition ${isAssigned ? 'bg-blue-600 text-white' : hasMatchingDays ? 'bg-base-100 hover:bg-primary/20 cursor-pointer border border-primary/50' : 'bg-base-100 opacity-40 cursor-not-allowed'}`} onClick={() => { if (!hasMatchingDays) { alert(`No day templates configured for ${WEEKDAY_NAMES[weekday]}. Please add a day template for this weekday first.`); return; } setTempSelectedCalendarDay(date); }} disabled={!hasMatchingDays}>
                                  {date.getDate()}
                                  <span className="block text-[10px] opacity-60">{WEEKDAY_NAMES[weekday].slice(0, 3)}</span>
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    {tempSelectedCalendarDay && (
                      <div className="p-3 bg-base-100 rounded border border-primary">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold">{tempSelectedCalendarDay.toLocaleDateString()} ({WEEKDAY_NAMES[tempSelectedCalendarDay.getDay()]})</p>
                          <button className="btn btn-xs btn-circle btn-ghost" onClick={() => setTempSelectedCalendarDay(null)}>✕</button>
                        </div>
                        <p className="text-xs opacity-70 mb-2">Select day template:</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedPlan?.days?.filter(day => day.weekday === tempSelectedCalendarDay.getDay()).map(day => (
                            <button key={day.plan_day_id} className="btn btn-xs btn-outline btn-primary" onClick={() => { 
                              setTempActiveDays(prev => { 
                                const filtered = prev.filter(d => d.date.toDateString() !== tempSelectedCalendarDay.toDateString()); 
                                return [...filtered, { date: tempSelectedCalendarDay, day }]; 
                              }); 
                              setTempSelectedCalendarDay(null); 
                            }}>
                              {day.day_label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {tempActiveDays.length > 0 && (
                      <div className="p-2 bg-base-200 rounded">
                        <p className="text-xs font-semibold mb-1">Assigned ({tempActiveDays.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {tempActiveDays.map((item, idx) => (
                            <span key={idx} className="badge badge-secondary badge-sm">
                              {item.date.toLocaleDateString()}: {item.day.day_label}
                              <button className="ml-1 hover:text-error" onClick={() => setTempActiveDays(prev => prev.filter((_, i) => i !== idx))}>✕</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm flex-1" onClick={handleAssignPlan} disabled={tempActiveDays.length === 0}>
                        Schedule These Workouts ({tempActiveDays.length} day{tempActiveDays.length !== 1 ? "s" : ""})
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setShowScheduleCalendar(false); setTempActiveDays([]); setTempSelectedCalendarDay(null); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </LargeModal>

      {isBrowsePopOpen && (
        <LargeModal open={isBrowsePopOpen} onClose={() => { setBrowsePopOpen(false); setSelectedScheduledWorkout(null); }}>
          <BrowseExercises
            planId={selectedPlan?.plan_id}
            dayId={selectedScheduledWorkout?.plan_day?.plan_day_id}
            calendarWorkoutId={selectedScheduledWorkout?.calendar_workout_id}
            weekday={selectedScheduledWorkout ? new Date(selectedScheduledWorkout.scheduled_start).getDay() : null}
            onExerciseAdded={async () => {
              await fetchPlansWithDetails();
              await fetchCalendarWorkouts(currentViewDate, calendarView);
              setBrowsePopOpen(false);
              setSelectedScheduledWorkout(null);
              showAlert("Exercises added to workout!", "success");
            }}
            onClose={() => { setBrowsePopOpen(false); setSelectedScheduledWorkout(null); }}
          />
        </LargeModal>
      )}
      
      {alert && <Alert message={alertMsg} type={alertType} onClose={() => setShowAlert(false)} />}
    </div>
  );
}

export default ClientWorkoutPlans;