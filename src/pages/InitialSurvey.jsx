import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";

/*add input validation here */

function Initial_Survey(){
    const [initialData, setData] = useState({
        first_name: "", 
        last_name: "", 
        phone_number: "", 
        date_of_birth: "", 
        gender: "", 
        profile_photo: "", 
        bio: "", 
        height: "", 
        weight: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setData({
            ...initialData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try{
            const response = await api.post("/client/daily-survey", initialData);
            console.log("Form submitted:", response.data);
            console.log("STATUS:", response.status);

            if(response.status === 200 || response.status === 201){
                navigate("/client/dashboard");
            }
        }
        catch(error){
            console.error("Survey failed:", error.response?.data);
            alert("Survey failed, please try again");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-600 py-10">
            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Initial Survey</legend>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <p>Before you get started on your fitness journey, tell us about youself!</p>
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
                        <select className="select" id="gender" name="gender" onChange={handleChange}>
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
                                        onChange={handleChange}>
                            </textarea>
                            <div className="label">Optional (you can always edit this later!)</div>
                        </div>
                        <label className="label font-semibold">Height: </label>
                        <input
                            className="input"
                            type="number"
                            name="inches"
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
        </div>

    );

}
export default Initial_Survey;
