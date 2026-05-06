import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import Alert from "../../components/Alert.jsx";

function ADashboard() {
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState();
  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  const [appli, setAppli] = useState([]);
  const [names, setNames] = useState({});
  const [error, setError] = useState(null);

  const showAlert = (message, type = 'success') => {
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

              const profile = res.data;

              namesMap[coach.user_id] = profile.first_name
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
        showAlert(err.message || "Failed to fetch applications", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAppli();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await api.get("/admin/users/stats");
        
        const data = response.data;
        console.log("Data:", data);
        
        setStats(data);
        
      } catch (err) {
        console.error("Failed to fetch:", err.response?.data || err);
        showAlert(err.response?.data?.message || "Failed to load statistics", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const openModal = async (coach) => {
    setSelectedCoach(coach);
    setModalOpen(true);
    await fetchDocumentsForCoach(coach);
  };

  const closePopUp = () => {
    setPopOpen(null);
    setSelectedUser(null);
    setUser({ first_name: "", last_name: "", phone_number: "" });
  };

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <div className="p-6">
          <div className="text-2xl font-bold mb-6">Dashboard</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

            <div className="card bg-base-300 rounded-box p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm text-black font-semibold opacity-70 uppercase tracking-wide">
                  Pending Requests
                </h2>
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 bg-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {loading ? (
                <p className="text-sm opacity-50">Checking requests...</p>
              ) : appli?.length > 0 ? (
                <p className="text-3xl font-bold">
                  {appli.length}
                </p>
              ) : (
                <p className="text-sm opacity-50">0 requests</p>
              )}

              <p className="text-xs opacity-50 mt-1">
                Coach applications waiting review
              </p>

              <button
                className="mt-4 btn bg-blue-800 text-white btn-sm"
                onClick={() => navigate("/admin/coach")}
              >
                View Requests
              </button>
            </div>
            <div className="card bg-base-300 rounded-box p-5">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm text-black font-semibold opacity-70 uppercase tracking-wide">
      Quick Actions
    </h2>
  </div>
  
  <div className="space-y-2">
    <button
      onClick={() => navigate("/admin/profile")}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 group border border-blue-100 cursor-pointer"
    >
      <div className="p-1.5 rounded-lg bg-white text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <span className="flex-1 text-left text-sm font-medium text-gray-700">Manage Users</span>
      <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <button
      onClick={() => navigate("/admin/workouts")}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 group border border-blue-100 cursor-pointer"
    >
      <div className="p-1.5 rounded-lg bg-white text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <span className="flex-1 text-left text-sm font-medium text-gray-700">View Workouts</span>
      <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <button
      onClick={() => navigate("/admin/progresslogs")}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 group border border-blue-100 cursor-pointer"
    >
      <div className="p-1.5 rounded-lg bg-white text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <span className="flex-1 text-left text-sm font-medium text-gray-700">Analytics</span>
      <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <button
      onClick={() => navigate("/admin/reviews")}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 group border border-blue-100 cursor-pointer"
    >
      <div className="p-1.5 rounded-lg bg-white text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <span className="flex-1 text-left text-sm font-medium text-gray-700">Manage Reviews</span>
      <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</div>
          </div>


          {loading ? (
            <div className="text-center py-8 opacity-50">Loading stats...</div>
          ) : (
            <>
              {stats?.total_users > 0 && (
                <div className="mt-8 card bg-base-300 rounded-box p-6">
                  <div className="text-base font-bold mb-4">Activity Overview</div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="opacity-60">Active Users</span>
                        <span className="font-semibold">
                          {((stats.active_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-base-100 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.active_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="opacity-60">Inactive Users</span>
                        <span className="font-semibold">
                          {((stats.inactive_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-base-100 rounded-full h-2">
                        <div 
                          className="bg-blue-200 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.inactive_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-base-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black">
                        {((stats.active_users / stats.total_users) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs opacity-60 mt-1">Engagement Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        +{stats.new_users_last_7_days || 0}
                      </p>
                      <p className="text-xs opacity-60 mt-1">New this week</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PopUp isOpen={popOpen !== null} onClose={closePopUp}>
        {/* Add your popup content here if needed */}
      </PopUp>

      <Alert 
        isOpen={alert} 
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default ADashboard;