import { useState } from "react";
import "../App.css";

/*add input validation here */

function Sign_Up(){
    const [signUpData, setData] = useState({
        first_name: "", 
        last_name: "", 
        email: "", 
        password: ""
    });

    const handleChange = (e) => {
        setData({
            ...signUpData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", signUpData);
    };

    return (
        <div className="form-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-label">
                    <label>First Name: </label><br />
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Enter your first name"
                        value={signUpData.first_name}
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
                        value={signUpData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Email: </label><br />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-label">
                    <label>Password: </label><br />
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={signUpData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{display: "flex", alignItems: "left", gap: "0.5rem", marginBottom: "10px"}}>
                    <input type="checkbox" id="terms" name="terms" />
                    <label htmlFor="terms">Agree to Terms & Conditions</label>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>

    );

}
export default Sign_Up;
