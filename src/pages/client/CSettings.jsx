import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import { useAuth } from "../../AuthContext";
import Alert from "../../components/Alert";

function CSettings() {
    const { user } = useAuth()
    const navigate = useNavigate();
    const [isPopOpen, setPopOpen] = useState(null);

    const [deleteStep, setDeleteStep] = useState(1);
    const [reason, setReason] = useState("");
    const [detailedReason, setDetailedReason] = useState("");

    const [alert, setShowAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState('success');

    const showAlert = (message, type = 'success') => {
        console.log("ALERT FUNCTION CALLED with:", message, type);
        setAlertMsg(message);
        setAlertType(type);
        setShowAlert(true);
    };

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


    const [users, setUser] = useState({
        first_name: "",
        last_name: "",
        phone_number: ""
    });

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get("/client/profile");

                const data = response.data;

                console.log("Response data:", data);

                setData({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || "",
                    password: data.password || "",
                    phone_number: data.phone_number || "",
                    date_of_birth: data.date_of_birth || "",
                    gender: data.gender || "",
                    profile_photo: data.profile_photo || "",
                    bio: data.bio || "",
                    height: data.height || "",
                    weight: data.weight || "",
                });

            } catch (err) {
                console.error("Failed to fetch user:", err.response?.data || err);
            }
        }

        fetchUser();
    }, []);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get("/user/me");
                const data = response.data;

                setUser({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    phone_number: data.phone_number || ""
                });

            } catch (err) {
                console.error("Failed to fetch user:", err.response?.data || err);
            }
        }

        fetchUser();
    }, []);

    const handleChange = (e) => {
        setUser({
            ...users, [e.target.name]: e.target.value
        });
        setData({
            ...initialData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedData = {
            date_of_birth: initialData.date_of_birth,
            bio: initialData.bio,
            profile_photo: initialData.profile_photo,
            height: Number(initialData.height),
            weight: Number(initialData.weight),
        };

        const formattedData2 = {
            first_name: users.first_name,
            last_name: users.last_name,
            phone_number: users.phone_number
        };

        try {
            const response = await api.put("/client/profile", formattedData);
            const response2 = await api.patch("/user/me", formattedData2);

            console.log("SUCCESS:", response.data);
            console.log("SUCCESS:", response2.data);

            showAlert("Profile updated successfully!", "success");
        } catch (error) {
        console.error("ERROR occurred:", error);
        showAlert(error.response?.data?.message || "Failed to update profile", "error");
            if (error.response || error.response2) {
                console.error("Backend errors:", error.response.data);
                //console.error("Backend errors:", error.response2.data);
            } else {
                console.error("No response received");
            }
        }
    };

    const handleDeleteAccount = async () => {

        try {

            const response = await api.delete("/user/me", {
                data: {
                    reason:reason,
                    detailed_reason: detailedReason
                }

            });
            console.log("Server Response:", response.data);

            localStorage.clear();
            navigate("/");
            window.location.reload();

        } catch (error) {
            console.error("Deletion failed:", error.response?.data);
            showAlert("Could not delete account.", "error");
        }
    };

    const handleDeleteRecord = async () => {
        try {
            const response = await api.patch("/client/delete-daily");
            console.log("Daily record reset:", response.data);
            showAlert("Daily record reset", "success");
            setPopOpen(null);
        } catch (error) {
            console.error("Failed to reset daily record:", error.response?.data || error);
            showAlert(error.response?.data?.message || "Failed to reset daily record", "error");
        }
    };

    const handleOpenWidget = () => {
        if (!window.cloudinary) {
            console.error("Cloudinary script not found. Is it in index.html?");
            return;
        }

        const myCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const myPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: myCloudName,
                uploadPreset: myPreset,
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: true,
                clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
                zIndex: 2000
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setData(prev => ({
                        ...prev,
                        profile_photo: result.info.secure_url
                    }));
                    showAlert("Photo uploaded successfully! Don't forget to save your changes.", "success");
                }
                if (error) {
                    console.error("Cloudinary Widget Error:", error);
                    showAlert("Failed to upload photo", "error");
                }
            }
        );

        widget.open();
    };

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <section className="p-6 flex flex-col gap-6">
                    <div className="text-2xl font-bold mb-2">Settings</div>
                    <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            {initialData?.profile_photo ? (
                                <img
                                    src={initialData.profile_photo}
                                    alt="Profile"
                                    className="w-32 h-32  rounded-full  object-cover border-2 border-gray-300  "
                                />
                            ) : (
                                <div className="w-50 h-50 bg-blue-800  rounded-full  text-primary-content flex items-center justify-center text-4xl font-bold uppercase border-4 border-base-100 shadow-lg">
                                    {users?.first_name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleOpenWidget}
                                    className="btn btn-outline border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white bg-white"
                                >
                                Edit Image
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100">

                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-600">First Name</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    name="first_name"
                                    value={users.first_name}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-600">Last Name</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    name="last_name"
                                    value={users.last_name}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                />
                            </div>

                            <div className="flex flex-col md:col-span-2 gap-1">
                                <span className="font-semibold text-gray-600">Phone Number</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    name="phone_number"
                                    value={users.phone_number}
                                    onChange={handleChange}
                                    placeholder="XXX-XXX-XXXX"
                                />
                            </div>
                            {/*
                            <div className="flex flex-col md:col-span-2 gap-1">
                                <span className="font-semibold text-gray-600">Email</span>
                                <input
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="email"
                                name="email"
                                value={initialData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                />
                            </div>
                            */}

                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-600">Date of Birth</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="date"
                                    name="date_of_birth"
                                    value={initialData.date_of_birth}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col md:col-span-2 gap-1">
                                <span className="font-semibold text-gray-600">Bio</span>
                                <textarea
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    name="bio"
                                    value={initialData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-600">Height (cm)</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                    name="height"
                                    value={initialData.height}
                                    onChange={handleChange}
                                    placeholder="Height"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-600">Weight (kg)</span>
                                <input
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                    name="weight"
                                    value={initialData.weight}
                                    onChange={handleChange}
                                    placeholder="Weight"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="btn bg-blue-800 btn-primary btn-m rounded-t mr-2 mb-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </section>
                    <div>
                        <button className="btn border-2 text-l border-black bg-transparent text-black hover:bg-black hover:text-white transition-all font-black" onClick={() => setPopOpen("account")}>DELETE ACCOUNT</button>
                        <PopUp isOpen={isPopOpen === "account"} onClose={() => {
                            setPopOpen(null);
                            setDeleteStep(1);
                        }}>

                            <fieldset className="fieldset bg-white border-2 border-black rounded-box p-6 shadow-xl">

                                <legend className="fieldset-legend px-3 text-xl font-bold bg-black text-white rounded-md">
                                    Delete Account
                                </legend>

                                {/* step 1 */}
                                {deleteStep === 1 && (
                                    <>
                                        <p className="text-gray-700 font-medium my-2">
                                            Are you sure you want to delete your account? This action cannot be undone.
                                        </p>

                                        <div className="flex flex-col gap-3 mt-4">
                                            <button
                                                type="button"
                                                className="btn bg-red-700 hover:bg-red-900 text-white"
                                                onClick={() => setDeleteStep(2)}
                                            >
                                                Yes, continue
                                            </button>

                                            <button
                                                className="btn bg-gray-200 hover:bg-gray-300 text-black"
                                                onClick={() => setPopOpen(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* step 2 */}
                                {deleteStep === 2 && (
                                    <>
                                        <p className="font-medium mb-2">
                                            Why are you deleting your account?
                                        </p>

                                        <select
                                            className="border p-2 w-full mb-3"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        >
                                            <option value="">Select reason</option>
                                            <option value="Too expensive">Too expensive</option>
                                            <option value="Not using it">Not using it</option>
                                            <option value="Found better app">Found better app</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        <textarea
                                            className="border p-2 w-full"
                                            placeholder="Optional details..."
                                            value={detailedReason}
                                            onChange={(e) => setDetailedReason(e.target.value)}
                                        />

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                className="btn bg-black text-white"
                                                onClick={() => setDeleteStep(3)}
                                            >
                                                Continue
                                            </button>

                                            <button
                                                className="btn bg-gray-300"
                                                onClick={() => setDeleteStep(1)}
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* step 3 */}
                                {deleteStep === 3 && (
                                    <>
                                        <p className="text-red-600 font-bold">
                                            Final confirmation: This cannot be undone.
                                        </p>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                className="btn bg-red-700 text-white"
                                                onClick={handleDeleteAccount}
                                            >
                                                Delete Forever
                                            </button>

                                            <button
                                                className="btn bg-gray-300"
                                                onClick={() => setDeleteStep(2)}
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </>
                                )}

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
                                    <label className="label font-semibold">Password: </label>
                                    <input
                                        className="input"
                                        type="text"
                                        name="text"
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
                <Alert 
                    isOpen={alert} 
                    message={alertMsg}
                    type={alertType}
                    onClose={() => setShowAlert(false)}/>
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