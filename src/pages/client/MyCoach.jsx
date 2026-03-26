import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Link } from 'react-router-dom';
import Navbar from "../../components/Navbar";

function MyCoach(){
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6">
          <div className="text-2xl font-bold mb-6">My Coach</div>
              <div className="flex w-full">
                <div className="card bg-base-300 rounded-box grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Coach</h2>
                  <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm"  onClick={() => navigate("/coaches")} >Browse Coaches</button>
                  </div>
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="card bg-base-300 rounded-box grid grow p-4 flex">
                  <h2 className="text-lg font-bold mb-2">My Requests</h2>
                  </div>
              </div>
            <div className="divider"></div>
              <div className="flex w-full h-60 flex-1 gap-4">
                <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">Saved Coaches</h2>
                  <span className="text-sm opacity-70 mb-3">No coach assigned</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm">Browse Coaches</button>
                  </div>
                </div>
                <div className="card bg-base-300 rounded-box flex-1 grow p-4 flex flex-col">
                  <h2 className="text-lg font-bold mb-2">My Reviews</h2>
                  <span className="text-sm opacity-70 mb-3">No reviews</span>
                  <div className="mt-auto flex justify-center">
                    <button className="btn btn-primary btn-sm">Browse Coaches</button>
                  </div>
                </div>
              </div>
        </section>
      </div>
    </div>

  );

}
export default MyCoach;
