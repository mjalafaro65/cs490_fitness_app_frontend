import { useState, useEffect } from "react";
import api from "../../axios";
import "../../App.css";

const SPECIALTY_TITLES = {
  1: "Weight Loss",
  2: "Muscle Building",
  3: "Cardio & Endurance",
  4: "Nutrition Coaching",
  5: "Yoga & Flexibility",
  6: "Sports Performance",
  7: "Senior Fitness",
  8: "Rehabilitation",
  9: "Weight Management Nutrition",
  10: "Sports Nutrition",
  11: "Plant-Based Nutrition",
  12: "Macro Tracking",
  13: "CrossFit & HIIT",
  14: "Powerlifting",
  15: "Bodyweight Training"
};

function ACoach() {
  const [appli, setAppli] = useState([]);
  const [docs, setDocs] = useState({});
  const [loadingDocs, setLoadingDocs] = useState({});
  const [names, setNames] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCoach, setSelectedCoach] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppli = async () => {
      try {
        const response = await api.get("/admin/coach-applications");
        const pending = response.data.filter((app) => app.status === "pending");
        setAppli(pending);

        const namesMap = {};

        await Promise.all(
          pending.map(async (coach) => {
            try {
              const res = await api.get("/profile", {
                params: { user_id: coach.user_id },
              });

              const profile = res.data;

              namesMap[coach.user_id] = profile.first_name
                ? `${profile.first_name} ${profile.last_name}`
                : "Unknown";
            } catch {
              namesMap[coach.user_id] = "Unknown";
            } finally{
              setLoading(false);
            }
          })
        );

        setNames(namesMap);
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
      }
    };

    fetchAppli();
  }, []);

  const fetchDocumentsForCoach = async (coach) => {
    if (docs[coach.coach_profile_id]) return;

    setLoadingDocs((prev) => ({
      ...prev,
      [coach.coach_profile_id]: true,
    }));

    try {
      const docResp = await api.get("/admin/coach-documents", {
        params: { user_id: coach.user_id },
      });

      setDocs((prev) => ({
        ...prev,
        [coach.coach_profile_id]: docResp.data,
      }));
    } catch {
      setDocs((prev) => ({
        ...prev,
        [coach.coach_profile_id]: [],
      }));
    } finally {
      setLoadingDocs((prev) => ({
        ...prev,
        [coach.coach_profile_id]: false,
      }));
    }
  };

  const reviewDocument = async (docId, status, notes = "") => {
    try {
      await api.patch(`/admin/coach-documents/${docId}`, { status, notes });

      const updatedDocs = { ...docs };

      for (let coachId in updatedDocs) {
        updatedDocs[coachId] = updatedDocs[coachId].map((doc) =>
          doc.document_id === docId ? { ...doc, status } : doc
        );
      }

      setDocs(updatedDocs);
      alert(`Document ${status}`);
    } catch (err) {
      alert(`Failed to update document`);
    }
  };

  const openModal = async (coach) => {
    setSelectedCoach(coach);
    setModalOpen(true);
    await fetchDocumentsForCoach(coach);
  };

  const closeModal = () => {
    setSelectedCoach(null);
    setModalOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <section className="p-6">
          <div className="text-2xl font-bold mb-6">Coach Requests</div>

          <div className="flex flex-col gap-4 w-full">
            {error && <p className="text-red-500">Error: {error}</p>}

            {loading ? (
              <div>Loading...</div>
            ) : appli.length === 0 ? (
              <div>No pending applications</div>
            ) : ( appli.map((app) => (
              <div
                key={app.coach_profile_id}
                className="card bg-base-300 rounded-box p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                {app.profile_photo ? (
                  <img
                    src={app.profile_photo}
                    alt="Coach"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                    N/A
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1">
                  <p>
                    <strong>Name:</strong>{" "}
                    {names[app.user_id] || "Loading..."}
                  </p>
                  <p><strong>Bio:</strong> {app.bio}</p>
                  <p><strong>Experience:</strong> {app.years_experience} years</p>
                  <p>
                    <strong>Specialty:</strong>{" "}
                    {SPECIALTY_TITLES[app.specialty_id] || "Unknown"}
                  </p>
                </div>

                {/* Button */}
                <button
                  className="btn btn-primary mt-2 md:mt-0"
                  onClick={() => openModal(app)}
                >
                  View Documents
                </button>
              </div>
            )))}
          </div>
        </section>

        {/* Modal */}
        {modalOpen && selectedCoach && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-xl relative">

              <button
                className="absolute top-2 right-2 btn btn-sm btn-ghost"
                onClick={closeModal}
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-4">
                Documents for {names[selectedCoach.user_id] || "Coach"}
              </h2>

              {loadingDocs[selectedCoach.coach_profile_id] ? (
                <p>Loading documents...</p>
              ) : docs[selectedCoach.coach_profile_id]?.length > 0 ? (
                <ul className="list-disc ml-5">
                  {docs[selectedCoach.coach_profile_id].map((document) => (
                    <li key={document.document_id} className="mb-2">
                      {document.document_type}:{" "}
                      <a
                        href={document.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View
                      </a>{" "}
                      <span className="ml-2 font-semibold">
                        [{document.status || "pending"}]
                      </span>

                      <div className="mt-1 flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            reviewDocument(document.document_id, "approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() =>
                            reviewDocument(document.document_id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents uploaded</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ACoach;