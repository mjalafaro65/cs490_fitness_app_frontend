import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios.jsx";

function SetupPage() {
    const [profileData, setProfileData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        profile_photo: "",
        bio: "",
        date_of_birth: "",
        gender: "",
        height: 0,
        weight: 0,
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;

        // List of fields that must be numbers
        const numericFields = ["height", "weight"];

        if (numericFields.includes(name)) {
            // If input is empty, set to null. Otherwise, convert to Number.
            finalValue = value === "" ? null : Number(value);
        }

        setProfileData({
            ...profileData,
            [name]: finalValue
        });
    };

    const handleFinish = async (e) => {
        e.preventDefault();

        // 1. Create a FormData instance
        const formData = new FormData();

        // 2. Append all your text/number fields
        Object.keys(profileData).forEach(key => {
            // Don't append if null (optional)
            if (profileData[key] !== null) {
                formData.append(key, profileData[key]);
            }
        });

        try {
            const response = await api.post("/user/setup-profile", formData);

            if (response.status === 200 || response.status === 201) {
                navigate("client/initial-survey");
            }
        } catch (error) {
            console.error("Upload failed:", error.response?.data);
            alert("Error saving profile photo and data");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileData({
                ...profileData,
                profile_photo: e.target.files[0]
            });
        }
    };

    return (
        <div className="min-h-screen bg-blue-600 p-8">
            <div className="max-w-2xl mx-auto bg-base-100 p-8 rounded-box shadow-xl">
                <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
                <p>Before you get started on your fitness journey, tell us about youself!</p>

                <form onSubmit={handleFinish} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
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
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="form-control">
                        <label className="label font-semibold">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            onChange={handleChange}
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
                            defaultValue="male"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Height */}
                    <div className="form-control">
                        <label className="label font-semibold">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            onChange={handleChange}
                            className="input input-bordered"
                            placeholder="180"
                        />
                    </div>

                    {/* Weight */}
                    <div className="form-control">
                        <label className="label font-semibold">Weight (lb)</label>
                        <input type="number" name="weight" onChange={handleChange} className="input input-bordered" />
                    </div>

                    {/* Profile Photo Upload */}
                    <div className="form-control md:col-span-2">
                        <label className="label font-semibold">Profile Photo</label>
                        <input
                            type="file"
                            name="profile_photo"
                            accept="image/*"
                            onChange={handleFileChange} // Notice: Different handler for files
                            className="file-input file-input-bordered file-input-primary w-full"
                        />
                        {/* Optional Preview */}
                        {profileData.profile_photo && (
                            <div className="mt-2 avatar">
                                <div className="w-24 rounded-xl">
                                    <img src={URL.createObjectURL(profileData.profile_photo)} alt="Preview" />
                                </div>
                            </div>
                        )}
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
                            placeholder="Tell us about your fitness journey..."
                        ></textarea>
                    </div>

                    <button className="btn btn-primary md:col-span-2 mt-6">Save and Continue</button>
                </form>
            </div>
        </div>
    );
}

export default SetupPage;