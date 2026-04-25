import { useState, useEffect } from "react";
import api from "../axios.jsx";
import VisitorNavbar from "../components/VisitorNavbar.jsx";

function LandingExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: "",
    muscle_group: "",
    equipment: "",
    training_type: "",
  });

  const fetchExercises = async (params = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/workouts/exercises", { params });
      setExercises(res.data.exercises || res.data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoading(false);
    }
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

  const clearFilters = () => {
    setFilters({
      q: "",
      muscle_group: "",
      equipment: "",
      training_type: "",
    });

    fetchExercises();
  };

  return (
    <div>
      <VisitorNavbar />

      <h1 className="p-8 text-4xl font-bold mb-4">Exercise Library</h1>

      <form
        onSubmit={handleFilterSubmit}
        className="px-16 mb-8 flex flex-wrap gap-3"
      >
        <input
          type="text"
          placeholder="Search exercises..."
          className="input input-bordered flex-1 min-w-64"
          value={filters.q}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, q: e.target.value }))
          }
        />

        <input
          type="text"
          placeholder="Muscle group"
          className="input input-bordered w-full md:w-48"
          value={filters.muscle_group}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              muscle_group: e.target.value,
            }))
          }
        />

        <input
          type="text"
          placeholder="Equipment"
          className="input input-bordered w-full md:w-48"
          value={filters.equipment}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              equipment: e.target.value,
            }))
          }
        />

        <input
          type="text"
          placeholder="Training type"
          className="input input-bordered w-full md:w-48"
          value={filters.training_type}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              training_type: e.target.value,
            }))
          }
        />

        <button
          type="submit"
          className="btn btn-primary bg-blue-800 border-none"
        >
          Search
        </button>

        <button type="button" className="btn btn-ghost" onClick={clearFilters}>
          Clear
        </button>
      </form>

      {loading ? (
        <div className="px-16">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <p className="px-16 text-gray-500">No exercises found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-16 pb-10">
          {exercises.map((exercise) => (
            <div
              key={exercise.exercise_id}
              className="card bg-base-100 shadow-xl border border-base-300"
            >
              <div className="card-body">
                <h2 className="card-title text-lg">{exercise.name}</h2>

                <div className="flex flex-wrap gap-2 my-2">
                  <span className="badge badge-primary">
                    {exercise.muscle_group}
                  </span>

                  <span className="badge badge-outline">
                    {exercise.equipment}
                  </span>

                  <span className="badge badge-outline">
                    {exercise.training_type}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {exercise.description || "No description available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LandingExercises;