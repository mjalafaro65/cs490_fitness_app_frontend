import { useState } from "react";
import "../App.css";

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

    const handleChange = (e) => {
        setData({
            ...initialData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", initialData);
    };

    return (
        <div className="form-container">
            <h2>Initial Survey</h2>
            <p>Before you get started on your fitness journey, tell us about yoursefl!</p>
            <form onSubmit={handleSubmit}>
                <div className="form-label">
                    <label>First Name: </label><br />
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Enter your first name"
                        value={initialData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Last Name: </label><br />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Enter your last name"
                        value={initialData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Phone Number: </label><br />
                    <input
                        type="text"
                        name="phone_number"
                        placeholder="Enter your phone number"
                        value={initialData.phone_number}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Date of Birth: </label><br />
                    <input
                        type="date"
                        name="date_of_birth"
                        placeholder="01-01-2001"
                        value={initialData.date_of_birth}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Gender: </label><br />
                    <select id="gender" name="gender" onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                        <option value="other">Other</option>
                        <option value="null">None</option>
                    </select>
                </div>
                <div className="form-label">
                    <label>Profile Photo: </label><br />
                    <input
                        type="url"
                        name="profile_photo"
                        placeholder="Enter a URL here"
                        value={initialData.profile_photo}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-label">
                    <label>Bio: </label><br />
                    <input
                        type="text"
                        name="bio"
                        placeholder="Tell us about yourself!"
                        value={initialData.bio}
                        onChange={handleChange}
                        style={{ height: "50px" }}
                    />
                </div>
                <div className="form-label">
                    <label>Height: </label><br />
                    <input
                        type="number"
                        name="inches"
                        placeholder=""
                        value={initialData.height}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-label">
                    <label>Weight: </label><br />
                    <input
                        type="number"
                        name="weight"
                        min = "0"
                        max = "10000"
                        step = "1"
                        placeholder=""
                        value={initialData.weight}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Get Started!</button>
            </form>
        </div>

    );

}
export default Initial_Survey;
