import { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function Landing(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/signup");
    };

    const handleClick2 = () => {
        navigate("/login");
    };

    return (
        <section className="blue">
            <h2>Testing</h2>
            <p>Here information about the page can go here. 
                This is just for testing for now.
            </p>
            <button style = {{marginLeft: "10px"}} onClick={handleClick}>Sign Up</button>
            <button style = {{marginLeft: "10px"}} onClick={handleClick2}>Log In</button>
        </section>

    );

}
export default Landing;
