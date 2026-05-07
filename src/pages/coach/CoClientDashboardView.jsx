import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "../../App.css";
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

function CoClientDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [insightsData, setInsightsData] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [weeklyChartData, setWeeklyChartData] = useState([]);

  const fetchClientDashboard = async () => {
    try {
      const res = await api.get(`/coach/dashboard/clients/${id}/progress`);
      console.log("CLIENT DASHBOARD:", res.data);
      setDashboard(res.data);
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
        goals_status: [],
      });
    }
  };

  useEffect(() => {
    fetchClientDashboard();
    fetchInsights();
  }, [id]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await api.get(`/insights/survey?client_id=${id}&days=30`);
      console.log("INSIGHTS DATA:", response.data);
      setInsightsData(response.data.history || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsData([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const prepareWeeklyChartData = () => {
    const dataMap = new Map();
    insightsData.forEach(item => {
      if (item.date) {
        const dateObj = new Date(item.date);
        const dateStr = dateObj.toISOString().split('T')[0];
        const monthDay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        if (!dataMap.has(dateStr)) {
          dataMap.set(dateStr, {
            date: monthDay,
            fullDate: dateObj.toLocaleDateString(),
            dateStr: dateStr,
            displayDate: monthDay,
            sleep: 0,
            mood: 0,
            energy: 0,
            water: 0,
            weight: 0,
            hasData: false,
            isLogged: false
          });
        }
        
        const dayData = dataMap.get(dateStr);
        if (item.sleep_hours) {
          dayData.sleep = item.sleep_hours;
          dayData.hasData = true;
          dayData.isLogged = true;
        }
        if (item.mood_score) {
          dayData.mood = item.mood_score;
          dayData.hasData = true;
          dayData.isLogged = true;
        }
        if (item.energy_level) {
          dayData.energy = item.energy_level;
          dayData.hasData = true;
          dayData.isLogged = true;
        }
        if (item.water_oz) {
          dayData.water = item.water_oz;
          dayData.hasData = true;
          dayData.isLogged = true;
        }
        if (item.weight_lbs) {
          dayData.weight = item.weight_lbs;
          dayData.hasData = true;
          dayData.isLogged = true;
        }
      }
    });
    
    // Fill in missing days for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (dataMap.has(dateStr)) {
        chartData.push(dataMap.get(dateStr));
      } else {
        chartData.push({
          date: monthDay,
          fullDate: date.toLocaleDateString(),
          dateStr: dateStr,
          displayDate: monthDay,
          sleep: 0,
          mood: 0,
          energy: 0,
          water: 0,
          weight: 0,
          hasData: false,
          isLogged: false
        });
      }
    }
    
    return chartData;
  };

  useEffect(() => {
    setWeeklyChartData(prepareWeeklyChartData());
  }, [insightsData]);

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
              <div className="flex items-center gap-4">
                <button 
                  className="cursor-pointer border flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" 
                  onClick={() => navigate(-1)} 
                >
                  Back
                </button>
              <div className="text-2xl font-bold mb-4">{client.first_name || "Client"}{client.last_name ? ` ${client.last_name}'` : "'s"} Dashboard</div>
            </div>
              <p className="text-sm opacity-70 mt-2">
                Active since {client.relationship_start_date ? new Date(client.relationship_start_date).toLocaleDateString() : "--"} · {client.relationship_status || "--"} · {client.first_name} {client.last_name}
              </p>
            </div> 
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Profile</h2>
              <div className="space-y-3">
                {dashboard.profile ? (
                  <>
                    {dashboard.profile.bio && (
                      <div className="flex flex-col py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Bio</span>
                        <span className="font-semibold text-sm">{dashboard.profile.bio}</span>
                      </div>
                    )}
                    {dashboard.profile.age && (
                      <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Age</span>
                        <span className="font-semibold text-sm">{dashboard.profile.age}</span>
                      </div>
                    )}
                    {dashboard.profile.height && (
                      <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Height</span>
                        <span className="font-semibold text-sm">{dashboard.profile.height} cm</span>
                      </div>
                    )}
                    {dashboard.profile.weight && (
                      <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Weight</span>
                        <span className="font-semibold text-sm">{dashboard.profile.weight} kg</span>
                      </div>
                    )}
                    {dashboard.profile.fitness_goals && (
                      <div className="flex flex-col py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Fitness Goals</span>
                        <span className="font-semibold text-sm">{dashboard.profile.fitness_goals}</span>
                      </div>
                    )}
                    {dashboard.profile.activity_level && (
                      <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Activity Level</span>
                        <span className="font-semibold text-sm">{dashboard.profile.activity_level}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm opacity-50">No profile data</p>
                )}
              </div>
            </div>

            {/* Progress Summary Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Progress Summary</h2>
              <div className="space-y-3">
                {[
                  { label: "Avg Energy Level", value: dashboard.progress_summary?.avg_energy_level ? `${dashboard.progress_summary.avg_energy_level.toFixed(1)}` : "No data" },
                  { label: "Avg Mood Score", value: dashboard.progress_summary?.avg_mood_score ? `${dashboard.progress_summary.avg_mood_score.toFixed(1)}` : "No data" },
                  { label: "Avg Sleep Hours", value: dashboard.progress_summary?.avg_sleep_hours ? `${dashboard.progress_summary.avg_sleep_hours.toFixed(1)}h` : "No data" },
                  { label: "Workout Completion", value: dashboard.progress_summary?.workout_completion_rate ? `${Number(dashboard.progress_summary.workout_completion_rate).toFixed(2)}%` : "No data" },
                  { label: "Nutrition Logging", value: dashboard.progress_summary?.nutrition_logging_rate ? `${Number(dashboard.progress_summary.nutrition_logging_rate).toFixed(2)}%` : "No data" },
                  { label: "Active Goals", value: dashboard.progress_summary?.active_goals_count || "0" },
                  { label: "Completed Goals", value: dashboard.progress_summary?.completed_goals_count || "0" },
                  { label: "Total Workouts", value: dashboard.progress_summary?.total_workouts_completed || "0" },
                  { label: "Days Tracked", value: dashboard.progress_summary?.days_tracked || "0" }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-base-content/10">
                    <span className="text-sm opacity-70">{label}</span>
                    <span className="font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Status Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Goals Status</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dashboard.goals_status && dashboard.goals_status.length > 0 ? (
                  dashboard.goals_status.map((goal, index) => (
                    <div key={goal.goal_id || index} className="text-sm py-2 border-b border-base-content/10">
                      <p className="font-medium">{goal.description || "Goal"}</p>
                      {goal.progress_percentage !== undefined && (
                        <p className="text-xs opacity-60">Progress: {goal.progress_percentage}%</p>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        goal.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {goal.status || 'unknown'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No goals set</p>
                )}
              </div>
            </div>

            {/* Survey Status Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Daily Survey Status</h2>
              <div className="space-y-3">
                {dashboard.survey_status ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                      <span className="text-sm opacity-70">Today's Survey</span>
                      <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                        dashboard.survey_status.completed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {dashboard.survey_status.completed ? 'Completed' : 'Not Completed'}
                      </span>
                    </div>
                    {dashboard.survey_status.last_completed && (
                      <div className="flex justify-between items-center py-2 border-b border-base-content/10">
                        <span className="text-sm opacity-70">Last Completed</span>
                        <span className="font-semibold text-sm">{new Date(dashboard.survey_status.last_completed).toLocaleString()}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm opacity-50">No survey data</p>
                )}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6 lg:col-span-2">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.recent_activity && dashboard.recent_activity.length > 0 ? (
                  dashboard.recent_activity.map((activity, index) => (
                    <div key={index} className="text-sm py-2 border-b border-base-content/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.description || "Activity"}</p>
                          <p className="text-xs opacity-60">Type: {activity.activity_type || 'unknown'}</p>
                        </div>
                        <span className="text-xs opacity-60">{activity.date ? new Date(activity.date).toLocaleDateString() : '--'}</span>
                      </div>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="text-xs opacity-50 mt-1">
                          {JSON.stringify(activity.details)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Workout & Meal Assignments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workout Assignments Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Workout Assignments</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.workout_assignments && dashboard.workout_assignments.length > 0 ? (
                  dashboard.workout_assignments.map((assignment) => (
                    <div key={assignment.assignment_id} className="text-sm py-2 border-b border-base-content/10">
                      <p className="font-medium">{assignment.plan_name || "Workout Plan"}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-60">
                          {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : '--'} - {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          assignment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          assignment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {assignment.status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No workout assignments</p>
                )}
              </div>
            </div>

            {/* Meal Assignments Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Meal Assignments</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.meal_assignments && dashboard.meal_assignments.length > 0 ? (
                  dashboard.meal_assignments.map((assignment) => (
                    <div key={assignment.meal_plan_assignment_id} className="text-sm py-2 border-b border-base-content/10">
                      <p className="font-medium">{assignment.plan_name || "Meal Plan"}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-60">
                          {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : '--'} - {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          assignment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          assignment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {assignment.status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No meal assignments</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoices & Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoices Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Invoices</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.invoices && dashboard.invoices.length > 0 ? (
                  dashboard.invoices.map((invoice) => (
                    <div key={invoice.invoice_id} className="text-sm py-2 border-b border-base-content/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Invoice #{invoice.invoice_id}</p>
                          <p className="text-xs opacity-60">Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '--'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${invoice.amount || '0.00'}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {invoice.status || 'unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No invoices</p>
                )}
              </div>
            </div>

            {/* Payments Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Payments</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.payments && dashboard.payments.length > 0 ? (
                  dashboard.payments.map((payment) => (
                    <div key={payment.payment_id} className="text-sm py-2 border-b border-base-content/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Payment #{payment.payment_id}</p>
                          <p className="text-xs opacity-60">Date: {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '--'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${payment.amount || '0.00'}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {payment.status || 'unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No payments</p>
                )}
              </div>
            </div>
          </div>

          {/* Coaches & Progress Photos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coaches Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Client's Coaches</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.coaches && dashboard.coaches.length > 0 ? (
                  dashboard.coaches.map((coach) => (
                    <div key={coach.coach_profile_id} className="text-sm py-2 border-b border-base-content/10">
                      <p className="font-medium">{coach.first_name} {coach.last_name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-60">
                          Since: {coach.started_at ? new Date(coach.started_at).toLocaleDateString() : '--'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          coach.relationship_status === 'active' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {coach.relationship_status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-50">No coaches assigned</p>
                )}
              </div>
            </div>

            {/* Progress Photos Card */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
              <h2 className="text-lg font-bold mb-4">Progress Photos</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.progress_photos && dashboard.progress_photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {dashboard.progress_photos.map((photo) => (
                      <div key={photo.photo_id} className="relative">
                        <img 
                          src={photo.photo_url} 
                          alt="Progress photo" 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs opacity-60 mt-1 text-center">
                          {photo.upload_date ? new Date(photo.upload_date).toLocaleDateString() : '--'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm opacity-50">No progress photos</p>
                )}
              </div>
            </div>
          </div>

          {/* Wellness Charts Section */}
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Wellness Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sleep Hours Chart */}
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

              {/* Weight Chart */}
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

              {/* Water Intake Chart */}
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
    </div>
  );
}

export default CoClientDashboardView;