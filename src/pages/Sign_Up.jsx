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

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-600">
            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-xs border p-4">
                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Sign Up</legend>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="label font-semibold">Enter your email: </label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            placeholder="email@gmail.com"
                            value={signUpData.email}
                            onChange={handleChange}
                            required
                        />
                        <label className="label font-semibold">Create a password: </label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            placeholder="xxxxxxx"
                            value={signUpData.password}
                            onChange={handleChange}
                            required
                        />
                        <label className="flex items-center gap-2">
                            <input type="checkbox" id="terms" name="terms" className="checkbox checkbox-primary" required/>
                            <span className="text-sm">Agree to Terms & Conditions</span>
                        </label>
                        <button className="btn btn-neutral mt-4" type="submit">Register</button>
                    </form>
            </fieldset>
        </div>

    );

}
export default Sign_Up;
