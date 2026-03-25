import { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Landing(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/signup");
    };

    const handleClick2 = () => {
        navigate("/login");
    };

    return (
    <div>
        <div className="navbar bg-base-100 shadow-sm" >
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">FitNet</a>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal gap-x-5 px-3">
                <li><Link to="/coaches">Home</Link></li>
                <li><Link to="/coaches">About Us</Link></li>
                <li><Link to="/coaches">Coaches</Link></li>
                <li>
                    <details>
                    <summary className="btn btn-primary h-8 rounded-t p-2">Login In/Sign Up</summary>
                    <ul class="bg-base-100 rounded-t-none p-2">
                        <li><a>Log In</a></li>
                        <li><a>Sign Up</a></li>
                    </ul>
                    </details>
                </li>
                </ul>
            </div>
        </div>
            <section>
                <div className="flex w-full">
                  < div className="card bg-base-300 rounded-box grid h-40 grow">Testing. Here information about the page can go here. 
                    This is just for testing for now.
                    <button className="btn btn-primary w-30" style = {{marginLeft: "10px"}} onClick={handleClick}>Sign Up</button>
                    <button className="btn btn-primary w-30" style = {{marginLeft: "10px"}} onClick={handleClick2}>Log In</button>
                    </div>
                </div>
            </section>
    </div>
    );

}
export default Landing;
