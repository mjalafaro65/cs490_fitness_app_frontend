import { useEffect, useState } from "react";
import api from "../../axios";

function CoInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);

    try {
      const res = await api.get("/coach/invoices");
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error("Failed to fetch coach invoices:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get("/coach/show-client-relationships");
      setClients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err.response?.data || err);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedClient || !amount) {
      alert("Please select a client and enter an amount.");
      return;
    }

    try {
      await api.post("/coach/generate-invoice", {
        relationship_id: selectedClient.relationship_id,
        amount: Number(amount),
      });

      alert("Invoice created.");

      setAmount("");
      setSelectedClient(null);

      await fetchInvoices();
    } catch (err) {
      console.error("Failed to create invoice:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.description ||
          "Failed to create invoice."
      );
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold">Invoices</div>

      <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
        <h2 className="text-lg font-bold mb-3">Create Invoice</h2>

        <p className="text-sm font-semibold mb-2">Select Client</p>

        {clients.length === 0 ? (
          <p className="text-sm opacity-70 mb-3">No clients found.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
            {clients.map((client) => {
              const clientName = `${client.user?.first_name || ""} ${
                client.user?.last_name || ""
              }`.trim();

              const isSelected =
                selectedClient?.relationship_id === client.relationship_id;

              return (
                <button
                  key={client.relationship_id}
                  className={`p-3 rounded-box text-left cursor-pointer ${
                    isSelected
                      ? "bg-blue-800 text-white"
                      : "bg-base-100 hover:bg-base-200"
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <p className="font-semibold">{clientName || "Unnamed Client"}</p>
                  <p className="text-xs opacity-70">
                    Plan: {client.plan?.name || "No plan"}{" "}
                    {client.plan?.billing_type
                      ? `(${client.plan.billing_type})`
                      : ""}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="Amount"
            className="input input-bordered"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            className="btn btn-primary bg-blue-800 text-white"
            onClick={handleCreateInvoice}
          >
            Create Invoice
          </button>
        </div>
      </div>

      <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-4">
        <h2 className="text-lg font-bold mb-3">All Invoices</h2>

        {loading ? (
          <p className="text-sm opacity-70">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm opacity-70">No invoices found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                className="bg-base-100 rounded-box p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">Invoice #{invoice.invoice_id}</p>
                  <p className="text-sm">Client: {invoice.client_name || "—"}</p>
                  <p className="text-sm">
                    Amount: ${Number(invoice.amount ?? 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-60">
                    Created:{" "}
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <span className="badge badge-primary">
                  {invoice.status || "unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoInvoices;