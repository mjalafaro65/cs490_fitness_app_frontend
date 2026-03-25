import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";

/*add input validation here */

function Sign_Up(){
    const [signUpData, setData] = useState({
        email: "", 
        password: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setData({
            ...signUpData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const termsAndCond = document.getElementById("terms");
        if(!termsAndCond.checked){
            alert("Please agree to the Terms & Conditions to proceed");
            return;
        }
        try{
            const response = await api.post("/auth/register", signUpData);
            console.log("Form submitted:", response.data);
            console.log("STATUS:", response.status);

            if(response.status === 200 || response.status === 201){
                navigate("/initialsurvey");
            }
        }
        catch(error){
            console.error("Signup failed:", error.response?.data);
            alert("Signup failed, please try again");
        }
    };

    /* and then go to the initial_survey page*/

    return (
        <div className="form-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
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
