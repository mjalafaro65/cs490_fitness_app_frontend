import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import BrowseExercises from "../Exercises";
import { useNavigate, useLocation } from "react-router-dom";
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

function CoWorkoutPlans() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedClient = location.state;

  const [isPopOpen, setPopOpen] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isBrowsePopOpen, setBrowsePopOpen] = useState(false);
  const [assigningDay, setAssigningDay] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  const [newDayByPlan, setNewDayByPlan] = useState({});

  const [assignData, setAssignData] = useState({
    start_date: "",
    end_date: "",
  });

  const [clients, setClients] = useState([]);
  const [assigningPlan, setAssigningPlan] = useState(null);
  const [assignPopupClient, setAssignPopupClient] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await api.get("/coach/show-client-relationships");
      setClients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const fetchPlansWithDetails = async () => {
    try {
      const res = await api.get("/workouts/plans/mine");
      const userPlans = res.data.plans || [];
      const plansWithDetails = await Promise.all(
        userPlans.map(async (plan) => {
          const planRes = await api.get(`/workouts/plans/${plan.plan_id}`);
          return planRes.data;
        })
      );
      setPlans(plansWithDetails);
      return plansWithDetails;
    } catch (err) {
      console.error("Failed to fetch plans:", err.response?.data || err);
      return [];
    }
  };

  useEffect(() => {
    fetchPlansWithDetails();
    fetchClients();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/workouts/plans", newPlan);
      setPopOpen(null);
      setNewPlan({ name: "", description: "", is_public: false });
      await fetchPlansWithDetails();
      showAlert("New plan successfully created!", "success");
    } catch (err) {
      showAlert(err.response?.data || "Failed to create plan", "error");
      console.error("Create plan failed:", err.response?.data || err);
    }
  };

  const handleSelectPlan = async (plan_id) => {
    try {
      const res = await api.get(`/workouts/plans/${plan_id}`);
      const plan = res.data;
      setSelectedPlan(plan);
      setEditData({
        name: plan.name,
        description: plan.description,
        is_public: plan.is_public,
      });
      setPopOpen("details");
    } catch (err) {
      console.error("Failed to fetch plan details:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/workouts/plans/${selectedPlan.plan_id}`, editData);
      await fetchPlansWithDetails();
      await handleSelectPlan(selectedPlan.plan_id);
      showAlert("Plan updated successfully!", "success");
    } catch (err) {
      showAlert(err.response?.data || "Failed to update plan", "error");
      console.error("Update plan failed:", err.response?.data || err);
    }
  };

  const handleDeletePlan = async (plan_id) => {
    if (!window.confirm("Are you sure you want to delete this entire workout plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}`);
      await fetchPlansWithDetails();
      if (selectedPlan?.plan_id === plan_id) {
        setPopOpen(null);
        setSelectedPlan(null);
      }
      showAlert("Plan deleted successfully.", "success");
    } catch (err) {
      console.error("Delete plan failed:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to delete plan", "error");
    }
  };

  const handleDayChange = (planId, field, value) => {
    setNewDayByPlan((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  const handleAddDay = async (plan_id) => {
    const dayData = newDayByPlan[plan_id] || {};
    const plan = plans.find((p) => p.plan_id === plan_id) || selectedPlan;
    const nextOrder = (plan?.days?.length || 0) + 1;
    try {
      await api.post(`/workouts/plans/${plan_id}/days`, {
        day_label: dayData.day_label || `Day ${nextOrder}`,
        sort_order: nextOrder,
        weekday: Number(dayData.weekday) || 0,
        session_time: dayData.session_time || null,
      });
      setNewDayByPlan((prev) => ({ ...prev, [plan_id]: {} }));
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
      showAlert("New day added!", "success");
    } catch (err) {
      showAlert(err.response?.data || "Failed to add day", "error");
      console.error("Add day failed:", err.response?.data || err);
    }
  };

  const handleDeleteDay = async (plan_id, plan_day_id) => {
    if (!window.confirm("Remove this day and all its exercises?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${plan_day_id}`);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
      showAlert("Day deleted!", "success");
    } catch (err) {
      showAlert(err.response?.data || "Failed to delete day", "error");
      console.error("Delete day failed:", err.response?.data || err);
    }
  };

  const handleUpdateDayExercise = async () => {
    if (!editingExercise) return;
    const { plan_id, day_id, de_id, ...fields } = editingExercise;
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
      setEditingExercise(null);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Update exercise failed:", err.response?.data || err);
    }
  };

  const handleDeleteDayExercise = async (plan_id, day_id, de_id) => {
    if (!window.confirm("Remove this exercise?")) return;
    try {
      await api.delete(`/workouts/plans/${plan_id}/days/${day_id}/exercises/${de_id}`);
      if (editingExercise?.de_id === de_id) setEditingExercise(null);
      await fetchPlansWithDetails();
      await handleSelectPlan(plan_id);
    } catch (err) {
      console.error("Delete exercise failed:", err.response?.data || err);
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedClient || !selectedPlan) return;
  
    try {
      await api.post("/coach/assign-workout/plan", {
        plan_id: selectedPlan.plan_id,
        assigned_to_client_id: selectedClient.clientId,
        repeat_rules: "weekly",
        status: "active",
        start_date: null,
        end_date: null,
      });
  
      alert(`Assigned ${selectedPlan.name} to ${selectedClient.clientName}`);
    } catch (err) {
      console.error("Assign workout failed:", err.response?.data || err);
      alert("Failed to assign workout plan.");
    }
  };

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      {alert && (
        <Alert
          message={alertMsg}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Workout Plans</div>
        {selectedClient && (
          <div className="p-3 bg-base-200 rounded-box text-sm">
            Assigning for: <b>{selectedClient.clientName}</b>
          </div>
        )}
      </div>

      <div className="flex w-full gap-4">
        <div className="card bg-base-300 rounded-box flex-1 p-4">
          <h2 className="text-lg font-bold mb-2">My Workout Plans</h2>
          {plans.length === 0 ? (
            <span className="text-sm opacity-70">No plans yet</span>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
              {plans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className="p-2 bg-base-200 rounded flex justify-between items-center cursor-pointer hover:bg-base-100 transition"
                >
                  <div onClick={() => handleSelectPlan(plan.plan_id)}>
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-xs opacity-70">{plan.description || "No description"}</p>
                    <p className="text-xs opacity-50">
                      {plan.days?.length || 0} day(s) · {plan.is_public ? "Public" : "Private"}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleSelectPlan(plan.plan_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setAssigningPlan(plan);
                        setAssignPopupClient(null);
                        setAssignData({ start_date: "", end_date: "" });
                        setPopOpen("assign");
                      }}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-base-300 p-4 rounded-box w-64 flex flex-col items-center justify-center gap-2">
          <h2 className="text-lg font-bold">Create New Plan</h2>
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={() => setPopOpen("create")}
          >
            Create New
          </button>
        </div>
      </div>

      <PopUp isOpen={isPopOpen === "create"} onClose={() => setPopOpen(null)}>
        <div className="bg-base-200 p-6 rounded-box">
          <h2 className="text-xl font-bold mb-4">Create Workout Plan</h2>
          <form onSubmit={handleCreate}>
            <div className="form-control mb-3">
              <label className="label">Name</label>
              <input
                className="input input-bordered w-full"
                type="text"
                name="name"
                value={newPlan.name}
                onChange={(e) => handleChange(e, setNewPlan)}
                required
              />
            </div>
            <div className="form-control mb-3">
              <label className="label">Description</label>
              <input
                className="input input-bordered w-full"
                type="text"
                name="description"
                value={newPlan.description}
                onChange={(e) => handleChange(e, setNewPlan)}
              />
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                name="is_public"
                checked={newPlan.is_public}
                onChange={(e) => handleChange(e, setNewPlan)}
              />
              Public
            </label>
            <button className="btn btn-primary w-full" type="submit">
              Create
            </button>
          </form>
        </div>
      </PopUp>

      <LargeModal open={isPopOpen === "details"} onClose={() => setPopOpen(null)}>
        {selectedPlan && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDeletePlan(selectedPlan.plan_id)}
                >
                  Delete Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">

                <div className="bg-base-300 p-4 rounded-box">
                  <h3 className="font-bold mb-3">Plan Settings</h3>
                  <div className="space-y-3">
                    <input
                      className="input input-sm w-full"
                      name="name"
                      value={editData.name}
                      onChange={(e) => handleChange(e, setEditData)}
                      placeholder="Plan name"
                    />
                    <textarea
                      className="textarea textarea-sm w-full"
                      name="description"
                      value={editData.description}
                      onChange={(e) => handleChange(e, setEditData)}
                      placeholder="Description"
                      rows="2"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={editData.is_public}
                        onChange={(e) => handleChange(e, setEditData)}
                      />
                      Public
                    </label>
                    <button
                      className="btn btn-primary btn-sm w-full"
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-base-300 p-4 rounded-box">
                  <h3 className="font-bold mb-3">Workout Days</h3>

                  {selectedPlan.days?.length === 0 ? (
                    <p className="text-sm opacity-70 text-center py-4">
                      No days added yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedPlan.days.map((day) => (
                        <div
                          key={day.plan_day_id}
                          className="border rounded-lg p-3 bg-base-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-md">{day.day_label}</span>
                              <span className="text-xs opacity-60 ml-2">
                                ({WEEKDAY_NAMES[day.weekday]})
                              </span>
                              {day.session_time && (
                                <span className="text-xs opacity-60 ml-2">
                                  {day.session_time}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => {
                                  setAssigningDay(day);
                                  setBrowsePopOpen(true);
                                }}
                              >
                                + Exercise
                              </button>
                              <button
                                className="btn btn-xs btn-error btn-outline"
                                onClick={() =>
                                  handleDeleteDay(selectedPlan.plan_id, day.plan_day_id)
                                }
                              >
                                Delete Day
                              </button>
                            </div>
                          </div>

                          {day.exercises?.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              {day.exercises.map((ex) => {
                                const deId = ex.day_exercise_id ?? ex.de_id ?? ex.id;
                                const isEditing =
                                  editingExercise?.de_id === deId &&
                                  editingExercise?.day_id === day.plan_day_id;
                                return (
                                  <div key={deId} className="bg-base-100 rounded p-2">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <p className="font-semibold text-xs">
                                          {ex.exercise?.name || ex.name}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            type="number"
                                            placeholder="Sets"
                                            className="input input-xs"
                                            value={editingExercise.sets}
                                            onChange={(e) =>
                                              setEditingExercise({
                                                ...editingExercise,
                                                sets: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Reps"
                                            className="input input-xs"
                                            value={editingExercise.reps}
                                            onChange={(e) =>
                                              setEditingExercise({
                                                ...editingExercise,
                                                reps: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Weight"
                                            className="input input-xs"
                                            value={editingExercise.weight}
                                            onChange={(e) =>
                                              setEditingExercise({
                                                ...editingExercise,
                                                weight: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Duration"
                                            className="input input-xs"
                                            value={editingExercise.duration_minutes}
                                            onChange={(e) =>
                                              setEditingExercise({
                                                ...editingExercise,
                                                duration_minutes: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="Notes"
                                          className="input input-xs w-full"
                                          value={editingExercise.notes}
                                          onChange={(e) =>
                                            setEditingExercise({
                                              ...editingExercise,
                                              notes: e.target.value,
                                            })
                                          }
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            className="btn btn-xs btn-primary"
                                            onClick={handleUpdateDayExercise}
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="btn btn-xs btn-ghost"
                                            onClick={() => setEditingExercise(null)}
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            className="btn btn-xs btn-error ml-auto"
                                            onClick={() =>
                                              handleDeleteDayExercise(
                                                selectedPlan.plan_id,
                                                day.plan_day_id,
                                                deId
                                              )
                                            }
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                          <span className="font-medium text-sm">
                                            {ex.exercise?.name || ex.name}
                                          </span>
                                          <div className="flex gap-2 text-xs opacity-60 mt-1">
                                            <span>{ex.sets} sets</span>
                                            <span>× {ex.reps} reps</span>
                                            {ex.weight > 0 && (
                                              <span>@ {ex.weight} lbs</span>
                                            )}
                                            {ex.duration_minutes > 0 && (
                                              <span>{ex.duration_minutes} min</span>
                                            )}
                                          </div>
                                          {ex.notes && (
                                            <p className="text-xs opacity-50 mt-1">
                                              {ex.notes}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          className="btn btn-xs btn-ghost"
                                          onClick={() =>
                                            setEditingExercise({
                                              plan_id: selectedPlan.plan_id,
                                              day_id: day.plan_day_id,
                                              de_id: deId,
                                              sets: ex.sets ?? 3,
                                              reps: ex.reps ?? 10,
                                              weight: ex.weight ?? 0,
                                              duration_minutes: ex.duration_minutes ?? 0,
                                              notes: ex.notes ?? "",
                                              sort_order: ex.sort_order ?? 0,
                                            })
                                          }
                                        >
                                          ✏️
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs opacity-70 text-center py-2">
                              No exercises yet.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-base-100 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Add New Day</p>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        className="input input-xs flex-1"
                        placeholder="Day name"
                        value={newDayByPlan[selectedPlan.plan_id]?.day_label || ""}
                        onChange={(e) =>
                          handleDayChange(selectedPlan.plan_id, "day_label", e.target.value)
                        }
                      />
                      <select
                        className="select select-xs w-28"
                        value={newDayByPlan[selectedPlan.plan_id]?.weekday ?? ""}
                        onChange={(e) =>
                          handleDayChange(selectedPlan.plan_id, "weekday", e.target.value)
                        }
                      >
                        <option value="">Weekday</option>
                        {WEEKDAY_NAMES.map((name, i) => (
                          <option key={i} value={i}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input input-xs w-28"
                        type="time"
                        placeholder="Time"
                        value={newDayByPlan[selectedPlan.plan_id]?.session_time || ""}
                        onChange={(e) =>
                          handleDayChange(selectedPlan.plan_id, "session_time", e.target.value)
                        }
                      />
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => handleAddDay(selectedPlan.plan_id)}
                      >
                        Add Day
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-300 p-4 rounded-box">
                <h3 className="font-bold mb-3">Assign Plan</h3>
                {selectedClient ? (
                  <div className="space-y-3">
                    <p className="text-sm opacity-70">
                      Assigning <b>{selectedPlan.name}</b> to <b>{selectedClient.clientName}</b>
                    </p>
                    <div>
                      <label className="text-xs opacity-70">Start Date (optional)</label>
                      <input
                        type="date"
                        className="input input-sm input-bordered w-full"
                        value={assignData.start_date}
                        onChange={(e) => setAssignData({ ...assignData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">End Date (optional)</label>
                      <input
                        type="date"
                        className="input input-sm input-bordered w-full"
                        value={assignData.end_date}
                        onChange={(e) => setAssignData({ ...assignData, end_date: e.target.value })}
                      />
                    </div>
                    <button
                      className="btn btn-primary btn-sm w-full"
                      onClick={() => handleAssignPlan(selectedPlan.plan_id)}
                    >
                      Assign to {selectedClient.clientName}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm opacity-70">
                    Navigate here from a client's profile to assign this plan to them.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </LargeModal>

      <PopUp isOpen={isPopOpen === "assign"} onClose={() => { setPopOpen(null); setAssigningPlan(null); setAssignPopupClient(null); }}>
        <div className="bg-base-200 p-6 rounded-box w-80">
          <h2 className="text-xl font-bold mb-1">Assign Plan</h2>
          <p className="text-sm opacity-70 mb-4">
            <b>{assigningPlan?.name}</b>
          </p>

          <p className="text-sm font-semibold mb-2">Select Client</p>
          {clients.length === 0 ? (
            <p className="text-sm opacity-50 mb-4">No clients found.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-4">
              {clients.map((c) => {
                const name = `${c.user?.first_name} ${c.user?.last_name}`;
                const id = c.user?.user_id;
                const isSelected = assignPopupClient?.clientId === id;
                return (
                  <button
                    key={c.relationship_id}
                    className={`p-2 rounded text-left text-sm transition ${isSelected ? "bg-primary text-white" : "bg-base-100 hover:bg-base-300"}`}
                    onClick={() => setAssignPopupClient({ clientId: id, clientName: name })}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div>
              <label className="text-xs opacity-70">Start Date (optional)</label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                value={assignData.start_date}
                onChange={(e) => setAssignData({ ...assignData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">End Date (optional)</label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                value={assignData.end_date}
                onChange={(e) => setAssignData({ ...assignData, end_date: e.target.value })}
              />
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            disabled={!assignPopupClient}
            onClick={() => handleAssignPlan(assigningPlan.plan_id, assignPopupClient)}
          >
            {assignPopupClient ? `Assign to ${assignPopupClient.clientName}` : "Select a client"}
          </button>
        </div>
      </PopUp>

      {isBrowsePopOpen && (
        <LargeModal
          open={isBrowsePopOpen}
          onClose={() => {
            setBrowsePopOpen(false);
            setAssigningDay(null);
          }}
        >
          <BrowseExercises
            planId={selectedPlan?.plan_id}
            dayId={assigningDay?.plan_day_id}
            weekday={assigningDay?.weekday}
            onExerciseAdded={async () => {
              await fetchPlansWithDetails();
              await handleSelectPlan(selectedPlan.plan_id);
              setBrowsePopOpen(false);
              setAssigningDay(null);
            }}
            onClose={() => {
              setBrowsePopOpen(false);
              setAssigningDay(null);
            }}
          />
        </LargeModal>
      )}
    </div>
  );
}

export default CoWorkoutPlans;
