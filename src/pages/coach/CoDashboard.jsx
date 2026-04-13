import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

function CoDashboard() {
  const navigate = useNavigate();
  const [isPopOpen, setPopOpen] = useState(null);

  return (
    
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <section className="p-6 flex flex-col gap-6">
            <div className="text-2xl font-bold mb-4">Dashboard</div>
            <div className="flex w-full h-60 flex-1 gap-4">
              <div className="card bg-base-300 rounded-box flex-1 grow p-4">
                <h2 className="text-lg font-bold mb-2">My Clients</h2>
                <span className="text-sm opacity-70 mb-3">No clients assigned</span>
                <div className="mt-auto flex justify-center">
                </div>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-lg font-bold mb-2">Client Requests</h2>
                <span className="text-sm opacity-70 mb-3"></span>
              </div>
            </div>
          </section>
        </div>
      </div>
    
  )
}
export default CoDashboard;
