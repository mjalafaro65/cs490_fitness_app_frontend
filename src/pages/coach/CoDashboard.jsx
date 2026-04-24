import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";

function CoDashboard() {
  const navigate = useNavigate();
  const [isPopOpen, setPopOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  const [requests, setRequests] = useState([]);

  useEffect(() => {

    const getRequests = async () => {
      try {
        const response = await api.get(`/coach/pending-requests`)


        const reqWithUsers = await Promise.all(
          response.data.map(async (req) => {
            const userReq = await api.get(`/user/${req.client_user_id}`);

            return {
              ...req,
              user: userReq.data
            };
          })
        );
        console.log(reqWithUsers)

        setRequests(reqWithUsers)

      } catch (err) {
        console.log(err.data)
        setError("Request does not exist or error");
      }

    }

    const getClients = async () => {
      try {
        const response = await api.get(`/coach/show-client-relationships`)

        console.log(response.data)
        setClients(response.data)


      } catch (err) {
        console.log(err)

        setError("No relationships exist or error");
      }




    }

    const fetchData = async () => {
      try {
        await Promise.all([getRequests(), getClients()]);
      } catch (err) {
        console.log(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const acceptRequest = async (request_id) => {
    return api.post(`/coach/hire-request/${request_id}/accept`);
  };

  const denyRequest = async (request_id) => {
    return api.post(`/coach/hire-request/${request_id}/deny`);
  };
  const handleDeny = async (request_id) => {
    try {
      await denyRequest(request_id);

      setRequests((prev) =>
        prev.filter((req) => req.request_id !== request_id)
      );

    } catch (err) {
      console.log(err);
      setError("Failed to deny request");
    }
  };
  const handleAccept = async (request_id) => {
    try {
      await acceptRequest(request_id);

      setRequests((prev) =>
        prev.filter((req) => req.request_id !== request_id)
      );

    } catch (err) {
      console.log(err);
      setError("Failed to accept request");
    }
  };
  return (

    <div className="drawer lg:drawer-open bg-gray-50 text-gray-900">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">

          {/* HEADER */}
          <div className="text-2xl font-bold text-gray-900">
            Dashboard
          </div>

          <div className="flex w-full h-60 flex-1 gap-4">

            {/* CLIENTS */}
            <div className="card bg-white border border-gray-200 rounded-xl flex-1 p-4 shadow-sm">
              <h2 className="text-lg font-bold text-blue-800 mb-4">
                My Clients
              </h2>

              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.relationship_id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition"
                  >
                    <p className="font-medium text-gray-900">
                      {client.user.first_name} {client.user.last_name}
                    </p>

                    <p className="text-xs text-gray-600">
                      Plan: <span className="text-blue-800 font-medium">
                        {client.plan.name}
                      </span> ({client.plan.billing_type})
                    </p>

                    <p className="text-xs text-gray-500">
                      Status: {client.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* REQUESTS */}
            <div className="card bg-white border border-gray-200 rounded-xl flex-1 p-4 shadow-sm">

              <h2 className="text-lg font-bold text-blue-800 mb-4">
                Client Requests
              </h2>

              {loading ? (
                <span className="text-gray-500">Loading...</span>
              ) : !requests || requests.length === 0 ? (
                <span className="text-gray-400">No requests yet</span>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.request_id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition"
                    >
                      <p className="font-medium text-gray-900">
                        {req.user.first_name} {req.user.last_name}
                      </p>

                      <p className="text-xs text-gray-600">
                        Status: <span className="text-blue-800 font-medium">
                          {req.status}
                        </span>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-3 py-1 text-xs bg-blue-800 hover:bg-blue-900 text-white rounded"
                          onClick={() => handleAccept(req.request_id)}
                        >
                          Accept
                        </button>

                        <button
                          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                          onClick={() => handleDeny(req.request_id)}
                        >
                          Deny
                        </button>
                      </div>

                      <button
                        className="mt-2 px-3 py-1 text-xs bg-blue-800 hover:bg-blue-900 text-white rounded"
                        onClick={() => deleteRequest(req.request_id)}
                      >
                        Delete
                      </button>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </div>
  )
}
export default CoDashboard;
