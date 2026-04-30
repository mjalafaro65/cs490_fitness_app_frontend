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

  const [tempWorkoutForLog, setTempWorkoutForLog] = useState(null);

  const [currentWeight, setCurrentWeight] = useState(null);
  const [workoutInsights, setWorkoutInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

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

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
      console.log("ALERT FUNCTION CALLED with:", message, type);
      setAlertMsg(message);
      setAlertType(type);
      setShowAlert(true);
  };

  useEffect(() => {
    async function fetchWorkoutInsights() {
      setLoadingInsights(true);
      try {
        const response = await api.get("/insights/workouts");
        console.log("Workout insights:", response.data);
        if (response.data?.summary) {
          setWorkoutInsights(response.data.summary);
        }
      } catch (err) {
        console.error("Failed to fetch workout insights:", err);
      } finally {
        setLoadingInsights(false);
      }
    }
    fetchWorkoutInsights();
  }, []);

  // Load existing scheduled days when dates are selected
  useEffect(() => {
    if (assignData.start_date && assignData.end_date && selectedPlan) {
      loadExistingScheduledDays();
    }
  }, [assignData.start_date, assignData.end_date, selectedPlan]);

  const fetchCalendarWorkouts = async (date = null, view = "week") => {
    console.log("[DEBUG] fetchCalendarWorkouts called with date:", date, "view:", view);
    setIsLoading(true);
    try {
      const params = {};
      if (date) {
        params.date = date instanceof Date ? date.toISOString().split('T')[0] : date;
      }
      if (view) {
        params.view = view;
      }
      
      console.log("[DEBUG] Request params:", params);
      const response = await api.get("/workouts/calendar-workouts-view", { params });
      const workouts = response.data || [];
      console.log("[DEBUG] Calendar workouts response:", workouts);
      console.log("[DEBUG] Number of workouts received:", workouts.length);
      
      const transformedWorkouts = workouts.map(workout => ({
        id: workout.calendar_workout_id,
        assignment_id: workout.assignment_id,
        plan_id: workout.plan_day?.plan?.plan_id,
        plan_name: workout.plan_day?.plan?.name,
        day_label: workout.plan_day?.day_label,
        day_id: workout.plan_day?.plan_day_id,
        scheduled_start: workout.scheduled_start,
        exercises: workout.plan_day?.exercises || [],
        date_str: new Date(workout.scheduled_start).toDateString(),
        session_time: workout.plan_day?.session_time,
        is_scheduled: true
      }));
      
      // Add unscheduled workouts to show on calendar
      const unscheduledWorkouts = [];
      plans.forEach(plan => {
        plan.days?.forEach(day => {
          if (day.exercises && day.exercises.length > 0) {
            // Check if this day is already scheduled
            const isAlreadyScheduled = transformedWorkouts.some(scheduled => 
              scheduled.plan_id === plan.plan_id && scheduled.day_id === day.plan_day_id
            );
            
            if (!isAlreadyScheduled) {
              // Add as unscheduled workout for next available weekday
              const today = new Date();
              const currentWeekday = today.getDay();
              const daysUntilNext = (day.weekday - currentWeekday + 7) % 7 || 7; // Next occurrence of this weekday
              const nextDate = new Date(today);
              nextDate.setDate(today.getDate() + daysUntilNext);
              
              unscheduledWorkouts.push({
                id: `unscheduled_${plan.plan_id}_${day.plan_day_id}`,
                assignment_id: null,
                plan_id: plan.plan_id,
                plan_name: plan.name,
                day_label: day.day_label,
                day_id: day.plan_day_id,
                scheduled_start: nextDate.toISOString(),
                exercises: day.exercises || [],
                date_str: nextDate.toDateString(),
                session_time: day.session_time,
                is_scheduled: false
              });
            }
          }
        });
      });
      
      const allWorkouts = [...transformedWorkouts, ...unscheduledWorkouts];
      console.log("[DEBUG] All workouts (including unscheduled):", allWorkouts);
      setScheduledWorkouts(allWorkouts);
      return allWorkouts;
    } catch (err) {
      console.error("[ERROR] Failed to fetch calendar workouts:", err);
      console.error("[ERROR] Error details:", err.response?.data);
      showAlert("Failed to fetch calendar workouts", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlansWithDetails = async () => {
    console.log("[DEBUG] fetchPlansWithDetails called");
    setIsLoading(true);
    try {
      const res = await api.get("/workouts/plans/mine");
      const userPlans = res.data.plans || [];
      console.log("[DEBUG] User plans response:", userPlans);
      console.log("[DEBUG] Number of plans:", userPlans.length);
      
      const plansWithDetails = await Promise.all(
        userPlans.map(async (plan) => {
          console.log("[DEBUG] Fetching details for plan:", plan.plan_id);
          const planRes = await api.get(`/workouts/plans/${plan.plan_id}`);
          return planRes.data;
        })
      );
      
      console.log("[DEBUG] Plans with details:", plansWithDetails.length);
      setPlans(plansWithDetails);
      return plansWithDetails;
    } catch (err) {
      console.error("[ERROR] Failed to fetch plans:", err.response?.data || err);
      showAlert("Failed to fetch plans", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    console.log("[DEBUG] fetchAllData called - fetching plans and calendar workouts");
    await Promise.all([
      fetchPlansWithDetails(),
      fetchCalendarWorkouts(currentDate, "month")
    ]);
    console.log("[DEBUG] fetchAllData completed");
  };

  const handleDeletePlan = async (plan_id) => {
    console.log("[DEBUG] handleDeletePlan called for plan_id:", plan_id);
    if (!window.confirm("Are you sure you want to delete this entire workout plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}`);
      console.log("[DEBUG] Plan deleted successfully:", plan_id);
      await fetchAllData();
  
      if (selectedPlan?.plan_id === plan_id) {
        setPopOpen(null);
        setSelectedPlan(null);
      }
      showAlert("Plan deleted successfully.", "success");
    } catch (err) {
      console.error("[ERROR] Delete plan failed:", err.response?.data || err);
      showAlert(`Failed to delete plan: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      console.log("[DEBUG] Component initialized - fetching initial data");
      await fetchAllData();
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
        console.log("[DEBUG] Daily survey response:", res.data);
        setCurrentWeight(res.data.weight_lbs || null);
      } catch (err) {
        console.error("[ERROR] Failed to fetch daily survey:", err);
        setCurrentWeight(null);
      }
    };
    fetchDailySurvey();
  }, []);

  const handleCreate = async (e) => {
    console.log("[DEBUG] handleCreate called");
    e.preventDefault();
    try {
      const response = await api.post("/workouts/plans", newPlan);
      console.log("[DEBUG] Plan created successfully:", response.data);
      setPopOpen(null);
      setNewPlan({ name: "", description: "", is_public: false });
      await fetchAllData();
      showAlert("New plan successfully created!", "success");
    } catch (err) {
      console.error("[ERROR] Create plan failed:", err.response?.data || err);
      showAlert(err.response?.data || "Failed to create plan", "error");
    }
  };

  const handleSelectPlan = async (plan_id) => {
    console.log("[DEBUG] handleSelectPlan called for plan_id:", plan_id);
    try {
      const res = await api.get(`/workouts/plans/${plan_id}`);
      const plan = res.data;
      console.log("[DEBUG] Plan details fetched:", plan);
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
      console.error("[ERROR] Failed to fetch plan details:", err);
      showAlert("Failed to fetch plan details", "error");
    }
  };

  const handleUpdate = async () => {
    console.log("[DEBUG] handleUpdate called for plan:", selectedPlan?.plan_id);
    try {
      await api.patch(`/workouts/plans/${selectedPlan.plan_id}`, editData);
      console.log("[DEBUG] Plan updated successfully");
      await fetchAllData();
      await handleSelectPlan(selectedPlan.plan_id);
      showAlert("Plan updated successfully!", "success");
    } catch (err) {
      console.error("[ERROR] Update plan failed:", err.response?.data || err);
      showAlert(err.response?.data || "Failed to update plan", "error");
    }
  };

  const handleDayChange = (planId, field, value) => {
    console.log("[DEBUG] handleDayChange - planId:", planId, "field:", field, "value:", value);
    setNewDayByPlan((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  const handleAddDay = async (plan_id) => {
    console.log("[DEBUG] handleAddDay called for plan_id:", plan_id);
    const dayData = newDayByPlan[plan_id] || {};
    const plan = plans.find((p) => p.plan_id === plan_id) || selectedPlan;
    const nextOrder = (plan?.days?.length || 0) + 1;
    console.log("[DEBUG] Day data:", dayData, "nextOrder:", nextOrder);
    try {
      await api.post(`/workouts/plans/${plan_id}/days`, {
        day_label: dayData.day_label || `Day ${nextOrder}`,
        sort_order: nextOrder,
        weekday: Number(dayData.weekday) || 0,
        session_time: dayData.session_time || null,
      });
      console.log("[DEBUG] Day added successfully");
      setNewDayByPlan((prev) => ({ ...prev, [plan_id]: {} }));
      await fetchAllData();
      await handleSelectPlan(plan_id);

      showAlert("New day added!", "success");
    } catch (err) {
      console.error("[ERROR] Add day failed:", err.response?.data || err);
      showAlert(err.response?.data || "Failed to add day", "error");
    }
  };

  const handleDeleteDay = async (plan_id, plan_day_id) => {
    console.log("[DEBUG] handleDeleteDay called - plan_id:", plan_id, "plan_day_id:", plan_day_id);
    if (!window.confirm("Remove this day and all its exercises?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${plan_day_id}`);
      console.log("[DEBUG] Day deleted successfully");
      await fetchAllData();
      await handleSelectPlan(plan_id);

      showAlert("Day deleted!", "success");

    } catch (err) {
      console.error("[ERROR] Delete day failed:", err.response?.data || err);
      showAlert(err.response?.data || "Failed to delete day", "error");
    }
  };

  const [editingExercise, setEditingExercise] = useState(null);

  const handleUpdateDayExercise = async () => {
    console.log("[DEBUG] handleUpdateDayExercise called");
    if (!editingExercise) return;
    const { plan_id, day_id, de_id, ...fields } = editingExercise;
    console.log("[DEBUG] Exercise update data:", { plan_id, day_id, de_id, fields });
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
      console.log("[DEBUG] Exercise updated successfully");
      setEditingExercise(null);
      await fetchAllData();
      await handleSelectPlan(plan_id);
      showAlert("Exercise updated!", "success");
    } catch (err) {
      console.error("[ERROR] Update exercise failed:", err.response?.data || err);
      showAlert("Failed to update exercise", "error");
    }
  };

  const handleDeleteDayExercise = async (plan_id, day_id, de_id) => {
    console.log("[DEBUG] handleDeleteDayExercise called:", { plan_id, day_id, de_id });
    if (!window.confirm("Remove this exercise?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${day_id}/exercises/${de_id}`);
      console.log("[DEBUG] Exercise deleted successfully");
      if (editingExercise?.de_id === de_id) setEditingExercise(null);
      await fetchAllData();
      await handleSelectPlan(plan_id);
      showAlert("Exercise removed!", "success");
    } catch (err) {
      console.error("[ERROR] Delete exercise failed:", err.response?.data || err);
      showAlert("Failed to remove exercise", "error");
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
    console.log("[DEBUG] handleShowScheduleCalendar called");
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

  const loadExistingScheduledDays = async () => {
    if (!selectedPlan || !assignData.start_date || !assignData.end_date) return;
    
    try {
      // Get existing scheduled workouts for this plan within the date range
      const response = await api.get("/workouts/calendar-workouts-view", {
        params: {
          start_date: assignData.start_date,
          end_date: assignData.end_date,
          plan_id: selectedPlan.plan_id
        }
      });
      
      const existingWorkouts = response.data || [];
      console.log("[DEBUG] Existing scheduled workouts:", existingWorkouts);
      
      // Convert existing workouts to tempActiveDays format
      const existingDays = existingWorkouts.map(workout => ({
        date: new Date(workout.scheduled_start),
        day: {
          plan_day_id: workout.plan_day.plan_day_id,
          day_label: workout.plan_day.day_label,
          weekday: new Date(workout.scheduled_start).getDay(),
          session_time: workout.plan_day.session_time,
          exercises: workout.plan_day.exercises || []
        }
      }));
      
      setTempActiveDays(existingDays);
      console.log("[DEBUG] Loaded existing scheduled days:", existingDays);
      
    } catch (err) {
      console.error("[ERROR] Failed to load existing scheduled days:", err);
    }
  };

  const handleAssignPlan = async () => {
    console.log("[DEBUG] handleAssignPlan called with tempActiveDays:", tempActiveDays);
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
      console.log("[DEBUG] Assignment created:", assignmentId);
      
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

      console.log("[DEBUG] Occurrences to create:", occurrences);
      const calendarResponse = await api.post(`/workouts/plans/${selectedPlan.plan_id}/calendar`, {
        occurrences: occurrences
      });
      
      console.log("[DEBUG] Calendar response:", calendarResponse.data);
      showAlert(`Success: ${calendarResponse.data.calendar_workout_ids?.length || 0} workout(s) scheduled.`, "success");
      
      // Don't close the calendar, just refresh the data and clear temp selection
      setTempSelectedCalendarDay(null);
      
      await fetchAllData();
      await handleSelectPlan(selectedPlan.plan_id);
      await loadExistingScheduledDays(); // Reload scheduled days
      
    } catch (err) {
      console.error("[ERROR] Schedule failed:", err.response?.data);
      showAlert(err.response?.data || "Failed to schedule plan", "error");
    }
  };

  const openEditSchedule = (workout) => {
    console.log("[DEBUG] openEditSchedule called for workout:", workout.id);
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
    console.log("[DEBUG] handleUpdateSchedule called");
    if (!editingSchedule) return;
    
    try {
      const [year, month, day] = editScheduleForm.date.split('-');
      const [hours, minutes] = editScheduleForm.start_time.split(':');
      const newDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0));
      
      console.log("[DEBUG] Updating schedule to new date:", newDate.toISOString());
      await api.patch(`/workouts/calendar-workouts/${editingSchedule.id}`, {
        scheduled_start: newDate.toISOString()
      });
      
      console.log("[DEBUG] Schedule updated successfully");
      await fetchAllData();
      
      setEditingSchedule(null);
      setEditScheduleForm({ date: "", day_label: "", start_time: "" });

      showAlert("Schedule successfully updated", "success");
      
    } catch (err) {
      console.error("[ERROR] Failed to update schedule:", err);
      showAlert(err.response?.data || "Failed to update schedule", "error");
    }
  };

  const handleDeleteSchedule = async (workoutId) => {
    console.log("[DEBUG] handleDeleteSchedule called for workoutId:", workoutId);
    if (!confirm("Are you sure you want to remove this scheduled workout?")) return;
    
    try {
      await api.delete(`/workouts/calendar-workouts/${workoutId}`);
      console.log("[DEBUG] Workout removed successfully");
      await fetchAllData();
      setEditingSchedule(null);
      showAlert("Workout removed successfully", "success");
    } catch (err) {
      console.error("[ERROR] Failed to delete workout:", err);
      showAlert(err.response?.data || "Failed to remove workout", "error");
    }
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
          ...logData, [e.target.name]: e.target.value
      });
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    
    if (!logData.calendar_workout_id || logData.calendar_workout_id <= 0) {
      showAlert("Calendar Workout ID is missing. Please try selecting the workout again.", "error");
      return;
    }
    
    if (!logData.plan_day_exercise_id || logData.plan_day_exercise_id <= 0) {
      showAlert("Please select a specific exercise to log.", "error");
      return;
    }
    
    if (!logData.exercise_id || logData.exercise_id <= 0) {
      showAlert("Exercise ID is missing. Please try selecting the exercise again.", "error");
      return;
    }
    
    if (logData.sets < 0 || logData.reps < 0) {
      showAlert("Sets and reps cannot be negative.", "error");
      return;
    }
    
    const requestData = {
      calendar_workout_id: parseInt(logData.calendar_workout_id, 10),
      plan_day_exercise_id: parseInt(logData.plan_day_exercise_id, 10),
      exercise_id: parseInt(logData.exercise_id, 10),
      sets: parseInt(logData.sets, 10) || 0,
      reps: parseInt(logData.reps, 10) || 0,
      weight: parseFloat(logData.weight) || 0,
      rpe: parseFloat(logData.rpe) || 0,
      distance: parseFloat(logData.distance) || 0,
      duration_minutes: parseInt(logData.duration_minutes, 10) || 0,
      notes: logData.notes || ""
    };

    console.log("[DEBUG] Sending workout log:", requestData);
    
    try {
      const response = await api.post("/workouts/workout-logs", requestData);
      console.log("[DEBUG] Workout log saved:", response.data);
      
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
      
      setPopOpen(null);
      setTempWorkoutForLog(null);
      showAlert(`Workout logged successfully! ${response.data.log_id ? `Log ID: ${response.data.log_id}` : ''}`, "success");
      
      await fetchAllData();
      
    } catch(err) {
      console.error("[ERROR] Failed to save workout log:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to log workout";
      showAlert(errorMessage, "error");
    }
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
          time: workout.is_scheduled ? workoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not scheduled',
          isScheduled: workout.is_scheduled
        });
      }
    });
    
    return workouts;
  };

  const selectedWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];
  const groupedData = getWorkoutsByPlanAndAssignment();

  const getWorkoutCountForDate = (date) => {
    const targetDateStr = date.toDateString();
    return scheduledWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.scheduled_start);
      return workoutDate.toDateString() === targetDateStr;
    }).length;
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-4">
          <div className="flex text-2xl font-bold">My Workout Plans</div>
          <div className="p-6 flex gap-4">

          {!loadingInsights && workoutInsights && (
            <div className="grid grid-row-6 gap-4 mb-4">
              <div className="card bg-base-300 rounded-box p-4 text-center">
                <p className="text-xs opacity-70">Total Workouts</p>
                <p className="text-xl font-bold text-blue-400">{workoutInsights.total || 0}</p>
              </div>
              <div className="card bg-base-300 rounded-box p-4 text-center">
                <p className="text-xs opacity-70">Current Streak</p>
                <p className="text-xl font-bold text-blue-300">{workoutInsights.current_streak_days || 0} days</p>
              </div>
              <div className="card bg-base-300 rounded-box p-4 text-center">
                <p className="text-xs opacity-70">Scheduled</p>
                <p className="text-xl font-bold text-blue-800">{workoutInsights.scheduled || 0}</p>
              </div>
            </div>
          )}

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box w-1/2 p-4">
              <h2 className="text-lg font-bold mb-2">Calendar</h2>
              <div className="flex justify-between items-center mb-3">
                <button 
                  className="btn btn-sm" 
                  onClick={() => {
                    console.log("[DEBUG] Previous month button clicked");
                    const newDate = new Date(year, month - 1, 1);
                    setCurrentDate(newDate);
                    fetchCalendarWorkouts(newDate, "month");
                  }}
                >←</button>
                <span className="font-semibold text-lg">{monthName} {year}</span>
                <button 
                  className="btn btn-sm" 
                  onClick={() => {
                    console.log("[DEBUG] Next month button clicked");
                    const newDate = new Date(year, month + 1, 1);
                    setCurrentDate(newDate);
                    fetchCalendarWorkouts(newDate, "month");
                  }}
                >→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {WEEKDAY_NAMES.map((day, i) => (
                  <div key={i} className="font-bold text-xs opacity-70 py-1">{day.slice(0, 3)}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 p-1 bg-base-200 rounded opacity-30"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = new Date(year, month, i + 1);
                  const isToday = new Date().toDateString() === day.toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  const workoutCount = getWorkoutCountForDate(day);
                  const hasWorkout = workoutCount > 0;

                  return (
                    <div
                      key={`day-${year}-${month}-${i}`}
                      onClick={() => {
                        console.log("[DEBUG] Date selected:", day.toDateString());
                        setSelectedDate(day);
                      }}
                      className={`h-16 p-1 rounded-lg cursor-pointer transition-all relative
                        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                        ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
                        hover:bg-base-100
                      `}
                    >
                      <div className={`text-right text-sm font-semibold p-0.5 rounded-full w-6 h-6 flex items-center justify-center ml-auto
                        ${isToday ? 'bg-blue-500 text-white' : ''}
                      `}>
                        {i + 1}
                      </div>
                      {hasWorkout && (
                        <div className="mt-1 flex flex-col items-center">
                          <div className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            {workoutCount}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-4 text-xs justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="opacity-70">Has Workout</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
                  <span className="opacity-70">Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/20 ring-2 ring-primary rounded"></div>
                  <span className="opacity-70">Selected</span>
                </div>
              </div>
            </div>

            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <h2 className="text-lg font-bold mb-2">Workouts for {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              {isLoading ? (
                <p className="text-sm opacity-70">Loading workouts...</p>
              ) : selectedWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm opacity-70">No workouts planned for this day.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedWorkouts.map((workout, idx) => (
                    <div 
                      key={workout.occurrenceId || idx}
                      className={`p-3 border rounded transition ${
                        workout.isScheduled 
                          ? 'bg-base-200 hover:bg-base-100 border-blue-300' 
                          : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm">{workout.planName} - {workout.dayLabel}</p>
                        {!workout.isScheduled && (
                          <span className="text-xs badge bg-yellow-400 text-yellow-900">Unscheduled</span>
                        )}
                      </div>
                      <p className="text-xs opacity-60 mb-2">
                        Time: {workout.time}
                      </p>
                      {workout.exercises.length > 0 ? (
                        <ul className="ml-4 list-disc text-sm">
                          {workout.exercises.slice(0, 3).map((ex, exIdx) => {
                            const exId = ex.day_exercise_id || ex.exercise_id || exIdx;
                            return (
                              <li key={exId} className="text-xs">
                                {ex.exercise?.name || ex.name} — {ex.sets} sets × {ex.reps} reps
                                {ex.weight ? ` @ ${ex.weight} lbs` : ""}
                              </li>
                            );
                          })}
                          {workout.exercises.length > 3 && (
                            <li className="text-xs opacity-70">+{workout.exercises.length - 3} more exercises</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs opacity-70 italic">No exercises added yet. Click "Edit Plan" to add exercises.</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button 
                          className="btn btn-xs bg-blue-800 text-white"
                          onClick={() => handleSelectPlan(workout.planId)}
                        >
                          Edit Plan
                        </button>
                        <button 
                          className="btn btn-xs bg-green-700 text-white"
                          onClick={() => {
                            console.log("[DEBUG] Log workout button clicked for workout:", workout);
                            console.log("[DEBUG] Workout exercises:", workout.exercises);
                            
                            if (workout.exercises && workout.exercises.length > 0) {
                              if (workout.exercises.length === 1) {
                                const exercise = workout.exercises[0];
                                setLogData({
                                  calendar_workout_id: workout.occurrenceId,
                                  plan_day_exercise_id: exercise.day_exercise_id || exercise.plan_day_exercise_id,
                                  exercise_id: exercise.exercise?.exercise_id || exercise.exercise_id,
                                  sets: exercise.sets || 3,
                                  reps: exercise.reps || 10,
                                  weight: exercise.weight || 0,
                                  rpe: 0,
                                  distance: 0,
                                  duration_minutes: exercise.duration_minutes || 0,
                                  notes: ""
                                });
                                setPopOpen("log");
                              } else {
                                setTempWorkoutForLog(workout);
                                setPopOpen("selectExercise");
                              }
                            } else {
                              showAlert("This workout has no exercises to log", "error");
                            }
                          }}
                        >
                          Log Workout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                                console.log("[DEBUG] Edit Plan button clicked for plan:", planGroup.plan_id);
                                await handleSelectPlan(planGroup.plan_id);
                              }}
                            >
                              Edit Plan
                            </button>
                            <button 
                              className="btn btn-xs bg-red-600 text-white"
                              onClick={async (e) => {
                                e.stopPropagation();
                                console.log("[DEBUG] Delete Plan button clicked for plan:", planGroup.plan_id);
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
                                                      <span key={w.id} className="text-xs badge bg-yellow-400">
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
                                                    onClick={() => handleDeleteSchedule(firstWorkout.id)}
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
            <div className="flex flex-col gap-4">
            <div className="card bg-base-300 p-4 rounded-box w-64 flex flex-col items-center h-24">
              <h2 className="text-lg font-bold mb-2">Create New Plan</h2>
              <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => setPopOpen("create")}>
                Create New
              </button>
            </div>
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

      {isPopOpen === "selectExercise" && tempWorkoutForLog && (
        <PopUp isOpen={true} onClose={() => {
          setPopOpen(null);
          setTempWorkoutForLog(null);
        }}>
          <div className="bg-base-200 p-6 rounded-box w-[500px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Exercise to Log</h2>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setPopOpen(null);
                  setTempWorkoutForLog(null);
                }}
              >
                ✕
              </button>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Workout: {tempWorkoutForLog.planName} - {tempWorkoutForLog.dayLabel}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tempWorkoutForLog.exercises.map((exercise, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-base-300 rounded-lg cursor-pointer hover:bg-primary/20 transition"
                  onClick={() => {
                    setLogData({
                      calendar_workout_id: tempWorkoutForLog.occurrenceId,
                      plan_day_exercise_id: exercise.day_exercise_id || exercise.plan_day_exercise_id,
                      exercise_id: exercise.exercise?.exercise_id || exercise.exercise_id,
                      sets: exercise.sets || 3,
                      reps: exercise.reps || 10,
                      weight: exercise.weight || 0,
                      rpe: 0,
                      distance: 0,
                      duration_minutes: exercise.duration_minutes || 0,
                      notes: ""
                    });
                    setPopOpen("log");
                    setTempWorkoutForLog(null);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{exercise.exercise?.name || exercise.name}</p>
                      <p className="text-xs opacity-70">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight ? ` @ ${exercise.weight} lbs` : ''}
                      </p>
                    </div>
                    <button className="btn btn-xs bg-blue-800 text-white">Log This</button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-ghost btn-sm w-full mt-4"
              onClick={() => {
                setPopOpen(null);
                setTempWorkoutForLog(null);
              }}
            >
              Cancel
            </button>
          </div>
        </PopUp>
      )}

      <PopUp isOpen={isPopOpen === "log"} onClose={() => {
        setPopOpen(null);
        setTempWorkoutForLog(null);
      }}>
        <form onSubmit={handleLogSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-sm border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Log Workout</h2>
            <button 
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => {
                setPopOpen(null);
                setTempWorkoutForLog(null);
              }}
            >
              ✕
            </button>
          </div>
          
          <div className="bg-base-300 p-2 rounded mb-3">
            <p className="text-xs opacity-70">Logging:</p>
            <p className="text-sm font-semibold">Exercise ID: {logData.exercise_id || 'Not selected'}</p>
            {logData.plan_day_exercise_id > 0 && (
              <p className="text-xs opacity-70">Plan Exercise ID: {logData.plan_day_exercise_id}</p>
            )}
          </div>
          
          <label className="label flex flex-col items-start gap-1 mb-2">
            <span>Sets *</span>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              value={logData.sets} 
              name="sets" 
              onChange={handleLogChange} 
              required 
              min="0"
            />
          </label>
          
          <label className="label flex flex-col items-start gap-1 mb-2">
            <span>Reps *</span>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              value={logData.reps} 
              name="reps" 
              onChange={handleLogChange} 
              required 
              min="0"
            />
          </label>
          
          <label className="label flex flex-col items-start gap-1 mb-2">
            <span>Weight (lbs)</span>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              step="0.5" 
              value={logData.weight} 
              name="weight" 
              onChange={handleLogChange} 
            />
          </label>
          
          <label className="label flex flex-col items-start gap-1 mb-2">
            <span>RPE (0-10)</span>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              step="0.5" 
              min="0" 
              max="10" 
              value={logData.rpe} 
              name="rpe" 
              onChange={handleLogChange} 
            />
          </label>
          
          <label className="label flex flex-col items-start gap-1 mb-2">
            <span>Duration (minutes)</span>
            <input 
              className="input input-bordered w-full" 
              type="number" 
              value={logData.duration_minutes} 
              name="duration_minutes" 
              onChange={handleLogChange} 
            />
          </label>
          
          <label className="label flex flex-col items-start gap-1 mb-4">
            <span>Notes</span>
            <textarea 
              className="textarea textarea-bordered w-full" 
              value={logData.notes} 
              name="notes" 
              onChange={handleLogChange} 
              rows="3" 
            />
          </label>
          
          <button className="btn btn-primary bg-blue-800 w-full" type="submit">
            Submit Log
          </button>
        </form>
      </PopUp>

      <LargeModal open={isPopOpen === "details"} onClose={() => setPopOpen(null)}>
        {selectedPlan && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
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
                    <button className="btn btn-primary bg-blue-800 btn-sm w-full" onClick={handleUpdate}>Save Changes</button>
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
                              <button className="btn btn-xs btn-primary bg-blue-800" onClick={() => { setAssigningDay(day); setBrowsePopOpen(true); }}>+ Exercise</button>
                              <button className="btn btn-xs bg-red-600 text-white btn-outline" onClick={() => handleDeleteDay(selectedPlan.plan_id, day.plan_day_id)}>Delete Day</button>
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
                                          <button className="btn btn-xs btn-primary bg-blue-800" onClick={handleUpdateDayExercise}>Save</button>
                                          <button className="btn btn-xs btn-ghost" onClick={() => setEditingExercise(null)}>Cancel</button>
                                          <button className="btn btn-xs bg-red-600 text-white ml-auto" onClick={() => handleDeleteDayExercise(selectedPlan.plan_id, day.plan_day_id, deId)}>Remove</button>
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
                      <input className="input input-xs flex-1" placeholder="Workout name" value={newDayByPlan[selectedPlan.plan_id]?.day_label || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "day_label", e.target.value)} />
                      <select className="select select-xs w-28" value={newDayByPlan[selectedPlan.plan_id]?.weekday ?? ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "weekday", e.target.value)}>
                        <option value="">Weekday</option>
                        {WEEKDAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                      </select>
                      <input className="input input-xs w-28" type="time" placeholder="Time" value={newDayByPlan[selectedPlan.plan_id]?.session_time || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "session_time", e.target.value)} />
                      <button className="btn btn-xs btn-primary bg-blue-800" onClick={() => handleAddDay(selectedPlan.plan_id)}>Add Day</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-300 p-4 rounded-box">
                <h3 className="font-bold mb-3">Schedule Plan</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs opacity-70">Start Date</label>
                      <input type="date" className="input input-sm input-bordered w-full" value={assignData.start_date} onChange={(e) => setAssignData({...assignData, start_date: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">End Date</label>
                      <input type="date" className="input input-sm input-bordered w-full" value={assignData.end_date} onChange={(e) => setAssignData({...assignData, end_date: e.target.value})} />
                    </div>
                  </div>
                  
                  {assignData.start_date && assignData.end_date && (
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
                            <button className="btn btn-xs btn-circle btn-ghost" onClick={() => setTempSelectedCalendarDay(null)}>×</button>
                          </div>
                          <p className="text-xs opacity-70 mb-2">Select workout:</p>
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
                          <div className="flex flex-wrap gap-1">{tempActiveDays.map((item, idx) => (<span key={idx} className="badge border-black badge-sm">{item.date.toLocaleDateString()}: {item.day.day_label}<button className="ml-1 hover:text-error" onClick={() => setTempActiveDays(prev => prev.filter((_, i) => i !== idx))}>×</button></span>))}</div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button className="btn btn-primary bg-blue-800 btn-sm flex-1" onClick={handleAssignPlan} disabled={tempActiveDays.length === 0}>Confirm Schedule ({tempActiveDays.length} day{tempActiveDays.length !== 1 ? "s" : ""})</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAssignData({ start_date: "", end_date: "" }); setTempActiveDays([]); setTempSelectedCalendarDay(null); }}>Clear</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button 
                className="btn btn-sm bg-red-500 text-white"
                onClick={() => handleDeletePlan(selectedPlan.plan_id)}
              >
                Delete Plan
              </button>
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
                <button className="btn btn-primary bg-blue-800 flex-1" onClick={handleUpdateSchedule}>Save Changes</button>
                <button className="btn bg-red-600 text-white flex-1" onClick={() => handleDeleteSchedule(editingSchedule.id)}>Delete Workout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {isBrowsePopOpen && (
      <LargeModal open={isBrowsePopOpen} onClose={() => { setBrowsePopOpen(false); setAssigningDay(null); }} width="60vw" height="70vh">
        <BrowseExercises
          planId={selectedPlan?.plan_id}
          dayId={assigningDay?.plan_day_id}
          weekday={assigningDay?.weekday}
          onExerciseAdded={async () => {
            await fetchAllData();
            await handleSelectPlan(selectedPlan.plan_id);
            setBrowsePopOpen(false);
            setAssigningDay(null);
          }}
          onClose={() => { setBrowsePopOpen(false); setAssigningDay(null); }}
        />
      </LargeModal>
    )}

    <Alert 
      isOpen={alert} 
      message={alertMsg}
      type={alertType}
      onClose={() => setShowAlert(false)}
    />
  </div>
)
}

export default ClientWorkoutPlans;