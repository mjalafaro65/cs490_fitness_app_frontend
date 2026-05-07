import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import BrowseExercises from "../Exercises";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Confirm from "../../components/confirm";
import { useAuth } from "../../AuthContext";


function LargeModal({ open, onClose, children, width = "50vw", height = "70vh" }) {
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

  const { user } = useAuth()

  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    type: "default",
    onResolve: null,
  });

  const [scheduledPlans, setScheduledPlans] = useState([]);
  const [selectedDatePlan, setSelectedDatePlan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedDateC, setSelectedDateC] = useState(null);


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

  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editScheduleForm, setEditScheduleForm] = useState({
    date: "",
    day_label: "",
    start_time: "",
  });

  const [selectedDateP, setSelectedDateP] = useState(null);

  // for scheduling dates for assigment days 
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedDatesA, setSelectedDatesA] = useState({});

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [plans, setPlans] = useState([]);
  const [workoutMap, setWorkoutMap] = useState({});

  const [assignPlan, setAssignPlan] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const showAlert = (message, type = 'success') => {
    console.log("ALERT FUNCTION CALLED with:", message, type);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
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
    await Promise.all([
      fetchPlansWithDetails(),
      getMyAssignments()
    ]);
    console.log("SCHEDULED WORKOUTS:", scheduledWorkouts);
    console.log("[DEBUG] fetchAllData completed");
  };

  const getMyAssignments = async () => {
    try {
      const res = await api.get("/workouts/assignments/mine");
      console.log(res.data);
      const cleaned = simplifyAssignments(res.data);
      console.log(cleaned)
      setScheduledPlans(cleaned);


    } catch (err) {
      console.log("error in getting assigments ", err)
    }



  };

  function simplifyAssignments(data = []) {
    return data.map((assignment) => ({
      assignment_id: assignment.assignment_id,
      assigned_by_user_id : assignment.assigned_by_user_id,
      plan_name: assignment.plan?.name,
      start_date: assignment.start_date,
      end_date: assignment.end_date,

      days: (assignment.plan?.days ?? []).map((day) => ({
        day_label: day.day_label,
        plan_day_id: day.plan_day_id,

        exercises: (day.exercises ?? []).map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
        })),
      })),
    }));
  }
  useEffect(() => {
    const init = async () => {
      console.log("[DEBUG] initializing");

      await Promise.all([
        fetchAllData(),
      ]);
    };

    init();
  }, []);

  const getWorkoutsForDay = async (date) => {
    try {
      const res = await api.get(
        `/workouts/calendar-workouts-view?date=${date}`
      );

      console.log(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };





  const fetchWork = async (date = currentDate) => {
    setWorkoutMap({});
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    console.log(year, month)

    const res = await api.get(
      `/workouts/calendar-workouts?view=month&year=${year}&month=${month}`
    );
    console.log(res.data)

    const formatLocalDate = (dateStr) => {
      const d = new Date(dateStr);

      return d.getUTCFullYear() + "-" +
        String(d.getUTCMonth() + 1).padStart(2, "0") + "-" +
        String(d.getUTCDate()).padStart(2, "0");
    };

    const map = {};

    res.data.forEach(w => {
      const day = formatLocalDate(w.scheduled_start);

      map[day] = (map[day] || 0) + 1;
    });

    setWorkoutMap(map);

    setWorkoutMap(map);
  };

  useEffect(() => {
    fetchWork(currentDate);
  }, [currentDate]);

  const handleDeletePlan = async (plan_id) => {
    console.log("[DEBUG] handleDeletePlan called for plan_id:", plan_id);

    const ok = await confirm({ message: "Are you sure you want to delete this entire workout plan? This action cannot be undone.", type: "cancel" });
    if (!ok) return;
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

  // create new plan=> just name and description after submit
  const handleCreate = async (e) => {
    // console.log("[DEBUG] handleCreate called");
    e.preventDefault();
    try {
      const response = await api.post("/workouts/plans", newPlan);
      console.log("[DEBUG] Plan created successfully:", response.data);
      setPopOpen(null);
      // setNewPlan({ name: "", description: "", is_public: false });
      await fetchPlansWithDetails(); //not all data,just plans
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
    const ok = await confirm({ message: "Remove this day and all its exercises?", type: "cancel" });
    if (!ok) return;
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
  const refreshAll = async () => {
    await Promise.all([
      fetchAllData(),
      refreshActivePlans(),
      fetchWork()
    ]);
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
    const ok = await confirm({ message: "Remove this exercise?", type: "cancel" });
    if (!ok) return;
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

  const handleAssignPlan = async (plan_id) => {
    try {

      const payload = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      };

      const assignmentResponse = await api.post(
        `/workouts/plans/${plan_id}/assignments`,
        payload
      );


      const assignmentId = assignmentResponse.data.assignment_id;
      console.log("[DEBUG] Assignment created:", assignmentId);

      await getMyAssignments()

    } catch (err) {
      const msg = err.response?.data?.description || err.response?.data?.message || "Failed to schedule plan.";
      showAlert(msg + " Check assigned exercises", "error");
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

    try {
      const [year, month, day] = editScheduleForm.date.split('-');
      const [hours, minutes] = editScheduleForm.start_time.split(':');
      const newStart = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0));
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000); // +1 hour

      console.log("[DEBUG] Updating schedule to new date:", newStart.toISOString());
      await api.patch(`/workouts/calendar-workouts/${editingSchedule.id}`, {
        scheduled_start: newStart.toISOString(),
        scheduled_end: newEnd.toISOString(),
        status: editingSchedule.status || "scheduled"
      });

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
      await api.patch(`/workouts/calendar-workouts/${workoutId}`, {
        status: "cancelled"
      });
      console.log("[DEBUG] Workout cancelled successfully");
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

    } catch (err) {
      console.error("[ERROR] Failed to save workout log:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to log workout";
      showAlert(errorMessage, "error");
    }
  };

  const fetchWorkoutsForDate = async (date) => {
    setSelectedDateC(date);

    const formatted = date.toISOString().split("T")[0];

    try {
      const res = await api.get(
        `/workouts/calendar-workouts-view?date=${formatted}`
      );

      console.log(res.data);

      setSelectedWorkouts(
        (res.data || []).filter(w => w.status !== "canceled")
      );
    } catch (err) {
      console.error("Failed to fetch day workouts:", err);
      setSelectedWorkouts([]);
    }
  };


  const generateCalendarDates = (startDate, endDate) => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    const dates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    return dates;
  };

  const calendarDates = generateCalendarDates(
    assignData.start_date,
    assignData.end_date
  );




  // need to handle scheduling changes
  const handleScheduleAssignment = async (assignment, selectedDays) => {
    try {

      const payload = {
        occurrences: Object.entries(selectedDatesA)
          .filter(([_, val]) => val?.date)
          .map(([plan_day_id, val]) => {
            const time = val.time || DEFAULT_TIME;

            return {
              plan_day_id: Number(plan_day_id),
              scheduled_start: `${val.date}T${time}:00`,
            };
          }),
      };

      await api.post(
        `/workouts/assignments/${assignment.assignment_id}/schedule`,
        payload
      );

      try {
        await fetchWork(currentDate);
        await fetchWorkoutsForDate(selectedDateC);
      } catch {
        console.log("failed reload fetches")
      }


      showAlert("Workout scheduled successfully!", "success");
    } catch (err) {
      console.error("[ERROR] scheduling failed:", err);
      showAlert("Failed to schedule workout", "error");
    }
  };

  const confirm = ({ message, type = "default" }) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        message,
        type,
        onResolve: resolve,
      });
    });


  };
  console.log(user.user_id)

  const today = new Date().toISOString().split("T")[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-4">
          <div className="flex text-2xl font-bold">My Workout Plans</div>
          <div className="p-6 flex gap-4">


            {/* Calendar top */}
            <div className="flex w-full gap-4">
              <div className="card bg-base-300 rounded-box w-1/2 p-4">
                <h2 className="text-lg font-bold mb-2">Calendar</h2>
                <div className="flex justify-between items-center mb-3">
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      const newDate = new Date(year, month - 1, 1);
                      setCurrentDate(newDate);
                    }}
                  >←</button>
                  <span className="font-semibold text-lg">{monthName} {year}</span>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      const newDate = new Date(year, month + 1, 1);
                      setCurrentDate(newDate);
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

                    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                    const workoutCount = workoutMap[dateKey] || 0;
                    const hasWorkout = workoutCount > 0;
                    const isToday =
                      new Date().toDateString() === day.toDateString();

                    const isSelected =
                      selectedDateC?.toDateString() === day.toDateString();

                    return (
                      <div
                        key={`day-${year}-${month}-${i}`}
                        onClick={() => {
                          const date = new Date(year, month, i + 1);
                          fetchWorkoutsForDate(date)
                        }}
                        className={`h-16 p-1 rounded-lg cursor-pointer transition-all relative
        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
        ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
        ${hasWorkout ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
        hover:bg-base-100
      `}
                      >
                        <div className={`text-right text-sm font-semibold p-0.5 rounded-full w-6 h-6 flex items-center justify-center ml-auto
                        ${isToday ? 'bg-blue-500 text-white' : ''}`}>
                          {i + 1}
                        </div>
                        {hasWorkout && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                            <div className="bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded-full">
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
                    <div className="w-3 h-3 bg-blue-800 bg-primary/20 ring-2 ring-primary rounded"></div>
                    <span className="opacity-70">Selected</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-300 rounded-box flex-1 p-4">
                <h2 className="text-lg font-bold mb-2">
                  {selectedDateC
                    ? `Workouts for ${selectedDateC.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}`
                    : "Select a day to view workouts"}
                </h2>


                {/* Daily workouts after selecting plan */}
                {isLoading ? (
                  <p className="text-sm opacity-70">Loading workouts...</p>
                ) : selectedWorkouts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm opacity-70">No workouts planned for this day.</p>
                  </div>
                ) : (
                  <div className="">
                    {selectedWorkouts.map((workout, idx) => (
                      <div
                        key={workout.occurrenceId || idx}
                        className="p-3 border rounded bg-base-200 hover:bg-base-100 transition"
                      >
                        <p className="font-semibold text-sm">
                          {workout.plan_day.plan.name} - {workout.plan_day.day_label}
                        </p>

                        <p className="text-xs opacity-60 mb-2">
                          Time: {new Date(workout.scheduled_start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {workout.plan_day?.exercises?.length > 0 ? (
                          <ul className="ml-4 list-disc text-sm">
                            {workout.plan_day.exercises.slice(0, 3).map((ex, exIdx) => {
                              const exId = ex.day_exercise_id || ex.exercise_id || exIdx;

                              return (
                                <li key={exId} className="text-xs">
                                  {ex.exercise?.name || ex.name} — {ex.sets} sets × {ex.reps} reps
                                  {ex.weight ? ` @ ${ex.weight} lbs` : ""}
                                </li>
                              );
                            })}

                            {workout.plan_day.exercises.length > 3 && (
                              <li className="text-xs opacity-70">
                                +{workout.plan_day.exercises.length - 3} more exercises
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-xs opacity-70 italic">
                            No exercises added yet. Click "Edit Plan" to add exercises.
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {
                            workout.status != "completed" ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="btn btn-xs bg-blue-700 text-white"
                                  onClick={async () => {
                                    const ok = await confirm({
                                      message: "Mark this workout as completed?",
                                      type: "complete",
                                    });

                                    if (!ok) return;

                                    await api.patch(`/workouts/calendar-workouts/${workout.calendar_workout_id}`, {
                                      status: "completed",
                                    });

                                    await fetchWork(currentDate);
                                    await getMyAssignments();
                                    await fetchWorkoutsForDate(selectedDateC);
                                  }}
                                >
                                  Complete
                                </button>

                                <button
                                  className="btn btn-xs bg-blue-700 text-white"
                                  onClick={() => {
                                    const exercises = workout.plan_day?.exercises || [];

                                    if (exercises.length === 0) {
                                      showAlert("This workout has no exercises to log", "error");
                                      return;
                                    }

                                    // prevent logging completed workouts
                                    if (workout.status === "completed") {
                                      showAlert("This workout is already completed", "info");
                                      return;
                                    }

                                    // optional: prevent logging canceled workouts
                                    if (workout.status === "canceled") {
                                      showAlert("This workout was canceled", "error");
                                      return;
                                    }

                                    if (exercises.length === 1) {
                                      const ex = exercises[0];

                                      setLogData({
                                        calendar_workout_id: workout.calendar_workout_id,
                                        exercise_id: ex.exercise?.exercise_id,
                                        exercise_name: ex.exercise?.name,
                                        sets: ex.sets || 3,
                                        reps: ex.reps || 10,
                                        weight: ex.weight || 0,
                                        rpe: 0,
                                        distance: 0,
                                        duration_minutes: ex.duration_minutes || 0,
                                        notes: ""
                                      });

                                      setPopOpen("log");
                                    } else {
                                      setTempWorkoutForLog({
                                        ...workout,
                                        exercises
                                      });

                                      setPopOpen("selectExercise");
                                    }
                                  }}
                                >
                                  Log Workout
                                </button>
                                <button
                                  className="btn btn-xs bg-red-600 text-white hover:bg-red-700"
                                  onClick={async () => {
                                    const ok = await confirm({
                                      message: "Cancel this workout?",
                                      type: "cancel",
                                    });

                                    if (!ok) return;

                                    await api.patch(`/workouts/calendar-workouts/${workout.calendar_workout_id}`, {
                                      status: "canceled",
                                    });
                                    await fetchWork(currentDate);
                                    await getMyAssignments();
                                    await fetchWorkoutsForDate(selectedDateC);
                                  }}
                                >
                                  Delete Planned Workout
                                </button>
                              </div>
                            ) : (
                              <p>Workout Completed</p>
                            )
                          }


                          {/* {confirmState.open && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                              <div className="bg-white p-4 rounded w-80">

                                <p className="text-sm mb-4">
                                  {confirmState.message}
                                </p>

                                <div className="flex justify-end gap-2">
                                  <button
                                    className="btn btn-xs"
                                    onClick={() => {
                                      confirmState.onResolve(false);
                                      setConfirmState({ ...confirmState, open: false });
                                    }}
                                  >
                                    No
                                  </button>

                                  <button
                                    className={`btn btn-xs text-white ${confirmState.type === "cancel"
                                      ? "bg-red-600"
                                      : "bg-blue-700"
                                      }`}
                                    onClick={() => {
                                      confirmState.onResolve(true);
                                      setConfirmState({ ...confirmState, open: false });
                                    }}
                                  >
                                    Yes
                                  </button>
                                </div>

                              </div>
                            </div>
                          )} */}

                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Daily workouts after selecting plan end */}


              </div>
            </div>
          </div>


          {/* Active Plans  */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Active Plans</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheduledPlans.map((plan) => {
                if (plan?.status == "completed" || plan?.status == "canceled") return null;

                return (
                  <div
                    key={plan.assignment_id}
                    className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm mb-3"
                  >

                    <div className="mb-3">
                      <h2 className="font-semibold text-lg tracking-tight">
                        {plan.plan_name}
                      </h2>

                      {user && Number(plan.assigned_by_user_id) !== Number(user.user_id) && (
                        <p className="ext-xs opacity-60 mt-1">Assigned by Coach</p>
                      )}


                      <p className="text-xs opacity-60 mt-1">
                        {plan.start_date && plan.end_date ? (
                          <>
                            Active from{" "}
                            <span className="font-medium">
                              {new Date(plan.start_date).toLocaleDateString()}
                            </span>
                            {" "}to{" "}
                            <span className="font-medium">
                              {new Date(plan.end_date).toLocaleDateString()}
                            </span>
                          </>
                        ) : (
                          <span className="italic opacity-50">No scheduled timeframe</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.days?.map((d, i) => {
                        const time = d.session?.start
                          ? new Date(d.session.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "";

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-base-200 text-sm"
                          >
                            <span className="font-semibold">
                              {d.day_label}
                            </span>

                            {time && (
                              <>
                                <span className="opacity-60">|</span>
                                <span className="font-mono">{time}</span>
                              </>
                            )}

                          </div>

                        );
                      })}

                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="btn btn-sm bg-blue-800 text-white"
                        onClick={() => {
                          setSelectedAssignment(plan);
                          setTempActiveDays([]);
                          setScheduleOpen(true);
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                );

              })}

            </div>


          </div>



          {/* Pop up to schedule labeled days */}

          {scheduleOpen && selectedAssignment && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">
                  Schedule {selectedAssignment.plan_name}
                </h3>

                <p className="text-sm opacity-70 mt-2">
                  Choose a workout day from this assignment:
                </p>

                <div className="mt-3 space-y-2">
                  {selectedAssignment?.days?.map((d, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded cursor-pointer transition  text-black "bg-base-200 hover:bg-blue-100 bg-base-200"`}
                    >
                      {d.day_label}{" "}

                      <div className="mb-3">
                        <label className="text-xs opacity-70">Select Date</label>

                        <input
                          type="date"
                          className="input input-sm input-bordered w-full"
                          value={selectedDatesA[d.plan_day_id]?.date || ""}
                          onChange={(e) =>
                            setSelectedDatesA(prev => ({
                              ...prev,
                              [d.plan_day_id]: {
                                ...(prev[d.plan_day_id] || {}),
                                date: e.target.value,
                              }
                            }))
                          }
                        />
                        <input
                          type="time"
                          className="input input-sm input-bordered w-full"
                          value={selectedDatesA[d.plan_day_id]?.time || ""}
                          onChange={(e) =>
                            setSelectedDatesA(prev => ({
                              ...prev,
                              [d.plan_day_id]: {
                                ...(prev[d.plan_day_id] || {}),
                                time: e.target.value,
                              }
                            }))
                          }
                        />
                      </div>

                    </div>

                  ))}
                </div>

                {/* Action buttons */}
                <div className="modal-action flex justify-between">
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setScheduleOpen(false);
                      setSelectedAssignment(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn bg-blue-800 btn-primary"
                    disabled={!selectedDatesA}
                    onClick={() => {
                      console.log(selectedAssignment, selectedDatesA)
                      handleScheduleAssignment(selectedAssignment, selectedDatesA);

                      setScheduleOpen(false);
                      setSelectedAssignment(null);
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full gap-4">
            <div className="card bg-base-300 rounded-box flex-1 p-4">
              <div>
                <h1 className="text-2xl font-bold">My Workout Plans</h1>

                <p className="text-sm opacity-70 mt-1">
                  Select a template plan below to assign.
                </p>
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((placeholder) => (
                    <div
                      key={placeholder}
                      className="p-2 bg-base-200 rounded flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="h-4 bg-base-300 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-base-300 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="h-3 bg-base-300 rounded w-12 animate-pulse"></div>
                    </div>
                  ))}
                  <p className="text-sm opacity-70 text-center mt-2">Loading workout plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <span className="text-sm opacity-70">No plans yet</span>
              ) : (
                <div className="flex flex-col gap-2 ">
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
                      <div className="flex items-center gap-3">
                        <span className="text-xs">
                          {plan.is_public ? "Public" : "Private"}
                        </span>
                        <button
                          className="btn btn-xs bg-blue-800 btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignPlan(plan);
                            setShowAssignModal(true);
                          }}
                        >
                          Assign
                        </button>
                      </div>

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
      </div >

      {showAssignModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Assign "{assignPlan?.name}"
            </h3>

            <p className="text-sm opacity-70 mt-2">
              Do you want to schedule a date? If not select Assign Now
            </p>

            <div className="mt-3">
              <label className="text-sm">Start Date  (Optional)</label>
              <input
                type="date"
                className="input input-bordered w-full mt-1"
                min={today}
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-sm">End Date (Optional)</label>
              <input
                type="date"
                className="input input-bordered w-full mt-1"
                value={endDate || ""}
                min={today}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="modal-action flex justify-between">

              {/* Cancel button */}
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAssignModal(false);
                  // setAssignPlan(null);
                  setSelectedDatePlan("");
                }}
              >
                Cancel
              </button>

              <div className="flex gap-2">

                {/* Assign Now */}
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    handleAssignPlan(assignPlan.plan_id, null);
                    setShowAssignModal(false);
                    // setAssignPlan(null);
                    // setSelectedDatePlan("");
                  }}
                >
                  Assign Now
                </button>

                {/* Schedule */}
                <button
                  className="btn bg-blue-800 btn-primary"
                  onClick={() => {
                    handleAssignPlan(assignPlan.plan_id, selectedDateP);
                    setShowAssignModal(false);
                    setAssignPlan(null);
                    setSelectedDatePlan("");
                  }}
                >
                  Schedule
                </button>

              </div>
            </div>
          </div>
        </div>
      )}



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

      {
        isPopOpen === "selectExercise" && tempWorkoutForLog && (
          <PopUp
            isOpen={true}
            onClose={() => {
              setPopOpen(null);
              setTempWorkoutForLog(null);
            }}
          >
            <div className="">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Select Exercise to Log</h2>

                {/* <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setPopOpen(null);
                  setTempWorkoutForLog(null);
                }}
              >
                ✕
              </button> */}
              </div>




              {/* EXERCISE LIST */}
              <div className="space-y-2 max-h-96 ">


                {tempWorkoutForLog.exercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    className="
            w-full text-left p-3 rounded-lg
            bg-base-200 hover:bg-primary/10
            transition flex justify-between items-center
          "
                    onClick={() => {
                      setLogData({
                        calendar_workout_id: tempWorkoutForLog.calendar_workout_id,
                        exercise_id: exercise.exercise?.exercise_id || exercise.exercise_id,
                        exercise_name: exercise.exercise?.name || exercise.name,
                        sets: exercise.sets || 0,
                        reps: exercise.reps || 0,
                        weight: exercise.weight || 0,
                        rpe: 0,
                        distance: 0,
                        duration_minutes: exercise.duration_minutes || 0,
                        notes: ""
                      });




                      setPopOpen("log");
                    }}
                    onClose={() => {
                      setPopOpen(null);
                      setTempWorkoutForLog(null);
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {exercise.exercise?.name || exercise.name}
                      </p>

                      <p className="text-xs opacity-60">
                        {exercise.sets} × {exercise.reps}
                        {exercise.weight ? ` • ${exercise.weight} lbs` : ""}
                      </p>
                    </div>

                    <span className="text-xs bg-blue-800 text-white px-2 py-1 rounded">
                      Log
                    </span>
                  </button>
                ))}

              </div>

              {/* FOOTER */}
              <button
                className="btn btn-sm btn-ghost w-full mt-4"
                onClick={() => {
                  setPopOpen(null);
                  setTempWorkoutForLog(null);
                }}
              >
                Cancel
              </button>

            </div>
          </PopUp>
        )
      }

      <PopUp isOpen={isPopOpen === "log"} onClose={() => {
        setPopOpen(null);
        setTempWorkoutForLog(null);
      }}>
        <form onSubmit={handleLogSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-sm min-w-0 border p-4 ">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Log Workout</h2>
          </div>

          <div className="bg-base-300 p-2 rounded mb-3">
            <p className="text-xs opacity-70">Logging:</p>
            <p className="text-sm font-semibold">Exercise: {logData.exercise_name || 'Not selected'}</p>
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


            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-5">
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
                              {/* <span className="text-xs opacity-60 ml-2">({WEEKDAY_NAMES[day.weekday]})</span> */}
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
                                          <input type="number" placeholder="Sets" className="input input-xs" value={editingExercise.sets} onChange={(e) => setEditingExercise({ ...editingExercise, sets: e.target.value })} />
                                          <input type="number" placeholder="Reps" className="input input-xs" value={editingExercise.reps} onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })} />
                                          <input type="number" placeholder="Weight" className="input input-xs" value={editingExercise.weight} onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })} />
                                          <input type="number" placeholder="Duration" className="input input-xs" value={editingExercise.duration_minutes} onChange={(e) => setEditingExercise({ ...editingExercise, duration_minutes: e.target.value })} />
                                        </div>
                                        <input type="text" placeholder="Notes" className="input input-xs w-full" value={editingExercise.notes} onChange={(e) => setEditingExercise({ ...editingExercise, notes: e.target.value })} />
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
                      <input className="input input-xs flex-1" placeholder="Day name" value={newDayByPlan[selectedPlan.plan_id]?.day_label || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "day_label", e.target.value)} />
                      {/* <select className="select select-xs w-28" value={newDayByPlan[selectedPlan.plan_id]?.weekday ?? ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "weekday", e.target.value)}>
                        <option value="">Weekday</option>
                        {WEEKDAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                      </select> */}
                      {/* <input className="input input-xs w-28" type="time" placeholder="Time" value={newDayByPlan[selectedPlan.plan_id]?.session_time || ""} onChange={(e) => handleDayChange(selectedPlan.plan_id, "session_time", e.target.value)} /> */}
                      <button className="btn btn-xs btn-primary bg-blue-800" onClick={() => handleAddDay(selectedPlan.plan_id)}>Add Day</button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
            <div className="flex justify-center mt-6">
              <button

                className="btn btn-sm  bg-red-600 text-white"
                onClick={() => handleDeletePlan(selectedPlan.plan_id)}
              >
                Delete Plan
              </button>
            </div>
          </div>


        )}
      </LargeModal>

      {
        editingSchedule && (
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
                    onChange={(e) => setEditScheduleForm({ ...editScheduleForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={editScheduleForm.date}
                      onChange={(e) => setEditScheduleForm({ ...editScheduleForm, date: e.target.value })}
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
                      onChange={(e) => setEditScheduleForm({ ...editScheduleForm, start_time: e.target.value })}
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
        )
      }

      {
        isBrowsePopOpen && (
          <LargeModal open={isBrowsePopOpen} onClose={() => { setBrowsePopOpen(false); setAssigningDay(null); }}>
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
        )
      }

      {confirmState.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">

            <p className="text-sm text-gray-700 mb-6">
              {confirmState.message}
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-xs"
                onClick={() => {
                  confirmState.onResolve(false);
                  setConfirmState({ ...confirmState, open: false });
                }}
              >
                No
              </button>

              <button
                className={`btn btn-xs text-white ${confirmState.type === "cancel"
                  ? "bg-red-600"
                  : "bg-blue-700"
                  }`}
                onClick={() => {
                  confirmState.onResolve(true);
                  setConfirmState({ ...confirmState, open: false });
                }}
              >
                Yes
              </button>
            </div>

          </div>
        </div>
      )}



      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div >
  )
}

export default ClientWorkoutPlans;