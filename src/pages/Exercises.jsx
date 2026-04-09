import { useState, useEffect } from "react";
import api from "../axios";

function BrowseExercises() {
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const response = await api.get("/workouts/exercises");
        setExercises(response.data);
      } catch (err) {
        console.error("Error fetching exercises:", err.response?.data || err);
      }
      setLoading(false);
    };

    fetchExercises();
  }, []);


  const fetchExerciseDetails = async (exercise_id) => {
    setLoading(true);
    try {
      const response = await api.get(`/workouts/exercises/${exercise_id}`);
      setSelectedEx(response.data);
    } catch (err) {
      console.error("Error fetching exercise details:", err.response?.data || err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Browse Exercises</h1>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="card bg-base-300 p-4 rounded-box shadow cursor-pointer hover:bg-base-200 transition"
            onClick={() => fetchExerciseDetails(ex.id)}
          >
            <h2 className="text-lg font-bold">{ex.name}</h2>
            <p className="text-sm opacity-70">{ex.muscle_group || "Muscle group not specified"}</p>
          </div>
        ))}
      </div>

      {selectedEx && (
        <div className="card bg-base-100 p-6 rounded-box shadow mt-6">
          <h2 className="text-xl font-bold mb-2">{selectedEx.name}</h2>
          <p className="mb-2">{selectedEx.description || "No description available."}</p>
          <div className="text-sm opacity-70">
            <p>Muscle Group: {selectedEx.muscle_group || "N/A"}</p>
            <p>Equipment: {selectedEx.equipment || "N/A"}</p>
            <p>Training Type: {selectedEx.training_type || "N/A"}</p>
          </div>
          <button
            className="btn btn-sm btn-secondary mt-4"
            onClick={() => setSelectedEx(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default BrowseExercises;