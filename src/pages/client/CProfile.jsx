import { useState, useEffect } from "react";
import "../../App.css";
import api from "../../axios";

function CProfile() {

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
        const response = await api.get("/client/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;

        console.log("Response data:", data);

        setData({
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
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

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Profile</div>

          <section className="p-10 flex flex-col md:flex-row gap-10 items-start">

            {/* Profile Picture */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

              <label className="label font-semibold">Date of Birth:</label>
              <input
                className="input"
                type="date"
                name="date_of_birth"
                value={bioData.date_of_birth}
                onChange={handleChange}
                required
              />

              <label className="label font-semibold">Gender:</label>
              <select
                className="select"
                name="gender"
                value={bioData.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                <option value="OTHER">Other</option>
              </select>

              <label className="label font-semibold">Bio:</label>
              <textarea
                className="textarea h-24"
                name="bio"
                placeholder="Tell us about yourself!"
                value={bioData.bio}
                onChange={handleChange}
              />

              <label className="label font-semibold">Height:</label>
              <input
                className="input"
                type="number"
                name="height"
                value={bioData.height}
                onChange={handleChange}
                required
              />

              <label className="label font-semibold">Weight:</label>
              <input
                className="input"
                type="number"
                name="weight"
                value={bioData.weight}
                onChange={handleChange}
                required
              />

              <button type="submit" className="btn btn-primary">
                Update
              </button>

            </form>
          </section>

          <div className="flex gap-6">
            <button className="btn btn-primary" onClick={() => setPopOpen("invoices")}>
              Invoices
            </button>
            <button className="btn btn-primary" onClick={() => setPopOpen("reports")}>
              View Reports
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}

export default CProfile;