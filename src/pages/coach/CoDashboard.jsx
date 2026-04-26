import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import api from "../../axios";

function getWeekDays(anchorDate) {
  const d = new Date(anchorDate);
  const day = d.getDay();
  const monday = new Date(d);

  monday.setDate(d.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function CoDashboard() {
  const navigate = useNavigate();

  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const weekDays = getWeekDays(weekAnchor);

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(new Date());

  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [clientWorkouts, setClientWorkouts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const fetchCoachDashboardData = async () => {
    setIsLoadingDashboard(true);

    try {
      const clientsRes = await api.get("/coach/show-client-relationships");
      setClients(clientsRes.data || []);

      const requestsRes = await api.get("/coach/pending-requests");

      const requestsWithUsers = await Promise.all(
        (requestsRes.data || []).map(async (req) => {
          const userRes = await api.get(`/user/${req.client_user_id}`);

          return {
            ...req,
            user: userRes.data,
          };
        })
      );

      setRequests(requestsWithUsers);

      const conversationsRes = await api.get("/messaging/conversations");
      setMessages(conversationsRes.data || []);

      // something like this for future backend:
      // const workoutsRes = await api.get("/coach/workouts");
      // setClientWorkouts(workoutsRes.data || []);
    } catch (err) {
      console.error("Failed to load coach dashboard data:", err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const getWorkoutsForDate = (date) => {
    if (!date) return [];

    return clientWorkouts.filter(
      (w) => new Date(w.date).toDateString() === date.toDateString()
    );
  };

  useEffect(() => {
    fetchCoachDashboardData();
  }, []);

  const selectedWorkouts = getWorkoutsForDate(selectedDay);

  const acceptRequest = async (request) => {
    try {
      await api.post(`/coach/hire-request/${request.request_id}/accept`);
      fetchCoachDashboardData();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await api.post(`/coach/hire-request/${requestId}/deny`);
      fetchCoachDashboardData();
    } catch (err) {
      console.error("Failed to decline request:", err);
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">Dashboard</div>

          <div className="card bg-base-300 rounded-box p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  const d = new Date(weekAnchor);
                  d.setDate(d.getDate() - 7);
                  setWeekAnchor(d);
                }}
              >
                ← Prev
              </button>

              <h2 className="text-base font-bold">
                {weekDays[0].toLocaleDateString("default", {
                  month: "short",
                  day: "numeric",
                })}
                {" — "}
                {weekDays[6].toLocaleDateString("default", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  const d = new Date(weekAnchor);
                  d.setDate(d.getDate() + 7);
                  setWeekAnchor(d);
                }}
              >
                Next →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date, i) => {
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDay);
                const sessions = getWorkoutsForDate(date);
                const hasSession = sessions.length > 0;

                return (
                  <div
                    key={`wd-${i}`}
                    onClick={() => setSelectedDay(date)}
                    className={`
                      cursor-pointer rounded-xl p-2 flex flex-col gap-1 min-h-[110px] transition
                      border-2
                      ${
                        isSelected
                          ? "border-primary bg-blue-800 bg-primary/10"
                          : isToday
                          ? "border-neutral bg-neutral/10"
                          : "border-transparent bg-base-200 hover:bg-base-100"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center mb-1">
                      <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                        {DAY_LABELS[i]}
                      </span>

                      <span
                        className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? "bg-neutral text-neutral-content" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {hasSession ? (
                      sessions.map((s, si) => (
                        <div
                          key={`s-${si}`}
                          className="bg-blue-400/20 text-blue-400 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight truncate"
                          title={`${s.clientName} — ${s.workoutName}`}
                        >
                          {s.clientName}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] opacity-30 text-center mt-auto">
                        No workouts
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card bg-base-300 rounded-box p-4">
              <h2 className="text-base font-bold mb-3">
                {selectedDay.toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              {isLoadingDashboard ? (
                <p className="text-sm opacity-50">Loading workouts...</p>
              ) : selectedWorkouts.length === 0 ? (
                <p className="text-sm opacity-50">
                  No client workouts scheduled for this day.
                </p>
              ) : (
                selectedWorkouts.map((s, si) => (
                  <div
                    key={`workout-${si}`}
                    className="mb-3 p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm">
                        {s.clientName} — {s.workoutName}
                      </p>
                      {s.time && (
                        <span className="text-xs opacity-50">{s.time}</span>
                      )}
                    </div>

                    <button
                      className="btn btn-sm btn-outline mt-2"
                      onClick={() =>
                        navigate(`/coach/clients/${s.clientId}/workouts`)
                      }
                    >
                      View Workout
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="card bg-base-300 rounded-box p-4">
              <h2 className="text-base font-bold mb-3">
                Recent Messages ({messages.length})
              </h2>

              {isLoadingDashboard ? (
                <p className="text-sm opacity-50">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm opacity-50">No messages</p>
              ) : (
                messages.map((conversation) => {
                  const lastMessage = conversation.last_message;

                  return (
                    <div
                      key={conversation.conversation_id}
                      className="p-3 bg-base-200 rounded-lg flex justify-between items-center mb-3"
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          Conversation #{conversation.conversation_id}
                        </p>
                        <p className="text-xs opacity-70">
                          {lastMessage?.body || "No messages yet"}
                        </p>
                      </div>

                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate("/messages")}
                      >
                        Open
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card bg-base-300 rounded-box p-4">
              <h2 className="text-lg font-bold mb-2">Clients</h2>

              {isLoadingDashboard ? (
                <span className="text-sm opacity-70">Loading clients...</span>
              ) : clients.length === 0 ? (
                <span className="text-sm opacity-70">No clients</span>
              ) : (
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-2">
                  {clients.map((client) => (
                    <div
                      key={client.relationship_id}
                      className="bg-base-100 rounded-box p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          {client.user?.first_name} {client.user?.last_name}
                        </p>
                        <p className="text-xs opacity-70">
                          Plan: {client.plan?.name || "No plan"}{" "}
                          {client.plan?.billing_type
                            ? `(${client.plan.billing_type})`
                            : ""}
                        </p>
                        <p className="text-xs opacity-60">
                          Status: {client.status}
                        </p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            navigate(`/coach/clients/${client.user?.user_id}`)
                          }
                        >
                          View Dashboard
                        </button>

                        <div className="dropdown dropdown-end">
                          <button className="btn btn-sm btn-outline">
                            Manage
                          </button>

                          <ul className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
                            <li>
                              <button
                                onClick={() =>
                                  navigate("/coach/workoutplans", {
                                    state: {
                                      clientId: client.user?.user_id,
                                      clientName: `${client.user?.first_name} ${client.user?.last_name}`,
                                    },
                                  })
                                }
                              >
                                Assign Workouts
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/coach/clients/${client.user?.user_id}/progress`
                                  )
                                }
                              >
                                View Progress
                              </button>
                            </li>

                            <li>
                              <button onClick={() => navigate("/messages")}>
                                Message Client
                              </button>
                            </li>

                            <li>
                              <button className="text-error">
                                Drop Client
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-300 rounded-box p-4">
              <h2 className="text-lg font-bold mb-2">Requests</h2>

              {isLoadingDashboard ? (
                <span className="text-sm opacity-70">Loading requests...</span>
              ) : requests.length === 0 ? (
                <span className="text-sm opacity-70">No requests</span>
              ) : (
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-2">
                  {requests.map((request) => (
                    <div
                      key={request.request_id}
                      className="flex justify-between items-center p-3 bg-base-100 rounded-box"
                    >
                      <div>
                        <p className="font-semibold">
                          {request.user?.first_name} {request.user?.last_name}
                        </p>
                        <p className="text-xs opacity-70">
                          Status: {request.status}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => acceptRequest(request)}
                        >
                          Accept
                        </button>

                        <button
                          className="btn btn-sm btn-error"
                          onClick={() =>
                            declineRequest(request.request_id)
                          }
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CoDashboard;
