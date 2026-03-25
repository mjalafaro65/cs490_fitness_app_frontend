import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Sign_Up from "./pages/Sign_Up";
import Log_In from "./pages/Log_In";
import Initial_Survey from "./pages/InitialSurvey";
import ClientSettings from "./pages/ClientSettings";
import ClientProfile from "./pages/ClientProfile";
import ClientWorkoutPlans from "./pages/ClientWorkoutPlans";
import MealLogs from "./pages/MealLogs";
import Messages from "./pages/Messages";
import MyCoach from "./pages/MyCoach";
import Notifications from "./pages/Notifications";
import ProgressLogs from "./pages/ProgressLogs";

function App() {
  return (
    <Routes>
        <Route path="landing" element={<Landing />} />
        <Route path="signup" element ={<Sign_Up />}/>
        <Route path="login" element ={<Log_In />}/>
        <Route path="initialsurvey" element ={<Initial_Survey />}/>

        <Route path="clientsettings" element={<ClientSettings />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mycoach" element={<MyCoach />} />

        <Route path="/" element={<ProtectedRoute>{(user) => <Layout user={user} />}</ProtectedRoute>}>
          <Route path="clientprofile" element={<ClientProfile />} />
          <Route path="clientworkoutplans" element={<ClientWorkoutPlans />} />
          <Route path="meallogs" element={<MealLogs />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="progresslogs" element={<ProgressLogs />} />
        </Route>
    </Routes>
  );
}

export default App;
