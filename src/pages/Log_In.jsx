import { useState } from "react";
import "../App.css";

/*add input validation here */

function Log_In(){
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
            <h2>Log In</h2>
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
                <button type="submit">Log In</button>
            </form>
        </div>

    );

}
export default Log_In;
