import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import "../../App.css";

import PopUp from "../../components/PopUp";

import api from "../../axios";

import Alert from "../../components/Alert.jsx";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


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

  const [insightsData, setInsightsData] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [weeklyInsightsData, setWeeklyInsightsData] = useState([]);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');


  const showAlert = (message, type = 'success') => {
    console.log("ALERT FUNCTION CALLED with:", message, type);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const [scheduledWorkouts, setScheduledWorkouts] = useState([]);

  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [hiredCoaches, setHiredCoaches] = useState([]);



  const fetchScheduledWorkouts = async (date = null, view = "week") => {
    setIsLoadingWorkouts(true);

    try {
      const params = {};

      // For week view, pass the date as anchor to get the correct week
      // For date view, pass the date to get that specific day
      if (date) {
        params.date =
          date instanceof Date
            ? date.toISOString().split("T")[0]
            : date;
      }

      if (view) {
        params.view = view;
      }

      const response = await api.get(
        "/workouts/calendar-workouts-view",
        { params }
      );

      const workouts = response.data || [];

      const transformedWorkouts = workouts.map((workout) => {
        // Robustly parse the date string (e.g., "2026-05-02T10:00:00")
        // We want to compare the calendar day, regardless of the time.
        const [datePart] = workout.scheduled_start.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const d = new Date(year, month - 1, day);

        return {
          id: workout.calendar_workout_id,
          assignment_id: workout.assignment_id,
          plan_id: workout.plan_day?.plan?.plan_id,
          plan_name: workout.plan_day?.plan?.name,
          day_label: workout.plan_day?.day_label,
          day_id: workout.plan_day?.plan_day_id,
          scheduled_start: workout.scheduled_start,
          exercises: workout.plan_day?.exercises || [],
          date_str: d.toDateString(),
          session_time: workout.plan_day?.session_time,
        };
      });

      setScheduledWorkouts(transformedWorkouts);
    } catch (err) {
      console.error("Failed to fetch calendar workouts:", err);
      showAlert("Failed to fetch workouts", "error");
    } finally {
      setIsLoadingWorkouts(false);
    }
  };


  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getWorkoutsForDate = (date) => {
    if (!date) return [];

    // Use ISO date string (YYYY-MM-DD) for reliable comparison
    const targetDateStr = formatLocalDate(date);
    const workouts = [];

    scheduledWorkouts.forEach((workout) => {
      if (!workout.scheduled_start) return;
      const workoutDateStr = workout.scheduled_start.split('T')[0];

      if (workoutDateStr === targetDateStr) {
        const workoutDate = new Date(workout.scheduled_start);
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

  // Single useEffect to handle both initial fetch and week changes
  useEffect(() => {
    fetchScheduledWorkouts(weekAnchor, "week");
    // Update selected day to the start of the week when weekAnchor changes
    const firstDayOfWeek = weekDays[0];
    setSelectedDay(firstDayOfWeek);
  }, [weekAnchor]);

  // Separate useEffect for window focus event
  useEffect(() => {
    const handleFocus = () => {
      fetchScheduledWorkouts(weekAnchor, "week");
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [weekAnchor]);



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
    async function fetchAllInsights() {
      try {
        const [survey, workouts, strength, goals, summary] = await Promise.all([
          api.get("/insights/survey?days=30"),
          api.get("/insights/workouts?days=30"),
          api.get("/insights/strength?days=90"),
          api.get("/insights/goals"),
          api.get("/insights/summary"),
        ]);

        console.log("=== SURVEY ===", survey.data);
        console.log("=== WORKOUTS ===", workouts.data);
        console.log("=== STRENGTH ===", strength.data);
        console.log("=== GOALS ===", goals.data);
        console.log("=== SUMMARY ===", summary.data);

      } catch (err) {
        console.error("Insights fetch failed:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    }

    const fetchCoach = async () => {
      try {
        const res = await api.get("client/my-coaches");
        console.log(res.data)
        const activeCoaches = res.data.filter(
          (coach) => coach.status !== "terminated"
        );

        setHiredCoaches(activeCoaches);

      } catch (err) {
        console.log(err);
      }
    }

    fetchAllInsights();



    fetchUser();
    fetchCoach();

  }, []);

  const filterDataForCurrentWeek = (data) => {
    if (!data.length) return [];

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

    console.log("Filtering for week:", weekStartStr, "to", weekEndStr);
    console.log("Data entries:", data.map(d => ({ date: d.date, dateStr: d.dateStr })));

    const filtered = data.filter(item => {
      if (!item.dateStr) return false;
      return item.dateStr >= weekStartStr && item.dateStr <= weekEndStr;
    });

    console.log("Filtered data:", filtered);
    return filtered;
  };

  useEffect(() => {
    fetchScheduledWorkouts(weekAnchor, "week");
  }, [weekAnchor]);


  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await api.get("/insights/survey");
      console.log("Insights response:", response.data);

      const historyArray = response.data?.history || [];

      const transformedData = historyArray
        .filter(entry => entry.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(entry => {
          const [year, month, day] = entry.date.split("-");
          const dateObj = new Date(year, month - 1, day);
          dateObj.setHours(0, 0, 0, 0);

          const dateStr = `${year}-${month}-${day}`;

          return {
            date: dateStr,
            dateStr: dateStr,
            displayDate: `${month}/${day}`,
            sleep: entry.sleep_hours || 0,
            mood: entry.mood_score || 0,
            energy: entry.energy_level || 0,
            water: entry.water_oz || 0,
            weight: entry.weight_lbs || 0
          };
        });

      setInsightsData(transformedData);
      console.log("Transformed chart data:", transformedData);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  }




  useEffect(() => {
    console.log("Updating weekly data, weekAnchor:", weekAnchor);
    console.log("Insights data:", insightsData);
    const filtered = filterDataForCurrentWeek(insightsData);
    setWeeklyInsightsData(filtered);
  }, [weekAnchor, insightsData]);



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
      showAlert("Daily wellness logged successfully!", "success");

      const insightsResponse = await api.get("/insights/survey");
      console.log(insightsResponse)
      await fetchInsights();

    } catch (error) {

      showAlert(error.response?.data?.message || "Failed to log", "error");

      console.error("Update failed:", error.response?.data || error);

    }
  };

  const prepareWeeklyChartData = () => {
    const dataMap = new Map();
    insightsData.forEach(item => {
      if (item.dateStr) {
        dataMap.set(item.dateStr, item);
      }
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const chartData = last7Days.map(day => {
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(day.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayOfMonth}`;
      const dayData = dataMap.get(dateStr);

      const hasData = dayData && (
        dayData.sleep > 0 ||
        dayData.mood > 0 ||
        dayData.energy > 0 ||
        dayData.water > 0 ||
        dayData.weight > 0
      );

      return {
        date: `${month}/${dayOfMonth}`,
        fullDate: `${month}/${dayOfMonth}/${year}`,
        actualDate: dateStr,
        sleep: dayData?.sleep || 0,
        mood: dayData?.mood || 0,
        energy: dayData?.energy || 0,
        water: dayData?.water || 0,
        weight: dayData?.weight || 0,
        hasData: hasData,
        isLogged: dayData !== undefined
      };
    });

    console.log("Chart data with dates:", chartData);
    return chartData;
  };

  const weeklyChartData = prepareWeeklyChartData();



  console.log(selectedDay, today, dayLog)

  return (

    <div className="drawer lg:drawer-open">

      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">

        <section className="p-6 flex flex-col gap-6">

          <div className="text-2xl font-bold mb-4">Dashboard</div>

          <div className="card bg-base-200 shadow-lg border border-base-500 p-6 flex flex-col">

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

                  const isToday = isSameDay(date, today);

                  const isSelected = isSameDay(date, selectedDay);

                  const sessions = getWorkoutsForDate(date);

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


          <div className="flex flex-col">
            <div className="flex gap-4 items-stretch">

              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box flex-1 p-4 items-stretch">
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

              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box w-70 p-4 flex flex-col ">
                <h2 className="text-lg font-bold mb-2">My Coach</h2>
                <div className="flex-1 ">
                  {hiredCoaches && hiredCoaches.length > 0 ? (
                    hiredCoaches.map((rel) => (
                      <div key={rel.relationship_id} >
                        <p className="font-semibold">{rel.coach_name}</p>
                        <p className="text-xs opacity-70">
                          Specialty: {rel.specialty}
                        </p>
                        <p className="text-xs opacity-60">
                          Since: {rel.started_at
                            ? new Date(rel.started_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "—"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm opacity-70">No coach assigned</span>



                  )}
                </div>

                <div className="mt-auto flex justify-center">

                  <button className="btn bg-blue-800 text-white btn-sm" onClick={() => navigate("/client/reviews")}>

                    Go to my Reviews

                  </button>

                </div>
              </div>

              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box w-60 p-4 shrink-0">

                <h2 className="text-base font-bold mb-3">Daily Log</h2>

                {isSameDay(selectedDay, today) && dayLog ? (

                  <div className="flex flex-col gap-2 text-sm">

                    {[

                      { label: "Goal", value: dayLog.daily_goal || null },

                      { label: "Focus", value: dayLog.target_focus || null },

                      { label: "Mood", value: dayLog.mood_score ? `${dayLog.mood_score} / 5` : null },

                      { label: "Weight", value: dayLog.weight_lbs ? `${dayLog.weight_lbs} lbs` : null },


                      { label: "Energy", value: dayLog.energy_level ? `${dayLog.energy_level} / 5` : null },


                      { label: "Sleep", value: dayLog.sleep_hours ? `${dayLog.sleep_hours} hrs` : null },

                      { label: "Water", value: dayLog.water_oz ? `${dayLog.water_oz} oz` : null },

                    ].map(({ label, value }) =>

                      value ? (

                        <div key={label} className="flex justify-between border-b border-base-content/10 pb-1">

                          <span className="opacity-60">{label}</span>

                          <span className="font-semibold">{value}</span>

                        </div>

                      ) : (
                        <div key={label} className="flex justify-between border-b border-base-content/10 pb-1">

                          <span className="opacity-60">{label}</span>

                          <span className="font-semibold">---</span>

                        </div>
                      )

                    )}

                    {Object.values(dayLog).every((v) => !v) && (

                      <p className="text-xs opacity-40">Nothing logged yet today.</p>

                    )}

                  </div>

                ) : (

                  <p className="text-xs opacity-40">

                    {isSameDay(selectedDay, today)

                      ? "Nothing logged yet today."

                      : "Log history not available for today."}

                  </p>

                )}

                {isSameDay(selectedDay, today) && (

                  <button

                    className="btn bg-blue-800 text-white btn-xs p-3 mt-4 w-full"

                    onClick={() => setPopOpen("update")}

                  >

                    Update

                  </button>

                )}

              </div>



            </div>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Sleep Hours</h2>
                <p className="text-xs opacity-60 mb-4">This week's sleep pattern</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip
                        labelFormatter={(label) => {
                          const dayData = weeklyChartData.find(d => d.date === label);
                          return dayData ? dayData.fullDate : label;
                        }}
                        formatter={(value, name, props) => {
                          const dayData = weeklyChartData.find(d => d.date === props.payload.date);
                          if (!dayData?.hasData && dayData?.isLogged === false) {
                            return ["No data logged", name];
                          }
                          return [`${value}`, name];
                        }}
                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="sleep" stroke="#3c74ba" name="Sleep Hours" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Weight</h2>
                <p className="text-xs opacity-60 mb-4">This week's weight (lbs)</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
                      <Tooltip
                        labelFormatter={(label) => {
                          const dayData = weeklyChartData.find(d => d.date === label);
                          return dayData ? dayData.fullDate : label;
                        }}
                        formatter={(value, name, props) => {
                          const dayData = weeklyChartData.find(d => d.date === props.payload.date);
                          if (!dayData?.hasData && dayData?.isLogged === false) {
                            return ["No data logged", name];
                          }
                          return [`${value}`, name];
                        }}
                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#5cbbf6" name="Weight (lbs)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Water Intake</h2>
                <p className="text-xs opacity-60 mb-4">This week's water (oz)</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
                      <Tooltip
                        labelFormatter={(label) => {
                          const dayData = weeklyChartData.find(d => d.date === label);
                          return dayData ? dayData.fullDate : label;
                        }}
                        formatter={(value, name, props) => {
                          const dayData = weeklyChartData.find(d => d.date === props.payload.date);
                          if (!dayData?.hasData && dayData?.isLogged === false) {
                            return ["No data logged", name];
                          }
                          return [`${value}`, name];
                        }}
                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="water" stroke="#194dfa" name="Water (oz)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
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

      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)} />

    </div>

  );

}



export default CDashboard;