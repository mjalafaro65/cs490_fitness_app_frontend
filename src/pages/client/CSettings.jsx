import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import { useAuth } from "../../AuthContext";


function CSettings() {
    const { user } = useAuth()
    const navigate = useNavigate();
    const [isPopOpen, setPopOpen] = useState(null);

    const [initialData, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    });

    // const [user, setUser] = useState({
    //     first_name: "",
    //     last_name: "",
    //     picture: ""
    // });

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
    const handleDeleteRecord = async (type) => {
        try {
            await api.delete(`/client/delete-today/${type}`);
            alert(`${type} records deleted.`);
            setPopOpen(null);
        } catch (error) {
            alert(`Failed to delete ${type} records.`);
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
                            <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 gap-2 w-full">

                                <label className="label font-semibold">First Name: </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    name="first_name"
                                    onChange={handleChange}
                                    required
                                />


                                <label className="label font-semibold">Last Name: </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    name="last_name"
                                    onChange={handleChange}
                                    required
                                />


                                <label className="label font-semibold ">Phone Number: </label>
                                <input
                                    className="input font-semibold "
                                    type="email"
                                    name="Email"
                                    onChange={handleChange}
                                    required
                                />


                                <label className="label font-semibold">Date of Birth: </label>
                                <input
                                    className="input font-semibold"
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
                        <button className="btn bg-blue-800 btn-primary" onClick={() => setPopOpen("retake_survey")}>RETAKE INITIAL SURVEY</button>
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
                        {!user?.roles?.includes(2) && (
                            <button
                                className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300 shadow-sm"
                                onClick={() => navigate("/client/coach-apply")}
                            >
                                Apply to become a Coach
                            </button>
                        )}
                        
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className="btn bg-blue-800  btn-primary btn-m rounded-t" onClick={() => setPopOpen("calories")}>Delete Calories</button>
                        <PopUp isOpen={isPopOpen === "calores"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                                <button className="btn bg-blue-800 btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                                <button className="btn bg-blue-800  btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                            </fieldset>
                        </PopUp>
                        <button className="btn bg-blue-800  btn-primary btn-m rounded-t" onClick={() => setPopOpen("steps")}>Delete Steps</button>
                        <PopUp isOpen={isPopOpen === "steps"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                                <button className="btn bg-blue-800btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                                <button className="btn bg-blue-800 btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                            </fieldset>
                        </PopUp>
                        <button className="btn bg-blue-800 btn-primary btn-m rounded-t" onClick={() => setPopOpen("water")}>Delete Water Intake</button>
                        <PopUp isOpen={isPopOpen === "water"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                                <button className="btn bg-blue-800 btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                                <button className="btn bg-blue-800 btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                            </fieldset>
                        </PopUp>
                        <button className="btn bg-blue-800  btn-primary btn-m rounded-t" onClick={() => setPopOpen("workout")}>Delete Workout</button>
                        <PopUp isOpen={isPopOpen === "workout"} onClose={() => setPopOpen(null)}>
                            <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                                <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Today's Records?</legend>
                                <button className="btn bg-blue-800  btn-secondary mt-4" onSubmit={handleSubmit}>Yes, DELETE</button>
                                <button className="btn bg-blue-800 btn-neutral mt-4" onSubmit={handleSubmit}>Cancel</button>
                            </fieldset>
                        </PopUp>
                    </div>
                    <PopUp isOpen={isPopOpen === "calories"} onClose={() => setPopOpen(null)}>
                        <fieldset className="fieldset bg-base-200 border-base-500 rounded-box w-s border p-4">
                            <legend className="fieldset-legend px-2 text-xl bg-base-200 rounded-box">Delete Calories</legend>
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
                                    <div className="label">Optional (you can always edit this later!)</div>
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
                                <button className="btn bg-blue-800  btn-neutral mt-4" type="submit">Get Started!</button>
                            </form>
                        </fieldset>
                    </PopUp>
                </section>
            </div>
        </div>
    );




    // return (
    //     <div className="drawer lg:drawer-open bg-base-100">
    //         <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
    //         <div className="drawer-content p-6 max-w-4xl mx-auto">
    //             <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

    //             {/* profile info */}
    //             <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
    //                 <div className="flex flex-col md:flex-row gap-8 items-start">
    //                     {/* avatar  */}
    //                     <div className="flex flex-col items-center gap-4">
    //                         {user.picture ? (
    //                             <img src={user.picture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-50" />
    //                         ) : (
    //                             <div className="w-32 h-32 bg-blue-800 rounded-full text-white flex items-center justify-center text-4xl font-bold uppercase shadow-inner">
    //                                 {user.first_name?.[0] || "?"}
    //                             </div>
    //                         )}
    //                         <button className="btn btn-ghost btn-sm">Change Photo</button>
    //                     </div>

    //                     {/* form/info */}
    //                     <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

    //                         <div className="form-control">
    //                             <label className="label font-semibold">First Name</label>
    //                             <input className="input input-bordered" name="first_name" value={initialData.first_name} onChange={handleChange} required />
    //                         </div>
    //                         <div className="form-control">
    //                             <label className="label font-semibold">Last Name</label>
    //                             <input className="input input-bordered" name="last_name" value={initialData.last_name} onChange={handleChange} required />
    //                         </div>
    //                         <div className="form-control md:col-span-2">
    //                             <label className="label font-semibold">Bio</label>
    //                             <textarea className="textarea textarea-bordered" name="bio" value={initialData.bio} onChange={handleChange} />
    //                         </div>
    //                         <div className="md:col-span-2">
    //                             <button className="btn bg-blue-800 text-white w-full md:w-auto px-10" type="submit">Save Changes</button>
    //                         </div>

    //                     </form>
    //                 </div>
    //             </section>

    //             {/* coach apply and survey actions*/}
    //             <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    //                 <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
    //                     <h3 className="font-bold text-lg mb-2">Coach Application</h3>
    //                     <p className="text-sm text-gray-600 mb-4">Want to help others? Transition your account to a coaching profile.</p>
    //                     <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 w-full" onClick={() => navigate("/client/coach-apply")}>
    //                         Apply to become a Coach
    //                     </button>
    //                 </div>

    //                 <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
    //                     <h3 className="font-bold text-lg mb-2">Health Survey</h3>
    //                     <p className="text-sm text-gray-600 mb-4">Update your fitness goals, height, or weight by retaking the survey.</p>
    //                     <button className="btn bg-blue-800 text-white w-full" onClick={() => setPopOpen("retake_survey")}>
    //                         Retake Initial Survey
    //                     </button>
    //                 </div>
    //             </section>

    //             {/* danger zone */}
    //             <section className="p-6 rounded-xl border-2 border-black bg-transparent text-black bg-black">
    //                 <h3 className="text-black font-bold text-lg mb-4 flex items-center gap-2">
    //                     <span className="badge  badge-sm  text-black bg-black"></span> Danger Zone
    //                 </h3>

    //                 <div className="flex flex-wrap gap-2 mb-6">
    //                     {['calories', 'steps', 'water', 'workout'].map((type) => (
    //                         <button
    //                             key={type}
    //                             className="btn btn-outline btn-sm capitalize"
    //                             onClick={() => setPopOpen(type)}
    //                         >
    //                             Reset {type}
    //                         </button>
    //                     ))}
    //                 </div>

    //             </section>
    //             {/* delete button*/}
    //             <div className="divider"></div>
    //             <div className="flex justify-center">
    //                 <button
    //                     className="btn btn-ghost text-black hover:bg-gray-200"
    //                     onClick={() => setPopOpen("account")}
    //                 >
    //                     Delete Account
    //                 </button>
    //             </div>
    //             {/* POPUPS REMAIN THE SAME - JUST WRAP THEM AT THE BOTTOM */}
    //             <PopUp isOpen={isPopOpen === "account"} onClose={() => setPopOpen(null)}>
    //                 {/* Your Delete logic */}
    //             </PopUp>
    //         </div>
    //     </div>
    // );



    // return (
    //     <div className="drawer lg:drawer-open bg-base-100">
    //         <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

    //         <div className="drawer-content p-6">
    //             {/* This inner div controls the "form width" while the background stays full-width */}
    //             <div className="max-w-4xl mx-auto flex flex-col gap-8">

    //                 {/* HEADER */}
    //                 <header className="flex justify-between items-center">
    //                     <h1 className="text-3xl font-bold">Settings</h1>
    //                     {/* Subtle placement for the Coach Apply button if you want it top-right */}
    //                     <button
    //                         className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 shadow-sm"
    //                         onClick={() => navigate("/client/coach-apply")}
    //                     >
    //                         Become a Coach
    //                     </button>
    //                 </header>

    //                 {/* MAIN PROFILE CARD */}
    //                 <section className="card bg-base-100 shadow-xl border border-base-300">
    //                     <div className="card-body">
    //                         <h2 className="card-title mb-4">Profile Information</h2>
    //                         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                             {/* ... your first_name, last_name, etc inputs ... */}

    //                             <div className="md:col-span-2 mt-4">
    //                                 <button className="btn bg-blue-800 text-white px-10" type="submit">
    //                                     Update Profile
    //                                 </button>
    //                             </div>
    //                         </form>
    //                     </div>
    //                 </section>

    //                 {/* SECONDARY ACTIONS GRID */}
    //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                     <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col justify-between">
    //                         <div>
    //                             <h3 className="font-bold text-blue-900">Health Survey</h3>
    //                             <p className="text-sm text-blue-700 mt-1">Update your physical metrics and fitness goals.</p>
    //                         </div>
    //                         <button className="btn bg-blue-800 text-white mt-6" onClick={() => setPopOpen("retake_survey")}>
    //                             Retake Survey
    //                         </button>
    //                     </div>

    //                     {/* DANGER ZONE PREVIEW */}
    //                     <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
    //                         <h3 className="font-bold text-red-900">Data Management</h3>
    //                         <p className="text-sm text-red-700 mt-1">Reset today's logs or remove your account.</p>
    //                         <div className="flex flex-wrap gap-2 mt-6">
    //                             <button className="btn btn-xs btn-outline btn-error" onClick={() => setPopOpen("calories")}>Calories</button>
    //                             <button className="btn btn-xs btn-outline btn-error" onClick={() => setPopOpen("steps")}>Steps</button>
    //                             <button className="btn btn-xs btn-outline btn-error" onClick={() => setPopOpen("water")}>Water</button>
    //                         </div>
    //                     </div>
    //                 </div>

    //                 {/* FINAL DANGER BUTTON */}
    //                 <div className="divider"></div>
    //                 <div className="flex justify-center">
    //                     <button
    //                         className="btn btn-ghost text-red-600 hover:bg-red-50"
    //                         onClick={() => setPopOpen("account")}
    //                     >
    //                         Delete Account
    //                     </button>
    //                 </div>

    //             </div>
    //         </div>
    //     </div>
    // );

}
export default CSettings;
