import { useState, useEffect } from "react";
import "../../App.css";
import api from "../../axios";

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
  const [showPlansFilters, setShowPlansFilters] = useState(false);
  
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exercisesFilters, setExercisesFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: ""
  });
  const [showExercisesFilters, setShowExercisesFilters] = useState(false);

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
    } finally {
      setPlansLoading(false);
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
    setExercises([]);
  } finally {
    setExercisesLoading(false);
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

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">Workout Management</div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-1.5 text-sm rounded-md transition cursor-pointer ${
                activeTab === "plans"
                  ? "bg-blue-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => setActiveTab("exercises")}
              className={`px-4 py-1.5 text-sm rounded-md transition cursor-pointer ${
                activeTab === "exercises"
                  ? "bg-blue-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowPlansFilters(!showPlansFilters)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      {showPlansFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                    <button
                      onClick={clearPlansFilters}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {showPlansFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md">
                      <select
                        name="muscle_group"
                        value={plansFilters.muscle_group}
                        onChange={handlePlansFilterChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                      
                      <select
                        name="exercise_match"
                        value={plansFilters.exercise_match}
                        onChange={handlePlansFilterChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="any">Match Any Exercise</option>
                        <option value="all">Match All Exercises</option>
                      </select>
                    </div>
                  )}
                </div>

                {plansLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading plans...</div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No published plans found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <btn key={plan.plan_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                        <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        )}
                        <div className="flex gap-2 text-xs">
                          <btn className="btn btn-xs bg-red-600 text-white">Delete</btn>
                        </div>
                      </btn>
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowExercisesFilters(!showExercisesFilters)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      {showExercisesFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                    <button
                      onClick={clearExercisesFilters}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {showExercisesFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md">
                      <select
                        name="muscle_group"
                        value={exercisesFilters.muscle_group}
                        onChange={handleExercisesFilterChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
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
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="">All Training Types</option>
                        <option value="strength">Strength</option>
                        <option value="hypertrophy">Hypertrophy</option>
                        <option value="endurance">Endurance</option>
                        <option value="power">Power</option>
                        <option value="cardio">Cardio</option>
                      </select>
                    </div>
                  )}
                </div>

                {exercisesLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading exercises...</div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No exercises found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises.map((exercise) => (
                      <btn key={exercise.id || exercise.exercise_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                        <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2 text-xs">
                          {exercise.muscle_group && (
                            <span className="px-2 py-1 bg-yellow-100 text-gray-700 rounded">{exercise.muscle_group}</span>
                          )}
                          {exercise.equipment && (
                            <span className="px-2 py-1 bg-yellow-300 text-gray-700 rounded">{exercise.equipment}</span>
                          )}
                          {exercise.training_type && (
                            <span className="px-2 py-1 bg-yellow-500 text-gray-700 rounded">{exercise.training_type}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <btn className="btn btn-xs bg-red-600 text-white">Delete</btn>
                        </div>
                      </btn>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AWorkoutPlans;