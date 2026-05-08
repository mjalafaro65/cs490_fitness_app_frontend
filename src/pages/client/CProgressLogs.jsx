import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import Alert from "../../components/Alert.jsx";
import { openCloudinaryWidget } from "../../cloudinary";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ProgressLogs() {
  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const [surveyData, setSurveyData] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [strengthData, setStrengthData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [imageType, setImageType] = useState(null);

  const [timeView, setTimeView] = useState('weekly');
  const [logs, setLogs] = useState([]);
  const [progressIncrementMode, setProgressIncrementMode] = useState(false);

  const [isPopOpen, setPopOpen] = useState(null);
  const [daily, setData] = useState({
    daily_goal: "",
    energy_level: "",
    target_focus: "",
    water_oz: "",
    weight_lbs: "",
    sleep_hours: "",
    mood_score: ""
  })

  const [logData, setLogData] = useState({
    exercise_id: 0,
    sets: 0,
    reps: 0,
    weight: 0,
    rpe: 0,
    distance: 0,
    calories: 0,
    duration_minutes: 0,
    notes: ""
  })

  const [goalData, setGoalData] = useState({
    goal_type: "weight", status: "active", title: "",
    target_value: "", unit: "", start_date: "", end_date: "", description: ""
  });

  const [editGoalData, setEditGoalData] = useState({
    goal_id: null, title: "", goal_type: "", description: "",
    target_value: "", unit: "", start_date: "", end_date: "", status: ""
  });

  const [editingGoal, setEditingGoal] = useState(null);

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [progressValue, setProgressValue] = useState("");

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalHistory, setGoalHistory] = useState([]);

  const fetchProgressPhotos = async () => {
    try {
      const response = await api.get("/client/progress-photos");
      if (response.data) {
        setBeforeImage(response.data.before_photo_url);
        setAfterImage(response.data.after_photo_url);
      }
    } catch (err) {
      console.error("Failed to fetch progress photos:", err);
    }
  };

  const saveProgressPhotos = async (beforeUrl, afterUrl) => {
    try {
      const response = await api.post("/client/progress-photos", {
        before_photo_url: beforeUrl,
        after_photo_url: afterUrl
      });
      return response.data;
    } catch (err) {
      console.error("Failed to save progress photos:", err);
      throw err;
    }
  };

  async function fetchAllInsights() {
    setLoadingInsights(true);
    try {
      // Fetch progress photos
      await fetchProgressPhotos();

      const surveyRes = await api.get("/insights/survey");
      if (surveyRes.data?.history) {
        setSurveyData(surveyRes.data.history);
        setSummaryData(surveyRes.data.summary);
      }

      const workoutRes = await api.get("/insights/workouts");
      if (workoutRes.data) {
        if (workoutRes.data.history && Array.isArray(workoutRes.data.history)) {
          setWorkoutData(workoutRes.data.history);
          setWorkoutSummary(workoutRes.data.summary);
        } else if (workoutRes.data.workouts && Array.isArray(workoutRes.data.workouts)) {
          setWorkoutData(workoutRes.data.workouts);
          setWorkoutSummary(workoutRes.data.summary);
        } else if (Array.isArray(workoutRes.data)) {
          setWorkoutData(workoutRes.data);
        }
      }

      const strengthRes = await api.get("/insights/strength");
      if (Array.isArray(strengthRes.data)) {
        setStrengthData(strengthRes.data);
      } else if (strengthRes.data?.exercises) {
        setStrengthData(strengthRes.data.exercises);
      }

    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoadingInsights(false);
    }
  }
  async function fetchMyLogs() {

    try {
      const res = await api.get('workouts/workout-logs')
      console.log(res.data)


      setLogs(res.data)
      console.log(res.data)

    } catch (err) {
      console.log(err)
    }


  }


  async function fetchGoals() {
    try {

      const res = await api.get("/client/my-goals")
      console.log(res.data)
      setGoalsData(res.data)

    } catch {
      console.log("no goals fetch ")

    }


  }



  useEffect(() => {

    fetchUser();

    fetchGoals()
    fetchAllInsights();
    fetchMyLogs();


  }, []);




  async function fetchUser() {
    try {
      const response = await api.get("/client/daily-survey");
      const data = response.data;

      setData({
        daily_goal: data.daily_goal || "",
        energy_level: data.energy_level || "",
        target_focus: data.target_focus || "",
        water_oz: data.water_oz || "",
        weight_lbs: data.weight_lbs || "",
        sleep_hours: data.sleep_hours || "",
        mood_score: data.mood_score || ""
      });

    } catch (err) {
      console.error("Failed to fetch user:", err.response?.data || err);
    }
  }



  const handleGoalChange = (e) => {
    setGoalData({
      ...goalData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProgress = async (goalId, value) => {
  try {
    const goal = goalsData.find(g => g.goal_id === goalId);
    
    // For frequency and performance goals, add to existing progress
    if (goal && (goal.goal_type === "frequency" || goal.goal_type === "performance")) {
      const currentProgress = parseFloat(goal.current_value) || 0;
      const valueToAdd = parseFloat(value);
      const newProgress = currentProgress + valueToAdd;
      
      await api.post(`/client/goals/${goalId}/progress`, {
        value: newProgress
      });
      showAlert(`Added ${valueToAdd} ${goal.unit}! New total: ${newProgress} ${goal.unit}`, "success");
    } else {
      // For other goal types (weight, strength, etc.), set the value directly
      await api.post(`/client/goals/${goalId}/progress`, {
        value: parseFloat(value)
      });
      showAlert("Progress updated!", "success");
    }
    
    await fetchGoals();
  } catch (err) {
    showAlert("Failed to update progress", "error");
  }
};

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    try {
      const userRes = await api.get("/user/me");
      console.log("User data:", userRes.data);

      const payload = {
        goal_type: goalData.goal_type,
        title: goalData.title,
        description: goalData.description,
        target_value: goalData.target_value
          && parseFloat(goalData.target_value),

        unit: goalData.unit,
        start_date: goalData.start_date,
        end_date: goalData.end_date,
        status: goalData.status,
        for_user_id: userRes.data.user_id
      };

      await api.post("/client/create-goal", payload);
      showAlert("Goal created successfully!", "success");


      setPopOpen(null);
      await fetchGoals()
    } catch (err) {
      console.log("Full error response:", err.response);

      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        showAlert(errorMessages.join(", "), "error");
      } else {
        showAlert("Failed to create goal", "error");
      }
    }
  };

  const fetchGoalHistory = (goal) => {
    setSelectedGoal(goal);
    setGoalHistory(goal.history || []);
  };



  const handleUpdateGoal = async (e) => {
    e.preventDefault();

    try {
      const { goal_id, ...rest } = editGoalData;

      const payload = {
        ...rest,
        target_value: rest.target_value
          ? parseFloat(rest.target_value)
          : null
      };
      console.log(payload)

      await api.patch(`/client/goal/${editGoalData.goal_id}`, payload);

      showAlert("Goal updated successfully!", "success");

      setPopOpen(null);
      setEditingGoal(null);
      fetchGoals()
    } catch (err) {
      console.error("Error updating goal:", err.response?.data);
      showAlert("Failed to update goal", "error");
    }

  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);

    setEditGoalData({
      goal_id: goal.goal_id || goal.id,
      title: goal.title || "",
      goal_type: goal.goal_type || "",
      description: goal.description || "",
      target_value: goal.target_value ?? "",
      unit: goal.unit || "",
      start_date: goal.start_date ? goal.start_date.split("T")[0] : "",
      end_date: goal.end_date ? goal.end_date.split("T")[0] : "",
      status: goal.status || "active"
    });

    setPopOpen("edit");
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditGoalData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const filterDataByPeriod = (data, period) => {
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      if (period === 'weekly') {
        const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      } else if (period === 'monthly') {
        return itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear();
      } else if (period === 'yearly') {
        return itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    return filtered;
  };

  const getFilteredSummaryStats = () => {
    if (!workoutData.length && !surveyData.length) return { filteredWorkoutSummary: null, filteredWellnessSummary: null };

    const now = new Date();

    const filteredWorkouts = workoutData.filter(workout => {
      const workoutDate = new Date(workout.date || workout.scheduled_start?.split('T')[0]);
      if (timeView === 'weekly') {
        const daysDiff = (now - workoutDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      } else if (timeView === 'monthly') {
        return workoutDate.getMonth() === now.getMonth() &&
          workoutDate.getFullYear() === now.getFullYear();
      } else if (timeView === 'yearly') {
        return workoutDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const filteredWorkoutStats = {
      total: filteredWorkouts.length,
      scheduled: filteredWorkouts.filter(w => w.status === 'scheduled').length,
      completed: filteredWorkouts.filter(w => w.status === 'completed').length,
      canceled: filteredWorkouts.filter(w => w.status === 'canceled').length,
      skipped: filteredWorkouts.filter(w => w.status === 'skipped').length,
      completion_rate: filteredWorkouts.length > 0
        ? ((filteredWorkouts.filter(w => w.status === 'completed').length / filteredWorkouts.length) * 100).toFixed(1)
        : 0,
      current_streak_days: workoutSummary?.current_streak_days || 0
    };

    const filteredSurvey = surveyData.filter(entry => {
      const entryDate = new Date(entry.date);
      if (timeView === 'weekly') {
        const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      } else if (timeView === 'monthly') {
        return entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear();
      } else if (timeView === 'yearly') {
        return entryDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const filteredWellnessStats = {
      total_entries: filteredSurvey.length,
      avg_sleep_hours: filteredSurvey.length > 0
        ? (filteredSurvey.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / filteredSurvey.length).toFixed(1)
        : 0,
      avg_mood: filteredSurvey.length > 0
        ? (filteredSurvey.reduce((sum, e) => sum + (e.mood_score || 0), 0) / filteredSurvey.length).toFixed(1)
        : 0,
      avg_energy: filteredSurvey.length > 0
        ? (filteredSurvey.reduce((sum, e) => sum + (e.energy_level || 0), 0) / filteredSurvey.length).toFixed(1)
        : 0,
      weight_change_lbs: (() => {
          if (filteredSurvey.length < 3) return 0;
          
          const firstValid = filteredSurvey.find(s => s?.weight_lbs > 0)?.weight_lbs;
          const lastValid = [...filteredSurvey].reverse().find(s => s?.weight_lbs > 0)?.weight_lbs;
          
          return firstValid && lastValid ? lastValid - firstValid : 0;
      })()
    };

    return {
      filteredWorkoutSummary: filteredWorkoutStats,
      filteredWellnessSummary: filteredWellnessStats
    };
  };

  const { filteredWorkoutSummary, filteredWellnessSummary } = getFilteredSummaryStats();

  const surveyChartDataRaw = surveyData
    .filter(entry => entry.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      date: new Date(entry.date),
      sleep: entry.sleep_hours || "",
      mood: entry.mood_score || "",
      energy: entry.energy_level || "",
      water: entry.water_oz || "",
      weight: entry.weight_lbs || ""
    }));

  let filteredSurveyData = filterDataByPeriod(surveyChartDataRaw, timeView);

  let surveyChartData;
  if (timeView === 'weekly') {
    surveyChartData = filteredSurveyData.map(d => ({
      date: d.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      sleep: d.sleep,
      mood: d.mood,
      energy: d.energy,
      water: d.water,
      weight: d.weight
    }));
  } else if (timeView === 'monthly') {
    surveyChartData = filteredSurveyData.map(d => ({
      date: d.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      sleep: d.sleep,
      mood: d.mood,
      energy: d.energy,
      water: d.water,
      weight: d.weight
    }));
  } else {
    const monthlyAggregated = {};
    filteredSurveyData.forEach(d => {
      const monthKey = d.date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      if (!monthlyAggregated[monthKey]) {
        monthlyAggregated[monthKey] = {
          period: monthKey,
          sleep: 0,
          mood: 0,
          energy: 0,
          water: 0,
          weight: 0,
          count: 0
        };
      }
      monthlyAggregated[monthKey].sleep += d.sleep;
      monthlyAggregated[monthKey].mood += d.mood;
      monthlyAggregated[monthKey].energy += d.energy;
      monthlyAggregated[monthKey].water += d.water;
      monthlyAggregated[monthKey].weight += d.weight;
      monthlyAggregated[monthKey].count++;
    });

    surveyChartData = Object.values(monthlyAggregated).map(group => ({
      period: group.period,
      sleep: (group.sleep / group.count).toFixed(1),
      mood: (group.mood / group.count).toFixed(1),
      energy: (group.energy / group.count).toFixed(1),
      water: Math.round(group.water / group.count),
      weight: (group.weight / group.count).toFixed(1)
    }));
  }

  const workoutByDate = {};
  workoutData.forEach(workout => {
    let date = workout.date;
    if (!date && workout.scheduled_start) {
      date = workout.scheduled_start.split('T')[0];
    }

    if (date) {
      if (!workoutByDate[date]) {
        workoutByDate[date] = { total: 0, completed: 0, scheduled: 0, dateObj: new Date(date) };
      }
      workoutByDate[date].total++;
      if (workout.status === 'completed') {
        workoutByDate[date].completed++;
      } else if (workout.status === 'scheduled') {
        workoutByDate[date].scheduled++;
      }
    }
  });

  let workoutChartDataRaw = Object.keys(workoutByDate)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date: date,
      dateObj: workoutByDate[date].dateObj,
      total: workoutByDate[date].total,
      completed: workoutByDate[date].completed,
      scheduled: workoutByDate[date].scheduled
    }));

  let filteredWorkoutDataForChart = filterDataByPeriod(
    workoutChartDataRaw.map(d => ({ ...d, date: d.dateObj })),
    timeView
  );

  let workoutChartData;
  if (timeView === 'weekly') {
    workoutChartData = filteredWorkoutDataForChart.map(d => ({
      date: d.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      total: d.total,
      completed: d.completed,
      scheduled: d.scheduled
    }));
  } else if (timeView === 'monthly') {
    workoutChartData = filteredWorkoutDataForChart.map(d => ({
      date: d.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      total: d.total,
      completed: d.completed,
      scheduled: d.scheduled
    }));
  } else {
    const monthlyWorkoutAggregated = {};
    workoutChartDataRaw.forEach(workout => {
      const date = new Date(workout.date);
      if (date.getFullYear() === new Date().getFullYear()) {
        const monthKey = date.toLocaleDateString('default', { month: 'short' });
        if (!monthlyWorkoutAggregated[monthKey]) {
          monthlyWorkoutAggregated[monthKey] = { period: monthKey, total: 0, completed: 0, scheduled: 0 };
        }
        monthlyWorkoutAggregated[monthKey].total += workout.total;
        monthlyWorkoutAggregated[monthKey].completed += workout.completed;
        monthlyWorkoutAggregated[monthKey].scheduled += workout.scheduled;
      }
    });
    workoutChartData = Object.values(monthlyWorkoutAggregated);
  }



  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];



  const [selectedDay, setSelectedDay] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());



  const handleUpload = (type) => {
    openCloudinaryWidget(async (url) => {
      let newBeforeImage = beforeImage;
      let newAfterImage = afterImage;

      // Update the profileData object specifically
      if (type === 'before') {
        console.log("Setting before image");
        setBeforeImage(url);
        newBeforeImage = url;
      } else if (type === 'after') {
        console.log("Setting after image");
        setAfterImage(url);
        newAfterImage = url;
      }

      // Save to backend
      try {
        await saveProgressPhotos(newBeforeImage, newAfterImage);
        showAlert("Image uploaded and saved successfully!", "success");
      } catch (error) {
        showAlert("Failed to save image to backend", "error");
        console.error("Backend save error:", error);
      }
    });
  };
  const toDateKey = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const grouped = logs.reduce((acc, log) => {
    const date = toDateKey(log.logged_at);  // ← use toDateKey here

    if (!acc[date]) {
      acc[date] = { date, sessions: {} };
    }

    const sessionKey = log.calendar_workout_id ?? `free-${log.workout_log_id}`;

    if (!acc[date].sessions[sessionKey]) {
      acc[date].sessions[sessionKey] = {
        id: sessionKey,
        calendar_workout_id: log.calendar_workout_id,
        logged_at: log.logged_at,
        entries: []
      };
    }

    acc[date].sessions[sessionKey].entries.push(...log.entries);
    return acc;
  }, {});

  const groupedArray = Object.values(grouped).map(day => ({
    ...day,
    sessions: Object.values(day.sessions)
  }));

  const logDateSet = new Set(groupedArray.map(d => d.date));
  
    useEffect(() => {
      async function fetchUser() {
        try {
          const response = await api.get("/client/daily-survey");
          const response2 = await api.get("/client/survey-status");
          const statusData = response2.data;
  
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
        }
      }
    fetchUser();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);

  const goal = goalsData.find(g => g.goal_id === selectedGoalId);
  const goalType = goal?.goal_type;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Progress/Analytics</div>

          <div className="tabs tabs-boxed rounded-box bg-base-300 p-1 self-start">
            <button
              className={`tab ${timeView === 'weekly' ? 'tab-active bg-blue-800 shadow-lg text-white rounded-box' : ''}`}
              onClick={() => setTimeView('weekly')}
            >
              Weekly
            </button>
            <button
              className={`tab ${timeView === 'monthly' ? 'tab-active bg-blue-800 shadow-lg text-white rounded-box' : ''}`}
              onClick={() => setTimeView('monthly')}
            >
              Monthly
            </button>
            <button
              className={`tab ${timeView === 'yearly' ? 'tab-active bg-blue-800 shadow-lg text-white rounded-box' : ''}`}
              onClick={() => setTimeView('yearly')}
            >
              Yearly
            </button>
          </div>



          {filteredWellnessSummary && filteredWellnessSummary.total_entries > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Total Entries</p>
                <p className="text-2xl font-bold text-black">{filteredWellnessSummary.total_entries || 0}</p>
              </div>
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Sleep</p>
                <p className="text-2xl font-bold text-black">{filteredWellnessSummary.avg_sleep_hours || 0}h</p>
              </div>
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Mood</p>
                <p className="text-2xl font-bold text-black">{filteredWellnessSummary.avg_mood || 0}/5</p>
              </div>
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Energy</p>
                <p className="text-2xl font-bold text-black">{filteredWellnessSummary.avg_energy || 0}/5</p>
              </div>
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Weight Change</p>
                <p className={`text-2xl font-bold ${filteredWellnessSummary.weight_change_lbs < 0 ? 'text-black' : filteredWellnessSummary.weight_change_lbs > 0 ? 'text-black' : 'text-gray-400'}`}>
                  {filteredWellnessSummary.weight_change_lbs > 0 ? '+' : ''}{filteredWellnessSummary.weight_change_lbs || 0} lbs
                </p>
              </div>
            </div>
          )}

          <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Wellness Trends ({timeView === 'weekly' ? 'Last 7 Days' : timeView === 'monthly' ? 'This Month' : 'By Month'})</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-2 text-center">Sleep Hours</p>
                {loadingInsights ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : surveyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={surveyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="sleep" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">No data available</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 text-center">Mood Score</p>
                {loadingInsights ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : surveyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={surveyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="mood" stroke="#02428a" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">No data available</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 text-center">Energy Level</p>
                {loadingInsights ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : surveyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={surveyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="energy" stroke="#12b5d6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">No data available</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 text-center">Weight Tracking</p>
                {loadingInsights ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : surveyChartData.length > 0 && surveyChartData.some(d => d.weight > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={surveyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="weight" stroke="#3e18e3" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm opacity-50">No weight data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Workout Schedule Overview ({timeView === 'weekly' ? 'Last 7 Days' : timeView === 'monthly' ? 'This Month' : 'By Month'})</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm opacity-50">Loading...</p>
              </div>
            ) : workoutChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
                  <Bar dataKey="completed" fill="#002664" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm opacity-50">No workout data available</p>
              </div>
            )}
          </div>
          <div className="flex w-full h-80 gap-4 ">
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box w-1/3 grow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Goals Progress</h2>
                <button className="btn btn-primary text-white bg-blue-800 btn-sm" onClick={() => setPopOpen("create")}>
                  Add New Goal
                </button>
              </div>
              {loadingInsights ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">Loading...</p>
                </div>

              ) : goalsData.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-64">


{goalsData.map((goal, idx) => {
  let calculatedProgress = 0;
  let displayText = "";
  
  // SPECIAL HANDLING FOR WEIGHT GOALS - USE ONLY SURVEY DATA
  if (goal.goal_type === "weight") {
    const target = parseFloat(goal.target_value);
    
    // Get survey data sorted by date
    const sortedSurvey = [...surveyData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestWeight = sortedSurvey.length > 0 ? parseFloat(sortedSurvey[0].weight_lbs) : null;
    
    if (latestWeight && latestWeight > 0) {
      // Get starting weight (first survey entry ever)
      // const earliestSurvey = [...surveyData].sort((a, b) => new Date(a.date) - new Date(b.date));
      // const startingWeight = earliestSurvey.length > 0 ? parseFloat(earliestSurvey[0].weight_lbs) : latestWeight;
      const startingWeight=latestWeight;
      
      // DEBUG LOG
      console.log(`Goal: ${goal.title}`, {
        target,
        // startingWeight,
        latestWeight,
        isWeightLoss: target < startingWeight,
        isWeightGain: target > startingWeight
      });
      
      if (target < latestWeight) {
        // WEIGHT LOSS GOAL
        calculatedProgress = (target/latestWeight) * 100;
        const leftToLose = latestWeight - target;
        displayText = `${leftToLose.toFixed(1)} ${goal.unit} to lose`;
        
        
      } else if (target > startingWeight) {
        // WEIGHT GAIN GOAL
        calculatedProgress = (latestWeight/target) * 100;
        const leftToGain = target - latestWeight;
        displayText = `${leftToGain.toFixed(1)} ${goal.unit} to gain`;
        
        
      } else {
        calculatedProgress = 100;
        displayText = `Goal achieved! 🎉`;
      }
      
      calculatedProgress = Math.min(100, Math.max(0, calculatedProgress));
      
    } else {
      displayText = "📝 Log your weight in daily survey";
      calculatedProgress = 0;
    }
    
  } else {
    calculatedProgress = goal.progress || 0;
    displayText = `${goal.current_value ?? 0} / ${Number(goal.target_value)} ${goal.unit}`;
  }
  
  return (
    <div 
  key={idx} 
  className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4 cursor-pointer hover:bg-base-300 transition-all duration-300"
  onClick={() => fetchGoalHistory(goal)}
>
  <div className="flex justify-between items-start mb-3">
    <div className="flex items-center gap-3">
      <span className="text-2xl"></span>
      <div>
        <h3 className="font-bold text-sm">{goal.title}</h3>
        <span className="text-xs opacity-60 capitalize">{goal.goal_type}</span>
      </div>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-blue-900">
        {calculatedProgress.toFixed(0)}%
      </div>
      <div className="text-xs opacity-60">
        {displayText}
      </div>
    </div>
  </div>
  
  <div className="flex justify-between text-xs opacity-50 mb-1">
    <span>0%</span>
    <span>25%</span>
    <span>50%</span>
    <span>75%</span>
    <span>100%</span>
  </div>
  
  <div className="w-full bg-gray-300 rounded h-6">
    <div
      className="h-full rounded transition-all duration-300 bg-gradient-to-r from-blue-300 to-blue-800"
      style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
    />
  </div>
  
  {calculatedProgress >= 100 && (
    <div className="mt-2 text-right">
      <span className="badge badge-success badge-sm">Completed</span>
    </div>
  )}
</div>
  );
})}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">No goals data available</p>
                </div>
              )}
            </div>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-base-200 rounded-xl shadow-lg border border-base-500 dark:bg-gray-800">
            <div className="form-control flex flex-col items-center">
              <label className="label font-semibold text-gray-600 dark:text-gray-300">Before Photo:</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleUpload('before')}
                  className="btn btn-outline border-blue-800 text-blue-500 hover:bg-blue-800 hover:text-white bg-white dark:bg-gray-700"
                >
                  Upload Before Image
                </button>
              </div>

              <div className="w-1/2 aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                {beforeImage ? (
                  <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">No image uploaded</span>
                  </div>
                )}
              </div>
            </div>
            <div className="form-control flex flex-col items-center">
              <label className="label font-semibold text-gray-600 dark:text-gray-300">After Photo:</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleUpload('after')}
                  className="btn btn-outline border-blue-00 text-blue-500 hover:bg-blue-800 hover:text-white bg-white dark:bg-gray-700"
                >
                  Upload After Image
                </button>
              </div>

              <div className="w-1/2 aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                {afterImage ? (
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">No image uploaded</span>
                  </div>
                )}
              </div>
            </div>

          </form>

          <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4 w-full">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              Workout Logs
              <span className="text-sm font-normal text-gray-500">
                • Select a day to view logs
              </span>
            </h2>
            <div className="flex justify-center">
              <div className="bg-gray-200 rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <button className="btn btn-sm btn-ghost" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>←</button>
                  <span className="font-semibold text-base">
                    {calendarMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="btn btn-sm btn-ghost" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>→</button>
                </div>

                <div className="grid grid-cols-7 text-sm text-center font-medium opacity-60 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 text-sm text-center gap-2">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const dateStr = toDateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                    const hasLog = logDateSet.has(dateStr);
                    const dayData = groupedArray.find(d => d.date === dateStr);
                    return (
                      <div
                        key={day}
                        onClick={() => hasLog && setSelectedDay(dayData)}
                        className={`rounded-full w-10 h-10 flex items-center justify-center mx-auto transition-colors font-medium
                ${hasLog ? 'bg-blue-800 text-white cursor-pointer hover:bg-blue-600' : 'opacity-40'}
              `}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


          <PopUp isOpen={selectedDay !== null} onClose={() => setSelectedDay(null)}>

            {selectedDay && (

              <div className="p-4 w-80">
                <h2 className="font-bold text-lg mb-3">🗓️ {selectedDay.date}</h2>
                {selectedDay.sessions.map((session) => (
                  <div key={session.id} className="mb-4">
                    <p className="text-xs opacity-60 mb-2">{new Date(session.logged_at).toLocaleTimeString()}</p>
                    <div className="flex flex-col gap-1">
                      {session.entries.map((entry) => (
                        <div key={entry.workout_log_entry_id} className="bg-base-200 rounded p-2 text-xs">
                          <span className="font-semibold">Ex {entry.exercise.name}</span>
                          <span className="ml-2 opacity-80">{entry.sets}x{entry.reps} @ {entry.weight}lb</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PopUp>


        </section>
      </div>




      <PopUp isOpen={selectedGoal !== null} onClose={() => { setSelectedGoal(null); setGoalHistory([]); }}>
        {selectedGoal && (() => {
          const goalType = selectedGoal.goal_type;
          
          let chartData = [];
          let chartYDomain = [0, parseFloat(selectedGoal.target_value) * 1.1];
          
          if (goalType === "weight") {
            const goalStartDate = new Date(selectedGoal.start_date);
            const filteredSurvey = [...surveyData]
              .filter(entry => new Date(entry.date) >= goalStartDate && entry.weight_lbs > 0)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(entry => ({
                date: new Date(entry.date).toLocaleDateString(),
                value: parseFloat(entry.weight_lbs),
                type: 'survey'
              }));
            
            chartData = filteredSurvey;
            
            const allValues = chartData.map(d => d.value);
            const minValue = Math.min(...allValues, selectedGoal.target_value);
            const maxValue = Math.max(...allValues, selectedGoal.target_value);
            chartYDomain = [Math.floor(minValue * 0.95), Math.ceil(maxValue * 1.05)];
          } else {
            chartData = goalHistory;
            chartYDomain = [0, parseFloat(selectedGoal.target_value) * 1.1];
          }
          
          return (
            <div className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-sm min-w-0 border p-4">
              <h2 className="font-bold text-lg mb-1">{selectedGoal.title}</h2>
              <p className="text-xs opacity-60 mb-4">Target: {selectedGoal.target_value} {selectedGoal.unit}</p>
{/* 
              {goalType === "weight" ? (
                chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        domain={chartYDomain}
                        label={{ value: selectedGoal.unit, angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#1d4ed8" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        name="Weight" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : chartData.length === 1 ? (
                  <div className="text-center py-8 opacity-60 text-sm">
                    Only one weight logged. Log more weights in your daily survey to see your trend.
                    <br />
                    Current weight: <span className="font-bold text-blue-600">{chartData[0]?.value} {selectedGoal.unit}</span>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-60 text-sm">
                    No weight data logged yet. Log your weight in the daily survey to track progress.
                  </div>
                )
              ) : (
                goalHistory.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={goalHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={chartYDomain} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 4 }} name="Progress" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : goalHistory.length === 1 ? (
                  <div className="text-center py-8 opacity-60 text-sm">Only one entry — log more to see your trend.</div>
                ) : (
                  <div className="text-center py-8 opacity-60 text-sm">No progress logged yet.</div>
                )
              )} */}

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm opacity-60">
                  <div>Target: <span className="font-bold">{selectedGoal.target_value} {selectedGoal.unit}</span></div>
                  
                  {selectedGoal.goal_type === "weight" && (
                    <div className="mt-1">
                      Latest weight: 
                      <span className="font-bold text-blue-600 ml-1">
                        {(() => {
                          const sortedSurvey = [...surveyData].sort((a, b) => new Date(b.date) - new Date(a.date));
                          const latest = sortedSurvey[0]?.weight_lbs;
                          return latest ? `${latest} ${selectedGoal.unit}` : 'Not logged yet';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEditGoal(selectedGoal)}>
                    Edit Goal
                  </button>
                  {selectedGoal.status == "active" && selectedGoal.goal_type !== "weight" && (
                    <button
                      className="btn btn-sm bg-blue-800 text-white"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setSelectedGoalId(selectedGoal.goal_id);
                        setProgressIncrementMode(selectedGoal.goal_type === "frequency" || selectedGoal.goal_type === "performance");
                        setProgressModalOpen(true);
                      }}
                    >
                      Update Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </PopUp>


      {progressModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-base-100 p-6 rounded-lg w-80 shadow-xl">
      <h3 className="text-lg font-bold mb-4">Update Progress</h3>
      
      {progressIncrementMode ? (
        <p className="text-sm text-gray-600 mb-3">
          Add additional {(() => {
            const goal = goalsData.find(g => g.goal_id === selectedGoalId);
            return goal?.unit || 'units';
          })()} to your progress
        </p>
      ) : (
        <p className="text-sm text-gray-600 mb-3">
          Set new progress value
        </p>
      )}
      
      <input
        type="number"
        step="any"
        placeholder={progressIncrementMode ? "Amount to add" : "Enter value"}
        className="input input-bordered w-full mb-4"
        value={progressValue}
        onChange={(e) => setProgressValue(e.target.value)}
      />
      
      <div className="flex justify-end gap-2">
        <button
          className="btn btn-ghost"
          onClick={() => {
            setProgressModalOpen(false);
            setProgressValue("");
            setProgressIncrementMode(false);
          }}
        >
          Cancel
        </button>
        
        <button
          className="btn bg-blue-800 text-white"
          onClick={async () => {
            await handleAddProgress(selectedGoalId, progressValue);
            setProgressModalOpen(false);
            setProgressValue("");
            setProgressIncrementMode(false);
          }}
        >
          {progressIncrementMode ? "Add" : "Save"}
        </button>
      </div>
    </div>

          {/* 
          {goalType === "frequency" ? (
            <button
              className="btn bg-blue-800 text-white w-full"
              onClick={async () => {
                await handleAddProgress(selectedGoalId, 1);
                setProgressModalOpen(false);
              }}
            >
              Complete
            </button>
          ) : (
            <input
              type="number"
              placeholder="Enter value"
              className="input input-bordered w-full mb-4"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
            />
          )} */}
        </div>



      )}

      <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
        {isPopOpen === "create" && (
          <>
            <form
              onSubmit={handleCreateGoal}
              className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
            >
              <h2 className="text-xl font-bold mb-4">Create a New Goal</h2>

              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Goal Name:</span>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  name="title"
                  value={goalData.title}
                  onChange={handleGoalChange}
                  required
                />
              </label>

              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Goal Type:</span>
                <select
                  className="select select-bordered w-full"
                  name="goal_type"
                  value={goalData.goal_type}
                  onChange={handleGoalChange}
                  required
                >
                  <option value="weight">Weight</option>
                  <option value="strength">Strength</option>
                  <option value="frequency">Frequency</option>
                  <option value="performance">Performance</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Description:</span>
                <textarea
                  className="textarea textarea-bordered w-full"
                  name="description"
                  value={goalData.description}
                  onChange={handleGoalChange}
                />
              </label>

              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Target Value:</span>
                <input
                  className="input input-bordered w-full"
                  type="number"
                  name="target_value"
                  value={goalData.target_value}
                  onChange={handleGoalChange}
                  placeholder="e.g. 30, 100, 5"
                  required
                />
                <span className="text-xs opacity-50">
                  Example: 30 (weight loss), 5 (workouts), 100 (lbs lifted)
                </span>
              </label>


              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Unit:</span>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  name="unit"
                  value={goalData.unit}
                  onChange={handleGoalChange}
                  placeholder="e.g. lbs, reps, miles, grams, workouts"
                  required
                />
                <span className="text-xs opacity-50">
                  Example: lbs, reps, miles, grams, workouts
                </span>
              </label>

              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Start Date:</span>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  name="start_date"
                  value={goalData.start_date}
                  onChange={handleGoalChange}
                  required
                />
              </label>

              <label className="label flex flex-col items-start gap-1 mb-4">
                <span>End Date:</span>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  name="end_date"
                  value={goalData.end_date}
                  onChange={handleGoalChange}
                  required
                />
              </label>

              <button
                className="btn btn-primary text-white bg-blue-800 w-full"
                type="submit"
              >
                Create Goal
              </button>
            </form>
          </>
        )}
        {isPopOpen === "edit" && (
          <form
            onSubmit={handleUpdateGoal}
            className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Goal</h2>
            </div>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Goal Name:</span>
              <input
                className="input input-bordered w-full"
                type="text"
                name="title"
                value={editGoalData.title}
                onChange={handleEditChange}
                required
              />
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Goal Type:</span>
              <select
                className="select select-bordered w-full"
                name="goal_type"
                value={editGoalData.goal_type}
                onChange={handleEditChange}
                required
              >
                <option value="weight">Weight</option>
                <option value="strength">Strength</option>
                <option value="performance">Performance</option>
                <option value="frequency">Frequency</option>
                <option value="nutrition">Nutrition</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Status:</span>
              <select
                className="select select-bordered w-full"
                name="status"
                value={editGoalData.status}
                onChange={handleEditChange}
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Paused</option>
              </select>
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Description:</span>
              <textarea
                className="textarea textarea-bordered w-full"
                name="description"
                value={editGoalData.description}
                onChange={handleEditChange}
              />
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Target Value:</span>
              <input
                className="input input-bordered w-full"
                type="number"
                name="target_value"
                value={editGoalData.target_value}
                onChange={handleEditChange}
                required
              />
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Unit:</span>
              <input
                className="input input-bordered w-full"
                type="text"
                name="unit"
                value={editGoalData.unit}
                onChange={handleEditChange}
                placeholder="e.g. lbs, reps, miles"
                required
              />
            </label>

            <label className="label flex flex-col items-start gap-1 mb-2">
              <span>Start Date:</span>
              <input
                className="input input-bordered w-full"
                type="date"
                name="start_date"
                value={editGoalData.start_date}
                onChange={handleEditChange}
                required
              />
            </label>

            <label className="label flex flex-col items-start gap-1 mb-4">
              <span>End Date:</span>
              <input
                className="input input-bordered w-full"
                type="date"
                name="end_date"
                value={editGoalData.end_date}
                onChange={handleEditChange}
                required
              />
            </label>

            <div className="flex gap-2">
              <button
                className="btn btn-primary text-white bg-blue-800 flex-1"
                type="submit"
              >
                Update Goal
              </button>
            </div>
          </form>
        )}
      </PopUp>



      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)} />
    </div >

  );

}
export default ProgressLogs;