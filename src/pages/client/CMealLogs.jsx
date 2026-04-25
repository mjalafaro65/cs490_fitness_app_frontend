import { useState, useEffect } from "react";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../axios";
import Alert from "../../components/Alert";

function MealLogs(){
  const [isPopOpen, setPopOpen] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
      console.log("ALERT FUNCTION CALLED with:", message, type);
      setAlertMsg(message);
      setAlertType(type);
      setShowAlert(true);
  };
  
  const [logData, setData] = useState({
    user_id: "",
    meal_id: "", 
    servings: "", 
    notes: ""
  });

  const [newMeal, setNewMeal] = useState({
    name: "", 
    description: ""
  });

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err);
      setUser(null);
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
    setMealPlanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();

    const set = {
      ...logData,
      user_id: user?.user_id
    };

    try {
      console.log("Sending:", set);

      const response = await api.post("/nutrition/nutrition-logs", set);

      console.log("SUCCESS:", response.data);
      setPopOpen(null);

      setData(prev => ({
        user_id: prev.user_id,
        meal_id: "",
        servings: "",
        notes: ""
      }));

      showAlert("Meal logged sucessfully!", "success");

      setData(prev => ({
        user_id: prev.user_id,
        meal_id: "",
        servings: "",
        notes: ""
      }));

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      showAlert(error.response?.data || "Failed to log meal", "error");
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
      showAlert(error.response?.data || "Failed to create meal plan", "error");
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">My Meal Plans</div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("log")}>Log Meals</button>
                <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("browse")}>Browse Meals</button>
                <button className="btn btn-primary bg-blue-800 btn-sm rounded-t" onClick={() => setPopOpen("history")}>Meal History</button> 
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
                  <button className="btn btn-primary bg-blue-800 btn-sm" onClick={() => setPopOpen("create")}>Create New</button>
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
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>Create New Meal Plan</h2>
              <label className="label">
                Name:
                <input className = "input" type="text" name="name" value={newMeal.name} onChange={handleMealPlanChange} />
              </label>
              <label className="label">
                Description:
                <input className="input" type="textarea" name="description" value={newMeal.description} onChange={handleMealPlanChange} rows="3" required/>
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Create</button>
          </fieldset>
        </form>
      )}
      {isPopOpen === "log" && (
        <form onSubmit={handleLogSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h2>Log Meal</h2>
              <label className="label">
                Meal:
                <input className = "input" type="number" name="meal_id" value={logData.meal_id} onChange={handleChange} />
              </label>
              <label className="label">
                Servings:
                <input className="input" type="number" name="servings" value={logData.servings} onChange={handleChange} />
              </label>
              <label className="label">
                Notes:
                <input className="input" type="text" name="notes" value={logData.notes} onChange={handleChange} />
              </label>
              <button className="btn btn-primary bg-blue-800" type="submit">Log</button>
          </fieldset>
        </form>
      )}
  
    {isPopOpen === "browse" && ( 
      <>
        <form>
        </form>
      </>
      )}

    {isPopOpen === "history" && ( 
      <>
          <form>
        </form>
        </>
      )}
    </PopUp>

     <Alert 
      isOpen={alert} 
      message={alertMsg}
      type={alertType}
      onClose={() => setShowAlert(false)}/>
  </div>

  );

}
export default MealLogs;