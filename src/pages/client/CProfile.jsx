import { useState, useEffect } from "react";
import "../../App.css";
import api from "../../axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

function CProfile() {
  const { fetchUser, coachStatus } = useAuth();

  const navigate = useNavigate();



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

  const [popOpen, setPopOpen] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/auth/setup", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;

        console.log("Response data:", data);

        setUser({
          first_name: data.date_of_birth || "",
          last_name: data.gender || "",
          bio: data.bio || "",
          profile_picture: data.profile_picture || ""
        });

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/client/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;

        console.log("Response data:", data);

        setData({
          date_of_birth: data.date_of_birth || "",
          gender: data.gender ? data.gender.split(".")[1] : "",
          bio: data.bio || "",
          height: data.height || "",
          weight: data.weight || ""
        });

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
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
          ? value === "" ? "" : Number(value)
          : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bioData.height <= 0 || bioData.weight <= 0) {
      alert("Height and weight must be greater than 0");
      return;
    }

    try {
      console.log("Sending:", bioData);

      const response = await api.put("/client/profile", bioData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log("SUCCESS:", response.data);

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
    }
  };
  const handleSwitchAccount = async (e) => {
    e.preventDefault();
    try {

      await api.patch("/coach/coach-profile", {
        "status": "approved"
      })
      await fetchUser();

      navigate("/coach/dashboard");

    } catch (error) {
      console.error("Switch failed", error);
    }
  }

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Profile</div>

          <section className="p-10 flex flex-col md:flex-row gap-10 items-start">

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
            <div>
              <label className="label font-semibold">Name:</label>
              <p className="text-xl font-bold">
                {user.first_name || user.last_name || "—"}
              </p>
            </div>
            <div>
              <label className="label font-semibold">Date of Birth:</label>
              <p className="text-xl font-bold">
                {bioData.date_of_birth || "—"}
              </p>
            </div>
            <div>
              <label className="label font-semibold">Gender:</label>
              <p className="text-xl font-bold">
                {bioData.gender || "—"}
              </p>
            </div>
            <div>
              <label className="label font-semibold">Bio:</label>
              <p className="text-xl font-bold">
                {bioData.bio || "—"}
              </p>
            </div>
            <div>
              <label className="label font-semibold">Height:</label>
              <p className="text-xl font-bold">
                {bioData.height || "—"}
              </p>
            </div>
            <div>
              <label className="label font-semibold">Weight:</label>
              <p className="text-xl font-bold">
                {bioData.weight || "—"}
              </p>
            </div>
          </section>

          <div className="flex gap-6">
            <button className="btn btn-primary" onClick={() => setPopOpen("invoices")}>
              Invoices
            </button>
            <button className="btn btn-primary" onClick={() => setPopOpen("reports")}>
              View Reports
            </button>
          </div>

          {coachStatus === "switched" &&
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