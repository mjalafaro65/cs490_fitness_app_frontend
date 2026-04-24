import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

function ADashboard(){
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState();
  
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
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  
  {/* Pending Requests Card */}
  <div className="bg-white rounded-lg border border-orange-100 shadow-sm p-5 hover:shadow-md transition-shadow">
    <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">
      Pending Requests
    </h2>

    {loading ? (
      <p className="text-sm text-gray-500">Checking requests...</p>
    ) : appli?.length > 0 ? (
      <p className="text-3xl font-bold text-gray-800">
        {appli.length}
      </p>
    ) : (
      <p className="text-sm text-gray-500">0 requests</p>
    )}

    <p className="text-xs text-gray-500 mt-1">
      Coach applications waiting review
    </p>

    <button
      className="mt-4 btn btn-sm bg-blue-800 text-white"
      onClick={() => navigate("/admin/coach")}
    >
      View Requests
    </button>
  </div>
{/*
  <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
    <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
      Training Content
    </h2>
    <div className="flex gap-6 mt-2">
  
      <div className="flex-1">
        <p className="text-xs text-gray-500">Workouts</p>
        <p className="text-2xl font-bold text-gray-800">
          {stats.total_workouts ?? 0}
        </p>

        <button
          className="mt-2 btn btn-xs bg-blue-800 text-white"
          onClick={() => navigate("/admin/workouts")}
        >
          View
        </button>
      </div>

      <div className="flex-1 border-l pl-4">
        <p className="text-xs text-gray-500">Exercises</p>
        <p className="text-2xl font-bold text-gray-800">
          {stats.total_exercises ?? 0}
        </p>

        <button
          className="mt-2 btn btn-xs bg-blue-800 text-white"
          onClick={() => navigate("/admin/exercises")}
        >
          View
        </button>
      </div>
    </div>
  </div>
*/}
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading stats...</div>
          ) : (
            <>
              <div className="grid grid-cols-4 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Client Users</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.client_users}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-green-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-5">ALL Users</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.active_users}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deleted Users</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.deleted_users}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">New Users (7 days)</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.new_client_users_last_7}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {stats.total_users > 0 && (
                <div className="mt-8 bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Activity Overview</h3>
                  
                  <div className="space-y-4">

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Active Users</span>
                        <span className="text-gray-800 font-medium">
                          {((stats.active_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.active_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Inactive Users</span>
                        <span className="text-gray-800 font-medium">
                          {((stats.inactive_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-gray-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.inactive_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {((stats.active_users / stats.total_users) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Engagement Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        +{stats.new_users_last_7_days}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">New this week</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ADashboard;