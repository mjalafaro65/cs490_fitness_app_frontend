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
            <div className="flex w-full grow flex-1 gap-4">
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-xs mb-2">Hours of Sleep</h2>
                <p className="text-xl font-bold">
                </p>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-xs mb-2">Mood</h2>
                <p className="text-xl font-bold">
                </p>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4 flex">
                <h2 className="text-xs mb-2">Water Intake</h2>
                <p className="text-xl font-bold">
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
             
            </div>
            <div className="flex w-full grow flex-1 gap-4">
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-lg font-bold mb-2">Graph 1</h2>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-lg font-bold mb-2">Graph 2</h2>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-lg font-bold mb-2">Graph 3</h2>
              </div>
            </div>
            <div className="flex w-full h-60 flex-1 gap-4">
              <div className="card bg-base-300 rounded-box flex-1 grow p-4">
                <h2 className="text-lg font-bold mb-2">My Coach</h2>
                <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                <div className="mt-auto flex justify-center">
                </div>
              </div>
              <div className="card bg-base-300 rounded-box grow p-4">
                <h2 className="text-lg font-bold mb-2">Upcoming Workout</h2>
                <span className="text-sm opacity-70 mb-3">No work outs assigned Today</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    
  )
}
export default CoDashboard;
