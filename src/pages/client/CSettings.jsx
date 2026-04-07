import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import { Link } from "react-router-dom";

//change the daily wellness thing to make it right

function CSettings() {
    const navigate = useNavigate();
    const [isPopOpen, setPopOpen] = useState(null);

        const [initialData, setData] = useState({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            phone_number: "",
            date_of_birth: "",
            gender: "",
            profile_photo: "",
            bio: "",
            height: "",
            weight: ""
        });

    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        picture: ""
    });

    const handleChange = (e) => {
        setData({
            ...initialData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/auth/setup", initialData);
            console.log("Update Success:", response.status);
            setPopOpen(null); // Close popup on success
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed:", error.response?.data);
            alert("Update failed, please try again");
        }
    };

    //handle account deletion
    const handleDeleteAccount = async () => {

        try {
            const response = await api.delete("/auth/me");
            console.log("Server Response:", response.data);

            localStorage.clear();
            navigate("/");
            window.location.reload();
            
        } catch (error) {
            console.error("Deletion failed:", error.response?.data);
            alert("Could not delete account.");
        }
    };

    //handle deletion of specific data
    const handleDeleteRecord = async () => {
        try {
            const response = await api.patch("/client/delete-daily");
            console.log("Daily record reset:", response.data);
            setPopOpen(null);
        } catch (error) {
            console.error("Failed to reset daily record:", error.response?.data || error);
        }
    };



    return (

        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <section className="p-6 flex flex-col gap-6">
                    <div className="text-2xl font-bold mb-2">Settings</div>
                    <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
                        <div className="flex-shrink-0 ">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="w-32 h-32  rounded-full  object-cover border-2 border-gray-300  "
                                />
                            ) : (
                                <div className="w-50 h-50 bg-blue-800  rounded-full  text-primary-content flex items-center justify-center text-4xl font-bold uppercase border-4 border-base-100 shadow-lg">
                                    {user.first_name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                        </div>
                        <fieldset className="fieldset rounded-box w-full flex-1">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <label className="label font-semibold">First Name: </label>
                                <input
                                    className="input"
                                    type="text"
                                    name="first_name"
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label font-semibold">Last Name: </label>
                                <input
                                    className="input"
                                    type="text"
                                    name="last_name"
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label font-semibold">Phone Number: </label>
                                <input
                                    className="input"
                                    type="email"
                                    name="Email"
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label font-semibold">Date of Birth: </label>
                                <input
                                    className="input"
                                    type="text"
                                    name="password"
                                    onChange={handleChange}
                                    required
                                />
                                <div>
                                    <button className="btn bg-blue-800 btn-primary" type="submit">Confirm</button>
                                </div>
                            </form>
                        </fieldset>
                    </section>
                    <div>
                        <button className="btn border-2 text-l border-black bg-transparent text-black hover:bg-black hover:text-white transition-all font-black" onClick={() => setPopOpen("account")}>DELETE ACCOUNT</button>
                        <PopUp isOpen={isPopOpen === "account"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-white border-2 border-black rounded-box p-6 shadow-xl">

                                <legend className="fieldset-legend px-3 text-xl font-bold bg-black text-white rounded-md">
                                    Delete Account
                                </legend>

                                <p className="text-gray-700 font-medium my-2">
                                    Are you sure you want to delete your account? This action cannot be undone.
                                </p>

                                <div className="flex flex-col gap-3 mt-4">
                                    {/* The "Yes" button */}
                                    <button
                                        type="button"
                                        className="btn bg-blue-800 hover:bg-blue-900 text-white border-none"
                                        onClick={handleDeleteAccount}
                                    >
                                        Yes, DELETE
                                    </button>

                                    {/* The "Cancel" button */}
                                    <button
                                        className="btn bg-gray-200 hover:bg-gray-300 text-black border-none"
                                        onClick={() => setPopOpen(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </fieldset>
                        </PopUp>
                    </div>
                    <div>
                        <button className="btn bg-blue-800 btn-primary" onClick={() => navigate("/setup")}>RETAKE INITIAL SURVEY</button>
                                            {/*can i just do this instead?*/}
                        <PopUp isOpen={isPopOpen === "retake_survey"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Retake Initial Survey</legend>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <label className="label font-semibold">First Name: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="first_name"
                                        placeholder="Enter your first name"
                                        value={initialData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Last Name: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="last_name"
                                        placeholder="Enter your last name"
                                        value={initialData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Phone Number: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="phone_number"
                                        placeholder="Enter your phone number"
                                        value={initialData.phone_number}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Date of Birth: </label>
                                    <input
                                        className="input"
                                        type="date"
                                        name="date_of_birth"
                                        placeholder="01-01-2001"
                                        value={initialData.date_of_birth}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Gender: </label>
                                    <select className="select" id="gender" name="gender" value={initialData.gender} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                        <option value="other">Other</option>
                                        <option value="null">None</option>
                                    </select>
                                    <label className="label font-semibold">Profile Photo: </label>
                                    <input
                                        className="input"
                                        type="url"
                                        name="profile_photo"
                                        placeholder="Enter a URL here"
                                        value={initialData.profile_photo}
                                        onChange={handleChange}
                                    />
                                    <label className="label font-semibold">Bio:</label>
                                    <div>
                                        <textarea className="textarea h-24"
                                            name="bio"
                                            placeholder="Tell us about yourself!"
                                            value={initialData.bio}
                                            onChange={handleChange}></textarea>
                                    </div>
                                    <label className="label font-semibold">Height: </label>
                                    <input
                                        className="input"
                                        type="number"
                                        name="height"
                                        placeholder=""
                                        value={initialData.height}
                                        onChange={handleChange}
                                    />
                                    <label className="label font-semibold">Weight: </label>
                                    <input
                                        className="input"
                                        type="number"
                                        name="weight"
                                        min="0"
                                        max="10000"
                                        step="1"
                                        placeholder=""
                                        value={initialData.weight}
                                        onChange={handleChange}
                                    />
                                    <button className="btn bg-blue-800 btn-neutral mt-4" type="submit">Submit</button>
                                </form>
                            </fieldset>
                        </PopUp>
                    </div>
                    <div>
                        <button className="btn bg-blue-800 btn-primary" onClick={() => setPopOpen("transfer")}>Transfer Account</button>
                        <PopUp isOpen={isPopOpen === "transfer"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Transfer Account</legend>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <label className="label font-semibold">First Name: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="first_name"
                                        placeholder="Enter your first name"
                                        value={initialData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Last Name: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="last_name"
                                        placeholder="Enter your last name"
                                        value={initialData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Email: </label>
                                    <input
                                        className="input"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={initialData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className="label font-semibold">Documents:</label>
                                    <div>
                                        <textarea className="textarea h-24"
                                            name="documents/credentials"
                                            placeholder="Submit your links here"
                                            value={initialData.bio}
                                            onChange={handleChange}></textarea>
                                    </div>
                                    <button className="btn bg-blue-800 btn-neutral mt-4" type="submit">Submit</button>
                                </form>
                            </fieldset>
                        </PopUp>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="btn bg-blue-800 btn-primary btn-m rounded-t mr-2 mb-2"
                            onClick={() => setPopOpen("daily")}
                        >
                            Delete Today's Records
                        </button>
                        <PopUp isOpen={isPopOpen === "daily"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                            <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">
                                Delete Today's Records?
                            </legend>
                            <p className="text-gray-700 my-2">
                                Are you sure you want to delete all your daily wellness records? This action cannot be undone.
                            </p>
                            <div className="flex gap-4 mt-4">
                                <button
                                    className="btn bg-blue-800 btn-neutral"
                                    type="button"
                                    onClick={() => handleDeleteRecord()}
                                >
                                    Yes, DELETE
                                </button>
                                <button
                                    className="btn bg-blue-800 btn-neutral"
                                    type="button"
                                    onClick={() => setPopOpen(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                            </fieldset>
                        </PopUp>
                        </div>
                </section>
            </div>
        </div>
    );
}

export default CSettings;
