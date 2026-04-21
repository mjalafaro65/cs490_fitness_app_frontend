import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios";
import PopUp from "../../components/PopUp";

function AProfile() {
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
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
        console.log(`Page ${currentPage} response:`, data);
        
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
        
        setHasNextPage(usersArray.length === 20);
        setHasPrevPage(currentPage > 1);
        
        console.log(`Loaded ${usersArray.length} users on page ${currentPage}`);
        
      } catch (err) {
        console.error("Failed to fetch:", err.response?.data || err);
        setUsers([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentPage]); 

  useEffect(() => {
    async function fetchUserInfo() {
      if (!selectedUser) return;
      
      try {
        const response = await api.get(`/user/${selectedUser}`);
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

    fetchUserInfo();
  }, [selectedUser]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await api.delete("/admin/purge-user", {
        data: { user_id: userId }
      });
      console.log("User deleted:", response.data);
      alert("User deleted successfully");
      
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
      
      setUsers(usersArray);
      
      if (usersArray.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      if (selectedUser === userId) {
        setSelectedUser(null);
        setUser({ first_name: "", last_name: "", phone_number: "" });
      }
    } catch (error) {
      console.error("Failed to delete user:", error.response?.data || error);
      alert("Failed to delete user");
    }
  };

  const handleViewUser = (userId) => {
    setSelectedUser(userId);
  };

  const closePopUp = () => {
  setPopOpen(null);
  setSelectedUser(null);
  setUser({ first_name: "", last_name: "", phone_number: "" });
};

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
      setSelectedUser(null);
    }
  };
  
  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
      setSelectedUser(null);
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
                        <th className="p-3 text-left">Phone Number</th>
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
                          <td className="p-3">{user.phone_number || "—"}</td>
                          <td className="p-3">
                            <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
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
                  className={`px-6 py-2 rounded-md font-medium ${
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
                    className={`px-6 py-2 rounded-md font-medium ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="font-bold">User Details</h2>
                <div>
                  <label className="font-semibold">First Name:</label>
                  <p className="text-lg">{user.first_name || "—"}</p>
                </div>
                <div>
                  <label className="font-semibold">Last Name:</label>
                  <p className="text-lg">{user.last_name || "—"}</p>
                </div>
                <div>
                  <label className="font-semibold">Phone Number:</label>
                  <p className="text-lg">{user.phone_number || "—"}</p>
                </div>
              </div>
              
          )}
          </PopUp>
        </div>
      </div>
    </div>
  );
}

export default AProfile;