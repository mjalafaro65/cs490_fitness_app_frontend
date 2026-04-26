import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

function CoClientDashboardView() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
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
          recent_activity: [],
          goals_status: [],
        });
      }
    };

    fetchClientDashboard();
  }, [id]);

  if (dashboard === null) {
    return <div className="p-6">Loading client dashboard...</div>;
  }

  const progress = dashboard.progress_summary || {};
  const client = dashboard.client_info || {};

  const percentOrDash = (value) =>
    value !== null && value !== undefined ? `${Math.round(value * 100)}%` : "--";

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold">
          {client.first_name || "Client"} {client.last_name || ""}
        </div>
        <p className="text-sm opacity-70">
          Client since {client.relationship_start_date || "--"} ·{" "}
          {client.relationship_status || "--"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-sm font-semibold">Energy</h2>
          <p className="text-2xl font-bold">
            {progress.avg_energy_level ?? "--"}
          </p>
        </div>

        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-sm font-semibold">Mood</h2>
          <p className="text-2xl font-bold">
            {progress.avg_mood_score ?? "--"}
          </p>
        </div>

        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-sm font-semibold">Sleep</h2>
          <p className="text-2xl font-bold">
            {progress.avg_sleep_hours !== null && progress.avg_sleep_hours !== undefined
              ? `${progress.avg_sleep_hours} hrs`
              : "--"}
          </p>
        </div>

        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-sm font-semibold">Tracked Days</h2>
          <p className="text-2xl font-bold">{progress.days_tracked ?? "--"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-lg font-bold mb-3">Progress Summary</h2>
          <p>Workout completion: {percentOrDash(progress.workout_completion_rate)}</p>
          <p>Nutrition logging: {percentOrDash(progress.nutrition_logging_rate)}</p>
          <p>Total workouts completed: {progress.total_workouts_completed ?? "--"}</p>
          <p>Active goals: {progress.active_goals_count ?? "--"}</p>
          <p>Completed goals: {progress.completed_goals_count ?? "--"}</p>
        </div>

        <div className="card bg-base-300 rounded-box p-4">
          <h2 className="text-lg font-bold mb-3">Recent Activity</h2>

          {dashboard.recent_activity.length === 0 ? (
            <p className="text-sm opacity-70">No recent activity available.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.recent_activity.map((activity, index) => (
                <div key={index} className="bg-base-200 rounded-box p-3">
                  <p className="font-semibold">{activity.description}</p>
                  <p className="text-xs opacity-60">
                    {activity.activity_type} · {activity.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-300 rounded-box p-4">
        <h2 className="text-lg font-bold mb-3">Goals</h2>

        {dashboard.goals_status.length === 0 ? (
          <p className="text-sm opacity-70">No goals available.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dashboard.goals_status.map((goal) => (
              <div
                key={goal.goal_id}
                className="bg-base-200 rounded-box p-3 flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {goal.description || "Untitled goal"}
                  </p>
                  <p className="text-xs opacity-60">
                    Target: {goal.target_date || "--"}
                  </p>
                </div>
                <span className="badge badge-primary">
                  {goal.status || "--"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoClientDashboardView;