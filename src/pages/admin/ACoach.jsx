import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "../../App.css";
import PopUp from "../../components/PopUp";
import Navbar from "../../components/Navbar";

function ACoach(){

      return (

        <div className="drawer lg:drawer-open">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <section className="p-6 flex flex-col gap-6">
              <div className="text-2xl font-bold mb-2">Profile</div>
            </section>

          </div>
        </div>
    );
}
export default ACoach;
