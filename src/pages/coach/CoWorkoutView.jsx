import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

function CoWorkoutView() {
  const { id } = useParams();
  const [workouts, setWorkouts] = useState(null);

  useEffect(() => {
    const fetchClientWorkouts = async () => {
      try {
        const res = await api.get(`/coach/clients/${id}/workouts/assigned`);
        console.log("CLIENT WORKOUTS:", res.data);
        setWorkouts(res.data);
      } catch (err) {
        console.error("Error fetching client workouts:", err.response?.data || err);
      }
    };

    fetchClientWorkouts();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Workout View</h1>

      {!workouts ? (
        <p>Loading workouts...</p>
      ) : (
        <pre className="bg-base-200 p-4 rounded">
          {JSON.stringify(workouts, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default CoWorkoutView;