import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "../../App.css";

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

function CoClientDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [hiredCoaches, setHiredCoaches] = useState([]);
  const [dayLog, setDayLog] = useState(null);

  const weekDays = getWeekDays(weekAnchor);
  const today = new Date();

  const fetchClientDashboard = async () => {
    try {
      const res = await api.get(`/coach/dashboard/clients/${id}/progress`);
      console.log("CLIENT DASHBOARD:", res.data);
      setDashboard(res.data);
      
      // Set coaches from dashboard data
      if (res.data.coaches) {
        setHiredCoaches(res.data.coaches.map(coach => ({
          relationship_id: coach.coach_profile_id,
          coach_name: `${coach.first_name} ${coach.last_name}`,
          specialty: "Fitness Training",
          started_at: coach.started_at
        })));
      }
    } catch (err) {
      console.error("Error fetching client dashboard:", err.response?.data || err);
      setDashboard({
        client_info: {
          user_id: id,
          first_name: "Client",
          last_name: "",
          relationship_status: "active",
          relationship_start_date: null,
        },
        profile: null,
        progress_summary: {
          avg_energy_level: null,
          avg_mood_score: null,
          avg_sleep_hours: null,
          workout_completion_rate: null,
          nutrition_logging_rate: null,
          active_goals_count: null,
          completed_goals_count: null,
          total_workouts_completed: null,
          days_tracked: null,
        },
        recent_activity: [],
        goals_status: [],
        workout_assignments: [],
        meal_assignments: [],
        invoices: [],
        payments: [],
        coaches: [],
        progress_photos: [],
        survey_status: {
          completed: false,
          last_completed: null
        }
      });
    }
  };

  useEffect(() => {
    fetchClientDashboard();
  }, [id]);

  useEffect(() => {
    fetchScheduledWorkouts(weekAnchor, "week");
  }, [weekAnchor]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchScheduledWorkouts = async (anchorDate, range) => {
    setIsLoadingWorkouts(true);
    try {
      // Use workout assignments from dashboard data
      if (dashboard && dashboard.workout_assignments) {
        const workouts = dashboard.workout_assignments.flatMap(assignment => 
          assignment.days ? assignment.days.map(day => ({
            planName: assignment.plan_name,
            dayLabel: day.day_label,
            exercises: day.exercises || [],
            date: anchorDate, // Simplified for coach view
            time: "All Day"
          })) : []
        );
        setSelectedWorkouts(workouts);
      }
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      // Create mock chart data from progress summary
      if (dashboard && dashboard.progress_summary) {
        const mockData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date.toLocaleDateString(),
            sleep: dashboard.progress_summary.avg_sleep_hours || 0,
            weight: 150, // Mock weight
            water: dashboard.progress_summary.avg_energy_level ? dashboard.progress_summary.avg_energy_level * 20 : 0,
            mood: dashboard.progress_summary.avg_mood_score || 0,
            energy: dashboard.progress_summary.avg_energy_level || 0,
            hasData: true,
            isLogged: true
          });
        }
        setWeeklyChartData(mockData);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const getWorkoutsForDate = (date) => {
    return selectedWorkouts.filter(workout => 
      isSameDay(workout.date, date)
    );
  };

  if (dashboard === null) {
    return <div className="p-6">Loading client dashboard...</div>;
  }

  const client = dashboard.client_info || {};

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold mb-4">{client.first_name || "Client"}{client.last_name ? ` ${client.last_name}'` : "'s"} Dashboard</div>
              <div className="flex items-center gap-4">
                <button 
                  className="cursor-pointer border flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" 
                  onClick={() => navigate(-1)} 
                >
                  Back
                </button>
              </div>
              <p className="text-sm opacity-70 mt-2">
                Active since {client.relationship_start_date ? new Date(client.relationship_start_date).toLocaleDateString() : "--"} · {client.relationship_status || "--"} · {client.first_name} {client.last_name}
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

          <div className="flex gap-4 items-start">
            <div className="card bg-base-300 rounded-box flex-1 p-4 h-72">
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
                          <li key={`ex-${ex.exercise_id}`} className="opacity-70">
                            • Exercise {ex.exercise_id}
                            {ex.sets && ex.reps ? ` — ${ex.sets}×${ex.reps}` : ""}
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

            <div className="card bg-base-300 rounded-box w-64 p-4 flex flex-col h-72">
              <h2 className="text-lg font-bold mb-2">My Coach</h2>
              <div className="flex-1">
                {hiredCoaches && hiredCoaches.length > 0 ? (
                  hiredCoaches.map((rel) => (
                    <div key={rel.relationship_id}>
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
                  My Reviews
                </button>
              </div>
            </div>

            <div className="card bg-base-300 rounded-box w-64 p-4 shrink-0">
              <h2 className="text-base font-bold mb-3">Wellness Log</h2>
              {isSameDay(selectedDay, today) ? (
                <div className="flex flex-col gap-2 text-sm">
                  {[
                    { label: "Sleep", value: dashboard.progress_summary?.avg_sleep_hours ? `${dashboard.progress_summary.avg_sleep_hours} hrs` : null },
                    { label: "Mood", value: dashboard.progress_summary?.avg_mood_score ? `${dashboard.progress_summary.avg_mood_score} / 5` : null },
                    { label: "Energy", value: dashboard.progress_summary?.avg_energy_level ? `${dashboard.progress_summary.avg_energy_level} / 5` : null },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="flex justify-between border-b border-base-content/10 pb-1">
                        <span className="opacity-60">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ) : null
                  )}
                  {(!dashboard.progress_summary?.avg_sleep_hours && !dashboard.progress_summary?.avg_mood_score && !dashboard.progress_summary?.avg_energy_level) && (
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
                  disabled
                >
                  View Only Mode
                </button>
              )}
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-base-300 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Sleep Hours</h2>
                <p className="text-xs opacity-60 mb-4">This week's sleep pattern</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-lg font-semibold">
                      {dashboard.progress_summary?.avg_sleep_hours ? `${dashboard.progress_summary.avg_sleep_hours} hrs avg` : "No data"}
                    </p>
                  </div>
                )}
              </div>

              <div className="card bg-base-300 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Energy Level</h2>
                <p className="text-xs opacity-60 mb-4">This week's energy levels</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-lg font-semibold">
                      {dashboard.progress_summary?.avg_energy_level ? `${dashboard.progress_summary.avg_energy_level} / 5 avg` : "No data"}
                    </p>
                  </div>
                )}
              </div>

              <div className="card bg-base-300 rounded-box p-4 flex">
                <h2 className="text-lg font-bold mb-2">Mood Score</h2>
                <p className="text-xs opacity-60 mb-4">This week's mood scores</p>
                {insightsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm opacity-50">Loading...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-lg font-semibold">
                      {dashboard.progress_summary?.avg_mood_score ? `${dashboard.progress_summary.avg_mood_score} / 5 avg` : "No data"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CoClientDashboardView;