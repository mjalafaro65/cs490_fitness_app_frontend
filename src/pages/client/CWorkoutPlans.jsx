import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import BrowseExercises from "../Exercises";
import { useNavigate } from "react-router-dom";

function LargeModal({ open, onClose, children, width = "80vw", height = "85vh" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isBrowsePopOpen, setBrowsePopOpen] = useState(false);
  const [assigningDay, setAssigningDay] = useState(null);

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

  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  const [tempActiveDays, setTempActiveDays] = useState([]);
  const [tempSelectedCalendarDay, setTempSelectedCalendarDay] = useState(null);

  const [newDayByPlan, setNewDayByPlan] = useState({});
  
  const [scheduledWorkouts, setScheduledWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editScheduleForm, setEditScheduleForm] = useState({
    date: "",
    day_label: "",
    start_time: "",
  });

  const saveScheduledWorkoutsToLocal = (workouts) => {
    try {
      const workoutsToStore = workouts.map(w => ({
        id: w.id,
        assignment_id: w.assignment_id,
        plan_id: w.plan_id,
        plan_name: w.plan_name,
        day_label: w.day_label,
        day_id: w.day_id,
        scheduled_start: w.scheduled_start,
        exercises: w.exercises || [],
        date_str: new Date(w.scheduled_start).toDateString()
      }));
      localStorage.setItem('scheduledWorkouts', JSON.stringify(workoutsToStore));
    } catch (err) {
      console.error("Failed to save workouts to localStorage:", err);
    }
  };

  const loadScheduledWorkoutsFromLocal = () => {
    try {
      const stored = localStorage.getItem('scheduledWorkouts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setScheduledWorkouts(parsed);
        return parsed;
      }
    } catch (err) {
      console.error("Failed to load workouts from localStorage:", err);
    }
    return [];
  };

  const fetchExistingCalendarWorkouts = async () => {
    setIsLoading(true);
    try {
      const localWorkouts = loadScheduledWorkoutsFromLocal();
      
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
                    assignment_id: occ.assignment_id || null,
                    plan_id: plan.plan_id,
                    plan_name: plan.name,
                    day_label: day.day_label,
                    day_id: day.plan_day_id,
                    scheduled_start: occ.scheduled_start,
                    exercises: day.exercises || [],
                    date_str: new Date(occ.scheduled_start).toDateString(),
                    session_time: day.session_time
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
        saveScheduledWorkoutsToLocal(allWorkouts);
      } else if (localWorkouts.length > 0) {
        setScheduledWorkouts(localWorkouts);
      }
      
      return allWorkouts;
    } catch (err) {
      console.error("Failed to fetch existing workouts:", err);
      const localWorkouts = loadScheduledWorkoutsFromLocal();
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlansWithDetails = async () => {
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
      return [];
    }
  };

  const handleDeletePlan = async (plan_id) => {
    if (!window.confirm("Are you sure you want to delete this entire workout plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}`);
      await fetchPlansWithDetails();
  
      setScheduledWorkouts(prev => prev.filter(w => w.plan_id !== plan_id));
      if (selectedPlan?.plan_id === plan_id) {
        setPopOpen(null);
        setSelectedPlan(null);
      }
      alert("Plan deleted successfully.");
    } catch (err) {
      console.error("Delete plan failed:", err.response?.data || err);
      alert(`Failed to delete plan: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchPlansWithDetails();
      await fetchExistingCalendarWorkouts();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (scheduledWorkouts.length > 0) {
      saveScheduledWorkoutsToLocal(scheduledWorkouts);
    }
  }, [scheduledWorkouts]);

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
      await api.post("/workouts/plans", newPlan);
      setPopOpen(null);
      setNewPlan({ name: "", description: "", is_public: false });
      await fetchPlansWithDetails();
    } catch (err) {
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
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/workouts/plans/${selectedPlan.plan_id}`, editData);
      await fetchPlansWithDetails();
      await handleSelectPlan(selectedPlan.plan_id);
    } catch (err) {
      console.error("Update plan failed:", err.response?.data || err);
    }
  };

  const handleDayChange = (planId, field, value) => {
    setNewDayByPlan((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  const handleAddDay = async (plan_id) => {
    const dayData = newDayByPlan[plan_id] || {};
    const plan = plans.find((p) => p.plan_id === plan_id) || selectedPlan;
    const nextOrder = (plan?.days?.length || 0) + 1;
    try {
      await api.post(`/workouts/plans/${plan_id}/days`, {
        day_label: dayData.day_label || `Day ${nextOrder}`,
        sort_order: nextOrder,
        weekday: Number(dayData.weekday) || 0,
        session_time: dayData.session_time || null,
      });
      setNewDayByPlan((prev) => ({ ...prev, [plan_id]: {} }));
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Add day failed:", err.response?.data || err);
    }
  };

  const handleDeleteDay = async (plan_id, plan_day_id) => {
    if (!window.confirm("Remove this day and all its exercises?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${plan_day_id}`);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Delete day failed:", err.response?.data || err);
    }
  };

  const [editingExercise, setEditingExercise] = useState(null);

  const handleUpdateDayExercise = async () => {
    if (!editingExercise) return;
    const { plan_id, day_id, de_id, ...fields } = editingExercise;
    try {
      await api.patch(
        `/workouts/plans/${plan_id}/days/${day_id}/exercises/${de_id}`,
        {
          sets: Number(fields.sets),
          reps: Number(fields.reps),
          weight: Number(fields.weight),
          duration_minutes: Number(fields.duration_minutes),
          notes: fields.notes,
          sort_order: Number(fields.sort_order ?? 0),
        }
      );
      setEditingExercise(null);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Update exercise failed:", err.response?.data || err);
    }
  };

  const handleDeleteDayExercise = async (plan_id, day_id, de_id) => {
    if (!window.confirm("Remove this exercise?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${day_id}/exercises/${de_id}`);
      if (editingExercise?.de_id === de_id) setEditingExercise(null);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Delete exercise failed:", err.response?.data || err);
    }
  };

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const getPlanDayId = (day) => {
    return day.plan_day_id || day.day_id || day.id;
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

      const assignmentId = assignmentResponse.data.assignment_id;
      
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
        const planDayId = getPlanDayId(day);
        
        return {
          plan_day_id: planDayId,
          scheduled_start: start.toISOString(),
          scheduled_end: end.toISOString(),
        };
      });

      const calendarResponse = await api.post(`/workouts/plans/${selectedPlan.plan_id}/calendar`, {
        occurrences: occurrences
      });
      
      const workoutsToAdd = tempActiveDays.map(({ date, day }) => ({
        id: Date.now() + Math.random(),
        assignment_id: assignmentId,
        plan_id: selectedPlan.plan_id,
        plan_name: selectedPlan.name,
        day_label: day.day_label,
        day_id: getPlanDayId(day),
        scheduled_start: date.toISOString(),
        exercises: day.exercises || [],
        date_str: date.toDateString(),
        session_time: day.session_time
      }));
      
      setScheduledWorkouts(prev => {
        const updated = [...prev, ...workoutsToAdd];
        saveScheduledWorkoutsToLocal(updated);
        return updated;
      });
      
      alert(`Success! ${calendarResponse.data.calendar_workout_ids?.length || 0} workout(s) scheduled.`);
      
      setShowScheduleCalendar(false);
      setTempActiveDays([]);
      setTempSelectedCalendarDay(null);
      
      await fetchPlansWithDetails();
      await handleSelectPlan(selectedPlan.plan_id);
      
    } catch (err) {
      console.error("Schedule failed:", err.response?.data);
      alert(`Scheduling failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const openEditSchedule = (workout) => {
    const date = new Date(workout.scheduled_start);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    setEditScheduleForm({
      id: workout.id,
      date: date.toISOString().split('T')[0],
      day_label: workout.day_label,
      start_time: `${hours}:${minutes}`,
    });
    setEditingSchedule(workout);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;
    
    try {
      const [year, month, day] = editScheduleForm.date.split('-');
      const [hours, minutes] = editScheduleForm.start_time.split(':');
      const newDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0));
      
      setScheduledWorkouts(prev => prev.map(w => {
        if (w.id === editingSchedule.id) {
          return {
            ...w,
            scheduled_start: newDate.toISOString(),
            date_str: newDate.toDateString(),
          };
        }
        return w;
      }));
      
      setEditingSchedule(null);
      setEditScheduleForm({ date: "", day_label: "", start_time: "" });
      
      await fetchPlansWithDetails();
      
    } catch (err) {
      console.error("Failed to update schedule:", err);
      alert("Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (workoutId) => {
    if (!confirm("Are you sure you want to remove this scheduled workout?")) return;
    
    setScheduledWorkouts(prev => prev.filter(w => w.id !== workoutId));
    setEditingSchedule(null);
  };

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getWorkoutsByPlanAndAssignment = () => {
    const groupedByPlan = {};
    
    plans.forEach(plan => {
      groupedByPlan[plan.plan_id] = {
        plan_name: plan.name,
        plan_id: plan.plan_id,
        assignments: {}
      };
    });
    
    scheduledWorkouts.forEach(workout => {
      if (!groupedByPlan[workout.plan_id]) {
        groupedByPlan[workout.plan_id] = {
          plan_name: workout.plan_name,
          plan_id: workout.plan_id,
          assignments: {}
        };
      }
      
      const assignmentId = workout.assignment_id || 'unknown';
      if (!groupedByPlan[workout.plan_id].assignments[assignmentId]) {
        groupedByPlan[workout.plan_id].assignments[assignmentId] = {
          assignment_id: assignmentId,
          start_date: null,
          end_date: null,
          workouts: []
        };
      }
      
      groupedByPlan[workout.plan_id].assignments[assignmentId].workouts.push(workout);
    });
    
    return groupedByPlan;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasWorkoutOnDate = (date) => {
    const targetDateStr = date.toDateString();
    return scheduledWorkouts.some((workout) => {
      const workoutDate = new Date(workout.scheduled_start);
      return workoutDate.toDateString() === targetDateStr;
    });
  };

  const getWorkoutsForDate = (date) => {
    if (!date) return [];
    const targetDateStr = date.toDateString();
    const workouts = [];
    
    scheduledWorkouts.forEach((workout) => {
      const workoutDate = new Date(workout.scheduled_start);
      if (workoutDate.toDateString() === targetDateStr) {
        workouts.push({
          planName: workout.plan_name,
          planId: workout.plan_id,
          dayLabel: workout.day_label,
          dayId: workout.day_id,
          exercises: workout.exercises || [],
          scheduledStart: workout.scheduled_start,
          occurrenceId: workout.id,
          time: workoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
    
    return workouts;
  };

  const selectedWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];
  const groupedData = getWorkoutsByPlanAndAssignment();

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

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box w-1/2 p-4">
              <h2 className="text-lg font-bold mb-2">Calendar</h2>
              <div className="flex justify-between items-center mb-3">
                <button className="btn btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>←</button>
                <span className="font-semibold text-lg">{monthName} {year}</span>
                <button className="btn btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>→</button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="font-bold text-xs opacity-70">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = new Date(year, month, i + 1);
                  const isToday = new Date().toDateString() === day.toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  const hasWorkout = hasWorkoutOnDate(day);

                  return (
                    <div
                      key={`day-${year}-${month}-${i}`}
                      className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition relative
                        ${isSelected ? "bg-primary text-white" : isToday ? "bg-neutral text-white" : hasWorkout ? "bg-blue-300 text-white" : "bg-base-200 hover:bg-base-300"}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {i + 1}
                      {hasWorkout && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">Workouts for {selectedDate?.toLocaleDateString()}</h2>
              {isLoading ? (
                <p className="text-sm opacity-70">Loading workouts...</p>
              ) : selectedWorkouts.length === 0 ? (
                <p className="text-sm opacity-70">No workouts planned for this day.</p>
              ) : (
                selectedWorkouts.map((workout, idx) => (
                  <div 
                    key={workout.occurrenceId || idx}
                    className="mb-4 p-3 border rounded bg-base-200"
                  >
                    <p className="font-semibold text-sm">{workout.planName} - {workout.dayLabel}</p>
                    <p className="text-xs opacity-60 mb-2">
                      Time: {workout.time}
                    </p>
                    {workout.exercises.length > 0 ? (
                      <ul className="ml-4 list-disc text-sm">
                        {workout.exercises.map((ex, exIdx) => {
                          const exId = ex.day_exercise_id || ex.exercise_id || exIdx;
                          return (
                            <li key={exId}>
                              {ex.exercise?.name || ex.name} — {ex.sets} sets × {ex.reps} reps
                              {ex.weight ? ` @ ${ex.weight} lbs` : ""}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs opacity-70">No exercises added</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Active Plans</h2>
            
            {Object.values(groupedData).filter(planGroup => Object.keys(planGroup.assignments).length > 0).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm opacity-70">No scheduled workouts yet.</p>
                <p className="text-xs opacity-50 mt-2">Click "Schedule This Plan" on any plan to add workouts to your calendar.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {Object.values(groupedData)
                  .filter(planGroup => Object.keys(planGroup.assignments).length > 0)
                  .map((planGroup) => {
                    const plan = plans.find(p => p.plan_id === planGroup.plan_id);
                    
                    return (
                      <div key={planGroup.plan_id} className="border rounded-lg overflow-hidden">
                      
                        <div 
                          className="p-4 bg-base-200 cursor-pointer hover:bg-base-100 transition flex justify-between items-center"
                          onClick={() => setExpandedPlan(expandedPlan === planGroup.plan_id ? null : planGroup.plan_id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-mono">{expandedPlan === planGroup.plan_id ? "▼" : "▶"}</span>
                              <div>
                                <h3 className="font-bold text-lg">{planGroup.plan_name}</h3>
                                {plan?.description && (
                                  <p className="text-xs opacity-70 mt-1">{plan.description}</p>
                                )}
                                <p className="text-xs opacity-70 mt-1">
                                  {plan?.days?.length || 0} workout days • {Object.keys(planGroup.assignments).length} schedule assignment(s)
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-xs bg-blue-800 text-white"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleSelectPlan(planGroup.plan_id);
                              }}
                            >
                              Edit Plan
                            </button>
                            <button 
                              className="btn btn-xs bg-red-700 text-white"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleDeletePlan(planGroup.plan_id);
                              }}
                            >
                              Delete Plan
                            </button>
                          </div>
                        </div>

                    
                        {expandedPlan === planGroup.plan_id && (
                          <div className="p-4 space-y-4">
                        
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Workout Days:</h4>
                              <div className="flex flex-wrap gap-2">
                                {plan?.days?.map(day => (
                                  <div key={day.plan_day_id} className="badge badge-lg badge-outline">
                                    {day.day_label} ({WEEKDAY_NAMES[day.weekday]})
                                    {day.session_time && ` @ ${day.session_time}`}
                                  </div>
                                ))}
                                {(!plan?.days || plan.days.length === 0) && (
                                  <p className="text-xs opacity-70">No days added yet. Click "Edit Plan" to add days.</p>
                                )}
                              </div>
                            </div>

                          
                            {Object.values(planGroup.assignments).map((assignment, assignIdx) => {
                              const uniqueDates = [...new Set(assignment.workouts.map(w => w.date_str))].sort();
                              
                              return (
                                <div key={assignment.assignment_id} className="border-l-4 border-primary pl-3">
                                  <div 
                                    className="cursor-pointer flex justify-between items-center py-2"
                                    onClick={() => setExpandedAssignment(expandedAssignment === assignment.assignment_id ? null : assignment.assignment_id)}
                                  >
                                    <div>
                                      <h4 className="font-semibold text-md">
                                        Schedule #{assignIdx + 1}
                                      </h4>
                                      <p className="text-xs opacity-70 mt-1">
                                        {uniqueDates.length} dates scheduled • {assignment.workouts.length} total workouts
                                      </p>
                                    </div>
                                    <span className="text-sm font-mono">{expandedAssignment === assignment.assignment_id ? "▲" : "▼"}</span>
                                  </div>
                                  
                                  {expandedAssignment === assignment.assignment_id && (
                                    <div className="mt-2 pl-2 space-y-3">
                                      <div>
                                        <h5 className="font-semibold text-xs mb-2">Scheduled Dates:</h5>
                                        <div className="space-y-1">
                                          {uniqueDates.map(dateStr => {
                                            const workoutsOnDate = assignment.workouts.filter(w => w.date_str === dateStr);
                                            const formattedDate = new Date(dateStr).toLocaleDateString(undefined, { 
                                              weekday: 'short', 
                                              month: 'short', 
                                              day: 'numeric' 
                                            });
                                            const firstWorkout = workoutsOnDate[0];
                                            
                                            return (
                                              <div key={dateStr} className="bg-base-100 rounded p-2 flex justify-between items-center">
                                                <div>
                                                  <span className="font-medium text-sm">{formattedDate}</span>
                                                  <div className="flex gap-1 mt-1">
                                                    {workoutsOnDate.map(w => (
                                                      <span key={w.id} className="text-xs badge badge-m bg-yellow-400">
                                                        {w.day_label}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="flex gap-1">
                                                  <button 
                                                    className="btn btn-xs btn-ghost"
                                                    onClick={() => openEditSchedule(firstWorkout)}
                                                  >
                                                    Edit
                                                  </button>
                                                  <button 
                                                    className="btn btn-xs btn-ghost text-error"
                                                    onClick={() => {
                                                      if (confirm("Remove this scheduled workout?")) {
                                                        setScheduledWorkouts(prev => prev.filter(w => w.id !== firstWorkout?.id));
                                                      }
                                                    }}
                                                  >
                                                    X
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">My Workout Plans</h2>
              {plans.length === 0 ? (
                <span className="text-sm opacity-70">No plans yet</span>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-40">
                  {plans.map((plan) => (
                    <div
                      key={plan.plan_id}
                      className="p-2 bg-base-200 rounded flex justify-between items-center cursor-pointer hover:bg-base-100 transition"
                      onClick={() => handleSelectPlan(plan.plan_id)}
                    >
                      <div>
                        <p className="font-bold">{plan.name}</p>
                        <p className="text-xs opacity-70">{plan.description || "No description"}</p>
                      </div>
                      <span className="text-xs">{plan.is_public ? "Public" : "Private"}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <button onClick={() => navigate("/plans")} className="btn bg-blue-800 btn-sm w-full text-white">
                  Browse Plans
                </button>
              </div>
            </div>
            <div className="card bg-base-300 p-4 rounded-box w-64 flex flex-col items-center h-24">
              <h2 className="text-lg font-bold mb-2">Create New Plan</h2>
              <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => setPopOpen("create")}>
                Create New
              </button>
            </div>
          </div>
        </section>
      </div>

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
                  <h3 className="font-bold mb-3">Workout Days</h3>
                  {selectedPlan.days?.length === 0 ? (
                    <p className="text-sm opacity-70 text-center py-4">No days added yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedPlan.days.map((day) => (
                        <div key={day.plan_day_id} className="border rounded-lg p-3 bg-base-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-md">{day.day_label}</span>
                              <span className="text-xs opacity-60 ml-2">({WEEKDAY_NAMES[day.weekday]})</span>
                              {day.session_time && <span className="text-xs opacity-60 ml-2">{day.session_time}</span>}
                            </div>
                            <div className="flex gap-1">
                              <button className="btn btn-xs btn-primary" onClick={() => { setAssigningDay(day); setBrowsePopOpen(true); }}>+ Exercise</button>
                              <button className="btn btn-xs btn-error btn-outline" onClick={() => handleDeleteDay(selectedPlan.plan_id, day.plan_day_id)}>Delete Day</button>
                            </div>
                          </div>
                          {day.exercises?.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              {day.exercises.map((ex) => {
                                const deId = ex.day_exercise_id ?? ex.de_id ?? ex.id;
                                const isEditing = editingExercise?.de_id === deId && editingExercise?.day_id === day.plan_day_id;
                                return (
                                  <div key={deId} className="bg-base-100 rounded p-2">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <p className="font-semibold text-xs">{ex.exercise?.name || ex.name}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                          <input type="number" placeholder="Sets" className="input input-xs" value={editingExercise.sets} onChange={(e) => setEditingExercise({...editingExercise, sets: e.target.value})} />
                                          <input type="number" placeholder="Reps" className="input input-xs" value={editingExercise.reps} onChange={(e) => setEditingExercise({...editingExercise, reps: e.target.value})} />
                                          <input type="number" placeholder="Weight" className="input input-xs" value={editingExercise.weight} onChange={(e) => setEditingExercise({...editingExercise, weight: e.target.value})} />
                                          <input type="number" placeholder="Duration" className="input input-xs" value={editingExercise.duration_minutes} onChange={(e) => setEditingExercise({...editingExercise, duration_minutes: e.target.value})} />
                                        </div>
                                        <input type="text" placeholder="Notes" className="input input-xs w-full" value={editingExercise.notes} onChange={(e) => setEditingExercise({...editingExercise, notes: e.target.value})} />
                                        <div className="flex gap-2">
                                          <button className="btn btn-xs btn-primary" onClick={handleUpdateDayExercise}>Save</button>
                                          <button className="btn btn-xs btn-ghost" onClick={() => setEditingExercise(null)}>Cancel</button>
                                          <button className="btn btn-xs btn-error ml-auto" onClick={() => handleDeleteDayExercise(selectedPlan.plan_id, day.plan_day_id, deId)}>Remove</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                          <span className="font-medium text-sm">{ex.exercise?.name || ex.name}</span>
                                          <div className="flex gap-2 text-xs opacity-60 mt-1">
                                            <span>{ex.sets} sets</span>
                                            <span>× {ex.reps} reps</span>
                                            {ex.weight > 0 && <span>@ {ex.weight} lbs</span>}
                                            {ex.duration_minutes > 0 && <span>{ex.duration_minutes} min</span>}
                                          </div>
                                          {ex.notes && <p className="text-xs opacity-50 mt-1">{ex.notes}</p>}
                                        </div>
                                        <button className="btn btn-xs btn-ghost" onClick={() => setEditingExercise({ plan_id: selectedPlan.plan_id, day_id: day.plan_day_id, de_id: deId, sets: ex.sets ?? 3, reps: ex.reps ?? 10, weight: ex.weight ?? 0, duration_minutes: ex.duration_minutes ?? 0, notes: ex.notes ?? "", sort_order: ex.sort_order ?? 0 })}>✏️</button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs opacity-70 text-center py-2">No exercises yet.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-base-100 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Add New Day</p>
                    <div className="flex gap-2 flex-wrap">
                      <input className="input input-xs flex-1" placeholder="Day name" value={newDayByPlan[selectedPlan.plan_id]?.day_label || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "day_label", e.target.value)} />
                      <select className="select select-xs w-28" value={newDayByPlan[selectedPlan.plan_id]?.weekday ?? ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "weekday", e.target.value)}>
                        <option value="">Weekday</option>
                        {WEEKDAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                      </select>
                      <input className="input input-xs w-28" type="time" placeholder="Time" value={newDayByPlan[selectedPlan.plan_id]?.session_time || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "session_time", e.target.value)} />
                      <button className="btn btn-xs btn-primary" onClick={() => handleAddDay(selectedPlan.plan_id)}>Add Day</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Schedule Plan */}
              <div className="bg-base-300 p-4 rounded-box">
                <h3 className="font-bold mb-3">Schedule Plan</h3>
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
                      <p className="text-xs opacity-70 mb-2">Click on a date to assign a workout:</p>
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
                                <button className={`w-full p-2 text-xs rounded transition ${isAssigned ? 'bg-blue-600 text-white' : hasMatchingDays ? 'bg-base-100 hover:bg-primary/20 cursor-pointer border border-primary/50' : 'bg-base-100 opacity-40 cursor-not-allowed'}`} onClick={() => { if (!hasMatchingDays) { alert(`No workout days configured for ${WEEKDAY_NAMES[weekday]}.`); return; } setTempSelectedCalendarDay(date); }} disabled={!hasMatchingDays}>
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
                        <p className="text-xs opacity-70 mb-2">Select workout day:</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedPlan?.days?.filter(day => day.weekday === tempSelectedCalendarDay.getDay()).map(day => (
                            <button key={day.plan_day_id} className="btn btn-xs btn-outline btn-primary" onClick={() => { setTempActiveDays(prev => { const filtered = prev.filter(d => d.date.toDateString() !== tempSelectedCalendarDay.toDateString()); return [...filtered, { date: tempSelectedCalendarDay, day }]; }); setTempSelectedCalendarDay(null); }}>{day.day_label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {tempActiveDays.length > 0 && (
                      <div className="p-2 bg-base-200 rounded">
                        <p className="text-xs font-semibold mb-1">Assigned ({tempActiveDays.length}):</p>
                        <div className="flex flex-wrap gap-1">{tempActiveDays.map((item, idx) => (<span key={idx} className="badge badge-secondary badge-sm">{item.date.toLocaleDateString()}: {item.day.day_label}<button className="ml-1 hover:text-error" onClick={() => setTempActiveDays(prev => prev.filter((_, i) => i !== idx))}>✕</button></span>))}</div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm flex-1" onClick={handleAssignPlan} disabled={tempActiveDays.length === 0}>Confirm Schedule ({tempActiveDays.length} day{tempActiveDays.length !== 1 ? "s" : ""})</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setShowScheduleCalendar(false); setTempActiveDays([]); setTempSelectedCalendarDay(null); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </LargeModal>

      {editingSchedule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditingSchedule(null)}>
          <div className="bg-base-200 p-6 rounded-box w-[500px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Scheduled Workout</h2>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setEditingSchedule(null)}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Date</label>
                <input 
                  type="date" 
                  className="input input-bordered w-full" 
                  value={editScheduleForm.date} 
                  onChange={(e) => setEditScheduleForm({...editScheduleForm, date: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Workout Day</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={editScheduleForm.day_label} 
                  disabled
                />
              </div>
              <div>
                <label className="label">Start Time</label>
                <input 
                  type="time" 
                  className="input input-bordered w-full" 
                  value={editScheduleForm.start_time} 
                  onChange={(e) => setEditScheduleForm({...editScheduleForm, start_time: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" onClick={handleUpdateSchedule}>Save Changes</button>
                <button className="btn btn-error flex-1" onClick={() => handleDeleteSchedule(editingSchedule.id)}>Delete Workout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBrowsePopOpen && (
        <LargeModal open={isBrowsePopOpen} onClose={() => { setBrowsePopOpen(false); setAssigningDay(null); }}>
          <BrowseExercises
            planId={selectedPlan?.plan_id}
            dayId={assigningDay?.plan_day_id}
            weekday={assigningDay?.weekday}
            onExerciseAdded={async () => {
              await fetchPlansWithDetails();
              await handleSelectPlan(selectedPlan.plan_id);
              setBrowsePopOpen(false);
              setAssigningDay(null);
            }}
            onClose={() => { setBrowsePopOpen(false); setAssigningDay(null); }}
          />
        </LargeModal>
      )}
    </div>
  );
}

export default ClientWorkoutPlans;