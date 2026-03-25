import { useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import "../App.css";
import api from "../axios.jsx";
import Forms from "../components/Forms.jsx";

/*add input validation here */

function Sign_Up(){
    const navigate = useNavigate();

    const signUpFields = [
        {name: "email", label: "Email", type: "email", placeholder: "Enter your email", required: true},
        {name: "password", label: "Password", type: "text", placeholder: "Enter your password", required: true}
    ];

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
        <Form 
            title="Sign Up"
            fields={signUpFields}
            onSubmit={handleSubmit}
            check={{id: "terms"}} 
        />

    );

}
export default Sign_Up;
