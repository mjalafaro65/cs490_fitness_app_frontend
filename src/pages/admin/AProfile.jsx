import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios";
import PopUp from "../../components/PopUp";
import Alert from "../../components/Alert";

function AProfile() {
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  const [hasCoachProfile, setHasCoachProfile] = useState(false);
  const [coachProfile, setCoachProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);
  
  const [userCoachStatus, setUserCoachStatus] = useState({});
  const [actionUser, setActionUser] = useState(null); 

  const showAlert = (message, type = 'success') => {
      console.log("ALERT FUNCTION CALLED with:", message, type);
      setAlertMsg(message);
      setAlertType(type);
      setShowAlert(true);
  };
  
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  const [user2, setUser2] = useState({
    date_of_birth: "",
    gender: "",
    bio: "",
    profile_photo: "",
    height: "",
    weight: ""
  });

  const checkUserCoachStatus = async (userId) => {
    if (userCoachStatus[userId] !== undefined) {
      return userCoachStatus[userId];
    }
    
    try {
      const response = await api.get("/coach/coach-profile", {
        params: { user_id: userId }
      });
      
      const hasCoach = !!(response.data && response.data.coach_profile_id);
      setUserCoachStatus(prev => ({ ...prev, [userId]: hasCoach }));
      return hasCoach;
    } catch (err) {

      setUserCoachStatus(prev => ({ ...prev, [userId]: false }));
      return false;
    }
  };

  const batchCheckCoachStatus = async (usersArray) => {
    console.log(`Batch checking coach status for ${usersArray.length} users...`);
    
    const promises = usersArray.map(async (user) => {
      if (userCoachStatus[user.user_id] !== undefined) {
        return { userId: user.user_id, hasCoach: userCoachStatus[user.user_id] };
      }
      
      try {
        const response = await api.get("/coach/coach-profile", {
          params: { user_id: user.user_id }
        });
        const hasCoach = !!(response.data && response.data.coach_profile_id);
        return { userId: user.user_id, hasCoach };
      } catch (err) {
        return { userId: user.user_id, hasCoach: false };
      }
    });
    
    const results = await Promise.all(promises);
    const newStatuses = {};
    results.forEach(result => {
      newStatuses[result.userId] = result.hasCoach;
    });
    
    setUserCoachStatus(prev => ({ ...prev, ...newStatuses }));
    console.log(`Batch check complete. Found ${Object.values(newStatuses).filter(v => v === true).length} coaches`);
  };

useEffect(() => {
  async function fetchUsers() {
    try {
      setLoading(true);
      
      const response = await api.get("/admin/users", {
        params: {
          page: currentPage,
          per_page: 20
        }
      });
      
      const data = response.data;
      
      let usersArray = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersArray = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersArray = data.data;
      } else {
        usersArray = [];
      }
      
      setUsers(usersArray);
      
      await batchCheckCoachStatus(usersArray);
      
      setHasNextPage(usersArray.length === 20);
      setHasPrevPage(currentPage > 1);
      
    } catch (err) {
      console.error("Failed to fetch:", err.response?.data || err);
      setUsers([]);
      setHasNextPage(false);
      showAlert("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }

  fetchUsers();
}, [currentPage]);

useEffect(() => {
  if (!selectedUser) return;
  
  const fetchUserInfo = async () => {
    try {
      setHasCoachProfile(false);
      setCoachProfile(null);
      setProfileType(null);
      
      const [userResponse, coachResponse] = await Promise.all([
        api.get(`/user/${selectedUser}`),
        api.get("/coach/coach-profile", { params: { user_id: selectedUser } }).catch(() => ({ data: null }))
      ]);
      
      const userData = userResponse.data;
      setUser({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone_number: userData.phone_number || ""
      });
   
      const hasCoach = coachResponse.data?.coach_profile_id;
      if (hasCoach) {
        setHasCoachProfile(true);
        setCoachProfile(coachResponse.data);
        setProfileType('coach');
      } else {
        setProfileType('client');
      }
      
    } catch (err) {
      console.error("Failed to fetch user:", err);
      showAlert('Failed to fetch user details', 'error');
    }
  };
  
  fetchUserInfo();
}, [selectedUser]);

const handleDeleteUser = async (userId) => {
  try {
    let coachProfileId = null;
    try {
      const coachCheck = await api.get("/coach/coach-profile", {
        params: { user_id: userId }
      });
      if (coachCheck.data && coachCheck.data.coach_profile_id) {
        coachProfileId = coachCheck.data.coach_profile_id;
        console.log("Found coach profile ID:", coachProfileId);
      }
    } catch (err) {
      console.log("No coach profile found for user");
    }

    if (coachProfileId) {
      console.log("Deleting coach profile first...");
      try {
        await api.delete("/admin/purge-user", { data: { coach_profile_id: coachProfileId } });
      } catch (err) {
        console.error("Failed to delete coach profile:", err);
      }
    }

    console.log("Deleting user...");
    const response = await api.delete("/admin/purge-user", {
      data: { user_id: userId }
    });

    console.log("User deleted:", response.data);
    showAlert("User deleted successfully", "success");
    
    // Update UI
    const updatedUsers = users.filter(user => user.user_id !== userId);
    setUsers(updatedUsers);

    if (updatedUsers.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUser({ first_name: "", last_name: "", phone_number: "" });
      setHasCoachProfile(false);
      setCoachProfile(null);
    }
    
    if (actionUser?.user_id === userId) {
      setActionUser(null);
    }
    
  } catch (error) {
    console.error("Failed to delete user:", error.response?.data || error);
    showAlert(error.response?.data?.message || "Failed to delete user", "error");
  }
};

  const handleUser = async (userId, currentStatus) => {
    const shouldActivate = !currentStatus;
    
    try {
      const response = await api.patch("/admin/users/disable", {
        user_id: userId,
        is_active: shouldActivate
      });
      console.log(`User ${shouldActivate ? 'activated' : 'deactivated'}:`, response.data);
      showAlert(`User ${shouldActivate ? 'activated' : 'deactivated'} successfully`, "success");

      const updatedUsers = users.map(user => 
        user.user_id === userId ? { ...user, is_active: shouldActivate } : user
      );
      
      setUsers(updatedUsers);

    } catch (error) {
      console.error("Failed to update user:", error.response?.data || error);
      showAlert(error.response?.data?.message || "Failed to update user status", "error");
    }
  };

  const handleViewUser = (userId) => {
    setSelectedUser(userId);
  };

  const closePopUp = () => {
    setPopOpen(null);
    setSelectedUser(null);
    setUser({ first_name: "", last_name: "", phone_number: "" });
    setHasCoachProfile(false);
    setCoachProfile(null);
    setProfileType(null);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
      setSelectedUser(null);
      setUserCoachStatus({});
    }
  };
  
  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
      setSelectedUser(null);
      setUserCoachStatus({});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>
          
          <div className="mb-8">
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th className="p-3 text-left">User ID</th>
                        <th className="p-3 text-left">First Name</th>
                        <th className="p-3 text-left">Last Name</th>
                        <th className="p-3 text-left">Coach Account</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.user_id} className="border-b hover:bg-base-100">
                          <td className="p-3">{user.user_id}</td>
                          <td className="p-3">{user.first_name || "—"}</td>
                          <td className="p-3">{user.last_name || "—"}</td>
                          <td className="p-3">
                            {userCoachStatus[user.user_id] === undefined ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                <span className="text-xs text-gray-500">Checking...</span>
                              </div>
                            ) : userCoachStatus[user.user_id] ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                Coach
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Client
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`badge ${user.is_active ? 'badge border-2 border-blue-800' : 'badge border-2 border-gray-600'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {handleViewUser(user.user_id); setPopOpen("userDetails");}}
                                className="btn btn-sm bg-blue-800 text-white"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => {
                                  setActionUser(user);
                                  setPopOpen("deactivate");
                                }}
                                className="btn btn-sm border-black text-black"
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => {
                                  setActionUser(user);
                                  setPopOpen("deleteConfirm");
                                }}
                                className="btn btn-sm bg-red-600 text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={prevPage}
                    disabled={!hasPrevPage}
                    className={`px-6 py-2 rounded-md font-medium cursor-pointer ${
                      hasPrevPage
                        ? 'bg-blue-800 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>
                  
                  <button
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    className={`px-6 py-2 rounded-md font-medium cursor-pointer ${
                      hasNextPage
                        ? 'bg-blue-800 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
          
            <PopUp isOpen={popOpen === "userDetails"} onClose={closePopUp}>
            {selectedUser && (
              <div className="px-2 pb-4">
                {/* User Details Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-300 pl-3">
                      User Details
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        First Name
                      </label>
                      <p className="text-gray-900 font-medium mt-1">{user.first_name || "—"}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Last Name
                      </label>
                      <p className="text-gray-900 font-medium mt-1">{user.last_name || "—"}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-gray-900 font-medium mt-1">{user.phone_number || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Coach Profile Section */}
                {hasCoachProfile && coachProfile && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-800 pl-3">
                        Coach Profile
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Specialty
                        </label>
                        <p className="text-gray-900 font-medium mt-1">{coachProfile.specialty_name || "—"}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Years Experience
                        </label>
                        <p className="text-gray-900 font-medium mt-1">{coachProfile.years_experience || "—"}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Status
                        </label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            coachProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                            coachProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              coachProfile.status === 'approved' ? 'bg-green-600' :
                              coachProfile.status === 'pending' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}></span>
                            {coachProfile.status || "—"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Bio
                        </label>
                        <p className="text-gray-900 font-medium mt-1 leading-relaxed">
                          {coachProfile.bio || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </PopUp>
          <PopUp isOpen={popOpen === "deleteConfirm"} onClose={closePopUp}>
            <div className="text-center p-4">

              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{actionUser?.first_name} {actionUser?.last_name}</span>?<br />
                <p className="text-red-600 font-semibold">This action cannot be undone.</p>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closePopUp}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(actionUser?.user_id);
                    closePopUp();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </PopUp>

          <PopUp isOpen={popOpen === "deactivate"} onClose={closePopUp}>
            <div className="text-center p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {actionUser?.is_active ? 'Deactivate User' : 'Activate User'}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to {actionUser?.is_active ? 'deactivate' : 'activate'} 
                <span className="font-semibold text-gray-700"> {actionUser?.first_name} {actionUser?.last_name}</span>?
                {actionUser?.is_active && (
                  <span className="block mt-2 text-xs text-red-600">
                    Note: Deactivated users will not be able to access the platform.
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closePopUp}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUser(actionUser?.user_id, actionUser?.is_active);
                    closePopUp();
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                    actionUser?.is_active 
                      ? 'bg-blue-800 hover:bg-blue-700' 
                      : 'bg-blue-800 hover:bg-blue-700'
                  }`}
                >
                  {actionUser?.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </PopUp>
        </div>
      </div>
      <Alert 
        isOpen={alert} 
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}/>
    </div>
  );
}

export default AProfile;