import { useState, useEffect } from "react";
import "../../App.css";
import api from "../../axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

function CProfile() {
  const { fetchUser, coachStatus } = useAuth();

  const navigate = useNavigate();

  const [bioData, setData] = useState(null);
  const [user, setUser] = useState(null);

  const [popOpen, setPopOpen] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userRes = await api.get("/user/me");
        console.log(userRes)
        setUser(userRes.data);

        const profileRes = await api.get("/client/profile");
        console.log(profileRes)

        const data = profileRes.data;

        console.log("Response data:", data);

        setData(data);

      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data || err);
      }
    }

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...bioData,
      [name]:
        name === "height" || name === "weight"
          ? value === "" ? "" : Number(value)
          : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bioData.height <= 0 || bioData.weight <= 0) {
      alert("Height and weight must be greater than 0");
      return;
    }

    try {
      console.log("Sending:", bioData);

      const response = await api.put("/client/profile", bioData);

      console.log("SUCCESS:", response.data);

    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
    }
  };

  const capitalize = (string) => {
    if (!string) return "—";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleSwitchAccount = async (e) => {
    e.preventDefault();
    try {

      await api.patch("/coach/coach-profile", {
        "status": "approved"
      })
      await fetchUser();

      navigate("/coach/dashboard");

    } catch (error) {
      console.error("Switch failed", error);
    }
  }

  const fetchInvoices = async () => {
    setInvoiceLoading(true);
    setInvoiceError(null);
  
    try {
      const res = await api.get("/client/invoices");
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err.response?.data || err);
      setInvoiceError("Failed to load invoices.");
    } finally {
      setInvoiceLoading(false);
    }
  };
  
  const handleOpenInvoices = async () => {
    setPopOpen("invoices");
    await fetchInvoices();
  };
  
  const handlePayInvoice = async (invoiceId) => {
    try {
      await api.post("/client/pay-invoice", {
        invoice_id: invoiceId,
      });
  
      alert("Invoice paid successfully.");
      await fetchInvoices();
    } catch (err) {
      console.error("Failed to pay invoice:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
        err.response?.data?.description ||
        "Failed to pay invoice."
      );
    }
  };

  return (

    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-2">Profile</div>
          <section className="p-10 flex flex-col md:flex-row gap-30 items-start">
            <div className="flex-shrink-0 ">
              {bioData?.profile_photo ? (
                <img
                  src={bioData.profile_photo}
                  alt="Profile"
                  className="w-32 h-32  rounded-full  object-cover border-2 border-gray-300  "
                />
              ) : (
                <div className="w-50 h-50 bg-blue-800  rounded-full  text-primary-content flex items-center justify-center text-4xl font-bold uppercase border-4 border-base-100 shadow-lg">
                </div>
              )}
            </div>


            <div className="ml-6 flex flex-col gap-3">
              <div>
                <label className="label font-semibold">Name:</label>
                <p className="text-xl font-bold">
                  {`${user?.first_name} ${user?.last_name}`|| user?.first_name || user?.last_name || "—"}
                </p>
              </div>
              <div>
                <label className="label font-semibold">Date of Birth:</label>
                <p className="text-xl font-bold">{bioData?.date_of_birth || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Gender:</label>
                <p className="text-xl font-bold">{capitalize(bioData?.gender) || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Bio:</label>
                <p className="text-xl font-bold">{bioData?.bio || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Height:</label>
                <p className="text-xl font-bold">{bioData?.height || "—"}</p>
              </div>
              <div>
                <label className="label font-semibold">Weight:</label>
                <p className="text-xl font-bold">{bioData?.weight || "—"}</p>
              </div>
            </div>
          </section>
          <div className="flex gap-6">
            <button className="btn btn-primary bg-blue-800 btn-m rounded-t" onClick={handleOpenInvoices}>Invoices</button>
            <button className="btn btn-primary bg-blue-800 btn-m rounded-t" onClick={() => setPopOpen("reports")}>View Reports</button>
          </div>

          {coachStatus === "switched" &&
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

        </section>


      </div>

      {popOpen === "invoices" && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-box shadow-xl p-6 w-[700px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Invoices</h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setPopOpen(null)}
            >
              ✕
            </button>
          </div>

          {invoiceLoading ? (
            <p className="text-sm opacity-70">Loading invoices...</p>
          ) : invoiceError ? (
            <p className="text-sm text-error">{invoiceError}</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm opacity-70">No invoices found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="bg-base-200 rounded-box p-4 flex justify-between gap-4"
                >
                  <div>
                    <p className="font-bold">Invoice #{invoice.invoice_id}</p>
                    <p className="text-sm">
                      Amount: ${Number(invoice.amount ?? invoice.subtotal ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs opacity-70">
                      Created: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="badge badge-primary">
                      {invoice.status || "unknown"}
                    </span>

                    {invoice.status?.toLowerCase() === "issued" && (
                      <button
                        className="btn btn-sm bg-blue-800 text-white"
                        onClick={() => handlePayInvoice(invoice.invoice_id)}
                      >
                        Pay
                      </button>
                    )}

                    {invoice.status?.toLowerCase() === "paid" && (
                      <span className="text-xs opacity-70">Paid</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}


    </div>
  );
}

export default CProfile;
