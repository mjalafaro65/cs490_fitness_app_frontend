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
  const [conversations, setConversations] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);



  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);



  const getClientsWorkoutsForDate = (date) => {
    const workouts = weekWorkouts.filter(w => isSameDay(new Date(w.scheduled_start), date));

    const grouped = {};
    workouts.forEach(w => {
      const key = w.for_user_id;
      if (!grouped[key]) {
        grouped[key] = {
          clientName: w.user_name || `User ${w.for_user_id}`,  // ← use user_name
          for_user_id: w.for_user_id,
          sessions: []
        };
      }
      grouped[key].sessions.push({
        calendar_workout_id: w.calendar_workout_id,
        plan_day_name: w.plan_day?.day_label || "Workout",
        plan_name: w.plan_day?.plan?.name || "",
        status: w.status,
        scheduled_start: w.scheduled_start,
        exercises: w.plan_day?.exercises || [],  // ← store exercises
        user_name: w.user_name                   // ← store name
      });
    });

    return Object.values(grouped);
  };

  const fetchCoachWeekWorkouts = async (anchorDate) => {
    const dateStr = anchorDate.toISOString().split('T')[0];
    const res = await api.get(`/workouts/calendar-workouts-view?view=week&date=${dateStr}`);
    console.log(res.data)
    setWeekWorkouts(res.data);
  };



  const fetchCoachDashboardData = async () => {
    setIsLoadingDashboard(true);

    try {
      const clientsRes = await api.get("/coach/show-client-relationships");
      console.log(clientsRes)
      const activeClients = clientsRes.data.filter(
        client => client.status !== "terminated"
      );
      console.log(activeClients)

      setClients(activeClients);
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

      const conversationsRes = await api.get("/messaging/inbox");

      const allConvos = conversationsRes.data || [];

      setConversations(allConvos);

      const unread = allConvos.filter((c) => c.unread_count > 0);
      setMessages(unread);

      // something like this for future backend:
      // const workoutsRes = await api.get("/coach-workouts");
      // setClientWorkouts(workoutsRes.data || []);
    } catch (err) {
      console.error("Failed to load coach dashboard data:", err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // const getWorkoutsForDate = (date) => {
  //   if (!date) return [];

  //   return clientWorkouts.filter(
  //     (w) => new Date(w.date).toDateString() === date.toDateString()
  //   );

  // };

  useEffect(() => {
    fetchCoachDashboardData();
  }, []);

  useEffect(() => {
    fetchCoachWeekWorkouts(weekAnchor);
  }, [weekAnchor]);

  const selectedWorkouts = getClientsWorkoutsForDate(selectedDay);

  console.log(selectedWorkouts)

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

          <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
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
                const sessions = getClientsWorkoutsForDate(date);
                const hasSession = sessions.length > 0;

                return (
                  <div
                    key={`wd-${i}`}
                    onClick={() => setSelectedDay(date)}
                    className={`
                      cursor-pointer rounded-xl p-2 flex flex-col gap-1 min-h-[110px] transition
                      border-2
                      ${isSelected
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
                      <div className="relative group">
                        <div className="bg-blue-400/20 text-blue-400 rounded px-1.5 py-0.5 text-[10px] font-semibold text-center">
                          {sessions.length} client{sessions.length > 1 ? 's' : ''}
                        </div>

                        {/* hover tooltip */}
                        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 w-40 text-xs">
                          {sessions.map((s, si) => (
                            <div key={si} className="py-0.5 border-b border-base-200 last:border-0">
                              <div className="font-semibold truncate">{s.clientName}</div>
                              <div className="opacity-60 truncate">{s.workoutName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] opacity-30 text-center mt-auto">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
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
                <p className="text-sm opacity-50">No client workouts scheduled for this day.</p>
              ) : (
                selectedWorkouts.map((client, ci) => (
                  <div key={`client-${ci}`} className="mb-3 p-3 bg-base-100 rounded-lg">
                    <p className="font-semibold text-sm mb-2">{client.clientName}</p>
                    <div className="flex flex-col gap-1">
                      {client.sessions.map((session) => (
                        <div
                          key={session.calendar_workout_id}
                          className="flex justify-between items-center text-xs p-2 bg-base-200 rounded cursor-pointer hover:bg-base-300 transition-colors"
                          onClick={() => setSelectedSession(session)}
                        >
                          <span>{session.plan_name} — {session.plan_day_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${session.status === 'completed' ? 'bg-green-600' :
                            session.status === 'scheduled' ? 'bg-blue-600' : 'bg-gray-500'
                            }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-xs btn-outline mt-2"
                      onClick={() => navigate(`/coach/clients/${client.for_user_id}`)}
                    >
                      View Client
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
              <h2 className="text-base font-bold mb-3">
                Unread Messages ({messages.length})
              </h2>

              {isLoadingDashboard ? (
                <p className="text-sm opacity-50">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm opacity-50">No unread messages</p>
              ) : (
                messages.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className="p-3 bg-base-100 rounded-lg flex justify-between items-center mb-3"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {conversation.other_user?.first_name}{" "}
                        {conversation.other_user?.last_name}
                      </p>

                      <p className="text-xs opacity-70">
                        {conversation.last_message || "No messages yet"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unread_count}
                      </span>

                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate("/messages")}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
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

                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setSelectedClient(client)}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
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
                          className="btn btn-sm btn-primary bg-blue-800"
                          onClick={() => acceptRequest(request)}
                        >
                          Accept
                        </button>

                        <button
                          className="btn btn-sm"
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
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="bg-base-100 rounded-xl p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">
              Manage {selectedClient.user?.first_name}
            </h2>

            <div className="flex flex-col gap-2">
              <button
                className="btn btn-sm"
                onClick={() =>
                  navigate("/coach/workoutplans", {
                    state: {
                      clientId: selectedClient.user?.user_id,
                      clientName: `${selectedClient.user?.first_name} ${selectedClient.user?.last_name}`,
                    },
                  })
                }
              >
                Assign Workouts
              </button>


              <button
                className="btn btn-sm"
                onClick={() => navigate("/messages", { state: { userId: selectedClient.user?.user_id } })}
              >
                Message Client
              </button>

              {/* <button className="btn btn-sm bg-black text-white hover:bg-red-600 hover:text-white transition">
                Drop Client
              </button> */}
            </div>

            <button
              className="btn btn-sm btn-ghost mt-4 w-full"
              onClick={() => setSelectedClient(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold">{selectedSession.plan_name}</h2>
                <p className="text-xs opacity-60">{selectedSession.plan_day_name} — {selectedSession.user_name}</p>
              </div>
              <button className="btn btn-xs btn-ghost" onClick={() => setSelectedSession(null)}>✕</button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${selectedSession.status === 'completed' ? 'bg-green-600' :
                selectedSession.status === 'scheduled' ? 'bg-blue-600' : 'bg-gray-500'
                }`}>{selectedSession.status}</span>
              <span className="text-xs opacity-60">
                {new Date(selectedSession.scheduled_start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}              </span>
            </div>

            <h3 className="font-semibold text-sm mb-2">Exercises</h3>
            <div className="flex flex-col gap-2">
              {selectedSession.exercises.map((ex) => (
                <div key={ex.day_exercise_id} className="bg-base-200 rounded-lg p-3 text-xs">
                  <p className="font-semibold">{ex.exercise?.name}</p>
                  <p className="opacity-60 mt-0.5">{ex.exercise?.muscle_group} — {ex.exercise?.equipment}</p>
                  <div className="flex gap-3 mt-1 opacity-80">
                    {ex.sets > 0 && ex.reps > 0 && <span>{ex.sets}×{ex.reps}</span>}
                    {ex.weight > 0 && <span>@ {ex.weight} lbs</span>}
                    {ex.duration_minutes > 0 && <span>{ex.duration_minutes} min</span>}
                    {ex.notes && <span className="opacity-60 italic">{ex.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoDashboard;