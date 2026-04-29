import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

function CoClientDashboardView() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

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

  useEffect(() => {
    fetchClientDashboard();
  }, [id]);

  const handleUpdateGoal = async () => {
    try {
      await api.patch(`/client/goal/${selectedGoal.goal_id}`, {
        description: selectedGoal.description,
        status: selectedGoal.status,
        target_date: selectedGoal.target_date,
      });

      alert("Goal updated.");
      setSelectedGoal(null);
      await fetchClientDashboard();
    } catch (err) {
      console.error("Failed to update goal:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.description ||
          "Failed to update goal."
      );
    }
  };

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
        <div className="flex items-center gap-4">
            <button className="cursor-pointer border flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" onClick={() => navigate(-1)} > Back</button>
          <div className="text-2xl font-bold">
            {client.first_name || "Client"} {client.last_name || ""}
          </div>
        </div>
        <p className="text-sm opacity-70 mt-4">
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
            {progress.avg_sleep_hours !== null &&
            progress.avg_sleep_hours !== undefined
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

                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">
                    {goal.status || "--"}
                  </span>
                  <button
                    className="btn btn-xs"
                    onClick={() => setSelectedGoal(goal)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedGoal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-box shadow-xl p-6 w-[400px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Goal</h2>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedGoal(null)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                className="input input-bordered"
                value={selectedGoal.description || ""}
                onChange={(e) =>
                  setSelectedGoal({
                    ...selectedGoal,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="input input-bordered"
                value={selectedGoal.target_date || ""}
                onChange={(e) =>
                  setSelectedGoal({
                    ...selectedGoal,
                    target_date: e.target.value,
                  })
                }
              />

              <select
                className="select select-bordered"
                value={selectedGoal.status || "active"}
                onChange={(e) =>
                  setSelectedGoal({
                    ...selectedGoal,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <button
                className="btn bg-blue-800 text-white"
                onClick={handleUpdateGoal}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoClientDashboardView;