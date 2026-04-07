import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Navbar from "../../components/Navbar.jsx";
import api from "../../axios.jsx";
import { useAuth } from "../../AuthContext.jsx";

function Profile() {
  const {coachStatus, fetchUser} =useAuth()
  const navigate=useNavigate()

  const [documents, setDocuments] = useState([]);
  const [newDocType, setNewDocType] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [fetchData, setData] = useState({
    specialty: "",
    years_experience: "",
    bio: "",
    profile_photo: "",
    status: ""
  });

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    picture: ""
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/coach/coach-profile");
        console.log("Response data:", response.data);
        console.log(JSON.stringify(bioData, null, 2));
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
      ...fetchData,
      years_experience: name === "years_experience" ? Number(value) : value,
      [name]: name !== "years_experience" ? value : fetchData.years_experience
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.patch("/coach/coach-profile", fetchData);
      console.log("STATUS:", response.status);
    }
    catch (error) {
      console.error("Update failed:", error.response?.data);
      alert("Update failed, please try again");
    }
  };
  const handleAddDocument = async () => {
    if (!newDocType || !newDocUrl) return alert("Enter type and URL");

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/coach/coach-documents", {
        document_type: newDocType,
        document_url: newDocUrl
      }
      );
      setDocuments([...documents, response.data]);
      setNewDocType("");
      setNewDocUrl("");
    } catch (error) {
      console.error("Failed to add document:", error.response?.data);
      alert("Failed to add document");
    }
  };

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
                <label className="label font-semibold">Speciality: </label>
                <select className="select" id="speciality" name="specialty" value={fetchData.specialty} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">Weight Loss</option>
                  <option value="2">Muscle Building</option>
                  <option value="3">Cardio & Endurance</option>
                  <option value="4">Nutrition Coaching</option>
                  <option value="5">Yoga & Flexibility</option>
                  <option value="6">Sports Performance</option>
                  <option value="7">Senior Fitness</option>
                  <option value="8">Rehabilitation</option>
                  <option value="9">Weight Management Nutrition</option>
                  <option value="10">Sports Nutrition</option>
                  <option value="11">Plant-Based Nutrition</option>
                  <option value="12">Macro Tracking</option>
                  <option value="13">CrossFit & HIIT</option>
                  <option value="14">Powerlifting</option>
                  <option value="15">Bodyweight Training</option>
                </select>
                <label className="label font-semibold">Years of Experience: </label>
                <input
                  className="input"
                  type="number"
                  name="years_experience"
                  min="0"
                  value={fetchData.years_experience}
                  onChange={handleChange}
                  required
                />
                <label className="label font-semibold">Bio: </label>
                <textarea className="textarea h-24"
                  name="bio"
                  placeholder="Tell us about yourself!"
                  value={fetchData.bio}
                  onChange={handleChange}>
                </textarea>
                <label className="label font-semibold">Profile Photo: </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Insert a URL here"
                  name="profile_photo"
                  value={fetchData.profile_photo}
                  onChange={handleChange}
                  required
                />
                <div>
                  <button className="btn btn-primary" type="submit">Update</button>
                </div>
              </form>
            </fieldset>
          </section>
          <div>
            <div className="text-lg font-bold mb-2">Documents:</div>
            <ul className="list-disc ml-6">
              {documents.map(doc => (
                <li key={doc.document_id}>
                  <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {doc.document_type}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder="Document type"
                className="input input-bordered"
                value={newDocType}
                onChange={e => setNewDocType(e.target.value)}
              />
              <input
                type="text"
                placeholder="Document URL"
                className="input input-bordered"
                value={newDocUrl}
                onChange={e => setNewDocUrl(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAddDocument}>Add Document</button>
            </div>
          </div>
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
