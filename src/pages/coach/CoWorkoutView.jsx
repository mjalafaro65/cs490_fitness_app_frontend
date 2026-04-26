import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

function CoWorkoutView() {
  const { id } = useParams();
  const [workouts, setWorkouts] = useState(null);
  const [showPlannedModal, setShowPlannedModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  useEffect(() => {
    const fetchClientWorkouts = async () => {
      try {
        const res = await api.get(`/coach/clients/${id}/workouts/assigned`);
        console.log("CLIENT WORKOUTS:", res.data);
        setWorkouts(res.data);
      } catch (err) {
        console.error("Error fetching client workouts:", err.response?.data || err);
        setWorkouts({ assignments: [], total_active: 0, total_completed: 0 });
      }
    };
    

    fetchClientWorkouts();
  }, [id]);

  const today = new Date();

  const plannedAssignments =
    workouts?.assignments?.filter(
      (a) =>
        a.status === "planned" ||
        a.status === "scheduled" ||
        (a.start_date && new Date(a.start_date) > today)
    ) || [];

  const activeAssignments =
    workouts?.assignments?.filter(
      (a) =>
        a.status === "active" &&
        !(a.start_date && new Date(a.start_date) > today)
    ) || [];

  const completedAssignments =
    workouts?.assignments?.filter((a) => a.status === "completed") || [];

  const nextFivePlanned = plannedAssignments.slice(0, 5);
  const lastFiveCompleted = completedAssignments.slice(0, 5);

  const renderWorkoutCard = (assignment, compact = false) => (
    <div
      key={assignment.assignment_id}
      className="bg-base-200 rounded-box p-3"
    >
      <p className="font-bold">{assignment.name}</p>

      {!compact && (
        <p className="text-sm opacity-70">
          {assignment.description || "No description"}
        </p>
      )}

      <p className="text-xs opacity-60 mt-2">
        {assignment.start_date || "—"} → {assignment.end_date || "—"}
      </p>

      {!compact && (
        <p className="text-xs opacity-60">
          Repeat: {assignment.repeat_rule || "—"}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold mb-2">Client Workout View</div>

      {workouts === null ? (
        <p>Loading workouts...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card bg-base-300 rounded-box p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Planned Workouts</h2>
                {plannedAssignments.length > 5 && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowPlannedModal(true)}
                  >
                    See More
                  </button>
                )}
              </div>

              {nextFivePlanned.length === 0 ? (
                <p className="text-sm opacity-70">No planned workouts yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {nextFivePlanned.map((assignment) =>
                    renderWorkoutCard(assignment, true)
                  )}
                </div>
              )}
            </div>

            <div className="card bg-base-300 rounded-box p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Completed Workouts</h2>
                {completedAssignments.length > 5 && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowCompletedModal(true)}
                  >
                    See More
                  </button>
                )}
              </div>

              {lastFiveCompleted.length === 0 ? (
                <p className="text-sm opacity-70">No completed workouts yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {lastFiveCompleted.map((assignment) => (
                    <div
                      key={assignment.assignment_id}
                      className="bg-base-200 rounded-box p-3"
                    >
                      <p className="font-bold">{assignment.name}</p>
                      <p className="text-xs opacity-60">
                        Completed: {assignment.end_date || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-bold mb-4">Active Workouts</h2>

            {activeAssignments.length === 0 ? (
              <p className="text-sm opacity-70">No active workouts assigned.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeAssignments.map((assignment) =>
                  renderWorkoutCard(assignment)
                )}
              </div>
            )}
          </div>
        </>
      )}

      {showPlannedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-box p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">All Planned Workouts</h2>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowPlannedModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {plannedAssignments.map((assignment) =>
                renderWorkoutCard(assignment)
              )}
            </div>
          </div>
        </div>
      )}

      {showCompletedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-box p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">All Completed Workouts</h2>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowCompletedModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {completedAssignments.map((assignment) => (
                <div
                  key={assignment.assignment_id}
                  className="bg-base-200 rounded-box p-3"
                >
                  <p className="font-bold">{assignment.name}</p>
                  <p className="text-xs opacity-60">
                    Completed: {assignment.end_date || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoWorkoutView;