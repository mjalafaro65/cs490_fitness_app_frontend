import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

{/*initial pages (shared by all) */}
import Landing from "./pages/visitors/Landing";
import AboutUs from "./pages/visitors/AboutUs";
import Sign_Up from "./pages/Sign_Up";
import Log_In from "./pages/Log_In";
import Coaches from "./pages/Coaches";

{/*client specific pages */}
import ClientDashboard from "./pages/client/CDashboard";
import ClientSettings from "./pages/client/CSettings";
import ClientProfile from "./pages/client/CProfile";
import ClientWorkoutPlans from "./pages/client/CWorkoutPlans";
import MyCoach from "./pages/client/MyCoach";

import MealLogs from "./pages/MealLogs";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import ProgressLogs from "./pages/ProgressLogs";

function App() {
  return (
    <Routes>
        <Route path="landing" element={<Landing />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="signup" element ={<Sign_Up />}/>
        <Route path="login" element ={<Log_In />}/>
        <Route path="coaches" element ={<Coaches/>}/>
        {/* <Route path="initial-survey" element ={<InitialSurvey />}/> */}
        
        {/* left this out for now since I didn't make a login, so if you want to view these pages, take out of protected route*/}
        <Route path="/client/settings" element={<ClientSettings />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="mycoach" element={<MyCoach />} />

        <Route path="/" element={<ProtectedRoute>{(user) => <Layout user={user} />}</ProtectedRoute>}>
          <Route path="/client/workoutplans" element={<ClientWorkoutPlans />} />
          <Route path="meallogs" element={<MealLogs />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="progresslogs" element={<ProgressLogs />} />
        </Route>
    </Routes>
  );
}

export default App;
