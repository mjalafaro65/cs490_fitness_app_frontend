import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../axios";
import Alert from "../../components/Alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

function ClientMealLogs() {
  const [isPopOpen, setPopOpen] = useState(null);
  const [isLargeOpen, setLargeOpen] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mealLogToDelete, setMealLogToDelete] = useState(null);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    let alertMessage = message;

    if (typeof message === 'object' && message !== null) {
      if (message.message) {
        alertMessage = message.message;
      } else if (message.status) {
        alertMessage = `${message.status}: ${message.code || 'Error'}`;
      } else {
        alertMessage = 'An error occurred';
      }
    }

    if (typeof message === 'string') {
      alertMessage = message;
    }

    console.log("ALERT FUNCTION CALLED with:", alertMessage, type);
    setAlertMsg(alertMessage);
    setAlertType(type);
    setShowAlert(true);
  };

  const [logData, setData] = useState({
    meal_id: "",
    servings: "",
    custom_meal_name: "",
    calories: "",
    notes: ""
  });

  const [newMeal, setNewMeal] = useState({
    name: "",
    description: ""
  });

  const [mealHistory, setMealHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedMealLog, setSelectedMealLog] = useState(null);
  const [editLogData, setEditLogData] = useState({
    custom_meal_name: "",
    servings: "",
    notes: "",
    calories:""
  });
  const [mealPlans, setMealPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const [nutritionInsights, setNutritionInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('daily');

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err);
      setUser(null);
      showAlert(err.response?.data?.message || "Failed to fetch user", "error");
    }
  };

  const fetchMealHistory = async () => {
    if (!user?.user_id) {
      showAlert("Please log in to view meal history", "error");
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await api.get("/nutrition/meal-logs");
      console.log("Meal history fetched:", response.data);
      setMealHistory(response.data || []);
    } catch (err) {
      console.error("Failed to fetch meal history:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch meal history";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchNutritionInsights = async () => {
    if (!user?.user_id) {
      //showAlert("Please log in to view nutrition insights", "error");
      return;
    }

    setIsLoadingInsights(true);
    try {
      const response = await api.get("/insights/nutrition");
      console.log("Nutrition insights fetched:", response.data);
      setNutritionInsights(response.data);
    } catch (err) {
      console.error("Failed to fetch nutrition insights:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch nutrition insights";
      //showAlert(errorMessage, "error");
      setNutritionInsights(null);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const fetchMealLogDetails = async (logId) => {
    try {
      const response = await api.get(`/nutrition/meal-logs/${logId}`);
      console.log("Meal log details:", response.data);
      setSelectedMealLog(response.data);

      setEditLogData({
        custom_meal_name: response.data.custom_meal_name || "", 
        servings: response.data.servings || "",
        notes: response.data.notes || "",
        calories: response.data.calories || ""
      });
      console.log(editLogData)
      setPopOpen("editLog");
    } catch (err) {
      console.error("Failed to fetch meal log details:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch meal log details";
      showAlert(errorMessage, "error");
    }
  };

  const updateMealLog = async (logId, updateData) => {
    try {
      console.log(updateData)
      const response = await api.patch(`/nutrition/meal-logs/${logId}`, updateData);
      console.log("Meal log updated:", response.data);
      showAlert("Meal log updated successfully!", "success");
      await fetchMealHistory();
      await fetchNutritionInsights();
      setSelectedMealLog(null);
      // setEditLogData({ servings: "", notes: "" , calories: ""});
      return response.data;
    } catch (err) {
      console.error("Failed to update meal log:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to update meal log";
      showAlert(errorMessage, "error");
      return null;
    }
  };

  const deleteMealLog = async (logId) => {
    if (!logId) {
      showAlert("No meal log selected to delete", "error");
      return false;
    }

    try {
      await api.delete(`/nutrition/meal-logs/${logId}`);
      console.log("Meal log deleted:", logId);
      showAlert("Meal log deleted successfully!", "success");
      await fetchMealHistory();
      await fetchNutritionInsights();
      setPopOpen(null);
      setMealLogToDelete(null);
      return true;
    } catch (err) {
      console.error("Failed to delete meal log:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to delete meal log";
      showAlert(errorMessage, "error");
      return false;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // if (!selectedMealLog) return;

    console.log(selectedMealLog.meal_log_id)
    const payload = {
      custom_meal_name: editLogData.custom_meal_name,
      servings: editLogData.servings,
      notes: editLogData.notes,
      calories: editLogData.calories,
    };

    // only include calories if you actually allow editing it
    // if (editLogData.calories !== undefined) {
    //   payload.calories = editLogData.calories;
    // }

    await updateMealLog(selectedMealLog.meal_log_id, payload);
    setPopOpen(null)
  };

  const openDeleteConfirm = (mealLog) => {
    setMealLogToDelete(mealLog);
    setPopOpen("delete");
  };

  const handleDeleteFromEdit = async () => {
    if (!selectedMealLog) return;
    const success = await deleteMealLog(selectedMealLog.meal_log_id);
    if (success) {
      setSelectedMealLog(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      fetchMealHistory();
      fetchNutritionInsights();
      fetchMealPlans();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMealPlanChange = (e) => {
    const { name, value } = e.target;
    setNewMeal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      meal_id: parseInt(logData.meal_id, 10),
      calories: parseFloat(logData.calories) || 0,
      servings: logData.servings ? parseFloat(logData.servings).toString() : "0",
      notes: logData.notes || "",
      custom_meal_name: logData.custom_meal_name || null,
    };

    if (logData.meal_id) {
        requestData.meal_id = parseInt(logData.meal_id, 10);
      }

    console.log("Sending request data:", requestData);
    try {
      const response = await api.post("/nutrition/meal-logs", requestData);

      console.log("SUCCESS:", response.data);
      setPopOpen(null);

      setData({
        user_id: user?.user_id || "",
        meal_id: "",
        calories: "",
        servings: "",
        notes: ""
      });

      showAlert("Meal logged successfully!", "success");


      await fetchMealHistory();
      await fetchNutritionInsights();

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.status || "Failed to log meal";
      showAlert(errorMessage, "error");
    }
  };

  const fetchMealPlans = async () => {
    if (!user?.user_id) {
      showAlert("Please log in to view meal plans", "error");
      return;
    }

    setIsLoadingPlans(true);
    try {
      const response = await api.get("/nutrition/mealplans");
      console.log("Meal plans fetched:", response.data);
      setMealPlans(response.data || []);
    } catch (err) {
      console.error("Failed to fetch meal plans:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch meal plans";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleCreateMealPlan = async (e) => {
    e.preventDefault();

    try {
      console.log("Creating meal plan:", newMeal);

      const response = await api.post("/nutrition/mealplans", newMeal);

      console.log("Meal plan created:", response.data);
      setPopOpen(null);

      setNewMeal({
        name: "",
        description: ""
      });

      showAlert("Meal plan created successfully!", "success");

      await fetchMealPlans();

    } catch (error) {
      console.error("Creation failed:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.status || "Failed to create meal plan";
      showAlert(errorMessage, "error");
    }
  };

  const prepareDailyData = () => {
    if (!nutritionInsights?.history) return [];
    return nutritionInsights.history.map(day => ({
      date: new Date(day.date || day.logged_at).toLocaleDateString(),
      calories: day.calories || 0,
      meals: 1
    }));
  };

  const prepareWeeklyData = () => {
    if (!nutritionInsights?.history) return [];
    return nutritionInsights.history.map((item, index) => ({
      week: `Day ${index + 1}`,
      calories: item.calories || 0,
      meals: 1
    }));
  };

  const COLORS = ['#0088FE', '#1e5376', '#73c7df', '#2780d3', '#4151b9', '#989ca7'];


  const renderNutritionInsights = () => {
  if (isLoadingInsights) {
    return (
      <div className="card bg-base-300 rounded-box p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 opacity-70">Loading nutrition insights...</p>
        </div>
      </div>
    );
  }

  if (!nutritionInsights) {
    return (
      <div className="card bg-base-300 rounded-box p-6">
        <div className="text-center py-8">
          <p className="opacity-70">No nutrition data available yet.</p>
          <p className="text-sm opacity-50 mt-2">Start logging meals to see your nutrition insights!</p>
        </div>
      </div>
    );
  }

  const summary = nutritionInsights.summary;
  const daysLogged = summary?.days_logged || 0;

  // Calculate totals from history
  const totalCalories = nutritionInsights.history?.reduce((sum, day) => sum + (day.calories || 0), 0) || 0;
  const totalCarbs = nutritionInsights.history?.reduce((sum, day) => sum + (day.carbs_g || 0), 0) || 0;
  const totalProtein = nutritionInsights.history?.reduce((sum, day) => sum + (day.protein_g || 0), 0) || 0;
  const totalFat = nutritionInsights.history?.reduce((sum, day) => sum + (day.fat_g || 0), 0) || 0;

  // Get latest day's data for macro breakdown (most recent log)
  const latestDay = nutritionInsights.history?.[nutritionInsights.history.length - 1];
  
  const macroData = latestDay ? [
    { name: 'Carbs', value: latestDay.carbs_g || 0, color: '#0088FE' },
    { name: 'Protein', value: latestDay.protein_g || 0, color: '#007cc4' },
    { name: 'Fat', value: latestDay.fat_g || 0, color: '#7b97d8' }
  ] : [];

  const COLORS = ['#0088FE', '#007cc4', '#7b97d8'];

  return (
    <div className="space-y-6">

      {/* Averages Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow-lg border border-base-500 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3 text-center">Average Carbs</h3>
          <p className="text-2xl font-bold text-center text-blue-800">
            {Math.round(summary?.avg_carbs_g || 0)}g
          </p>
          <p className="text-xs text-center opacity-60 mt-2">per day</p>
        </div>
        <div className="card bg-base-200 shadow-lg border border-base-500 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3 text-center">Average Protein</h3>
          <p className="text-2xl font-bold text-center text-blue-800">
            {Math.round(summary?.avg_protein_g || 0)}g
          </p>
          <p className="text-xs text-center opacity-60 mt-2">per day</p>
        </div>
        <div className="card bg-base-200 shadow-lg border border-base-500 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3 text-center">Average Fat</h3>
          <p className="text-2xl font-bold text-center text-blue-800">
            {Math.round(summary?.avg_fat_g || 0)}g
          </p>
          <p className="text-xs text-center opacity-60 mt-2">per day</p>
        </div>
      </div>

      {/* Macro Breakdown from Latest Day (Pie Chart) */}
      {macroData.length > 0 && macroData.some(m => m.value > 0) && (
        <div className="card bg-base-200 shadow-lg border border-base-500 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-center">Latest Day Macro Breakdown</h3>
          <p className="text-xs text-center opacity-60 mb-4">
            {latestDay?.date ? new Date(latestDay.date).toLocaleDateString() : 'Latest log'}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}g`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}g`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Daily Logs Table */}
      {nutritionInsights.history && nutritionInsights.history.length > 0 && (
        <div className="card bg-base-200 shadow-lg border border-base-500 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Daily Summary</h3>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Calories</th>
                  <th>Carbs (g)</th>
                  <th>Protein (g)</th>
                  <th>Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {[...nutritionInsights.history].reverse().slice(0, 7).map((day, idx) => (
                  <tr key={idx}>
                    <td>{new Date(day.date).toLocaleDateString()}</td>
                    <td className="font-semibold">{Math.round(day.calories || 0)}</td>
                    <td>{Math.round(day.carbs_g || 0)}</td>
                    <td>{Math.round(day.protein_g || 0)}</td>
                    <td>{Math.round(day.fat_g || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {nutritionInsights.history.length > 7 && (
            <p className="text-xs text-center opacity-50 mt-3">
              Showing last 7 days of {nutritionInsights.history.length} total
            </p>
          )}
        </div>
      )}
    </div>
  );
};

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Meal Plans</div>

          {/* Nutrition Insights Section
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nutrition Insights</h2>
            </div>
            {renderNutritionInsights()}
          </div> */}

          <div className="flex w-full gap-4 items-start">
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box flex-1 p-4 min-w-0">
              <h2 className="text-lg font-bold mb-2">Previously Logged Meals</h2>
              <div className="bg-base-200 rounded-box w-full">

                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 opacity-70">Loading meal history...</p>
                  </div>
                ) : mealHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="opacity-70">No meal logs found.</p>
                    <p className="text-sm opacity-50 mt-2">Click "Log Meals" to add your first meal log.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {mealHistory.map((meal) => (
                      <div
                        key={meal.meal_log_id}
                        className="border rounded-lg p-4 bg-base-100 hover:bg-base-200 transition cursor-pointer"
                        onClick={() => fetchMealLogDetails(meal.meal_log_id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">
                              Meal Name: {meal.custom_meal_name}
                            </p>
                            <p className="text-md mt-1">
                              Servings: {meal.servings}
                            </p>
                            {meal.notes && (
                              <p className="text-sm opacity-70 mt-2">
                                Notes: {meal.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary bg-blue-800 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchMealLogDetails(meal.meal_log_id);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm bg-red-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteConfirm(meal);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box flex-1 p-4 min-w-0">
              <h2 className="text-lg font-bold mb-2">Meal Plans Listing</h2>
              <div className="bg-base-200 rounded-box w-full">
                {isLoadingPlans ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 opacity-70">Loading meal plans...</p>
                  </div>
                ) : mealPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="opacity-70">No meal plans found.</p>
                    <p className="text-sm opacity-50 mt-2">Click "Create New" to add your first meal plan.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto p-4">
                    {mealPlans.map((plan) => (
                      <div 
                        key={plan.meal_plan_id} 
                        className="border rounded-lg p-4 bg-base-100 hover:bg-base-200 transition cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">
                              {plan.name}
                            </p>
                            {plan.description && (
                              <p className="text-sm opacity-70 mt-2">
                                {plan.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-sm btn-primary bg-blue-800 text-white"
                              onClick={() => {
                                console.log("Edit meal plan:", plan);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm bg-red-600 text-white"
                              onClick={() => {
                                console.log("Delete meal plan:", plan);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> */}
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box w-64 p-4 shrink-0">
              <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
              <div className="mt-auto flex flex-col gap-2 justify-center">
                {/* <button className="btn btn-primary text-white bg-blue-800 btn-sm" type="button" onClick={() => setPopOpen("create")}>Create New</button> */}
                <button type="button" className="btn btn-primary text-white bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("log")}>Log Meals</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PopUp isOpen={isPopOpen !== null} onClose={() => setPopOpen(null)}>
        {isPopOpen === "create" && (
          <form onSubmit={handleCreateMealPlan}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
              <h2 className="text-xl font-bold mb-4">Create New Meal Plan</h2>
              <label className="label">
                Name:
                <input className="input w-full" type="text" name="name" value={newMeal.name} onChange={handleMealPlanChange} required />
              </label>
              <label className="label">
                Description:
                <textarea className="textarea w-full" name="description" value={newMeal.description} onChange={handleMealPlanChange} rows="3" />
              </label>
              <button className="btn btn-primary bg-blue-800 w-full mt-4" type="submit">Create</button>
            </fieldset>
          </form>
        )}

        {isPopOpen === "log" && (
          <form onSubmit={handleLogSubmit}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
              <h2 className="text-xl font-bold mb-4">Log Meal</h2>
              {/* <label className="label">
                Meal ID:
                <input className="input w-full" type="number" name="meal_id" value={logData.meal_id} onChange={handleChange} required />
              </label> */}
              <label className="label">
                Meal Name:
                <input
                  className="input w-full"
                  type="text"
                  name="custom_meal_name"
                  value={logData.custom_meal_name}
                  onChange={handleChange}
                />
              </label>
              <label className="label">
                Servings:
                <input className="input w-full" type="number" step="0.5" name="servings" value={logData.servings} onChange={handleChange} required />
              </label>
              <label className="label">
                Calories:
                <input className="input w-full" type="number" name="calories" value={logData.calories} onChange={handleChange} />
              </label>
              <label className="label">
                Notes:
                <textarea className="textarea w-full" name="notes" value={logData.notes} onChange={handleChange} rows="3" />
              </label>
              <button className="btn btn-primary bg-blue-800 w-full mt-4" type="submit">Log</button>
            </fieldset>
          </form>
        )}

        {isPopOpen === "editLog" && selectedMealLog && (
          <form onSubmit={handleEditSubmit}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Meal Log</h2>
              </div>
              <label className="label">
                Meal Name:
                <input
                  className="input w-full"
                  type="text"
                  name="custom_meal_name"
                  value={editLogData.custom_meal_name}
                  onChange={(e) => setEditLogData({ ...editLogData, custom_meal_name: e.target.value })}
                  required
                />
              </label>

              <label className="label">
                Servings:
                <input
                  className="input w-full"
                  type="number"
                  step="0.5"
                  name="servings"
                  value={editLogData.servings}
                  onChange={(e) => setEditLogData({ ...editLogData, servings: e.target.value })}
                  required
                />
              </label>


              <label className="label">
                Calories:
                <input
                  className="input w-full"
                  type="number"
                  name="calories"
                  value={editLogData.calories}
                  onChange={(e) =>
                    setEditLogData({ ...editLogData, calories: e.target.value })
                  }
                />
              </label>
              <label className="label">
                Notes:
                <textarea
                  className="textarea w-full"
                  name="notes"
                  value={editLogData.notes}
                  onChange={(e) => setEditLogData({ ...editLogData, notes: e.target.value })}
                  rows="3"
                />
              </label>

              <div className="flex gap-3 mt-4">
                <button className="btn bg-blue-800 flex-1 text-white" type="submit">
                  Save Changes
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </PopUp>
      <PopUp isOpen={isPopOpen === "delete"} onClose={() => { setPopOpen(null); setMealLogToDelete(null); }}>
        <fieldset className="fieldset bg-base-200 border-gray-500 rounded-box w-s border p-4">
          <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">
            Delete This Log
          </legend>
          <p className="text-gray-700 font-semibold my-2">
            Are you sure you want delete this log?
          </p>
          {mealLogToDelete && (
            <div className="bg-base-100 p-3 rounded mt-2 mb-2">
              <p><strong>Meal ID:</strong> {mealLogToDelete.meal_id}</p>
              <p><strong>Servings:</strong> {mealLogToDelete.servings}</p>
              {mealLogToDelete.notes && <p><strong>Notes:</strong> {mealLogToDelete.notes}</p>}
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button
              className="btn bg-red-600 btn-neutral ml-auto"
              type="button"
              onClick={() => deleteMealLog(mealLogToDelete?.meal_log_id)}
            >
              Delete
            </button>
            <button
              className="btn bg-blue-800 btn-neutral"
              type="button"
              onClick={() => {
                setPopOpen(null);
                setMealLogToDelete(null);
              }}
            >
              Cancel
            </button>
          </div>
        </fieldset>
      </PopUp>
      <LargeModal open={isLargeOpen !== null} onClose={() => setLargeOpen(null)}>
        {isLargeOpen === "browse" && (
          <div className="bg-base-200 p-6 rounded-box w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Browse Meals</h2>
            </div>
            <p className="text-center opacity-70 py-8 text-lg">Meal browsing feature coming soon...</p>
          </div>
        )}
      </LargeModal>

      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default ClientMealLogs;