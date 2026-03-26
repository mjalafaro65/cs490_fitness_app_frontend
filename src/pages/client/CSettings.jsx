import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import Navbar from "../../components/Navbar";

function CSettings(){
  const [isPopOpen, setPopOpen] = useState(false);

    return (
        <div>
          <Navbar />
          <h1>Settings</h1>
          <button onClick={() => setPopOpen("account")}>DELETE ACCOUNT</button>
          <PopUp isOpen={isPopOpen === "account"} onClose={() => setPopOpen(false)}>
            <h2>Delete Account</h2>
            <form>
              <button type="submit">Delete</button>
            </form>
          </PopUp>

          <button onClick={() => setPopOpen("retake_survey")}>RETAKE INITIAL SURVEY</button>
          <PopUp isOpen={isPopOpen === "retake_survey"} onClose={() => setPopOpen(false)}>
            <h2>Initial Survey</h2>
            <form>
              <button type="submit">Submit</button>
            </form>
          </PopUp>

          <button onClick={() => setPopOpen("calories")}>Delete Calories</button>
          <PopUp isOpen={isPopOpen === "calories"} onClose={() => setPopOpen(null)}>
            <h2>Delete Calories</h2>
            <form>
              <button type="submit">Confirm</button>
            </form>
          </PopUp>
        </div>
    );

}
export default CSettings;
