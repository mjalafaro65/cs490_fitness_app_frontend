import { useState, useEffect } from "react";
import "../App.css";
import Navbar from "../components/Navbar";

function Notifications(){
  return (
    <div>
      <Navbar />
      <section className="blue">
        <h2 style = {{color: "black"}}>Notifications</h2>
      </section>
    </div>

  );

}
export default Notifications;
