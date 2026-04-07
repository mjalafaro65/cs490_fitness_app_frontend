import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import { useAuth } from "../../AuthContext";
//idk if we want 

function CProfile() {

  const { fetchUser,coachStatus} = useAuth();
  const navigate=useNavigate()

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    subscription_plan: ""
  });

  const [bioData, setData] = useState({
    date_of_birth: "",
    gender: "",
    bio: "",
    height: "",
    weight: ""
  });

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    picture: ""
  });

  useEffect(() => {
    const fetchUser = async () =>{
      try {
        const response = await api.get("/client/profile");
        const data = response.data;

        console.log("Response data:", response.data);
        setData({
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          bio: data.bio || "",
          height: data.height || "",
          weight: data.weight || "",
          pfp_url: data.profile_photo || ""
        });

        setUser({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response) {
          console.log("Status code:", err.response.status);
          console.log("Response data:", err.response.data);
          console.log("Response headers:", err.response.headers);
        } else if (err.request) {
          console.log("Request sent but no response received:", err.request);
        } else {
          console.log("Error setting up request:", err.message);
        }
      }
    }

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...bioData,
      [name]:
        name === "height" || name === "weight"
          ? Number(value)
          : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put("/client/profile", bioData);
      console.log("STATUS:", response.status);
    }
    catch (error) {
      console.error("Update failed:", error.response?.data);
    }
  };
  const handleSwitchAccount=async (e)=> {
    if (e) e.preventDefault();
    try{

      await api.patch("/coach/coach-profile",{
        "status":"approved"
      })
      await fetchUser();

      navigate("/coach/dashboard");

    }catch(error){
      console.error("Switch failed", error);
    }
  }

  return (

    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Profile</div>
          <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
            <div className="flex-shrink-0">
              {bioData.pfp_url ? (
                <div className="w-32 h-32 rounded-full border-2 border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={bioData.pfp_url}
                    alt="Profile"
                    className="min-w-full min-h-full object-cover scale-155"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  {user.first_name?.[0] || "?"}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <fieldset className="fieldset rounded-box w-full flex-1">
                <label className="label font-semibold">Date of Birth: </label>
                <input
                  className="input"
                  type="date"
                  name="date_of_birth"
                  value={bioData.date_of_birth}
                  onChange={handleChange}
                  required
                />
                <fieldset className="fieldset rounded-box w-full flex-1">
                  <label className="label font-semibold">Gender: </label>
                  <select className="select" id="gender" name="gender" value={bioData.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="other">Other</option>
                  </select>
                </fieldset>
                <label className="label font-semibold">Bio: </label>
                <textarea className="textarea h-24"
                  name="bio"
                  placeholder="Tell us about yourself!"
                  value={bioData.bio}
                  onChange={handleChange}>
                </textarea>
                <label className="label font-semibold">Height: </label>
                <input
                  className="input"
                  type="number"
                  name="height"
                  value={bioData.height}
                  onChange={handleChange}
                  required
                />
                <label className="label font-semibold">Weight: </label>
                <input
                  className="input"
                  type="number"
                  name="weight"
                  value={bioData.weight}
                  onChange={handleChange}
                  required
                />
                <div>
                  <button type="submit" className="btn btn-primary bg-blue-800 btn-m rounded-t">Update</button>
                </div>
              </fieldset>
            </form>
          </section>
          <div className="flex gap-6">
            <button className="btn btn-primary bg-blue-800 btn-m rounded-t" onClick={() => setPopOpen("invoices")}>Invoices</button>
            <button className="btn btn-primary bg-blue-800 btn-m rounded-t" onClick={() => setPopOpen("reports")}>View Reports</button>
          </div>
          {coachStatus==="switched" &&
            <div className="mt-8 p-6 bg-base-100 border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Type</h3>

              <div className="flex flex-row items-center justify-between w-full">

                <p className="text-sm text-gray-500">
                  Currently logged in as: <span className="font-semibold text-primary">{coachStatus === "approved" ? 'Coach' : 'Client'}</span>
                </p>

                <button
                  onClick={handleSwitchAccount}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch to {coachStatus === "approved" ? 'Client View' : 'Coach View'}
                </button>

              </div>
            </div>
          } 
          
          
        </section>

      </div>
    </div>
  );

}
export default CProfile;