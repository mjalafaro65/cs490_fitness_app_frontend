import { useState, useEffect } from "react";
import "../App.css";
import Navbar from "../components/Navbar";

function Messages(){
  return (
    <div>
      <Navbar />
      <section className="blue">
        <h2 style = {{color: "black"}}>Messages</h2>
      </section>
    </div>

  );

}
export default Messages;
