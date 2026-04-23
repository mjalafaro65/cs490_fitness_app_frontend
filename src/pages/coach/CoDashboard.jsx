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
        setError("Request does not exit or error");
      } finally {
        setLoading(false);
      }

    }

    getRequests();
  }, []);
  return (

    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">Dashboard</div>
          <div className="flex w-full h-60 flex-1 gap-4">
            <div className="card bg-base-300 rounded-box flex-1 grow p-4">
              <h2 className="text-lg font-bold mb-2">My Clients</h2>
              <span className="text-sm opacity-70 mb-3">No clients assigned</span>
              <div className="mt-auto flex justify-center">
              </div>
            </div>
            <div className="card bg-base-300 rounded-box grow p-4">
              <h2 className="text-lg font-bold mb-2">Client Requests</h2>

              {loading ? (
                <span className="text-sm opacity-70">Loading...</span>
              ) : !requests || requests.length == 0 ? (
                <span className="text-sm opacity-70">No requests Yet</span>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.request_id} className="p-2 bg-white rounded shadow-sm">
                      <p className="font-medium">
                        Coach Request: {req.user.first_name} {req.user.last_name}

                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {req.status}

                      </p>
                      <button className="btn" onClick={() => deleteRequest(req.request_id)}>Delete Request</button>

                    </div>
                  ))}
                </div>
              )}

              <span className="text-sm opacity-70 mb-3"></span>
            </div>
          </div>
        </section>
      </div>
    </div>

  )
}
export default CoDashboard;
