import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";
import { Link } from "react-router-dom";

/*add input validation here */

function Log_In(){
    const [loginData, setData] = useState({
        email: "", 
        password: ""
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setData({
            ...loginData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await api.post("/auth/login", loginData);
            console.log("Form submitted:", response.data.access_token);
            console.log("STATUS:", response.status);

            if(response.status === 200 || response.status === 201){
                localStorage.setItem("token", response.data.access_token); //storing the access_token
                navigate("/client/dashboard");
            }
        }
        catch(error){
            console.error("Login failed:", error.message);
            alert("Wrong email or password failed, please try again");
        }
    };

    return (
        <div>
            <nav className="navbar bg-base-100">
                <div className="navbar-start">
                    <Link to="/landing" className="btn btn-ghost text-3xl font-semibold">FitNet</Link>
                </div>
            </nav>
            <div className="flex items-center justify-center min-h-screen bg-blue-600">
                <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-xs border p-4">
                    <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Log In</legend>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <label className="label font-semibold">Email: </label>
                            <input
                                className="input"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={loginData.email}
                                onChange={handleChange}
                                required
                            />
                            <label className="label font-semibold">Password: </label>
                            <input
                                className="input"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleChange}
                                required
                            />
                            <button className="btn btn-neutral mt-4" type="submit">Log In</button>
                        </form>
                    </fieldset>
            </div>
        </div>

    );

}
export default Log_In;
