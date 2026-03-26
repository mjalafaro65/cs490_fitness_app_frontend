import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

{/*initial pages (shared by all) */}
import Landing from "./pages/visitors/Landing";
import AboutUs from "./pages/visitors/AboutUs";
import Sign_Up from "./pages/Sign_Up";
import Log_In from "./pages/Log_In";
import InitialSurvey from "./pages/InitialSurvey";
import Coaches from "./pages/Coaches";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";


{/*client specific pages */}
import ClientDashboard from "./pages/client/CDashboard";
import ClientSettings from "./pages/client/CSettings";
import ClientProfile from "./pages/client/CProfile";
import ClientWorkoutPlans from "./pages/client/CWorkoutPlans";
import MyCoach from "./pages/client/MyCoach";
import ClientProgressLogs from "./pages/client/CProgressLogs";   
import ClientMealLogs from "./pages/client/CMealLogs";

{/*coach specific pages 
import CoachDashboard from "./pages/coach/Dashboard";
import CoachSettings from "./pages/coach/Settings";
import CoachProfile from "./pages/coach/Profile";
import CoachWorkoutPlans from "./pages/coach/WorkoutPlans";
import CoachProgressLogs from "./pages/coach/ProgressLogs"; 
import CoachMealLogs from "./pages/coach/MealLogs";

{/*admin specific pages 
import AdminDashboard from "./pages/admin/ADashboard";
import AdminSettings from "./pages/admin/ASettings";
import AdminProfile from "./pages/admin/AProfile";
import AdminWorkoutPlans from "./pages/admin/AWorkoutPlans";
import AdminCoach from "./pages/admin/ACoach";
import AdminMealLogs from "./pages/admin/AMealLogs";
import AdminProgressLogs from "./pages/admin/AProgressLogs";  
*/} 

function App() {
  return (
    <Routes>
        <Route path="landing" element={<Landing />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="signup" element ={<Sign_Up />}/>
        <Route path="login" element ={<Log_In />}/>
        <Route path="coaches" element ={<Coaches isPublic={true} />}/>
        

        <Route  element={<Layout />}>
          <Route element={<ProtectedRoute />}> 
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* client Routes */}
          <Route path="/client" element={<ProtectedRoute allowedRoles={["1"]} />}>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="mycoach" element={<MyCoach />} />
            <Route path="coaches" isPublic={false}  element ={<Coaches  isPublic={false}/>}/>
            <Route path="profile" element={<ClientProfile />} />
            <Route path="workoutplans" element={<ClientWorkoutPlans />} />
            <Route path="meallogs" element={<ClientMealLogs />} />
            <Route path="progresslogs" element={<ClientProgressLogs />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          {/* coach Routes */}
          <Route path="/coach" element={<ProtectedRoute allowedRoles={["2"]} />}>
          </Route>

          {/* admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["3"]} />}>
          </Route>
          
        </Route>
    </Routes>
  );
}

export default App;
