import { useState, useEffect } from "react";
import api from "../axios";
import "../App.css";

function BrowsePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
    exercise_ids: "",
    exercise_match: "any",
  });

  // Fetch plans
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
      setPlans(response.data);
    } catch (err) {
      console.error("Error fetching plans:", err.response?.data || err);
    }

    setLoading(false);
  };

  // Run once on load
  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle input changes
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

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPlans();
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Browse Workout Plans</h1>

      {/* FILTER FORM */}
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

      {/* RESULTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.length === 0 ? (
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

                <button className="btn btn-sm btn-primary mt-3">
                  View Plan
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BrowsePlans;