import { useState } from "react";
import "../App.css";

/*add input validation here */

function Log_In(){
    const [signUpData, setData] = useState({
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
        <div>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">Login</legend>
                    <form onSubmit={handleSubmit}>
                        <label className="label">Email: </label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={signUpData.email}
                            onChange={handleChange}
                            required
                        />
                        <label className="label">Password: </label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={signUpData.password}
                            onChange={handleChange}
                            required
                        />
                        <button className="btn btn-neutral mt-4" type="submit">Log In</button>
                    </form>
                </fieldset>
        </div>

    );

}
export default Log_In;
