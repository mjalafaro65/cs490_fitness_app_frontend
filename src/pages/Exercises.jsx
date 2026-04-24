import { useState, useEffect } from "react";
import api from "../axios";

function BrowseExercises({ planId, dayId, weekday, onExerciseAdded, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [view, setView] = useState("browse");
  const [showAddForm, setShowAddForm] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: ""
  });

  const [addForm, setAddForm] = useState({
    sets: 3,
    reps: 10,
    weight: 0,
    duration_minutes: 0,
    notes: "",
    sort_order: 0,
  });

  const [newExercise, setNewExercise] = useState({
    name: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
    description: "",
    is_public: false,
  });

  const [editForm, setEditForm] = useState(null);

  console.log("BrowseExercises props:", { planId, dayId, weekday });

  const fetchExercises = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/workouts/exercises", { params });
      const exercisesList = res.data.exercises || [];
      setExercises(exercisesList);
      setFilteredExercises(exercisesList);
    } catch (err) {
      console.error("Failed to fetch exercises:", err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.muscle_group) params.muscle_group = filters.muscle_group;
    if (filters.equipment) params.equipment = filters.equipment;
    if (filters.training_type) params.training_type = filters.training_type;
    fetchExercises(params);
  };

  const fetchExerciseDetails = async (exerciseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/workouts/exercises/${exerciseId}`);
      const ex = res.data.exercise || res.data;
      setSelectedEx(ex);
      setEditForm({
        name: ex.name || "",
        muscle_group: ex.muscle_group || "",
        equipment: ex.equipment || "",
        training_type: ex.training_type || "",
        description: ex.description || "",
        is_public: ex.is_public || false,
      });
      setView("detail");
    } catch (err) {
      console.error("Failed to fetch exercise details:", err.response?.data || err);
    }
    setLoading(false);
  };

  const handleSelectExercise = (exercise) => {
    console.log("Selected exercise:", exercise.name);
    setSelectedEx(exercise);
    setShowAddForm(true);
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    try {
      await api.post("/workouts/exercises", newExercise);
      setNewExercise({
        name: "",
        muscle_group: "",
        equipment: "",
        training_type: "",
        description: "",
        is_public: false,
      });
      setView("browse");
      fetchExercises();
    } catch (err) {
      console.error("Create exercise failed:", err.response?.data || err);
    }
  };

  const handleUpdateExercise = async () => {
    if (!selectedEx) return;
    try {
      await api.patch(`/workouts/exercises/${selectedEx.exercise_id}`, editForm);
      fetchExercises();
      await fetchExerciseDetails(selectedEx.exercise_id);
    } catch (err) {
      console.error("Update exercise failed:", err.response?.data || err);
    }
  };

  const handleDeleteExercise = async () => {
    if (!selectedEx) return;
    if (!window.confirm("Deactivate this exercise?")) return;
    try {
      await api.delete(`/workouts/exercises/${selectedEx.exercise_id}`);
      setView("browse");
      setSelectedEx(null);
      fetchExercises();
    } catch (err) {
      console.error("Delete exercise failed:", err.response?.data || err);
    }
  };

  const handleAddExercise = async () => {
    if (!planId || !dayId || !selectedEx) {
      console.error("Missing required data:", { planId, dayId, selectedEx });
      alert("Cannot add exercise: Missing required information");
      return;
    }
    
    setAddingExercise(true);
    
    try {
      const payload = {
        exercise_id: selectedEx.exercise_id,
        sets: Number(addForm.sets),
        reps: Number(addForm.reps),
        weight: Number(addForm.weight),
        duration_minutes: Number(addForm.duration_minutes),
        notes: addForm.notes,
        sort_order: Number(addForm.sort_order),
      };
      
      console.log("Adding exercise to plan:", planId, "day:", dayId);
      console.log("Payload:", payload);
      
      const res = await api.post(
        `/workouts/plans/${planId}/days/${dayId}/exercises`,
        payload
      );
      
      console.log("Exercise added successfully:", res.data);
      
      setAddForm({
        sets: 3,
        reps: 10,
        weight: 0,
        duration_minutes: 0,
        notes: "",
        sort_order: 0,
      });
      
      if (onExerciseAdded) {
        await onExerciseAdded(res.data);
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error("Add exercise to day failed:", err.response?.data || err);
      alert(`Failed to add exercise: ${err.response?.data?.message || "Unknown error"}`);
    } finally {
      setAddingExercise(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewExChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExercise((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {(view !== "browse" || showAddForm) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setView("browse");
                setSelectedEx(null);
                setShowAddForm(false);
              }}
            >
              ← Back
            </button>
          )}
          <h1 className="text-xl font-bold">
            {view === "browse" && !showAddForm && "Browse Exercises"}
            {view === "create" && "Create Custom Exercise"}
            {view === "detail" && (selectedEx?.name || "Exercise Detail")}
            {showAddForm && `Add ${selectedEx?.name} to Day`}
          </h1>
        </div>
        <div className="flex gap-2">
          {view === "browse" && !showAddForm && (
            <button
              className="btn btn-sm btn-primary bg-blue-800"
              onClick={() => setView("create")}
            >
              + New Exercise
            </button>
          )}
        </div>
      </div>

      {(!planId || !dayId) && view === "browse" && !showAddForm && (
        <div className="alert alert-warning">
          <span>Cannot add exercises: Missing plan or day information</span>
        </div>
      )}

      {view === "browse" && !showAddForm && (
        <>
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap gap-2 bg-base-200 p-3 rounded-box"
          >
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className="input input-sm input-bordered"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            />
            <input
              type="text"
              name="muscle_group"
              placeholder="Muscle group"
              className="input input-sm input-bordered"
              value={filters.muscle_group}
              onChange={(e) =>
                setFilters((p) => ({ ...p, muscle_group: e.target.value }))
              }
            />
            <input
              type="text"
              name="equipment"
              placeholder="Equipment"
              className="input input-sm input-bordered"
              value={filters.equipment}
              onChange={(e) =>
                setFilters((p) => ({ ...p, equipment: e.target.value }))
              }
            />
            <input
              type="text"
              name="training_type"
              placeholder="Training type"
              className="input input-sm input-bordered"
              value={filters.training_type}
              onChange={(e) =>
                setFilters((p) => ({ ...p, training_type: e.target.value }))
              }
            />
            
            <button type="submit" className="btn btn-sm btn-primary bg-blue-800">
              Search
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setFilters({ q: "", muscle_group: "", equipment: "", training_type: "" });
                fetchExercises();
              }}
            >
              Clear
            </button>
          </form>

          {loading ? (
            <p className="text-sm opacity-70">Loading...</p>
          ) : (filteredExercises.length === 0 && exercises.length === 0) ? (
            <p className="text-sm opacity-70">No exercises found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto">
              {(filters.q || filters.muscle_group || filters.equipment || filters.training_type ? filteredExercises : exercises).map((ex) => (
                <div
                  key={ex.exercise_id}
                  className="p-3 bg-base-200 rounded hover:bg-base-300 transition group"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => fetchExerciseDetails(ex.exercise_id)}
                  >
                    <p className="font-bold text-sm">{ex.name}</p>
                    {ex.muscle_group && (
                      <p className="text-xs opacity-60">{ex.muscle_group}</p>
                    )}
                    {ex.equipment && (
                      <p className="text-xs opacity-50">{ex.equipment}</p>
                    )}
                  </div>
                  
                  <button
                    className="btn btn-xs btn-primary mt-2 w-full"
                    onClick={() => handleSelectExercise(ex)}
                    disabled={!planId || !dayId}
                    title={!planId || !dayId ? "Cannot add: Missing plan or day info" : "Select this exercise"}
                  >
                    {!planId || !dayId ? "Cannot Add" : "Select Exercise"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showAddForm && selectedEx && (
        <div className="bg-base-300 p-4 rounded-box flex flex-col gap-3">
          <h2 className="font-bold text-lg">
            Add "{selectedEx.name}" to {weekday !== undefined ? WEEKDAY_NAMES[weekday] : "Workout Day"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold opacity-70">Sets</span>
              <input
                type="number"
                name="sets"
                className="input input-sm input-bordered"
                value={addForm.sets}
                min={1}
                onChange={handleAddFormChange}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold opacity-70">Reps</span>
              <input
                type="number"
                name="reps"
                className="input input-sm input-bordered"
                value={addForm.reps}
                min={1}
                onChange={handleAddFormChange}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold opacity-70">Weight (lbs)</span>
              <input
                type="number"
                name="weight"
                className="input input-sm input-bordered"
                value={addForm.weight}
                min={0}
                step={5}
                onChange={handleAddFormChange}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold opacity-70">Duration (min)</span>
              <input
                type="number"
                name="duration_minutes"
                className="input input-sm input-bordered"
                value={addForm.duration_minutes}
                min={0}
                step={5}
                onChange={handleAddFormChange}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold opacity-70">Notes</span>
            <input
              type="text"
              name="notes"
              className="input input-sm input-bordered"
              value={addForm.notes}
              onChange={handleAddFormChange}
              placeholder="Optional notes..."
            />
          </label>

          <div className="flex gap-2">
            <button
              className="btn btn-primary bg-blue-800 flex-1"
              onClick={handleAddExercise}
              disabled={addingExercise}
            >
              {addingExercise ? "Adding..." : "Confirm Add to Day"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowAddForm(false);
                setSelectedEx(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === "create" && (
        <form
          onSubmit={handleCreateExercise}
          className="flex flex-col gap-3 max-w-md"
        >
          <label className="label flex-col items-start gap-1">
            <span className="label-text font-semibold">Name *</span>
            <input
              className="input input-bordered w-full"
              type="text"
              name="name"
              value={newExercise.name}
              onChange={handleNewExChange}
              required
            />
          </label>

          <label className="label flex-col items-start gap-1">
            <span className="label-text font-semibold">Muscle Group</span>
            <input
              className="input input-bordered w-full"
              type="text"
              name="muscle_group"
              value={newExercise.muscle_group}
              onChange={handleNewExChange}
            />
          </label>

          <label className="label flex-col items-start gap-1">
            <span className="label-text font-semibold">Equipment</span>
            <input
              className="input input-bordered w-full"
              type="text"
              name="equipment"
              value={newExercise.equipment}
              onChange={handleNewExChange}
            />
          </label>

          <label className="label flex-col items-start gap-1">
            <span className="label-text font-semibold">Training Type</span>
            <input
              className="input input-bordered w-full"
              type="text"
              name="training_type"
              value={newExercise.training_type}
              onChange={handleNewExChange}
            />
          </label>

          <label className="label flex-col items-start gap-1">
            <span className="label-text font-semibold">Description</span>
            <textarea
              className="textarea textarea-bordered w-full"
              name="description"
              value={newExercise.description}
              onChange={handleNewExChange}
              rows={3}
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_public"
              checked={newExercise.is_public}
              onChange={handleNewExChange}
              className="checkbox"
            />
            <span className="label-text">Make public</span>
          </label>

          <button type="submit" className="btn btn-primary bg-blue-800">
            Create Exercise
          </button>
        </form>
      )}

      {view === "detail" && selectedEx && !showAddForm && (
        <div className="flex flex-col gap-4 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="bg-base-200 p-4 rounded-box flex flex-col gap-3">
                <h2 className="font-bold text-lg">Exercise Info</h2>

                {selectedEx.is_default === false || selectedEx.owner_id ? (
                  <>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold opacity-70">Name</span>
                      <input
                        className="input input-sm input-bordered"
                        name="name"
                        value={editForm?.name || ""}
                        onChange={handleEditFormChange}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold opacity-70">Muscle Group</span>
                      <input
                        className="input input-sm input-bordered"
                        name="muscle_group"
                        value={editForm?.muscle_group || ""}
                        onChange={handleEditFormChange}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold opacity-70">Equipment</span>
                      <input
                        className="input input-sm input-bordered"
                        name="equipment"
                        value={editForm?.equipment || ""}
                        onChange={handleEditFormChange}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold opacity-70">Training Type</span>
                      <input
                        className="input input-sm input-bordered"
                        name="training_type"
                        value={editForm?.training_type || ""}
                        onChange={handleEditFormChange}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold opacity-70">Description</span>
                      <textarea
                        className="textarea textarea-bordered"
                        name="description"
                        value={editForm?.description || ""}
                        onChange={handleEditFormChange}
                        rows={2}
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={editForm?.is_public || false}
                        onChange={handleEditFormChange}
                        className="checkbox checkbox-sm"
                      />
                      <span className="text-sm">Public</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-primary bg-blue-800"
                        onClick={handleUpdateExercise}
                      >
                        Save Changes
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={handleDeleteExercise}
                      >
                        Deactivate
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm flex flex-col gap-1">
                    <p><span className="font-semibold">Muscle Group:</span> {selectedEx.muscle_group || "—"}</p>
                    <p><span className="font-semibold">Equipment:</span> {selectedEx.equipment || "—"}</p>
                    <p><span className="font-semibold">Training Type:</span> {selectedEx.training_type || "—"}</p>
                    <p className="opacity-70 mt-1">{selectedEx.description || "No description."}</p>
                  </div>
                )}
              </div>

              {planId && dayId && (
                <button
                  className="btn btn-primary bg-blue-800"
                  onClick={() => setShowAddForm(true)}
                >
                  Add to Day
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BrowseExercises;