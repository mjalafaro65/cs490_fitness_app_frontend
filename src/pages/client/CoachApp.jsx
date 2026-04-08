import api from "../../axios"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { openCloudinaryWidget } from "../../cloudinary";



function CoachApply() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [specialties, setSpecialties] = useState([]);

    const [profileData, setProfileData] = useState({
        "specialty_id": 0,
        "years_experience": 0,
        "bio": "",
        "profile_photo": "",
    });
    const [documentData, setDocumentData] = useState([
        { "document_type": "", "document_url": "" }
    ]);


    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await api.get("/coach/specialties")
                console.log(res)
                setSpecialties(res.data)
            } catch (error) {
                console.error("Error fetching specialties:", error);
            }

        }

        fetchSpecialties()
    }, [])

    const addDocument = () => {
        if (documentData.length < 3) {
            setDocumentData([...documentData, { document_type: "", document_url: "" }]);
        }
    };
    const handleTypeChange = (index, value) => {
        const updated = [...documentData];
        updated[index].document_type = value;
        setDocumentData(updated);
    };

    // 3. Handles upload for a specific index
    const handleUpload = (index) => {
        openCloudinaryWidget((url) => {
            const updated = [...documentData];
            updated[index].document_url = url;
            setDocumentData(updated);
        });
    };


    const handleProfilePhotoUpload = () => {
        openCloudinaryWidget((url) => {
            // Update the profileData object specifically
            setProfileData(prev => ({
                ...prev,
                profile_photo: url
            }));
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: (name === "years_experience"|| name ==="specialty_id") ? (parseInt(value) || 0) : value
        }))

    }

    const handleFromSubmit = async (e) => {
        if (e) e.preventDefault();
        // setLoading(true);
        try {
            console.log(profileData)
            const res = await api.post("/coach/coach-profile", profileData)
            console.log(res)

        } catch (err) {
            console.error("Error posting Coach profile data", err.response);
        }

        try {
            console.log(documentData)
            const res = await api.post("/coach/coach-documents", documentData)
            console.log(res)

        } catch (err) {
            console.error("Error posting document data", err.response);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <div className="max-w-3xl mx-auto">
                <section className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Join the Coaching Team</h1>
                    <p className="text-lg text-slate-600">
                        Share your expertise, motivate others, and grow your fitness business with us.
                    </p>
                </section>
                <form className="flex flex-col gap-8 " onSubmit={handleFromSubmit}>

                    {/* SECTION 1: PROFESSIONAL PROFILE */}
                    <div className="card bg-white shadow-sm border border-slate-200">
                        <div className="card-body">
                            <h2 className="card-title text-blue-800 mb-4">Professional Profile</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Specialty */}
                                <div className="form-control">
                                    <label className="label font-semibold">Specialty</label>
                                    <select
                                        name="specialty_id"
                                        className="select select-bordered"
                                        value={profileData.specialty_id}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select your gender</option>
                                        {specialties.map((specialty) => (
                                            <option key={specialty.specialty_id} value={specialty.specialty_id}>
                                                {specialty.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Years of Exp*/}
                                <div className="form-control">
                                    <label className="label font-semibold">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="years_experience"
                                        className="input input-bordered"
                                        placeholder="0"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/*  Bio */}
                                <div className="md:col-span-2">
                                    <label className="label font-semibold">Professional Bio</label>
                                    <textarea
                                        name="bio"
                                        className="textarea textarea-bordered h-32 w-full"
                                        placeholder="Tell potential clients why they should choose you..."
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Profile Photo */}
                                <div className="md:col-span-2">
                                    <label className="label font-semibold text-white">Profile Photo</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleProfilePhotoUpload}
                                            className={`btn w-full border-blue-800 ${profileData.profile_photo
                                                ? 'bg-blue-800 text-white hover:bg-blue-900'
                                                : 'btn-outline text-blue-800 bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            {profileData.profile_photo ? "Change File" : "Upload Photo for Profile Photo"}
                                        </button>

                                        {profileData.profile_photo && (
                                            <span className="text-sm text-green-200">✓ File ready to save</span>
                                        )}
                                    </div>
                                </div>
                            </div>



                        </div>
                    </div>

                    {/* CARD 2: VERIFICATION DOCUMENTS */}
                    <div className="card bg-white shadow-sm border border-slate-200">
                        <div className="card-body">
                            <h2 className="card-title text-blue-800 mb-4">Verification Documents</h2>

                            <div className="flex flex-col gap-4">
                                {documentData.map((doc, index) => (
                                    <div key={index} className="p-4 border rounded-xl bg-slate-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">
                                            Document #{index + 1}
                                        </label>

                                        <div className="flex items-center gap-2">

                                            <input
                                                type="text"
                                                className="input input-bordered input-sm w-32 sm:w-55"
                                                placeholder="Cert Name..."
                                                value={doc.document_type}
                                                onChange={(e) => handleTypeChange(index, e.target.value)}
                                            />

                                            <button
                                                type="button"
                                                className={`btn btn-sm flex-1 ${doc.document_url ? 'bg-blue-800  text-white hover:bg-blue-900' : 'btn-outline border-blue-800 text-blue-800'}`}
                                                onClick={() => handleUpload(index)}
                                            >
                                                {doc.document_url ? "Uploaded ✓" : "Upload File"}
                                            </button>

                                            {/* Remove button for this specific instance */}
                                            <button
                                                type="button"
                                                className={`btn btn-ghost btn-sm text-error ${index === 0 ? 'invisible pointer-events-none' : 'visible'}`}
                                                onClick={() => setDocumentData(documentData.filter((_, i) => i !== index))}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Plus Button that only shows if under the limit */}
                            {documentData.length < 3 && (
                                <button
                                    type="button"
                                    className="btn btn-outline btn-dashed border-slate-300 w-full mt-4 text-slate-500 hover:bg-slate-100"
                                    onClick={addDocument}
                                >
                                    + Add Document ({documentData.length}/3)
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`btn bg-blue-800 text-white w-full ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
}
export default CoachApply