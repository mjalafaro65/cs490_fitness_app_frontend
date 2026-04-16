import { useState, useEffect } from "react";
import api from "../axios";
import "../App.css";
import PopUp from "../components/PopUp";
import { useNavigate } from "react-router-dom";

function BrowsePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [pop, setPopOpen] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [copyingPlanId, setCopyingPlanId] = useState(null); 
  const navigate = useNavigate();


  const [filters, setFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
    exercise_ids: "",
    exercise_match: "any",
  });

  const fetchPlanDetails = async (planId) => {
    setLoadingPlans(true);
    try {
      const response = await api.get(`/workouts/plans/${planId}`);
      console.log("Full plan:", response.data);

      setSelectedPlan(response.data);
    } catch (err) {
      console.error("Error fetching plan details:", err);
    }
    setLoadingPlans(false);
  };
    const handleCopyPlan = async (planId, planName) => {
      setCopyingPlanId(planId);
    try {
      const customName = prompt("Enter a name for your copy (or leave blank to use default):", `${planName} (Copy)`);
      

      if (customName === null) {
        setCopyingPlanId(null); 
        return;
      }
      
      const response = await api.post(`/workouts/plans/${planId}/copy`, {
        name: customName || `${planName} (Copy)`
      });
      
      console.log("Plan copied:", response.data);
      
      alert(`Plan "${planName}" has been copied to your workouts!`);
      const goToPlans = confirm("Would you like to view your workout plans?");
      if (goToPlans) {
        navigate("/client/workout-plans");
      }
      
    } catch (err) {
      console.error("Error copying plan:", err.response?.data || err);
      alert(`Failed to copy plan: ${err.response?.data?.message || "Unknown error"}`);
    } finally {
      setCopyingPlanId(null);
    }
  };

  const fetchPlans = async () => {
    setLoading(true);

    try {
      const response = await api.get("/workouts/plans/browse", {
        params: {
          ...(filters.q && { q: filters.q }),
          ...(filters.muscle_group && { muscle_group: filters.muscle_group }),
          ...(filters.equipment && { equipment: filters.equipment }),
          ...(filters.training_type && { training_type: filters.training_type }),
          ...(filters.exercise_ids && { exercise_ids: filters.exercise_ids }),
          ...(filters.exercise_match && { exercise_match: filters.exercise_match }),
        },
      });

      console.log("Plans:", response.data);
      setPlans(response.data.plans);
    } catch (err) {
      console.error("Error fetching plans:", err.response?.data || err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

    useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/client/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;

        console.log("Response data:", data);

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
      }
    }

    fetchUser();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPlans();
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="p-2 border-b border-base-300 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm normal-case"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Plans
          </button>
        </div>
      <h1 className="text-2xl font-bold">Browse Workout Plans</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 bg-base-200 p-4 rounded-box"
      >
        <input
          type="text"
          name="q"
          placeholder="Search plans..."
          className="input input-bordered"
          value={filters.q}
          onChange={handleChange}
        />

        <input
          type="text"
          name="muscle_group"
          placeholder="Muscle Group"
          className="input input-bordered"
          value={filters.muscle_group}
          onChange={handleChange}
        />

        <input
          type="text"
          name="equipment"
          placeholder="Equipment"
          className="input input-bordered"
          value={filters.equipment}
          onChange={handleChange}
        />

        <input
          type="text"
          name="training_type"
          placeholder="Training Type"
          className="input input-bordered"
          value={filters.training_type}
          onChange={handleChange}
        />

        <input
          type="text"
          name="exercise_ids"
          placeholder="Exercise IDs (1,2,3)"
          className="input input-bordered"
          value={filters.exercise_ids}
          onChange={handleChange}
        />

        <select
          name="exercise_match"
          className="select select-bordered"
          value={filters.exercise_match}
          onChange={handleChange}
        >
          <option value="any">Any</option>
          <option value="all">All</option>
        </select>

        <button className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!Array.isArray(plans) || plans.length === 0 ?  (
            <p>No plans found.</p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.plan_id}
                className="card bg-base-300 p-4 rounded-box shadow"
              >
                <h2 className="text-lg font-bold mb-2">
                  {plan.name || "Unnamed Plan"}
                </h2>

                <p className="text-sm opacity-70 mb-2">
                  {plan.description || "No description"}
                </p>

                <div className="text-xs opacity-60">
                  <p>Type: {plan.training_type || "N/A"}</p>
                  <p>Equipment: {plan.equipment || "N/A"}</p>
                  <p>Muscle: {plan.muscle_group || "N/A"}</p>
                </div>

                <button onClick={async () => {
                                setPopOpen(plan.plan_id);
                                setSelectedPlan(null);
                                await fetchPlanDetails(plan.plan_id);
          }} className="btn btn-sm btn-primary mt-3">
                  View Plan
                </button>

                <button 
                  onClick={() => handleCopyPlan(plan.plan_id, plan.name)} 
                  className="btn btn-sm btn-secondary mt-3 ml-2"
                  disabled={copyingPlanId === plan.plan_id}
                >
                  {copyingPlanId === plan.plan_id ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Copying...
                    </>
                  ) : (
                    "Copy to My Plans"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <PopUp isOpen={pop !== null} onClose={() => {
        setPopOpen(null);
        setSelectedPlan(null);
      }}>
        {loadingPlans ? (
        <p>Loading plan...</p>
      ) : selectedPlan ? (
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-1">
            {selectedPlan.name}
          </h2>

          <p className="text-sm opacity-60 mb-2">
            By {selectedPlan.owner_name || "Unknown"}
          </p>

          <p className="mb-4 opacity-70">
            {selectedPlan.description || "No description"}
          </p>

          {selectedPlan.days?.length > 0 ? (
            selectedPlan.days.map((day, index) => (
              <div key={index} className="mb-4 p-3 bg-base-200 rounded">
                <h3 className="font-bold mb-2">
                  {day.day_label || `Day ${index + 1}`}
                </h3>

                {day.session_time && (
                  <p className="text-xs opacity-60 mb-2">
                    Time: {day.session_time}
                  </p>
                )}

                {day.exercises?.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {day.exercises.map((ex, i) => (
            <li key={i} className="flex justify-between items-center">
              
              <span className="font-medium">
                {ex.exercise?.name || "Unknown Exercise"}
              </span>

              <div className="text-right opacity-70">
                <div>{ex.sets || "-"} x {ex.reps || "-"}</div>
                <div className="text-xs">
                  {ex.duration_minutes ? `${ex.duration_minutes} min` : ""}
                </div>
              </div>

            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-50">No exercises</p>
      )}
              </div>
            ))
          ) : (
            <p>No days in this plan.</p>
          )}
        </div>
      ) : (
        <p>No plan selected.</p>
      )}
      </PopUp>
    </div>
  );
}

export default BrowsePlans;