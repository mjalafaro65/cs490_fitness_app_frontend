import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios.jsx";
import { useAuth } from "../../AuthContext.jsx";
import Alert from "../../components/Alert.jsx";

function CoSettings() {
  const {coachStatus, fetchUser} =useAuth()

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    console.log("ALERT FUNCTION CALLED with:", message, type);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const [documents, setDocuments] = useState([]);
  const [newDocType, setNewDocType] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [fetchData, setData] = useState({
    specialty_id: "",
    years_experience: "",
    bio: "",
    profile_photo: ""
  });

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    picture: ""
  });

  const specialty = {
    "Weight Loss": 1,
    "Muscle Building": 2,
    "Cardio & Endurance": 3,
    "Nutrition Coaching": 4,
    "Yoga & Flexibility": 5,
    "Sports Performance": 6,
    "Senior Fitness": 7,
    "Rehabilitation": 8,
    "Weight Management Nutrition": 9,
    "Sports Nutrition": 10,
    "Plant-Based Nutrition": 11,
    "Macro Tracking": 12,
    "CrossFit & HIIT": 13,
    "Powerlifting": 14,
    "Bodyweight Training": 15
    };

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/coach/coach-profile");
        console.log("Response data:", response.data);
        const data = response.data;

        setData({
        specialty_id: data.specialty_name || "",
        years_experience: data.years_experience || "",
        bio: data.bio || "",
        profile_photo: data.profile_photo || "",
        status: data.status || ""
      });

      setUser({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        picture: data.picture || ""
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
    setData((prev) => ({
    ...prev,
    [name]: name === "years_experience" ? Number(value) : value
  }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      ...fetchData,
      specialty_id: specialty[fetchData.specialty_id] || null
      };

    try {
      const response = await api.patch("/coach/coach-profile", updateData);
      console.log("STATUS:", response.status);

      showAlert("Updated successfully!", "success");

    }
    catch (error) {
      console.error("Update failed:", error.response?.data);
      showAlert(error.response?.data?.message || "Update failed", "error");
    }
  };

  const handleAddDocument = async () => {
    if (!newDocType || !newDocUrl) return alert("Enter type and URL");

    try {
      const response = await api.post("/coach/coach-documents", {
        document_type: newDocType,
        document_url: newDocUrl
      }
      );
      setDocuments([...documents, response.data]);
      setNewDocType("");
      setNewDocUrl("");
      
      showAlert("Document successfully added", "success");
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to add document", "error");
      console.error("Failed to add document:", error.response?.data);
    }
  };


  return (

    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Settings</div>
          <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
            <div className="flex-shrink-0">
              {fetchData.profile_photo ? (
                <img
                  src={fetchData.profile_photo}
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
                <select className="select" id="speciality" name="specialty_id" value={fetchData.specialty_id} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Cardio & Endurance">Cardio & Endurance</option>
                  <option value="Nutrition Coaching">Nutrition Coaching</option>
                  <option value="Yoga & Flexibility">Yoga & Flexibility</option>
                  <option value="Sports Performance">Sports Performance</option>
                  <option value="Senior Fitness">Senior Fitness</option>
                  <option value="Rehabilitation">Rehabilitation</option>
                  <option value="Weight Management Nutriton">Weight Management Nutrition</option>
                  <option value="Sports Nutrition">Sports Nutrition</option>
                  <option value="Plant-Based Nutrition">Plant-Based Nutrition</option>
                  <option value="Macro Tracking">Macro Tracking</option>
                  <option value="CrossFit & HIIT">CrossFit & HIIT</option>
                  <option value="Powerlifting">Powerlifting</option>
                  <option value="Bodyweight Training">Bodyweight Training</option>
                </select>
                <label className="label font-semibold">Years of Experience: </label>
                <input
                  className="input"
                  type="number"
                  name="years_experience"
                  min="0"
                  value={fetchData.years_experience}
                  onChange={handleChange}
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
        </section>
      </div>
       <Alert 
          isOpen={alert} 
          message={alertMsg}
          type={alertType}
          onClose={() => setShowAlert(false)}/>
    </div>
  );

}
export default CoSettings;