import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";

function CDashboard(){
  const [isPopOpen, setPopOpen] = useState(false);

    return (
        <div>
          <section className="blue">
            <h2 style = {{color: "black"}}>Dashboard</h2>
              <p>Here information about the page can go here. 
                  This is just for testing for now.
              </p>
          </section>
          <h1>Settings</h1>
          <button onClick={() => setPopOpen(true)}>Daily Wellness Log</button>
          <PopUp isOpen={isPopOpen} onClose={() => setPopOpen(false)}>
            <h2>DAILY WELLNESS LOG</h2>
            <form>
              <label>
                Daily Goal:
                <input type="text" name="daily_goal" />
              </label>
              <br />
              <label>
                Energy Level:
                <input type="number" name="energy_level" />
              </label>
              <br />
              <label>
                Target Focus:
                <input type="text" name="target_focus" />
              </label>
              <br />
              <label>
                Water (in oz):
                <input type="number" name="water_oz" />
              </label>
              <br />
              <label>
                Weight (in lbs):
                <input type="number" name="weight_lbs" />
              </label>
              <br />
              <label>
                Hours of Sleep:
                <input type="number" name="sleep_hours" />
              </label>
              <br />
              <label>
                Mood:
                <input type="number" min="0" max ="10" name="mood_score" />
              </label>
              <br />
              <button type="submit">Submit</button>
            </form>
          </PopUp>
        </div>
    );

}
export default CDashboard;
