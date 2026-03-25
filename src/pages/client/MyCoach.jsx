import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import { Link } from 'react-router-dom';
import Navbar from "../../components/Navbar";

function MyCoach(){
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <Navbar />

      <div className="drawer-content p-4">
        <h1>My Coach</h1>
      </div>
    </div>

  );

}
export default MyCoach;
