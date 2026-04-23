import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Navbar from "../../components/Navbar.jsx";
import api from "../../axios.jsx";
import { useAuth } from "../../AuthContext.jsx";

const SPECIALTY_TITLES = {
  1: "Weight Loss",
  2: "Muscle Building",
  3: "Cardio & Endurance",
  4: "Nutrition Coaching",
  5: "Yoga & Flexibility",
  6: "Sports Performance",
  7: "Senior Fitness",
  8: "Rehabilitation",
  9: "Weight Management Nutrition",
  10: "Sports Nutrition",
  11: "Plant-Based Nutrition",
  12: "Macro Tracking",
  13: "CrossFit & HIIT",
  14: "Powerlifting",
  15: "Bodyweight Training"
};

function Profile() {
  const {coachStatus, fetchUser} =useAuth()
  const navigate=useNavigate()

  const [fetchData, setData] = useState( null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userRes = await api.get("/user/me");
        console.log(userRes)
        setUser(userRes.data);

        const response = await api.get("/coach/coach-profile");
        console.log("Response data:", response.data);
        const data = response.data;

        setData(data);


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


  const handleSwitchAccount = async (e) => {
    if (e) e.preventDefault();
    try {

      await api.patch("/coach/coach-profile", {
        "status": "switched"
      })
      await fetchUser();

      navigate("/client/dashboard");

    } catch (error) {
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
             {fetchData?.profile_photo ? (
                    <img
                        src={fetchData.profile_photo}
                        alt="Profile"
                        className="w-32 h-32  rounded-full  object-cover border-2 border-gray-300  "
                    />
                ) : (
                    <div className="w-50 h-50 bg-blue-800  rounded-full  text-primary-content flex items-center justify-center text-4xl font-bold uppercase border-4 border-base-100 shadow-lg">
                        {user?.first_name?.[0]?.toUpperCase() || "?"}
                    </div>
                )}
            </div>


            <div className="ml-6 flex flex-col gap-3">
              <div>
                <label className="label font-semibold">Name:</label>
                <p className="text-l font-bold">
                  {user?.first_name || user?.last_name
                  ? `${user?.first_name} ${user?.last_name}`
                  : "—"}
                </p>
              </div>
              <div>
                <label className="label font-semibold">Specialty:</label>
                <p className="text-l font-bold">{fetchData?.specialty_name || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Year of Experience:</label>
                <p className="text-l font-bold">{fetchData?.years_experience || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Bio:</label>
                <p className="text-l font-bold">{fetchData?.bio || "—"}</p>
              </div>
            </div>
          </section>
          {coachStatus === "approved" &&
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
export default Profile;
