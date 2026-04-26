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

  // State for coach profile
  const [hasCoachProfile, setHasCoachProfile] = useState(false);
  const [coachProfile, setCoachProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [coachDebug, setCoachDebug] = useState(null); // For debug info
  
  // New state to store coach status for each user in the table
  const [userCoachStatus, setUserCoachStatus] = useState({});

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

  // Debug helper function
  const debugLog = (title, data, isError = false) => {
    console.group(`🐛 DEBUG: ${title}`);
    if (isError) {
      console.error('❌ Error:', data);
    } else {
      console.log('📦 Data:', data);
      console.log('📊 Type:', typeof data);
      console.log('🔍 Is Array:', Array.isArray(data));
      if (data && typeof data === 'object') {
        console.log('🔑 Keys:', Object.keys(data));
        console.log('📏 Length:', data.length || Object.keys(data).length);
      }
    }
    console.groupEnd();
  };

  // Axios interceptors for debugging
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(request => {
      console.log(`🌐 ${request.method?.toUpperCase()} ${request.url}`);
      if (request.params) console.log('📤 Request params:', request.params);
      if (request.data) console.log('📤 Request data:', request.data);
      return request;
    });
    
    const responseInterceptor = api.interceptors.response.use(
      response => {
        console.log(`✅ Response from ${response.config.url}:`, response.status);
        return response;
      },
      error => {
        console.error(`❌ Error in ${error.config?.url}:`, error.response?.status);
        console.error('Error details:', error.response?.data);
        return Promise.reject(error);
      }
    );
    
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Function to check if a user has a coach profile
  const checkUserCoachStatus = async (userId) => {
    // Return cached status if available
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
      // If error (404, etc.), user doesn't have coach profile
      setUserCoachStatus(prev => ({ ...prev, [userId]: false }));
      return false;
    }
  };

  // Batch check coach status for all users on current page
  const batchCheckCoachStatus = async (usersArray) => {
    console.log(`🔍 Batch checking coach status for ${usersArray.length} users...`);
    
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
    console.log(`✅ Batch check complete. Found ${Object.values(newStatuses).filter(v => v === true).length} coaches`);
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
    async function fetchUserInfo() {
      if (!selectedUser) return;
      
      console.log('\n' + '='.repeat(80));
      console.log(`🔍 STARTING COACH PROFILE CHECK FOR USER: ${selectedUser}`);
      console.log('='.repeat(80) + '\n');
      
      try {
        // Reset states
        setHasCoachProfile(false);
        setCoachProfile(null);
        setProfileType(null);
        setCoachDebug(null);
        
        // Fetch basic user info
        console.group(`📡 1. Fetching basic user info for ${selectedUser}`);
        const response = await api.get(`/user/${selectedUser}`);
        const data = response.data;
        console.log('✅ User data received:', data);
        console.log('🔑 User data keys:', Object.keys(data));
        console.log('👤 User name:', data.first_name, data.last_name);
        console.groupEnd();

        setUser({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || ""
        });

        // CHECK FOR COACH PROFILE - DETAILED DEBUGGING
        console.group(`📡 2. CHECKING COACH PROFILE for user_id: ${selectedUser}`);
        console.log('🔄 Making API call to: /coach/coach-profile');
        console.log('📤 With params:', { user_id: selectedUser });
        
        try {
          const coachResponse = await api.get("/coach/coach-profile", {
            params: { user_id: selectedUser }
          });
          
          console.log('✅ Coach API Response Status:', coachResponse.status);
          console.log('✅ Coach API Response Headers:', coachResponse.headers);
          console.log('✅ Coach API Response Data:', coachResponse.data);
          console.log('🔑 Coach response keys:', Object.keys(coachResponse.data));
          
          // Check if response has coach_profile_id
          if (coachResponse.data && coachResponse.data.coach_profile_id) {
            console.log('🎉 SUCCESS: User HAS a coach profile!');
            console.log('📋 Coach Profile Details:');
            console.log('  - coach_profile_id:', coachResponse.data.coach_profile_id);
            console.log('  - specialty_name:', coachResponse.data.specialty_name);
            console.log('  - years_experience:', coachResponse.data.years_experience);
            console.log('  - status:', coachResponse.data.status);
            console.log('  - bio:', coachResponse.data.bio);
            console.log('  - profile_photo:', coachResponse.data.profile_photo);
            console.log('  - approved_at:', coachResponse.data.approved_at);
            console.log('  - created_at:', coachResponse.data.created_at);
            
            setHasCoachProfile(true);
            setCoachProfile(coachResponse.data);
            setCoachDebug({
              status: 'success',
              message: 'Coach profile found',
              data: coachResponse.data
            });
          } else {
            console.log('⚠️ Response received but no coach_profile_id found');
            console.log('Response structure:', coachResponse.data);
            console.log('Available fields:', Object.keys(coachResponse.data));
            setHasCoachProfile(false);
            setCoachDebug({
              status: 'no_profile_id',
              message: 'Response missing coach_profile_id',
              data: coachResponse.data
            });
          }
          
        } catch (coachErr) {
          console.error('❌ Coach profile fetch FAILED');
          console.error('Error object:', coachErr);
          console.error('Error response status:', coachErr.response?.status);
          console.error('Error response statusText:', coachErr.response?.statusText);
          console.error('Error response data:', coachErr.response?.data);
          console.error('Error message:', coachErr.message);
          
          // Detailed error analysis
          if (coachErr.response?.status === 404) {
            console.log('📝 INTERPRETATION: User is NOT a coach (404 Not Found)');
            console.log('   This is expected for users without coach profiles');
          } else if (coachErr.response?.status === 422) {
            console.log('📝 INTERPRETATION: Invalid request or user may not exist');
            console.log('   Error details:', coachErr.response?.data);
          } else if (coachErr.response?.status === 401) {
            console.log('🔒 INTERPRETATION: Authentication error - you may not have permission');
          } else if (coachErr.response?.status === 403) {
            console.log('🚫 INTERPRETATION: Authorization error - admin permission required');
          } else if (coachErr.response?.status === 500) {
            console.log('💥 INTERPRETATION: Server error');
          }
          
          setHasCoachProfile(false);
          setCoachDebug({
            status: 'error',
            message: coachErr.message,
            statusCode: coachErr.response?.status,
            errorData: coachErr.response?.data
          });
        }
        console.groupEnd();

        // Try alternative coach profile endpoints for debugging
        console.group(`📡 3. TESTING ALTERNATIVE ENDPOINTS (for debugging)`);
        
        // Try without user_id parameter
        console.log('🔄 Testing /coach/coach-profile without params...');
        try {
          const noParamResponse = await api.get("/coach/coach-profile");
          console.log('Response without params:', noParamResponse.data);
          console.log('This returns the authenticated user\'s coach profile, not user', selectedUser);
        } catch (err) {
          console.log('Failed without params:', err.response?.status);
        }
        
        // Try with different parameter name
        console.log(`🔄 Testing /coach/coach-profile?coach_id=${selectedUser}...`);
        try {
          const coachIdResponse = await api.get("/coach/coach-profile", {
            params: { coach_id: selectedUser }
          });
          console.log('Response with coach_id param:', coachIdResponse.data);
        } catch (err) {
          console.log('Failed with coach_id param:', err.response?.status);
        }
        
        // Try with different parameter format
        console.log(`🔄 Testing /coach/coach-profile/${selectedUser}...`);
        try {
          const pathResponse = await api.get(`/coach/coach-profile/${selectedUser}`);
          console.log('Response with path param:', pathResponse.data);
        } catch (err) {
          console.log('Failed with path param:', err.response?.status);
        }
        
        console.groupEnd();

        // Try to fetch client profile (for debugging)
        console.group(`📡 4. CHECKING CLIENT PROFILE (for info)`);
        try {
          const clientResponse = await api.get("/client/profile");
          console.log('Client profile response (authenticated user):', clientResponse.data);
          const data2 = clientResponse.data;
          setUser2({
            date_of_birth: data2.date_of_birth || "",
            gender: data2.gender ? data2.gender.split(".")[1] : data2.gender || "",
            bio: data2.bio || "",
            profile_photo: data2.profile_photo || "",
            height: data2.height || "",
            weight: data2.weight || ""
          });
        } catch (clientErr) {
          console.log('Client profile not available:', clientErr.message);
        }
        console.groupEnd();

        // Determine profile type based on findings
        console.group(`📡 5. FINAL PROFILE TYPE DETERMINATION`);
        console.log('hasCoachProfile:', hasCoachProfile);
        console.log('hasClientProfile:', !!user2.date_of_birth);
        
        if (hasCoachProfile && user2.date_of_birth) {
          setProfileType('both');
          console.log('🎯 RESULT: User has BOTH coach and client profiles');
        } else if (hasCoachProfile) {
          setProfileType('coach');
          console.log('🎯 RESULT: User has ONLY coach profile');
        } else if (user2.date_of_birth) {
          setProfileType('client');
          console.log('🎯 RESULT: User has ONLY client profile');
        } else {
          setProfileType('basic');
          console.log('🎯 RESULT: User has basic account only (no coach or client profile)');
        }
        console.groupEnd();
        
        console.log('\n' + '='.repeat(80));
        console.log(`🔍 COACH PROFILE CHECK COMPLETE FOR USER: ${selectedUser}`);
        console.log(`📊 FINAL RESULT: hasCoachProfile = ${hasCoachProfile}`);
        if (hasCoachProfile && coachProfile) {
          console.log(`📊 Coach Profile ID: ${coachProfile.coach_profile_id}`);
          console.log(`📊 Specialty: ${coachProfile.specialty_name}`);
        }
        console.log('='.repeat(80) + '\n');

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
        debugLog('User Info Fetch Error', err, true);
        showAlert('Failed to fetch user details', 'error');
      }
    }

    fetchUserInfo();
  }, [selectedUser]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await api.delete("/admin/purge-user", {
        data: {user_id: userId}
      });
      console.log("User deleted:", response.data);
      showAlert("User deleted successfully", "success");
      
      const fetchResponse = await api.get("/admin/users", {
        params: {
          page: currentPage,
          per_page: 20
        }
      });
      
      const newData = fetchResponse.data;
      let usersArray = [];
      if (Array.isArray(newData)) {
        usersArray = newData;
      } else if (newData.users && Array.isArray(newData.users)) {
        usersArray = newData.users;
      } else if (newData.data && Array.isArray(newData.data)) {
        usersArray = newData.data;
      }
      
      const sortedUsers = sortUsersByUserId(usersArray);
      setUsers(sortedUsers);
      
      setUserCoachStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[userId];
        return newStatus;
      });
      
      if (sortedUsers.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      if (selectedUser === userId) {
        setSelectedUser(null);
        setUser({ first_name: "", last_name: "", phone_number: "" });
        setHasCoachProfile(false);
        setCoachProfile(null);
      }
    } catch (error) {
      console.error("Failed to delete user:", error.response?.data || error);
      showAlert(error.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const handleUser = async (userId, currentStatus) => {
    const shouldActivate = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${shouldActivate ? 'activate': 'deactivate'} this user?`)) return;
    
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
      
      const sortedUsers = sortUsersByUserId(updatedUsers);
      setUsers(sortedUsers);

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
    setCoachDebug(null);
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
                                onClick={() => handleUser(user.user_id, user.is_active)}
                                className={`btn btn-sm ${
                                  user.is_active 
                                    ? 'border-black text-black'  
                                    : 'border-black text-black' 
                                }`}
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.user_id)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="col-span-full mt-2">
                    <h3 className="font-bold text-lg text-blue-800">User Details</h3>
                    <hr className="my-2" />
                </div>
                <div>
                  <label className="font-semibold">First Name:</label>
                  <p className="text-md">{user.first_name || "—"}</p>
                </div>
                <div>
                  <label className="font-semibold">Last Name:</label>
                  <p className="text-md">{user.last_name || "—"}</p>
                </div>
                <div>
                  <label className="font-semibold">Phone Number:</label>
                  <p className="text-md">{user.phone_number || "—"}</p>
                </div>
                
                {/* Coach Profile Section */}
                {hasCoachProfile && coachProfile && (
                  <>
                    <div className="col-span-full mt-4">
                      <h3 className="font-bold text-lg text-blue-800">Coach Profile</h3>
                      <hr className="my-2" />
                    </div>
                    <div>
                      <label className="font-semibold">Specialty:</label>
                      <p className="text-md">{coachProfile.specialty_name || "—"}</p>
                    </div>
                    <div>
                      <label className="font-semibold">Years Experience:</label>
                      <p className="text-md">{coachProfile.years_experience || "—"}</p>
                    </div>
                    <div>
                      <label className="font-semibold">Status:</label>
                      <p className="text-lg">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          coachProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                          coachProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {coachProfile.status || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="col-span-full">
                      <label className="font-semibold">Bio:</label>
                      <p className="text-md">{coachProfile.bio || "—"}</p>
                    </div>
                  </>
                )}
              </div>
            )}
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