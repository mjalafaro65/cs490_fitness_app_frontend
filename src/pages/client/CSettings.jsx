import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";

function CSettings(){
  const [isPopOpen, setPopOpen] = useState(null);
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
            const response = await api.post("/auth/setup", initialData); //change this api
            console.log("STATUS:", response.status);

        }
        catch(error){
            console.error("Update failed:", error.response?.data);
            alert("Update failed, please try again");
        }
    };
    
    const handleDelete = async (e) => { //change the api
        e.preventDefault();
        
        try{
            const response = await api.delete("/auth/me");
            console.log("STATUS:", response.status);

        }
        catch(error){
            console.error("Deletio failed:", error.response?.data);
            alert("Update failed, please try again");
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
                        <label className="label font-semibold">Phone Number: </label>
                        <input
                            className="input"
                            type="email"
                            name="Email"
                            onChange={handleChange}
                            required
                        />
                        <label className="label font-semibold">Date of Birth: </label>
                        <input
                            className="input"
                            type="text"
                            name="password"
                            onChange={handleChange}
                            required
                        />
                        <div>
                          <button className="btn btn-primary" type="submit">Confirm</button>
                        </div>
                    </form>
              </fieldset>
              </section>
              <div>
              <button className="btn btn-secondary" onClick={() => setPopOpen("account")}>DELETE ACCOUNT</button>
                <PopUp isOpen={isPopOpen === "account"} onClose={() => setPopOpen(null)}>
                  <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Account</legend>
                        <p>Are you sure you want to delete your account?</p>
                        <button className="btn btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                        <button className="btn btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                </fieldset>
                </PopUp>
              </div>
              <div>
                <button className="btn btn-primary" onClick={() => setPopOpen("retake_survey")}>RETAKE INITIAL SURVEY</button>
                <PopUp isOpen={isPopOpen === "retake_survey"} onClose={() => setPopOpen(null)}>
                  <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Retake Initial Survey</legend>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <label className="label font-semibold">First Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="first_name"
                                placeholder="Enter your first name"
                                value={initialData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Last Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="last_name"
                                placeholder="Enter your last name"
                                value={initialData.last_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Phone Number: </label>
                            <input
                                className="input"
                                type="text"
                                name="phone_number"
                                placeholder="Enter your phone number"
                                value={initialData.phone_number}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Date of Birth: </label>
                            <input
                                className="input"
                                type="date"
                                name="date_of_birth"
                                placeholder="01-01-2001"
                                value={initialData.date_of_birth}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Gender: </label>
                            <select className="select" id="gender" name="gender" value={initialData.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                                <option value="other">Other</option>
                                <option value="null">None</option>
                            </select>
                            <label className="label font-semibold">Profile Photo: </label>
                            <input
                                className="input"
                                type="url"
                                name="profile_photo"
                                placeholder="Enter a URL here"
                                value={initialData.profile_photo}
                                onChange={handleChange}
                            />
                            <label className="label font-semibold">Bio:</label>
                            <div>
                                <textarea className="textarea h-24" 
                                            name="bio"
                                            placeholder="Tell us about yourself!"
                                            value={initialData.bio}
                                            onChange={handleChange}></textarea>
                            </div>
                            <label className="label font-semibold">Height: </label>
                            <input
                                className="input"
                                type="number"
                                name="height"
                                placeholder=""
                                value={initialData.height}
                                onChange={handleChange}
                            />
                            <label className="label font-semibold">Weight: </label>
                            <input
                                className="input"
                                type="number"
                                name="weight"
                                min = "0"
                                max = "10000"
                                step = "1"
                                placeholder=""
                                value={initialData.weight}
                                onChange={handleChange}
                            />
                            <button className="btn btn-neutral mt-4" type="submit">Submit</button>
                        </form>
                </fieldset>
                </PopUp>
              </div>
              <div>
              <button className="btn btn-primary" onClick={() => setPopOpen("transfer")}>Transfer Account</button>
                <PopUp isOpen={isPopOpen === "transfer"} onClose={() => setPopOpen(null)}>
                  <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Transfer Account</legend>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <label className="label font-semibold">First Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="first_name"
                                placeholder="Enter your first name"
                                value={initialData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Last Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="last_name"
                                placeholder="Enter your last name"
                                value={initialData.last_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Email: </label>
                            <input
                                className="input"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={initialData.email}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Documents:</label>
                            <div>
                                <textarea className="textarea h-24" 
                                            name="documents/credentials"
                                            placeholder="Submit your links here"
                                            value={initialData.bio}
                                            onChange={handleChange}></textarea>
                            </div>
                            <button className="btn btn-neutral mt-4" type="submit">Submit</button>
                        </form>
                </fieldset>
                </PopUp>
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("calories")}>Delete Calories</button>
                    <PopUp isOpen={isPopOpen === "calores"} onClose={() => setPopOpen(null)}>
                    <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                        <button className="btn btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                        <button className="btn btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                    </fieldset>
                    </PopUp>
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("steps")}>Delete Steps</button>
                <PopUp isOpen={isPopOpen === "steps"} onClose={() => setPopOpen(null)}>
                    <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                        <button className="btn btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                        <button className="btn btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                    </fieldset>
                    </PopUp>
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("water")}>Delete Water Intake</button> 
                <PopUp isOpen={isPopOpen === "water"} onClose={() => setPopOpen(null)}>
                    <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                        <button className="btn btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                        <button className="btn btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                    </fieldset>
                    </PopUp>
                <button className="btn btn-primary btn-m rounded-t" onClick={() => setPopOpen("workout")}>Delete Workout</button> 
                <PopUp isOpen={isPopOpen === "workout"} onClose={() => setPopOpen(null)}>
                    <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                        <button className="btn btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                        <button className="btn btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                    </fieldset>
                </PopUp>
              </div>
                <PopUp isOpen={isPopOpen === "calories"} onClose={() => setPopOpen(null)}>
                  <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Calories</legend>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <label className="label font-semibold">First Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="first_name"
                                placeholder="Enter your first name"
                                value={initialData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Last Name: </label>
                            <input
                                className="input"
                                type="text"
                                name="last_name"
                                placeholder="Enter your last name"
                                value={initialData.last_name}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Phone Number: </label>
                            <input
                                className="input"
                                type="text"
                                name="phone_number"
                                placeholder="Enter your phone number"
                                value={initialData.phone_number}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Date of Birth: </label>
                            <input
                                className="input"
                                type="date"
                                name="date_of_birth"
                                placeholder="01-01-2001"
                                value={initialData.date_of_birth}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Gender: </label>
                            <select className="select" id="gender" name="gender" value={initialData.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                                <option value="other">Other</option>
                                <option value="null">None</option>
                            </select>
                            <label className="label font-semibold">Profile Photo: </label>
                            <input
                                className="input"
                                type="url"
                                name="profile_photo"
                                placeholder="Enter a URL here"
                                value={initialData.profile_photo}
                                onChange={handleChange}
                            />
                            <label className="label font-semibold">Bio:</label>
                            <div>
                                <textarea className="textarea h-24" 
                                            name="bio"
                                            placeholder="Tell us about yourself!"
                                            value={initialData.bio}
                                            onChange={handleChange}></textarea>
                                <div className="label">Optional (you can always edit this later!)</div>
                            </div>
                            <label className="label font-semibold">Height: </label>
                            <input
                                className="input"
                                type="number"
                                name="height"
                                placeholder=""
                                value={initialData.height}
                                onChange={handleChange}
                            />
                            <label className="label font-semibold">Weight: </label>
                            <input
                                className="input"
                                type="number"
                                name="weight"
                                min = "0"
                                max = "10000"
                                step = "1"
                                placeholder=""
                                value={initialData.weight}
                                onChange={handleChange}
                            />
                            <button className="btn btn-neutral mt-4" type="submit">Get Started!</button>
                        </form>
                </fieldset>
                </PopUp>
            </section>
          </div>
        </div>
    );

}
export default CSettings;
