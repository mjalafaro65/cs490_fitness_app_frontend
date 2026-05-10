import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios.jsx";
import { useAuth } from "../AuthContext.jsx";
import Alert from "../components/Alert.jsx";

function SetupPage() {


    const { fetchUser } = useAuth()

    const [alert, setShowAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState('success');

    const showAlert = (message, type = 'success') => {
        console.log("ALERT FUNCTION CALLED with:", message, type);
        setAlertMsg(message);
        setAlertType(type);
        setShowAlert(true);
    };
    const DEFAULT_PHOTO = "https://res.cloudinary.com/dh1rjok0f/image/upload/v1777335485/unknown_pfp_adcb09_zzqxwp.png";

    const [profileData, setProfileData] = useState({
        "first_name": "",
        "last_name": "",
        "phone_number": null,
        "profile_photo": null,
        "bio": null,
        "date_of_birth": null,
        "gender": null,
        "height": 0,
        "weight": 0,
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;

        if (value === "") {
            finalValue = null;
        }
        else if (name === "phone_number") {
            finalValue = formatPhoneNumber(value);
        }
        else {
            const numericFields = ["height", "weight"];
            if (numericFields.includes(name)) {
                finalValue = Number(value);
            }
        }

        setProfileData({
            ...profileData,
            [name]: finalValue
        });
    };
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");

        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

        if (!match) return value;

        let formatted = "";

        if (match[1]) formatted += `(${match[1]}`;
        if (match[1] && match[1].length === 3) formatted += ") ";
        if (match[2]) formatted += match[2];
        if (match[3]) formatted += `-${match[3]}`;

        return formatted;
    };



    const handleFinish = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...profileData,
                profile_photo:
                    profileData.profile_photo === null
                    && DEFAULT_PHOTO

            };

            console.log(payload);


            const res = await api.post("/auth/setup", payload);
            console.log(res)
            await fetchUser()
            navigate("/client/initial-survey");
        } catch (error) {
            console.error("Upload failed:", error);

            showAlert("Error saving profile", "error");
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
                // so widget stays on top of other elements
                zIndex: 2000
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setProfileData(prev => ({
                        ...prev,
                        profile_photo: result.info.secure_url
                    }));
                }
                if (error) {
                    console.error("Cloudinary Widget Error:", error);
                }
            }
        );

        // Open immediately after creation
        widget.open();
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-blue-600 p-8">
            <div className="max-w-2xl mx-auto bg-base-100 p-8 rounded-box shadow-xl">
                <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                <p className="text-gray-500 mb-6">
                    Help us personalize your workouts and nutrition plan in under 2 minutes.
                </p>

                <form onSubmit={handleFinish} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="md:col-span-2 text-lg font-semibold mt-4">Personal Info</div>
                    <div className="form-control">
                        <label className="label font-semibold">First Name</label>
                        <input name="first_name" onChange={handleChange} className="input input-bordered" required />
                    </div>
                    {/* Last Name */}
                    <div className="form-control">
                        <label className="label font-semibold">Last Name</label>
                        <input name="last_name" onChange={handleChange} className="input input-bordered" required />
                    </div>

                    {/* Phone Number */}
                    <div className="form-control">
                        <label className="label font-semibold">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            onChange={handleChange}

                            className="input input-bordered"
                            placeholder="234-567-8900"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="form-control">
                        <label className="label font-semibold">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            onChange={handleChange}
                            max={today}
                            className="input input-bordered"
                        />
                    </div>

                    {/* Gender Select (Enum) */}
                    <div className="form-control">
                        <label className="label font-semibold">Gender</label>
                        <select
                            name="gender"
                            onChange={handleChange}
                            className="select select-bordered w-full"
                            defaultValue=""

                        >
                            <option value="" disabled>Select your gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 text-lg font-semibold mt-4">Body Metrics</div>
                    {/* Height */}
                    <div className="form-control">
                        <label className="label font-semibold">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            onChange={handleChange}
                            className="input input-bordered"
                            placeholder="cm (e.g. 175)"
                        />
                    </div>

                    {/* Weight */}
                    <div className="form-control">
                        <label className="label font-semibold">Weight (lb)</label>
                        <input type="number" name="weight" onChange={handleChange} placeholder="lb (e.g. 160)" className="input input-bordered" />
                    </div>

                    <div className="md:col-span-2 text-lg font-semibold mt-4">Profile</div>
                    {/* Upload profile pic */}
                    <div className="form-control md:col-span-2">
                        <label className="label font-semibold text-white">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleOpenWidget}
                                className="btn btn-outline border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white bg-white"
                            >
                                {profileData.profile_photo ? "Change File" : "Upload Photo or PDF"}
                            </button>

                            {profileData.profile_photo && (
                                <span className="text-sm text-green-200">✓ File ready to save</span>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-semibold text-lg">Bio</span>
                        </label>
                        <textarea
                            name="bio"
                            onChange={handleChange}
                            className="textarea textarea-bordered h-24 w-full"
                            placeholder="Example: I’m trying to lose weight, build strength, and stay consistent 3x/week."
                        ></textarea>
                    </div>

                    <button className="btn btn-primary md:col-span-2 mt-6">Save and Continue</button>
                </form>
            </div>

            <Alert
                isOpen={alert}
                message={alertMsg}
                type={alertType}
                onClose={() => setShowAlert(false)} />
        </div>
    );
}

export default SetupPage;