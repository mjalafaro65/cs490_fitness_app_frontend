function BrowseExercises({ planId, dayId, onExerciseAdded, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await api.get("/workouts/exercises");
        setExercises(res.data.exercises);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchExercises();
  }, []);

  const fetchExerciseDetails = async (exerciseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/workouts/exercises/${exerciseId}`);
      setSelectedEx(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddExercise = async () => {
    if (!planId || !dayId || !selectedEx) return;

    try {
      const payload = {
        exercise_id: selectedEx.exercise_id,
        sets: 3,
        reps: 10,
        weight: 0,
        duration_minutes: 0,
        notes: "",
        sort_order: 0,
      };

      const res = await api.post(
        `/workouts/plans/${planId}/days/${dayId}/exercises`,
        payload
      );

      onExerciseAdded?.(res.data);
      setSelectedEx(null);
      onClose?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Browse Exercises</h1>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-2 gap-3">
        {exercises.map((ex) => (
          <div
            key={ex.exercise_id}
            className="p-3 bg-base-200 rounded cursor-pointer"
            onClick={() => fetchExerciseDetails(ex.exercise_id)}
          >
            <p className="font-bold">{ex.name}</p>
          </div>
        ))}
      </div>

      {selectedEx && (
        <div className="mt-4 p-4 bg-base-300 rounded">
          <h2 className="text-lg font-bold">{selectedEx.name}</h2>

          <p>{selectedEx.description}</p>

          <button
            className="btn btn-primary mt-3"
            onClick={handleAddExercise}
          >
            Add Exercise
          </button>
        </div>
      )}
    </div>
  );
}