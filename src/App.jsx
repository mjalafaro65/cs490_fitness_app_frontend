import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Sign_Up from "./pages/Sign_Up";
import Log_In from "./pages/Log_In";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="signup" element ={<Sign_Up />}/>
        <Route path="login" element ={<Log_In />}/>
      </Route>
    </Routes>
  );
}

export default App;
