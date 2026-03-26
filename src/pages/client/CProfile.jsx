import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import Navbar from "../../components/Navbar";

function CProfile(){
  const [isPopOpen, setPopOpen] = useState(false);
  const [initialData, setData] = useState({
        first_name: "", 
        last_name: "", 
        email: "",
        password: ""
    });

    const [user, setUser] = useState({
      first_name: "",
      last_name: "",
      picture: "" 
    });

  const handleChange = (e) => {
        setData({
            ...initialData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try{
            console.log("STATUS:", response.status);

        }
        catch(error){
            console.error("Update failed:", error.response?.data);
            alert("Update failed, please try again");
        }
    };

    return (

        <div className="drawer lg:drawer-open">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <Navbar />
          <div className="drawer-content">
            <section className="p-6 flex flex-col gap-6">
              <div className="text-2xl font-bold mb-2">Settings</div>
              <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
                <div className="flex-shrink-0">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                      {user.first_name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <fieldset className="fieldset rounded-box w-full flex-1">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="label font-semibold">First Name: </label>
                        <input
                            className="input"
                            type="text"
                            name="first_name"
                            onChange={handleChange}
                            required
                        />
                        <label className="label font-semibold">Last Name: </label>
                        <input
                            className="input"
                            type="text"
                            name="last_name"
                            onChange={handleChange}
                            required
                        />
                        <label className="label font-semibold">Subscription Plan: </label>
                        <input
                            className="input"
                            type="text"
                            name="subscription_plan"
                            onChange={handleChange}
                            required
                        />
                    </form>
              </fieldset>
              </section>
              <div className="flex gap-6">
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("invoices")}>Invoices</button>
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("reports")}>View Reports</button>
              </div>
            </section>

          </div>
        </div>
    );

}
export default CProfile;
