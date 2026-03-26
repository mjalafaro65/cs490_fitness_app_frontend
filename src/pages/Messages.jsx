import { useState, useEffect } from "react";
import "../App.css";
import Navbar from "../components/Navbar";

function Messages(){
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <Navbar />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <h2 div className="text-2xl font-bold mb-6">Messages</h2>
        </section>
      </div>
    </div>

  );

}
export default Messages;
