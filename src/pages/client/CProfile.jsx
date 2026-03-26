import { useState, useEffect } from "react";
import "../../App.css";
import Navbar from "../../components/Navbar";

function CProfile(){
  return (
    <div>
      <Navbar />
      <section className="blue">
        <h2 style = {{color: "black"}}>ClientProfile</h2>
      </section>
    </div>

  );

}
export default CProfile;
