import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Navbar from "../../components/Navbar.jsx";
import api from "../../axios.jsx";
import { useAuth } from "../../AuthContext.jsx";

const capitalize = (str) => {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtCurrency = (val) => `$${Number(val ?? 0).toFixed(2)}`;

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    issued: "badge-warning", paid: "badge-success", overdue: "badge-error",
    pending: "badge-info", approved: "badge-success", denied: "badge-error",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[status?.toLowerCase()] ?? "badge-ghost"}`}>
      {capitalize(status)}
    </span>
  );
}

function EmptyState({ message }) {
  return <p className="text-sm text-base-content/40 text-center py-8">{message}</p>;
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <span className="loading loading-spinner loading-md opacity-30" />
    </div>
  );
}

/* ── Availability ── */
const DAYS = [
  { label: "Monday", value: 0 },
  { label: "Tuesday", value: 1 },
  { label: "Wednesday", value: 2 },
  { label: "Thursday", value: 3 },
  { label: "Friday", value: 4 },
  { label: "Saturday", value: 5 },
  { label: "Sunday", value: 6 }
];

function AvailabilitySection() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00"
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/availability");
      setSlots(r.data || []);
      console.log(r.data)
    }
    catch (e) {
      console.error(e);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load();
   }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.post("/coach/availability", {
        ...form,
        start_time: formatTime(form.start_time),
        end_time: formatTime(form.end_time)
      });
      console.log(r.data)
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save.");
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/coach/availability/${id}`);
      await load();


    }
    catch (e) { console.error(e); }
  };

  const grouped = DAYS.reduce((acc, day) => {
    const s = slots.filter((x) => x.day_of_week === day.value);
    if (s.length) acc[day.label] = s;
    return acc;
  }, {});

  return (
    <SectionCard
      title="Availability"
      subtitle="Your weekly coaching schedule"
      action={
        <button className="btn btn-sm btn-outline btn-primary" onClick={() => setShowForm((p) => !p)}>
          {showForm ? "Cancel" : "+ Add Slot"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleAdd} className="bg-base-200 rounded-xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/60">Day</label>
            <select
              className="select select-bordered select-sm"
              value={form.day_of_week}
              onChange={(e) =>
                setForm({ ...form, day_of_week: Number(e.target.value) })
              }
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/60">Start</label>

            <input type="time" className="input input-bordered input-sm" value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })} />

          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/60">End</label>
            <input type="time" className="input input-bordered input-sm" value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          
          <button type="submit" className="btn btn-sm bg-blue-800 text-white" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      )}

      {loading ? <Spinner /> : Object.keys(grouped).length === 0 ? (
        <EmptyState message="No availability set. Add a time slot to get started." />
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-1.5">{day}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <div key={slot.availability_id} className="flex items-center gap-2 bg-base-200 rounded-xl px-3 py-2 text-sm">
                    <span className="font-medium">{slot.start_time} – {slot.end_time}</span>
                    <button className="text-error text-xs font-bold" onClick={() => handleDelete(slot.availability_id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ── Documents ── */
function DocumentsSection() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doc_type: "certification", doc_url: "", notes: "" });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/coach-profile/documents");
      console.log(r.data)
      setDocs(r.data || []);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await api.post("/coach/coach-profile/documents", form);

      setShowForm(false);
      setForm({ doc_type: "certification", doc_url: "", notes: "" });
      await load();
    } catch (err) { alert(err.response?.data?.message || "Failed to upload."); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try { await api.delete(`/coach-profile/documents/${id}`); await load(); }
    catch (e) { console.error(e); }
  };

  return (
    <SectionCard
      title="Documents"
      subtitle="Certifications, licenses, and credentials"
      action={
        <button className="btn btn-sm btn-outline btn-primary" onClick={() => setShowForm((p) => !p)}>
          {showForm ? "Cancel" : "+ Add"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleUpload} className="bg-base-200 rounded-xl p-4 mb-5 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-base-content/60">Type</label>
              <select className="select select-bordered select-sm" value={form.doc_type}
                onChange={(e) => setForm({ ...form, doc_type: e.target.value })}>
                {["certification", "license", "insurance", "other"].map((o) => (
                  <option key={o} value={o}>{capitalize(o)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-base-content/60">Notes (optional)</label>
              <input type="text" className="input input-bordered input-sm" placeholder="e.g. Expires Dec 2026"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/60">Document URL</label>
            <input type="url" required className="input input-bordered input-sm" placeholder="https://..."
              value={form.doc_url} onChange={(e) => setForm({ ...form, doc_url: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-sm bg-blue-800 text-white" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      )}

      {loading ? <Spinner /> : docs.length === 0 ? (
        <EmptyState message="No documents uploaded yet." />
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <div key={doc.doc_id} className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 gap-4">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-semibold text-sm">{capitalize(doc.doc_type)}</span>
                {doc.notes && <span className="text-xs text-base-content/50">{doc.notes}</span>}
                <a href={doc.doc_url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate">{doc.doc_url}</a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge status={doc.status || "pending"} />
                <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(doc.doc_id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ── Invoices ── */
function InvoicesSection() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/invoices"); setInvoices(r.data.invoices || r.data || []);
      console.log(r.data)
    }
    catch (e) { console.error(e); }

    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id) => {
    setPayingId(id);
    try { await api.post("/client/pay-invoice", { invoice_id: id }); await load(); }
    catch (err) { alert(err.response?.data?.message || "Failed to pay invoice."); }
    finally { setPayingId(null); }
  };

  return (
    <SectionCard title="Invoices" subtitle="Billing history">
      {loading ? <Spinner /> : invoices.length === 0 ? (
        <EmptyState message="No invoices found." />
      ) : (
        <div className="flex flex-col gap-2">
          {invoices.map((inv) => (
            <div key={inv.invoice_id} className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">Invoice #{inv.invoice_id}</span>
                <span className="text-sm">{fmtCurrency(inv.amount ?? inv.subtotal)}</span>
                <span className="text-xs text-base-content/50">{fmtDate(inv.created_at)}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge status={inv.status} />
                {inv.status?.toLowerCase() === "issued" && (
                  <button className="btn btn-xs bg-blue-800 text-white"
                    disabled={payingId === inv.invoice_id} onClick={() => handlePay(inv.invoice_id)}>
                    {payingId === inv.invoice_id ? "Paying…" : "Pay now"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

const SPECIALTY_TITLES = {
  1: "Weight Loss",
  2: "Muscle Building",
  3: "Cardio & Endurance",
  4: "Nutrition Coaching",
  5: "Yoga & Flexibility",
  6: "Sports Performance",
  7: "Senior Fitness",
  8: "Rehabilitation",
  9: "Weight Management Nutrition",
  10: "Sports Nutrition",
  11: "Plant-Based Nutrition",
  12: "Macro Tracking",
  13: "CrossFit & HIIT",
  14: "Powerlifting",
  15: "Bodyweight Training"
};

function Profile() {
  const { coachStatus, fetchUser } = useAuth()
  const navigate = useNavigate()

  const [fetchData, setData] = useState(null);


  useEffect(() => {
    async function fetchUser() {
      try {


        const response = await api.get("/coach/coach-profile");
        console.log("Response data:", response.data);
        const data = response.data;

        setData(data);


      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response) {
          console.log("Status code:", err.response.status);
          console.log("Response data:", err.response.data);
          console.log("Response headers:", err.response.headers);
        } else if (err.request) {
          console.log("Request sent but no response received:", err.request);
        } else {
          console.log("Error setting up request:", err.message);
        }
      }
    }

    fetchUser();
  }, []);


  const handleSwitchAccount = async (e) => {
    if (e) e.preventDefault();
    try {

      await api.patch("/coach/coach-profile", {
        "status": "switched"
      })
      await fetchUser();

      navigate("/client/dashboard");

    } catch (error) {
      console.error("Switch failed", error);
    }
  }

  return (

    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Profile</div>
          <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
            <div className="flex-shrink-0">
              {fetchData?.profile_photo ? (
                <img
                  src={fetchData.profile_photo}
                  alt="Profile"
                  className="w-32 h-32  rounded-full  object-cover border-2 border-gray-300  "
                />
              ) : (
                <div className="w-50 h-50 bg-blue-800  rounded-full  text-primary-content flex items-center justify-center text-4xl font-bold uppercase border-4 border-base-100 shadow-lg">
                  {fetchData?.user?.first_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>


            <div className="ml-6 flex flex-col gap-3">
              <div>
                <label className="label font-semibold">Name:</label>
                <p className="text-l font-bold">
                  {fetchData?.user?.first_name || fetchData?.user?.last_name
                    ? `${fetchData?.user?.first_name} ${fetchData?.user?.last_name}`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="label font-semibold">Specialty:</label>
                <p className="text-l font-bold">{fetchData?.specialty_name || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Year of Experience:</label>
                <p className="text-l font-bold">{fetchData?.years_experience || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Bio:</label>
                <p className="text-l font-bold">{fetchData?.bio || "—"}</p>
              </div>
            </div>
          </section>
          {coachStatus === "approved" &&
            <div className="mt-8 p-6 bg-base-100 border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Type</h3>

              <div className="flex flex-row items-center justify-between w-full">

                <p className="text-sm text-gray-500">
                  Currently logged in as: <span className="font-semibold text-primary">{coachStatus === "approved" ? 'Coach' : 'Client'}</span>
                </p>

                <button
                  onClick={handleSwitchAccount}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch to {coachStatus === "approved" ? 'Client View' : 'Coach View'}
                </button>

              </div>
            </div>
          }

          <AvailabilitySection />
          <DocumentsSection />
          <InvoicesSection />


        </section>


      </div>
    </div>
  );

}
export default Profile;
