import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../axios";
import Alert from "../../components/Alert";

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

function ClientMealLogs(){
  const [isPopOpen, setPopOpen] = useState(null);
  const [isLargeOpen, setLargeOpen] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    // Extract string message from error object if needed
    let alertMessage = message;
    
    // If message is an object (like error response), extract the actual error message
    if (typeof message === 'object' && message !== null) {
      if (message.message) {
        alertMessage = message.message;
      } else if (message.status) {
        alertMessage = `${message.status}: ${message.code || 'Error'}`;
      } else {
        alertMessage = 'An error occurred';
      }
    }
    
    // If it's a string, use it directly
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
    servings: "",
    notes: ""
  });

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
      const response = await api.get("/nutrition/meal-logs", {
        params: { user_id: user.user_id }
      });
      console.log("Meal history fetched:", response.data);
      setMealHistory(response.data || []);
      setLargeOpen("history");
    } catch (err) {
      console.error("Failed to fetch meal history:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch meal history";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchMealLogDetails = async (logId) => {
    try {
      const response = await api.get(`/nutrition/meal-logs/${logId}`);
      console.log("Meal log details:", response.data);
      setSelectedMealLog(response.data);
      setEditLogData({
        servings: response.data.servings || "",
        notes: response.data.notes || ""
      });
      setLargeOpen("editLog");
    } catch (err) {
      console.error("Failed to fetch meal log details:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to fetch meal log details";
      showAlert(errorMessage, "error");
    }
  };

  // PATCH /nutrition/meal-logs/{log_id} - Update meal log
  const updateMealLog = async (logId, updateData) => {
    try {
      const response = await api.patch(`/nutrition/meal-logs/${logId}`, updateData);
      console.log("Meal log updated:", response.data);
      showAlert("Meal log updated successfully!", "success");
      await fetchMealHistory(); // Refresh the list
      setSelectedMealLog(null);
      setEditLogData({ servings: "", notes: "" });
      return response.data;
    } catch (err) {
      console.error("Failed to update meal log:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.status || "Failed to update meal log";
      showAlert(errorMessage, "error");
      return null;
    }
  };

  // DELETE /nutrition/meal-logs/{log_id} - Delete meal log
  const deleteMealLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this meal log?")) return false;
    
    try {
      await api.delete(`/nutrition/meal-logs/${logId}`);
      console.log("Meal log deleted:", logId);
      showAlert("Meal log deleted successfully!", "success");
      await fetchMealHistory(); // Refresh the list
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
    if (!selectedMealLog) return;
    
    await updateMealLog(selectedMealLog.meal_log_id, {
      servings: editLogData.servings,
      notes: editLogData.notes
    });
    setLargeOpen("history");
  };

  const handleDeleteFromEdit = async () => {
    if (!selectedMealLog) return;
    const success = await deleteMealLog(selectedMealLog.meal_log_id);
    if (success) {
      setLargeOpen("history");
      setSelectedMealLog(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      setData(prev => ({ ...prev, user_id: user.user_id }));
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
    notes: logData.notes || ""
  };

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

      setPopOpen(null);
      showAlert("Meal logged successfully!", "success");

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.status || "Failed to log meal";
      showAlert(errorMessage, "error");
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
      
    } catch (error) {
      console.error("Creation failed:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.status || "Failed to create meal plan";
      showAlert(errorMessage, "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Meal Plans</div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("log")}>Log Meals</button>
                <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setLargeOpen("browse")}>Browse Meals</button>
                <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={fetchMealHistory}>Meal History</button> 
              </div>
            <div className="flex w-full grow flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Active Meal Plans</h2>
            </div>
          </div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Create New Meal Plan</h2>
                <span className="text-sm opacity-70 mb-3">Nothing to see</span>
                <div className="mt-auto flex justify-center">
                  <button className="btn btn-primary bg-blue-800 btn-sm" type="button" onClick={() => setPopOpen("create")}>Create New</button>
                </div>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">View Meal Plans</h2>
              <span className="text-sm opacity-70 mb-3">No currently existing plans</span>
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
              <label className="label">
                Meal ID:
                <input className="input w-full" type="number" name="meal_id" value={logData.meal_id} onChange={handleChange} required />
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
      </PopUp>
      <LargeModal open={isLargeOpen !== null} onClose={() => setLargeOpen(null)}>
      {/* Meal History Popup */}
      {isLargeOpen === "history" && (
        <div className="bg-base-200 rounded-box w-full max-w-4xl">
          <div className="sticky top-0 bg-base-200 pb-4 border-b mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meal History</h2>
            </div>
          </div>
          
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
                        Meal ID: {meal.meal_id}
                      </p>
                      <p className="text-md mt-1">
                        Servings: {meal.servings}
                      </p>
                      {meal.notes && (
                        <p className="text-sm opacity-70 mt-2">
                          Notes: {meal.notes}
                        </p>
                      )}
                      <p className="text-xs opacity-50 mt-3">
                        Logged: {formatDate(meal.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchMealLogDetails(meal.meal_log_id);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-error"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (await deleteMealLog(meal.meal_log_id)) {
                            // Refresh will happen in deleteMealLog
                          }
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
      )}

      {/* Edit Meal Log Popup */}
      {isLargeOpen === "editLog" && selectedMealLog && (
        <form onSubmit={handleEditSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Meal Log</h2>
              <button 
                type="button"
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={() => {
                  setLargeOpen("history");
                  setSelectedMealLog(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <p className="text-md opacity-70 mb-4">
              Meal ID: {selectedMealLog.meal_id}
            </p>
            
            <label className="label">
              Servings:
              <input 
                className="input w-full" 
                type="number" 
                step="0.5" 
                name="servings" 
                value={editLogData.servings} 
                onChange={(e) => setEditLogData({...editLogData, servings: e.target.value})}
                required 
              />
            </label>
            
            <label className="label">
              Notes:
              <textarea 
                className="textarea w-full" 
                name="notes" 
                value={editLogData.notes} 
                onChange={(e) => setEditLogData({...editLogData, notes: e.target.value})}
                rows="3" 
              />
            </label>
            
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary bg-blue-800 flex-1" type="submit">
                Save Changes
              </button>
              <button 
                type="button"
                className="btn btn-error flex-1" 
                onClick={handleDeleteFromEdit}
              >
                Delete
              </button>
            </div>
          </fieldset>
        </form>
      )}
  
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