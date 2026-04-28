import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import Alert from "../../components/Alert.jsx";
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
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function ProgressLogs(){
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
  
  const [timeView, setTimeView] = useState('weekly');

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
    description: "",
    goal_type: "",
    target_date: "",
    status: "active"
  });

  useEffect(() => {
    async function fetchAllInsights() {
      setLoadingInsights(true);
      try {
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

        const goalsRes = await api.get("/insights/goals");
        if (Array.isArray(goalsRes.data)) {
          setGoalsData(goalsRes.data);
        } else if (goalsRes.data?.goals) {
          setGoalsData(goalsRes.data.goals);
        }

      } catch (err) {
        console.error("Failed to fetch insights:", err);
        setMockData();
      } finally {
        setLoadingInsights(false);
      }
    }
    
    fetchAllInsights();
  }, []);

  const setMockData = () => {
    const mockHistory = [];
    const todayDate = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      mockHistory.push({
        date: date.toISOString().split('T')[0],
        sleep_hours: Math.floor(Math.random() * 4) + 5,
        mood_score: Math.floor(Math.random() * 3) + 2,
        energy_level: Math.floor(Math.random() * 3) + 2,
        water_oz: Math.floor(Math.random() * 40) + 40,
        weight_lbs: 165 + (Math.random() - 0.5) * 8
      });
    }
    setSurveyData(mockHistory);
    setSummaryData({
      total_entries: mockHistory.length,
      avg_sleep_hours: 7.2,
      avg_mood: 3.6,
      avg_energy: 3.2,
      weight_change_lbs: -2.5
    });

    const mockWorkouts = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      mockWorkouts.push({
        date: date.toISOString().split('T')[0],
        scheduled_start: date.toISOString(),
        status: Math.random() > 0.7 ? "completed" : "scheduled"
      });
    }
    setWorkoutData(mockWorkouts);
    setWorkoutSummary({
      total: 90,
      scheduled: 60,
      completed: 30,
      canceled: 0,
      skipped: 0,
      completion_rate: 33.3,
      current_streak_days: 2
    });

    setStrengthData([
      { exercise: "Bench Press", max_weight: 185 },
      { exercise: "Squat", max_weight: 225 },
      { exercise: "Deadlift", max_weight: 275 },
      { exercise: "Overhead Press", max_weight: 115 },
      { exercise: "Pull Ups", max_weight: 65 }
    ]);

    setGoalsData([
      { goal: "Increase Bench Press", progress: 65, target_date: "2024-06-01" },
      { goal: "Improve Cardio", progress: 70, target_date: "2024-05-15" },
      { goal: "Lose Body Fat", progress: 45, target_date: "2024-07-01" }
    ]);
  };

  useEffect(() => {
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

    fetchUser();
  }, []);

  const handleChange = (e) => {
        setLogData({
            ...logData, [e.target.name]: e.target.value
        });
    };

    const handleGoalChange = (e) => {
      setGoalData({
        ...goalData,
        [e.target.name]: e.target.value
      });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await api.post("/workouts/workout-logs", logData);
      setPopOpen(null);
      showAlert("Workout logged successfully!", "success");

      setLogData({
        exercise_id: 0,
        sets: 0,
        reps: 0, 
        weight: 0,
        rpe: 0, 
        distance: 0, 
        calories: 0, 
        duration_minutes: 0, 
        notes: ""
      });

    } catch(err){
      console.error("Failed to save workout log:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to log workout", "error");
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
  
    if (!goalData.description || !goalData.target_date) {
      alert("Please fill required fields");
      return;
    }
  
    try {
      await api.post("/client/create-goal", goalData);
      showAlert("Goal created successfully!", "success");
  
      setGoalData({
        description: "",
        goal_type: "",
        target_date: "",
        status: "active"
      });
  
      setPopOpen(null);
    } catch (err) {
      console.error(err.response?.data || err);
      showAlert("Failed to create goal", "error");
    }
  };

    const handleOpenWidget = () => {
        if (!window.cloudinary) {
            console.error("Cloudinary script not found. Is it in index.html?");
            return;
        }

        const myCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const myPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: myCloudName,
                uploadPreset: myPreset,
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: true,
                clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
                zIndex: 2000
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    showAlert("Image uploaded successfully!", "success");
                }
                if (error) {
                    console.error("Cloudinary Widget Error:", error);
                }
            }
        );

        widget.open();
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
        weight_change_lbs: filteredSurvey.length >= 2 
          ? (filteredSurvey[filteredSurvey.length - 1]?.weight_lbs || 0) - (filteredSurvey[0]?.weight_lbs || 0)
          : 0
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
        sleep: entry.sleep_hours || 0,
        mood: entry.mood_score || 0,
        energy: entry.energy_level || 0,
        water: entry.water_oz || 0,
        weight: entry.weight_lbs || 0
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

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Progress/Analytics</div>
          
          <div className="tabs tabs-boxed rounded-box bg-base-300 p-1 self-start">
            <button 
              className={`tab ${timeView === 'weekly' ? 'tab-active bg-blue-800 text-white rounded-box' : ''}`}
              onClick={() => setTimeView('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`tab ${timeView === 'monthly' ? 'tab-active bg-blue-800 text-white rounded-box' : ''}`}
              onClick={() => setTimeView('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`tab ${timeView === 'yearly' ? 'tab-active bg-blue-800 text-white rounded-box' : ''}`}
              onClick={() => setTimeView('yearly')}
            >
              Yearly
            </button>
          </div>
          
          {filteredWellnessSummary && filteredWellnessSummary.total_entries > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="card bg-base-300 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Total Entries</p>
                <p className="text-2xl font-bold text-blue-400">{filteredWellnessSummary.total_entries || 0}</p>
              </div>
              <div className="card bg-base-300 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Sleep</p>
                <p className="text-2xl font-bold text-blue-800">{filteredWellnessSummary.avg_sleep_hours || 0}h</p>
              </div>
              <div className="card bg-base-300 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Mood</p>
                <p className="text-2xl font-bold text-blue-200">{filteredWellnessSummary.avg_mood || 0}/5</p>
              </div>
              <div className="card bg-base-300 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Avg Energy</p>
                <p className="text-2xl font-bold text-blue-600">{filteredWellnessSummary.avg_energy || 0}/5</p>
              </div>
              <div className="card bg-base-300 rounded-box p-3 text-center">
                <p className="text-xs opacity-70">Weight Change</p>
                <p className={`text-2xl font-bold ${filteredWellnessSummary.weight_change_lbs < 0 ? 'text-blue-700' : filteredWellnessSummary.weight_change_lbs > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {filteredWellnessSummary.weight_change_lbs > 0 ? '+' : ''}{filteredWellnessSummary.weight_change_lbs || 0} lbs
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("create")}>Create New Goal</button>
            <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("log")}>Log Activity</button>
          </div>

          <div className="card bg-base-300 rounded-box p-4">
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

          <div className="card bg-base-300 rounded-box p-4">
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
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm opacity-50">No workout data available</p>
              </div>
            )}
          </div>

          <div className="flex w-full h-80 gap-4">
            <div className="card bg-base-300 rounded-box flex-1 grow p-4">
              <h2 className="text-lg font-bold mb-4">Strength Progress</h2>
              {loadingInsights ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">Loading...</p>
                </div>
              ) : strengthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={strengthData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis dataKey="exercise" type="category" tick={{ fontSize: 10, fill: '#9CA3AF' }} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="max_weight" fill="#3b82f6" name="Max Weight (lbs)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">No strength data available</p>
                </div>
              )}
            </div>

            <div className="card bg-base-300 rounded-box w-1/3 grow p-4">
              <h2 className="text-lg font-bold mb-4">Goals Progress</h2>
              {loadingInsights ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">Loading...</p>
                </div>
              ) : goalsData.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-64">
                  {goalsData.map((goal, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate">{goal.goal || goal.description || 'Untitled Goal'}</span>
                        <span>{goal.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                      {goal.target_date && (
                        <p className="text-xs opacity-50 mt-1">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm opacity-50">No goals data available</p>
                </div>
              )}
              <div className="mt-4">
                <button className="btn btn-primary bg-blue-800 btn-sm w-full" onClick={() => setPopOpen("create")}>
                  Add New Goal
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Water Intake Trend ({timeView === 'weekly' ? 'Last 7 Days' : timeView === 'monthly' ? 'This Month' : 'By Month'})</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm opacity-50">Loading...</p>
              </div>
            ) : surveyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={surveyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={timeView === 'yearly' ? 'period' : 'date'} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="water" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Water (oz)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm opacity-50">No water intake data available</p>
              </div>
            )}
          </div>
        </section>
        {/* edit the space here, make it smaller */}
        <section className="p-7 flex flex-col md:flex-row items-start gap-6">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800">
                  <div className="form-control md:col-span-2">
                    <label className="label font-semibold text-gray-600 dark:text-gray-300">Before Photo:</label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleOpenWidget}
                            className="btn btn-outline border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white bg-white dark:bg-gray-700"
                        >
                          Upload Before Image
                        </button>
                    </div>
                </div>
                <div className="form-control md:col-span-2">
                    <label className="label font-semibold text-gray-600 dark:text-gray-300">After Photo:</label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleOpenWidget}
                            className="btn btn-outline border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white bg-white dark:bg-gray-700"
                        >
                          Upload After Image
                        </button>
                    </div>
                </div>
            </form>
        </section>
      </div>

    <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
      {isPopOpen === "create" && (
        <>
          <form onSubmit={handleCreateGoal} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2 className="text-xl font-bold mb-4">Create a New Goal</h2>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Goal Name:</span>
                <input className="input input-bordered w-full" type="text" name="description" value={goalData.description} onChange={handleGoalChange} required/>
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Goal Type:</span>
                <input className="input input-bordered w-full" type="text" name="goal_type" value={goalData.goal_type} onChange={handleGoalChange} placeholder="e.g., Strength, Cardio, Nutrition"/>
              </label>
              <label className="label flex flex-col items-start gap-1 mb-4">
                <span>Target Date:</span>
                <input className="input input-bordered w-full" type="date" name="target_date" value={goalData.target_date} onChange={handleGoalChange} required/>
              </label>
              <button className="btn btn-primary bg-blue-800 w-full" type="submit">Create Goal</button>
          </form>
        </>
      )}

      {isPopOpen === "log" && (
      <>
          <form onSubmit={handleSubmit} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2 className="text-xl font-bold mb-4">Log Activity</h2>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Exercise ID:</span>
                <input className="input input-bordered w-full" type="number" value={logData.exercise_id} name="exercise_id" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Sets:</span>
                <input className="input input-bordered w-full" type="number" value={logData.sets} name="sets" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Reps:</span>
                <input className="input input-bordered w-full" type="number" value={logData.reps} name="reps" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Weight (lbs):</span>
                <input className="input input-bordered w-full" type="number" value={logData.weight} name="weight" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>RPE (1-10):</span>
                <input className="input input-bordered w-full" type="number" value={logData.rpe} name="rpe" onChange={handleChange} min="1" max="10" />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Distance (miles):</span>
                <input className="input input-bordered w-full" type="number" step="0.01" value={logData.distance} name="distance" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Calories Burned:</span>
                <input className="input input-bordered w-full" type="number" value={logData.calories} name="calories" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-2">
                <span>Duration (minutes):</span>
                <input className="input input-bordered w-full" type="number" value={logData.duration_minutes} name="duration_minutes" onChange={handleChange} />
              </label>
              <label className="label flex flex-col items-start gap-1 mb-4">
                <span>Notes:</span>
                <textarea className="textarea textarea-bordered w-full" value={logData.notes} name="notes" onChange={handleChange} rows="3" />
              </label>
              <button className="btn btn-primary bg-blue-800 w-full" type="submit">Log Workout</button>
          </form>
      </>
      )}
    </PopUp>
    <Alert 
                    isOpen={alert} 
                    message={alertMsg}
                    type={alertType}
                    onClose={() => setShowAlert(false)}/>
  </div>

  );

}
export default ProgressLogs;