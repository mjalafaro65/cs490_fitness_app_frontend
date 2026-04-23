import { useState, useEffect } from "react";
import api from "../../axios";
import "../../App.css";
import Alert from "../../components/Alert.jsx";

function ACoach() {
  const [appli, setAppli] = useState([]);
  const [docs, setDocs] = useState({});
  const [loadingDocs, setLoadingDocs] = useState({});
  const [names, setNames] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState({}); // Track loading state for actions

  const [selectedCoach, setSelectedCoach] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
      console.log("ALERT FUNCTION CALLED with:", message, type);
      setAlertMsg(message);
      setAlertType(type);
      setShowAlert(true);
  };

  useEffect(() => {
    const fetchAppli = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/coach-applications");
        const pending = response.data.filter((app) => app.status === "pending");
        setAppli(pending);

        const namesMap = {};

        await Promise.all(
          pending.map(async (coach) => {
            try {
              const res = await api.get("/coach/coach-profile", {
                params: { user_id: coach.user_id },
              });

              const person = res.data;

              const profileRes = await api.get("/admin/users", {
                params: { user_id: person.user_id },
              });

              const profile = Array.isArray(profileRes.data)
              ? profileRes.data[0]
              : profileRes.data;

              namesMap[coach.user_id] = profile?.first_name
                ? `${profile.first_name} ${profile.last_name}`
                : "Unknown";
            } catch {
              namesMap[coach.user_id] = "Unknown";
            }
          })
        );

        setNames(namesMap);
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
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

const acceptCoach = async (coach) => {
  if (!window.confirm(`Are you sure you want to accept ${names[coach.user_id] || "this coach"}?`)) return;

  setProcessingAction(prev => ({ ...prev, [coach.coach_profile_id]: true }));

  try {
    await api.patch("/coach/coach-profile", 
      {status: "approved"},  { params: { user_id: coach.user_id } }
    );

    setAppli(prev => prev.filter(a => a.coach_profile_id !== coach.coach_profile_id));
    
    alert(`Coach ${names[coach.user_id] || "application"} has been approved!`);
    closeModal();
  } catch (err) {
    console.error("Failed to accept coach:", err);
    alert(`Failed to accept coach: ${err.response?.data?.message || err.message}`);
  } finally {
    setProcessingAction(prev => ({ ...prev, [coach.coach_profile_id]: false }));
  }
};

  const denyCoach = async (coach) => {
    if (!window.confirm(`Are you sure you want to deny ${names[coach.user_id] || "this coach"}?`)) return;

    setProcessingAction(prev => ({ ...prev, [coach.coach_profile_id]: true }));

    try {
      await api.patch("/coach/coach-profile", 
      { status: "denied" },
      { params: { user_id: coach.user_id } }
    );

      setAppli(prev => prev.filter(a => a.coach_profile_id !== coach.coach_profile_id));
      
      alert(`Coach ${names[coach.user_id] || "application"} has been denied.`);
      closeModal();
    } catch (err) {
        console.error("Failed to deny coach:", err);
        console.error("Full error response:", err.response?.data);
        console.error("Errors details:", err.response?.data?.errors);
        alert(`Failed to deny coach: ${JSON.stringify(err.response?.data?.errors)}`);
    } finally {
      setProcessingAction(prev => ({ ...prev, [coach.coach_profile_id]: false }));
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
            ) : (
              appli.map((app) => (
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

                  <div className="flex-1 flex flex-col gap-1">
                    <p>
                      <strong>Name:</strong>{" "}
                      {names[app.user_id] || "Loading..."}
                    </p>
                    <p><strong>Bio:</strong> {app.bio || "No bio provided"}</p>
                    <p><strong>Experience:</strong> {app.years_experience} year(s)</p>
                    <p>
                      <strong>Specialty:</strong>{" "}
                      {app.specialty_name || "Unknown"}
                    </p>
                  </div>

                  <button
                    className="btn bg-blue-800 mt-2 text-white md:mt-0"
                    onClick={() => openModal(app)}
                  >
                    Review Application
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {modalOpen && selectedCoach && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl relative max-h-[90vh] overflow-y-auto">

              <button
                className="absolute top-2 right-2 btn btn-sm btn-ghost"
                onClick={closeModal}
              >
                X
              </button>

              <h2 className="text-xl font-bold mb-4">
                Review Application: {names[selectedCoach.user_id] || "Coach"}
              </h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Application Summary</h3>
                <p><strong>Experience:</strong> {selectedCoach.years_experience} years</p>
                <p><strong>Specialty:</strong> {selectedCoach.specialty_name || "Unknown"}</p>
                <p><strong>Bio:</strong> {selectedCoach.bio || "No bio provided"}</p>
              </div>

              <h3 className="font-semibold mb-3">Documents</h3>
              {loadingDocs[selectedCoach.coach_profile_id] ? (
                <p>Loading documents...</p>
              ) : docs[selectedCoach.coach_profile_id]?.length > 0 ? (
                <ul className="list-disc ml-5 mb-6">
                  {docs[selectedCoach.coach_profile_id].map((document) => (
                    <li key={document.document_id} className="mb-3">
                      <div className="font-medium">{document.document_type}</div>
                      <a
                        href={document.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm"
                      >
                        View Document
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-yellow-600">No documents uploaded</p>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  className="flex-1 btn btn-success"
                  onClick={() => acceptCoach(selectedCoach)}
                  disabled={processingAction[selectedCoach.coach_profile_id]}
                >
                  {processingAction[selectedCoach.coach_profile_id] ? "Processing..." : "Accept Coach"}
                </button>
                <button
                  className="flex-1 btn bg-red-700 text-white"
                  onClick={() => denyCoach(selectedCoach)}
                  disabled={processingAction[selectedCoach.coach_profile_id]}
                >
                  {processingAction[selectedCoach.coach_profile_id] ? "Processing..." : "Deny Coach"}
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
        <Alert 
          isOpen={alert} 
          message={alertMsg}
          type={alertType}
          onClose={() => setShowAlert(false)}/>
    </div>
  );
}

export default ACoach;