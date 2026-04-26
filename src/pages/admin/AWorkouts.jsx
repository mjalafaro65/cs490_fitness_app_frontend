import { useState, useEffect } from "react";
import api from "../../axios";
import Alert from "../../components/Alert.jsx";
import PopUp from "../../components/PopUp";

function AWorkoutPlans() {
  const [activeTab, setActiveTab] = useState("plans");
  
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansFilters, setPlansFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
    exercise_ids: "",
    exercise_match: "any"
  });
  
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exercisesFilters, setExercisesFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: ""
  });
  const [showExercisesFilters, setShowExercisesFilters] = useState(false);
  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  // Popup states
  const [popOpen, setPopOpen] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form states
  const [editPlanData, setEditPlanData] = useState({
    name: "",
    description: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
    is_public: true
  });
  
  const [editExerciseData, setEditExerciseData] = useState({
    name: "",
    description: "",
    muscle_group: "",
    equipment: "",
    training_type: ""
  });

  const showAlert = (message, type = 'success') => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const params = {};
      if (plansFilters.q) params.q = plansFilters.q;
      if (plansFilters.muscle_group) params.muscle_group = plansFilters.muscle_group;
      if (plansFilters.equipment) params.equipment = plansFilters.equipment;
      if (plansFilters.training_type) params.training_type = plansFilters.training_type;
      if (plansFilters.exercise_ids) params.exercise_ids = plansFilters.exercise_ids;
      if (plansFilters.exercise_match) params.exercise_match = plansFilters.exercise_match;
      
      const response = await api.get("/workouts/plans/browse", { params });
      console.log("Published Plans:", response.data);
      setPlans(response.data.plans || response.data);
    } catch (err) {
      console.error("Failed to fetch plans:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to fetch plans", "error");
    } finally {
  PlansLoading(false);
    }
  };

  const fetchExercises = async () => {
    setExercisesLoading(true);
    try {
      const params = {};
      if (exercisesFilters.q) params.q = exercisesFilters.q;
      if (exercisesFilters.muscle_group) params.muscle_group = exercisesFilters.muscle_group;
      if (exercisesFilters.equipment) params.equipment = exercisesFilters.equipment;
      if (exercisesFilters.training_type) params.training_type = exercisesFilters.training_type;
      
      const response = await api.get("/workouts/exercises", { params });
      console.log("Exercises response:", response.data);
      
      let exercisesArray = [];
      if (Array.isArray(response.data)) {
        exercisesArray = response.data;
      } else if (response.data.exercises && Array.isArray(response.data.exercises)) {
        exercisesArray = response.data.exercises;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        exercisesArray = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        exercisesArray = response.data.items;
      } else {
        exercisesArray = [];
      }
      
      setExercises(exercisesArray);
    } catch (err) {
      console.error("Failed to fetch exercises:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to fetch exercises", "error");
      setExercises([]);
    } finally {
      setExercisesLoading(false);
    }
  };

  const fetchExerciseDetails = async (exercise_id) => {
    setExercisesLoading(true);
    try {
      const response = await api.get(`/workouts/exercises/${exercise_id}`);
      console.log("Exercise details response:", response.data);
      
      return response.data;
    } catch (err) {
      console.error("Failed to fetch exercise details:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to fetch exercise details", "error");
      throw err;
    } finally {
      setExercisesLoading(false);
    }
  };

  const fetchPlanDetails = async (plan_id) => {
  setPlansLoading(true);
  try {
    const response = await api.get(`/workouts/plans/${plan_id}`);
    console.log("Plan details response:", response.data);
    
    return response.data;
  } catch (err) {
    console.error("Failed to fetch plan details:", err.response?.data || err);
    showAlert(err.response?.data?.message || "Failed to fetch plan details", "error");
    throw err;
  } finally {
    setPlansLoading(false);
  }
};


  useEffect(() => {
    if (activeTab === "plans") {
      fetchPlans();
    }
  }, [activeTab, plansFilters]);

  useEffect(() => {
    if (activeTab === "exercises") {
      fetchExercises();
    }
  }, [activeTab, exercisesFilters]);

  const handlePlansFilterChange = (e) => {
    const { name, value } = e.target;
    setPlansFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearPlansFilters = () => {
    setPlansFilters({
      q: "",
      muscle_group: "",
      equipment: "",
      training_type: "",
      exercise_ids: "",
      exercise_match: "any"
    });
  };

  const handleExercisesFilterChange = (e) => {
    const { name, value } = e.target;
    setExercisesFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearExercisesFilters = () => {
    setExercisesFilters({
      q: "",
      muscle_group: "",
      equipment: "",
      training_type: ""
    });
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setEditPlanData({
      name: plan.name || "",
      description: plan.description || "",
      muscle_group: plan.muscle_group || "",
      equipment: plan.equipment || "",
      training_type: plan.training_type || ""
    });
    setIsEditing(true);
    setPopOpen("editPlan");
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workouts/plans/${selectedPlan.plan_id}`, editPlanData);
      showAlert(`Plan "${editPlanData.name}" updated successfully`, "success");
      setPopOpen(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to update plan:", err);
      showAlert(err.response?.data?.message || "Failed to update plan", "error");
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (window.confirm(`Are you sure you want to delete "${planName}"?`)) {
      try {
        await api.delete(`/workouts/plans/${planId}`);
        showAlert(`Plan "${planName}" deleted successfully`, "success");
        setPopOpen(null);
        fetchPlans();
      } catch (err) {
        console.error("Failed to delete plan:", err);
        showAlert(err.response?.data?.message || "Failed to delete plan", "error");
      }
    }
  };

const handleViewExercise = async (exercise) => {
  try {
    const exerciseId = exercise.id || exercise.exercise_id;
    const freshExerciseData = await fetchExerciseDetails(exerciseId);
    setSelectedExercise(freshExerciseData);
    setEditExerciseData({
      name: freshExerciseData.name || "",
      description: freshExerciseData.description || "",
      muscle_group: freshExerciseData.muscle_group || "",
      equipment: freshExerciseData.equipment || "",
      training_type: freshExerciseData.training_type || ""
    });
    setIsEditing(false);
    setPopOpen("viewExercise");
  } catch (err) {
    console.error("Failed to load exercise details:", err);
  }
};

const handleViewPlan = async (plan) => {
  try {
    const freshPlanData = await fetchPlanDetails(plan.plan_id);
    setSelectedPlan(freshPlanData);
    setEditPlanData({
      name: freshPlanData.name || "",
      description: freshPlanData.description || "",
      muscle_group: freshPlanData.muscle_group || "",
      equipment: freshPlanData.equipment || "",
      training_type: freshPlanData.training_type || "",
      is_public: freshPlanData.is_public ?? true
    });
    setIsEditing(false);
    setPopOpen("viewPlan");
  } catch (err) {
    console.error("Failed to load plan details:", err);
  }
};

  const handleEditExercise = (exercise) => {
    setSelectedExercise(exercise);
    setEditExerciseData({
      name: exercise.name || "",
      description: exercise.description || "",
      muscle_group: exercise.muscle_group || "",
      equipment: exercise.equipment || "",
      training_type: exercise.training_type || ""
    });
    setIsEditing(true);
    setPopOpen("editExercise");
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workouts/exercises/${selectedExercise.id || selectedExercise.exercise_id}`, editExerciseData);
      showAlert(`Exercise "${editExerciseData.name}" updated successfully`, "success");
      setPopOpen(null);
      fetchExercises();
    } catch (err) {
      console.error("Failed to update exercise:", err);
      showAlert(err.response?.data?.message || "Failed to update exercise", "error");
    }
  };

  const handleDeleteExercise = async (exerciseId, exerciseName) => {
    if (window.confirm(`Are you sure you want to delete "${exerciseName}"?`)) {
      try {
        await api.delete(`/workouts/exercises/${exerciseId}`);
        showAlert(`Exercise "${exerciseName}" deleted successfully`, "success");
        setPopOpen(null);
        fetchExercises();
      } catch (err) {
        console.error("Failed to delete exercise:", err);
        showAlert(err.response?.data?.message || "Failed to delete exercise", "error");
      }
    }
  };

  const closePopUp = () => {
    setPopOpen(null);
    setSelectedPlan(null);
    setSelectedExercise(null);
    setIsEditing(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">Workout Management</div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("plans")}
              className={`btn btn-sm ${activeTab === "plans" ? "btn-primary" : "btn-ghost"}`}
            >
              Plans
            </button>
            <button
              onClick={() => setActiveTab("exercises")}
              className={`btn btn-sm ${activeTab === "exercises" ? "btn-primary" : "btn-ghost"}`}
            >
              Exercises
            </button>
          </div>
          
          <div className="mt-4">
            {activeTab === "plans" && (
              <div>
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search plans by name..."
                      value={plansFilters.q}
                      onChange={handlePlansFilterChange}
                      className="input input-bordered flex-1"
                    />
                    <button
                      onClick={clearPlansFilters}
                      className="btn btn-ghost btn-sm"
                    >
                      Clear
                    </button>
                  </div>
              {/*
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-base-200 rounded-box">
                    <select
                      name="muscle_group"
                      value={plansFilters.muscle_group}
                      onChange={handlePlansFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Muscle Groups</option>
                      <option value="chest">Chest</option>
                      <option value="back">Back</option>
                      <option value="shoulders">Shoulders</option>
                      <option value="legs">Legs</option>
                      <option value="arms">Arms</option>
                      <option value="core">Core</option>
                      <option value="cardio">Cardio</option>
                    </select>
                    
                    <select
                      name="equipment"
                      value={plansFilters.equipment}
                      onChange={handlePlansFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Equipment</option>
                      <option value="barbell">Barbell</option>
                      <option value="dumbbell">Dumbbell</option>
                      <option value="machine">Machine</option>
                      <option value="cables">Cables</option>
                      <option value="bodyweight">Bodyweight</option>
                      <option value="bands">Bands</option>
                      <option value="kettlebell">Kettlebell</option>
                    </select>
                    
                    <select
                      name="training_type"
                      value={plansFilters.training_type}
                      onChange={handlePlansFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Training Types</option>
                      <option value="strength">Strength</option>
                      <option value="hypertrophy">Hypertrophy</option>
                      <option value="endurance">Endurance</option>
                      <option value="power">Power</option>
                      <option value="cardio">Cardio</option>
                    </select>
                    
                    <input
                      type="text"
                      name="exercise_ids"
                      placeholder="Exercise IDs (comma-separated)"
                      value={plansFilters.exercise_ids}
                      onChange={handlePlansFilterChange}
                      className="input input-bordered input-sm"
                    />
                    
                    <select
                      name="exercise_match"
                      value={plansFilters.exercise_match}
                      onChange={handlePlansFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="any">Match Any Exercise</option>
                      <option value="all">Match All Exercises</option>
                    </select>
                    
                  </div>
                  */}
                </div>

                {plansLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm opacity-70 mt-2">Loading plans...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8 opacity-50">No published plans found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div 
                        key={plan.plan_id} 
                        className="card bg-base-300 rounded-box p-4 hover:shadow-lg transition cursor-pointer"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-sm opacity-70 mb-3 line-clamp-2">{plan.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "exercises" && (
              <div>
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search exercises..."
                      value={exercisesFilters.q}
                      onChange={handleExercisesFilterChange}
                      className="input input-bordered flex-1"
                    />
                    <button
                      onClick={clearExercisesFilters}
                      className="btn btn-ghost btn-sm"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-base-200 rounded-box">
                    <select
                      name="muscle_group"
                      value={exercisesFilters.muscle_group}
                      onChange={handleExercisesFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Muscle Groups</option>
                      <option value="chest">Chest</option>
                      <option value="back">Back</option>
                      <option value="shoulders">Shoulders</option>
                      <option value="legs">Legs</option>
                      <option value="arms">Arms</option>
                      <option value="core">Core</option>
                      <option value="cardio">Cardio</option>
                    </select>
                    
                    <select
                      name="equipment"
                      value={exercisesFilters.equipment}
                      onChange={handleExercisesFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Equipment</option>
                      <option value="barbell">Barbell</option>
                      <option value="dumbbell">Dumbbell</option>
                      <option value="machine">Machine</option>
                      <option value="cables">Cables</option>
                      <option value="bodyweight">Bodyweight</option>
                      <option value="bands">Bands</option>
                      <option value="kettlebell">Kettlebell</option>
                    </select>
                    
                    <select
                      name="training_type"
                      value={exercisesFilters.training_type}
                      onChange={handleExercisesFilterChange}
                      className="select select-bordered select-sm"
                    >
                      <option value="">All Training Types</option>
                      <option value="strength">Strength</option>
                      <option value="hypertrophy">Hypertrophy</option>
                      <option value="endurance">Endurance</option>
                      <option value="power">Power</option>
                      <option value="cardio">Cardio</option>
                    </select>
                  </div>
                </div>

                {exercisesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm opacity-70 mt-2">Loading exercises...</p>
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-8 opacity-50">No exercises found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises.map((exercise) => (
                      <div 
                        key={exercise.id || exercise.exercise_id} 
                        className="card bg-base-300 rounded-box p-4 hover:shadow-lg transition cursor-pointer"
                        onClick={() => handleViewExercise(exercise)}
                      >
                        <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
                        {exercise.description && (
                          <p className="text-sm opacity-70 mb-3 line-clamp-2">{exercise.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exercise.muscle_group && (
                            <span className="badge badge-primary badge-sm">{exercise.muscle_group}</span>
                          )}
                          {exercise.equipment && (
                            <span className="badge badge-secondary badge-sm">{exercise.equipment}</span>
                          )}
                          {exercise.training_type && (
                            <span className="badge badge-accent badge-sm">{exercise.training_type}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
{/* View Plan Popup - Enhanced */}
<PopUp isOpen={popOpen === "viewPlan"} onClose={closePopUp}>
  <div className="card bg-base-200 border-base-300 border p-6 rounded-box w-full max-w-2xl max-h-[80vh] overflow-y-auto">
    <h2 className="text-xl font-bold mb-4">Plan Details</h2>
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-base-300">
        <div>
          <span className="font-semibold opacity-70 text-sm">Name:</span>
          <p className="font-medium mt-1">{selectedPlan?.name}</p>
        </div>
        <div>
          <span className="font-semibold opacity-70 text-sm">Plan ID:</span>
          <p className="font-medium mt-1">{selectedPlan?.plan_id}</p>
        </div>
      </div>

      <div className="pb-3 border-b border-base-300">
        <span className="font-semibold opacity-70 text-sm">Description:</span>
        <p className="mt-1">{selectedPlan?.description || "N/A"}</p>
      </div>

      {/* Owner Info */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-base-300">
        <div>
          <span className="font-semibold opacity-70 text-sm">Owner:</span>
          <p className="mt-1">{selectedPlan?.owner_name || "N/A"}</p>
        </div>
        <div>
          <span className="font-semibold opacity-70 text-sm">Public Status:</span>
          <p className="mt-1">
            <span className={`badge ${selectedPlan?.is_public ? 'badge-success' : 'badge-warning'} badge-sm`}>
              {selectedPlan?.is_public ? 'Public' : 'Private'}
            </span>
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="grid grid-cols-3 gap-3 pb-3 border-b border-base-300">
        <div>
          <span className="font-semibold opacity-70 text-sm">Muscle Group:</span>
          <div className="mt-1">
            <span className="badge badge-primary badge-sm">{selectedPlan?.muscle_group || "N/A"}</span>
          </div>
        </div>
        <div>
          <span className="font-semibold opacity-70 text-sm">Equipment:</span>
          <div className="mt-1">
            <span className="badge badge-secondary badge-sm">{selectedPlan?.equipment || "N/A"}</span>
          </div>
        </div>
        <div>
          <span className="font-semibold opacity-70 text-sm">Training Type:</span>
          <div className="mt-1">
            <span className="badge badge-accent badge-sm">{selectedPlan?.training_type || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Days/Workouts Section */}
      {selectedPlan?.days && selectedPlan.days.length > 0 && (
        <div className="pb-3">
          <span className="font-semibold opacity-70 text-sm block mb-2">
            Workout Days ({selectedPlan.days.length}):
          </span>
          <div className="space-y-3">
            {selectedPlan.days.map((day, index) => (
              <div key={day.plan_day_id || index} className="bg-base-300 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">
                    Day {index + 1}: {day.day_label || `Day ${index + 1}`}
                  </h4>
                  {day.day_of_week && (
                    <span className="badge badge-ghost badge-xs">
                      {day.day_of_week}
                    </span>
                  )}
                </div>
                
                {day.exercises && day.exercises.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs opacity-70">Exercises:</span>
                    <ul className="mt-1 space-y-1">
                      {day.exercises.map((exercise, exIndex) => (
                        <li key={exIndex} className="text-xs ml-2">
                          • {exercise.exercise?.name || exercise.name || `Exercise ${exIndex + 1}`}
                          {exercise.sets && exercise.reps && (
                            <span className="opacity-70 ml-1">
                              ({exercise.sets} × {exercise.reps})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <span className="font-semibold opacity-70 text-sm">Created:</span>
          <p className="text-xs opacity-60 mt-1">
            {selectedPlan?.created_at ? new Date(selectedPlan.created_at).toLocaleDateString() : "N/A"}
          </p>
        </div>
        <div>
          <span className="font-semibold opacity-70 text-sm">Last Updated:</span>
          <p className="text-xs opacity-60 mt-1">
            {selectedPlan?.updated_at ? new Date(selectedPlan.updated_at).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex gap-2 mt-6">
      <button 
        onClick={() => {
          closePopUp();
          handleEditPlan(selectedPlan);
        }} 
        className="btn btn-primary flex-1"
      >
        Edit Plan
      </button>
      <button 
        onClick={() => {
          if (window.confirm(`Are you sure you want to delete "${selectedPlan?.name}"?`)) {
            handleDeletePlan(selectedPlan?.plan_id, selectedPlan?.name);
          }
        }} 
        className="btn btn-error flex-1"
      >
        Delete Plan
      </button>
      <button onClick={closePopUp} className="btn btn-ghost">
        Close
      </button>
    </div>
  </div>
</PopUp>

{/* Edit Plan Popup - Enhanced */}
<PopUp isOpen={popOpen === "editPlan"} onClose={closePopUp}>
  <form onSubmit={handleUpdatePlan} className="card bg-base-200 border-base-300 border p-6 rounded-box w-full max-w-2xl max-h-[80vh] overflow-y-auto">
    <h2 className="text-xl font-bold mb-4">Edit Plan</h2>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label font-semibold opacity-70 text-sm">Plan Name *</label>
          <input
            type="text"
            value={editPlanData.name}
            onChange={(e) => setEditPlanData({...editPlanData, name: e.target.value})}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label font-semibold opacity-70 text-sm">Owner</label>
          <input
            type="text"
            value={selectedPlan?.owner_name || ""}
            className="input input-bordered w-full bg-base-300"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="label font-semibold opacity-70 text-sm">Description</label>
        <textarea
          value={editPlanData.description}
          onChange={(e) => setEditPlanData({...editPlanData, description: e.target.value})}
          className="textarea textarea-bordered w-full"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label font-semibold opacity-70 text-sm">Muscle Group</label>
          <select
            value={editPlanData.muscle_group}
            onChange={(e) => setEditPlanData({...editPlanData, muscle_group: e.target.value})}
            className="select select-bordered w-full"
          >
            <option value="">Select Muscle Group</option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="shoulders">Shoulders</option>
            <option value="legs">Legs</option>
            <option value="arms">Arms</option>
            <option value="core">Core</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
        
        <div>
          <label className="label font-semibold opacity-70 text-sm">Equipment</label>
          <select
            value={editPlanData.equipment}
            onChange={(e) => setEditPlanData({...editPlanData, equipment: e.target.value})}
            className="select select-bordered w-full"
          >
            <option value="">Select Equipment</option>
            <option value="barbell">Barbell</option>
            <option value="dumbbell">Dumbbell</option>
            <option value="machine">Machine</option>
            <option value="cables">Cables</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="bands">Bands</option>
            <option value="kettlebell">Kettlebell</option>
          </select>
        </div>
        
        <div>
          <label className="label font-semibold opacity-70 text-sm">Training Type</label>
          <select
            value={editPlanData.training_type}
            onChange={(e) => setEditPlanData({...editPlanData, training_type: e.target.value})}
            className="select select-bordered w-full"
          >
            <option value="">Select Training Type</option>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
            <option value="power">Power</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label font-semibold opacity-70 text-sm">Public Status</label>
          <select
            value={editPlanData.is_public}
            onChange={(e) => setEditPlanData({...editPlanData, is_public: e.target.value === "true"})}
            className="select select-bordered w-full"
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
      </div>

      {selectedPlan?.days && selectedPlan.days.length > 0 && (
        <div>
          <label className="label font-semibold opacity-70 text-sm">
            Workout Days ({selectedPlan.days.length})
          </label>
          <div className="text-sm opacity-70 bg-base-300 rounded-lg p-3">
            <p>This plan has {selectedPlan.days.length} workout day(s).</p>
            <p className="text-xs mt-1">To modify workouts, please use the workout management section.</p>
          </div>
        </div>
      )}
    </div>
    
    <div className="flex gap-2 mt-6">
      <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
      <button type="button" onClick={closePopUp} className="btn btn-ghost flex-1">Cancel</button>
    </div>
  </form>
</PopUp>

      {/* View Exercise Popup */}
      <PopUp isOpen={popOpen === "viewExercise"} onClose={closePopUp}>
        <div className="card bg-base-200 border-base-300 border p-6 rounded-box w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Exercise Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-base-300 pb-2">
              <span className="font-semibold opacity-70">Name:</span>
              <span className="font-medium">{selectedExercise?.name}</span>
            </div>
            <div className="flex justify-between border-b border-base-300 pb-2">
              <span className="font-semibold opacity-70">Description:</span>
              <span className="font-medium">{selectedExercise?.description || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-base-300 pb-2">
              <span className="font-semibold opacity-70">Muscle Group:</span>
              <span className="badge badge-primary badge-sm">{selectedExercise?.muscle_group || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-base-300 pb-2">
              <span className="font-semibold opacity-70">Equipment:</span>
              <span className="badge badge-secondary badge-sm">{selectedExercise?.equipment || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-base-300 pb-2">
              <span className="font-semibold opacity-70">Training Type:</span>
              <span className="badge badge-accent badge-sm">{selectedExercise?.training_type || "N/A"}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => {
              closePopUp();
              handleEditExercise(selectedExercise);
            }} className="btn btn-primary flex-1">
              Edit
            </button>
            <button onClick={() => {
              handleDeleteExercise(selectedExercise);
            }} className="btn bg-red-600 flex-1">
              Delete
            </button>
          </div>
        </div>
      </PopUp>

      {/* Edit Exercise Popup */}
      <PopUp isOpen={popOpen === "editExercise"} onClose={closePopUp}>
        <form onSubmit={handleUpdateExercise} className="card bg-base-200 border-base-300 border p-6 rounded-box w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Exercise</h2>
          <div className="space-y-3">
            <div>
              <label className="label font-semibold opacity-70">Name</label>
              <input
                type="text"
                value={editExerciseData.name}
                onChange={(e) => setEditExerciseData({...editExerciseData, name: e.target.value})}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label font-semibold opacity-70">Description</label>
              <textarea
                value={editExerciseData.description}
                onChange={(e) => setEditExerciseData({...editExerciseData, description: e.target.value})}
                className="textarea textarea-bordered w-full"
                rows="3"
              />
            </div>
            <div>
              <label className="label font-semibold opacity-70">Muscle Group</label>
              <select
                value={editExerciseData.muscle_group}
                onChange={(e) => setEditExerciseData({...editExerciseData, muscle_group: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="">Select Muscle Group</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="shoulders">Shoulders</option>
                <option value="legs">Legs</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
            <div>
              <label className="label font-semibold opacity-70">Equipment</label>
              <select
                value={editExerciseData.equipment}
                onChange={(e) => setEditExerciseData({...editExerciseData, equipment: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="">Select Equipment</option>
                <option value="barbell">Barbell</option>
                <option value="dumbbell">Dumbbell</option>
                <option value="machine">Machine</option>
                <option value="cables">Cables</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="bands">Bands</option>
                <option value="kettlebell">Kettlebell</option>
              </select>
            </div>
            <div>
              <label className="label font-semibold opacity-70">Training Type</label>
              <select
                value={editExerciseData.training_type}
                onChange={(e) => setEditExerciseData({...editExerciseData, training_type: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="">Select Training Type</option>
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="endurance">Endurance</option>
                <option value="power">Power</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
            <button type="button" onClick={closePopUp} className="btn btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      </PopUp>

      <Alert 
        isOpen={alert} 
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default AWorkoutPlans;