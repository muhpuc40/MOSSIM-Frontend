"use client";
import { useCallback, useEffect, useState } from "react";
import { CustomerAddress } from "@/type/Auth";
import { authService } from "@/services/auth";

interface Props { token: string; }

const emptyAddr = {
  recipient_name: "", address_line_1: "", address_line_2: "",
  city: "", state: "", postal_code: "", country: "", phone: "", is_default: false,
};

const AddressesTab: React.FC<Props> = ({ token }) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddr);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAddresses(await authService.getAddresses(token)); }
    catch { console.error("load addresses failed"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (editing) {
        await authService.updateAddress(token, editing.id, form);
        setSuccess("Address updated.");
      } else {
        await authService.createAddress(token, form as any);
        setSuccess("Address added.");
      }
      setShowForm(false); setEditing(null); setForm(emptyAddr);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to save address.");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await authService.deleteAddress(token, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch { console.error("delete failed"); }
  };

  const handleSetDefault = async (id: string) => {
    try { await authService.setDefaultAddress(token, id); await load(); }
    catch { console.error("set default failed"); }
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditing(addr);
    setForm({
      recipient_name: addr.recipient_name,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || "",
      city: addr.city,
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country,
      phone: addr.phone,
      is_default: addr.is_default,
    });
    setShowForm(true); setError(""); setSuccess("");
  };

  return (
    <div className="tab_address text-content w-full p-7 border border-line rounded-xl">
      <div className="flex items-center justify-between mb-5">
        <h6 className="heading6">My Addresses</h6>
        <button
          className="button-main bg-black text-sm px-4 py-2"
          onClick={() => {
            setEditing(null); setForm(emptyAddr);
            setError(""); setSuccess(""); setShowForm(true);
          }}>
          + Add New
        </button>
      </div>

      {error && <div className="text-red caption1 mb-3 p-3 bg-red/5 rounded-lg border border-red/20">{error}</div>}
      {success && <div className="text-success caption1 mb-3 p-3 bg-green/5 rounded-lg border border-green/20">{success}</div>}

      {!showForm && (
        loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="caption1 text-secondary py-10 text-center">No addresses yet. Add one above.</div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`p-5 border rounded-xl ${addr.is_default ? "border-black" : "border-line"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {addr.is_default && <span className="caption2 bg-black text-white px-2 py-0.5 rounded mb-2 inline-block">Default</span>}
                    <div className="caption1 font-semibold mt-1">{addr.recipient_name}</div>
                    <div className="caption1">{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ""}</div>
                    <div className="caption1">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postal_code}</div>
                    <div className="caption1">{addr.country}</div>
                    <div className="caption1 text-secondary mt-1">{addr.phone}</div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button className="caption2 px-3 py-1 border border-line rounded hover:border-black duration-200" onClick={() => openEdit(addr)}>Edit</button>
                    {!addr.is_default && (
                      <button className="caption2 px-3 py-1 border border-line rounded hover:border-black duration-200" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                    )}
                    <button className="caption2 px-3 py-1 border border-red-300 rounded text-red-600 hover:bg-red-600 hover:text-white duration-200" onClick={() => handleDelete(addr.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="heading6 mb-4">{editing ? "Edit Address" : "New Address"}</div>
          <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
            <div>
              <label className="caption1">Recipient Name <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.recipient_name} onChange={(e) => setForm((p) => ({ ...p, recipient_name: e.target.value }))} required />
            </div>
            <div>
              <label className="caption1">Phone <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="caption1">Street Address <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.address_line_1} onChange={(e) => setForm((p) => ({ ...p, address_line_1: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="caption1">Address Line 2</label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.address_line_2} onChange={(e) => setForm((p) => ({ ...p, address_line_2: e.target.value }))} />
            </div>
            <div>
              <label className="caption1">City <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required />
            </div>
            <div>
              <label className="caption1">State</label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div>
              <label className="caption1">Postal Code</label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.postal_code} onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))} />
            </div>
            <div>
              <label className="caption1">Country <span className="text-red">*</span></label>
              <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="addrDefault" checked={form.is_default} onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} />
              <label htmlFor="addrDefault" className="caption1 cursor-pointer">Set as default address</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="button-main bg-black" type="submit" disabled={loading}>
              {loading ? "Saving..." : editing ? "Update Address" : "Add Address"}
            </button>
            <button type="button" className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressesTab;