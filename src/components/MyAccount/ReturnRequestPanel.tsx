"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { Order } from "@/type/Order";
import { ordersService } from "@/services/orders";
import { returnsService } from "@/services/returns";

interface Props {
  orderId: string;
  token: string;
  onSubmitted: () => void;
  onClose: () => void;
}

type ReturnSelection = { selected: boolean; qty: number };

const ReturnRequestPanel: React.FC<Props> = ({
  orderId,
  token,
  onSubmitted,
  onClose,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selections, setSelections] = useState<Record<string, ReturnSelection>>(
    {},
  );
  const [reason, setReason] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ordersService
      .show(token, orderId)
      .then((data) => {
        if (!mounted) return;
        setOrder(data);
        const init: Record<string, ReturnSelection> = {};
        data.items?.forEach((item: any) => {
          init[item.id] = { selected: false, qty: item.qty };
        });
        setSelections(init);
      })
      .catch((err) => setError(err?.message || "Failed to load order."))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [orderId, token]);

  const toggleItem = (id: string) => {
    setSelections((prev: Record<string, ReturnSelection>) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));
  };

  const updateQty = (id: string, qty: number, max: number) => {
    const clamped = Math.max(1, Math.min(qty, max));
    setSelections((prev: Record<string, ReturnSelection>) => ({
      ...prev,
      [id]: { ...prev[id], qty: clamped },
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;
    const items = Object.entries(selections)
      .filter(([, v]) => v.selected)
      .map(([itemId, v]) => ({
        order_item_id: itemId,
        reason: reason.trim(),
        qty_returned: v.qty,
      }));

    if (items.length === 0) return setError("Please select at least one item.");
    if (!reason.trim()) return setError("Please provide a reason.");
    if (reason.trim().length < 10)
      return setError("Reason must be at least 10 characters.");

    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const { successful, failed } = await returnsService.requestMultiple(
        token,
        items,
      );
      if (failed.length === 0) {
        setSuccess(`${successful.length} return(s) submitted successfully.`);
        setTimeout(() => onSubmitted(), 2000);
      } else if (successful.length === 0) {
        setError(`Failed: ${failed.map((f) => f.error).join(", ")}`);
      } else {
        setSuccess(`${successful.length} submitted, ${failed.length} failed.`);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 p-6 border border-line rounded-xl space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-3 p-6 border border-line rounded-xl text-center caption1 text-secondary">
        Failed to load order.
      </div>
    );
  }

  return (
    <div className="mt-3 p-6 border border-line rounded-xl space-y-5">
      <div className="flex items-center justify-between">
        <h6 className="heading6">Request a Return</h6>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-black hover:text-white duration-200"
          disabled={submitting}>
          <Icon.X size={14} />
        </button>
      </div>

      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg caption2 text-orange-700">
        <Icon.Info size={16} className="inline mr-1" />
        Returns are accepted within 3 days of delivery.
      </div>

      {error && (
        <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green/5 border border-green/20 rounded-lg caption1 text-success">
          {success}
        </div>
      )}

      <div>
        <div className="caption2 text-secondary font-semibold uppercase mb-3">
          Select items to return
        </div>
        <div className="space-y-3">
          {order.items?.map((item: any) => {
            const sel = selections[item.id] || {
              selected: false,
              qty: item.qty,
            };
            return (
              <div
                key={item.id}
                className={`p-4 border-2 rounded-xl duration-200 ${sel.selected ? "border-black bg-orange-50/30" : "border-line"}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 cursor-pointer"
                    checked={sel.selected}
                    onChange={() => toggleItem(item.id)}
                    disabled={submitting}
                  />
                  {item.product?.image && (
                    <Image
                      src={item.product.image}
                      width={56}
                      height={72}
                      alt={item.product.name ?? ""}
                      className="w-14 aspect-[3/4] object-cover rounded-lg flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-button text-sm line-clamp-1">
                      {item.product?.name}
                    </div>
                    <div className="caption2 text-secondary mt-0.5">
                      {item.variant?.color?.name && (
                        <span className="capitalize">
                          {item.variant.color.name}
                        </span>
                      )}
                      {item.variant?.color?.name &&
                        item.variant?.size?.name && <span> / </span>}
                      {item.variant?.size?.name && (
                        <span>{item.variant.size.name}</span>
                      )}
                    </div>
                    <div className="caption2 text-secondary mt-0.5">
                      Ordered: {item.qty} × ৳{item.unit_price.toLocaleString()}
                    </div>

                    {sel.selected && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="caption2 text-secondary">
                          Return qty:
                        </span>
                        <div className="flex items-center border border-line rounded-lg overflow-hidden">
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white duration-200 disabled:opacity-30"
                            onClick={() =>
                              updateQty(item.id, sel.qty - 1, item.qty)
                            }
                            disabled={sel.qty <= 1 || submitting}>
                            <Icon.Minus size={12} />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center caption1 font-semibold border-x border-line">
                            {sel.qty}
                          </span>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white duration-200 disabled:opacity-30"
                            onClick={() =>
                              updateQty(item.id, sel.qty + 1, item.qty)
                            }
                            disabled={sel.qty >= item.qty || submitting}>
                            <Icon.Plus size={12} />
                          </button>
                        </div>
                        <span className="caption2 text-secondary">
                          (max {item.qty})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="caption2 text-secondary font-semibold uppercase block mb-2">
          Reason for return <span className="text-red">*</span>
        </label>
        <textarea
          rows={4}
          className="w-full border-line px-4 py-3 rounded-lg resize-none"
          placeholder="Tell us why you're returning these items (minimum 10 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={submitting}
        />
        <div className="caption2 text-secondary mt-1 text-right">
          {reason.length} characters
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          className="flex-1 caption1 px-4 py-3 border border-line rounded-lg hover:bg-surface duration-200 font-semibold"
          onClick={onClose}
          disabled={submitting}>
          Cancel
        </button>
        <button
          type="button"
          className="flex-1 button-main bg-black disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>
    </div>
  );
};

export default ReturnRequestPanel;
