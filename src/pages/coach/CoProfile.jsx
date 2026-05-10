import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Navbar from "../../components/Navbar.jsx";
import api from "../../axios.jsx";
import { useAuth } from "../../AuthContext.jsx";
import Alert from "../../components/Alert.jsx";
import { openCloudinaryWidget } from "../../cloudinary";
import Confirm from "../../components/Confirm.jsx";

const capitalize = (str) => {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtCurrency = (val) => `$${Number(val ?? 0).toFixed(2)}`;

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



function AvailabilitySection({ showAlert }) {




  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // const [alert, setAlert] = useState({
  //   open: false,
  //   message: "",
  //   type: "success",
  // });
  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
  });

  // const [alert, setAlert] = useState({
  //   open: false,
  //   message: "",
  //   type: "success",
  // });

  // const showAlert = (message, type = "success") => {
  //   setAlert({
  //     open: true,
  //     message,
  //     type,
  //   });
  // };


  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/availability");
      setSlots(r.data || []);
    } finally {
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
      console.log(form)
      await api.post("/coach/availability", form);
      setShowForm(false);
      load();
    } catch (err) {
      setAlert({
        open: true,
        message: "Time slot error!",
        type: "error",
      });

    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/coach/availability/${id}`);
    load();
  };

  const grouped = DAYS.reduce((acc, day) => {
    const s = slots.filter((x) => x.day_of_week === day.value);
    if (s.length) acc[day.label] = s;
    return acc;
  }, {});
  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    const [hour, minute] = timeStr.split(":");
    let h = Number(hour);

    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    return `${h}:${minute} ${ampm}`;
  };

  return (
    <div className="card bg-base-200 shadow-lg border border-base-500 rounded-2xl p-6 flex flex-col gap-4">

      {/* header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">Availability</h2>
          <p className="text-xs text-base-content/50">
            Your weekly coaching schedule
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Slot"}
        </button>
      </div>

      {/* form */}
      {showForm && (
        <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

          <input
            type="time"
            className="input input-bordered input-sm"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />

          <input
            type="time"
            className="input input-bordered input-sm"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />

          <button className="btn btn-sm bg-blue-800 text-white" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}
      {/* 
      <Alert
        isOpen={alert.open}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
      /> */}

      {/* content */}
      {loading ? (
        <Spinner />
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-center text-base-content/40 py-6">
          No availability set
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-bold uppercase text-base-content/40 mb-2">
                {day}
              </p>

              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <div
                    key={slot.availability_id}
                    className="flex items-center gap-2 bg-base-100 rounded-xl px-3 py-2 text-sm"
                  >
                    <span>
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </span>
                    <button
                      className="text-error text-xs"
                      onClick={() => handleDelete(slot.availability_id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function PaymentPlansSection({ coachId, showAlert }) {



  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    billing_type: "onetime"
  });

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/client/coach-payment-plans/${coachId}`);
      console.log(response.data)
      setPlans(response.data || []);
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [coachId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coach/payment-plans", form);
      setShowForm(false);
      setForm({ name: "", amount: "", billing_type: "onetime" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/coach/payment-plans/${id}`);
    load();
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/coach/payment-plans/${editingPlan.payment_plan_id}`, form);

      setEditingPlan(null);
      setShowForm(false);
      setForm({ name: "", amount: "", billing_type: "onetime" });

      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-lg border border-base-500 rounded-2xl p-6 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">Payment Plans</h2>
          <p className="text-xs text-base-content/50">
            Create pricing options for clients
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Plan"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">

          <input
            className="input input-bordered input-sm"
            placeholder="Plan name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="number"
            className="input input-bordered input-sm"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <select
            className="select select-bordered select-sm col-span-2"
            value={form.billing_type}
            onChange={(e) => setForm({ ...form, billing_type: e.target.value })}
          >
            <option value="onetime">One Time</option>
            <option value="recurring">Recurring</option>
          </select>

          <button
            className="btn btn-sm bg-blue-800 text-white col-span-2"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create"}
          </button>
        </form>
      )}

      {/* LIST */}
      {loading ? (
        <Spinner />
      ) : plans.length === 0 ? (
        <p className="text-sm text-center text-base-content/40 py-6">
          No payment plans yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <div
              key={plan.payment_plan_id}
              className="flex justify-between items-center bg-base-100 rounded-xl px-4 py-3"
            >
              {/* LEFT SIDE */}
              <div>
                <p className="font-bold text-sm">{plan.name}</p>
                <p className="text-xs text-base-content/60">
                  ${plan.amount} · {plan.billing_type}
                </p>
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => {
                    setEditingPlan(plan);
                    setForm({
                      name: plan.name,
                      amount: plan.amount,
                      billing_type: plan.billing_type,
                    });
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn btn-xs btn-ghost text-error"
                  onClick={() => handleDelete(plan.payment_plan_id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsSection({ showAlert }) {


  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    type: "default",
    resolve: null,
  });

  const confirm = ({ message, type = "default" }) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        message,
        type,
        onResolve: resolve,
      });
    });
  };

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    document_type: "Certification",
    document_url: "",
    notes: "",
  });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/coach-profile/documents");
      console.log(r.data)
      setDocs(r.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!form.document_url) {
      showAlert("Please upload a document first", "error");
      return;
    }

    setUploading(true);
    try {
      console.log([form]);
      await api.post("/coach/coach-profile/documents", [form]);

      setShowForm(false);
      setForm({ document_type: "certification", document_url: "" });

      await load();
      showAlert("Document uploaded successfully", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to upload.", "error");
    } finally {
      setUploading(false);
    }
  };
  const openCloudinaryWidget = (onSuccess) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
        multiple: false,
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          onSuccess(result.info.secure_url);
        }
      }
    );
    widget.open();
  };
  const handleCloudUpload = () => {
    openCloudinaryWidget((url) => {
      setForm((prev) => ({
        ...prev,
        document_url: url,
      }));
    });
  };



  const handleDelete = async (id) => {
    try {
      await api.delete(`/coach/coach-profile/documents/${id}`);
      await load();
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <div className="card bg-base-200 shadow-lg border border-base-500 rounded-2xl p-6 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">Documents</h2>
          <p className="text-xs text-base-content/50">
            Certifications, licenses, and credentials
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline btn-primary"
          onClick={() => setShowForm((p) => !p)}
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* form */}
      {showForm && (
        <form
          onSubmit={handleUpload}
          className="bg-base-200 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-base-content/60">
                Type
              </label>
              <select
                className="select select-bordered select-sm"
                value={form.document_type}
                onChange={(e) =>
                  setForm({ ...form, document_type: e.target.value })
                }
              >
                {["Certification", "License", "Insurance", "Other"].map((o) => (
                  <option key={o} value={o}>
                    {capitalize(o)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-base-content/60">
                Notes
              </label>
              <input
                className="input input-bordered input-sm"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/60">
              Document URL
            </label>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleCloudUpload}
            >
              Upload Document
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-sm bg-blue-800 text-white"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      )}

      {/* CONTENT */}
      {loading ? (
        <Spinner />
      ) : docs.length === 0 ? (
        <p className="text-sm text-center text-base-content/40 py-6">
          No documents uploaded yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center justify-between bg-base-100 rounded-xl px-4 py-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm">
                  {capitalize(doc.document_type)}
                </span>

                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Link
                </a>
              </div>

              <button
                className="btn btn-xs btn-ghost text-error"
                onClick={() => handleDelete(doc.document_id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ── Invoices ── */
function InvoicesSection({ showAlert }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coach/invoices");
      setInvoices(r.data.invoices || r.data || []);
      console.log(r.data)
    }
    catch (e) { console.error(e); }

    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id) => {
    setPayingId(id);
    try { await api.post("/client/pay-invoice", { invoice_id: id }); await load(); }
    catch (err) { showAlert(err.response?.data?.message || "Failed to pay invoice.", "error"); }
    finally { setPayingId(null); }
  };

  return (
    <div className="card bg-base-200 shadow-lg border border-base-500 rounded-2xl p-6 flex flex-col gap-4">

      {/* header */}
      <div>
        <h2 className="font-bold text-base">Invoices</h2>
        <p className="text-xs text-base-content/50">
          Billing history
        </p>
      </div>

      {/* content */}
      {loading ? (
        <Spinner />
      ) : invoices.length === 0 ? (
        <EmptyState message="No invoices found." />
      ) : (
        <div className="flex flex-col gap-2">
          {invoices.map((inv) => (
            <div
              key={inv.invoice_id}
              className="flex items-center justify-between bg-base-100 rounded-xl px-4 py-3 gap-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">
                  Invoice #{inv.invoice_id}
                </span>
                <span className="text-sm">
                  {fmtCurrency(inv.amount ?? inv.subtotal)}
                </span>
                <span className="text-xs text-base-content/50">
                  {fmtDate(inv.created_at)}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge status={inv.status} />

                {/* {inv.status?.toLowerCase() === "issued" && (
                  <button
                    className="btn btn-xs bg-blue-800 text-white"
                    disabled={payingId === inv.invoice_id}
                    onClick={() => handlePay(inv.invoice_id)}
                  >
                    {payingId === inv.invoice_id ? "Paying…" : "Pay now"}
                  </button>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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


  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

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
            <div className="mt-8 p-6 bg-base-100 shadow-lg border border-base-500 rounded-xl shadow-sm">
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

          <AvailabilitySection showAlert={showAlert} />
          <PaymentPlansSection
            coachId={fetchData?.coach_profile_id}
            showAlert={showAlert}
          />
          <DocumentsSection showAlert={showAlert} />

          <InvoicesSection showAlert={showAlert} />






        </section>


      </div>
      <Alert
        isOpen={alert}
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />

    </div>
  );

}
export default Profile;
