"use client";
import { useState } from "react";
import { Order } from "@/type/Order";
import { ordersService } from "@/services/orders";
import { STATUS_STYLE } from "./constants";
import { ExpandedPanel } from "./OrdersTab";

interface Props {
  order: Order;
  expandedPanel: ExpandedPanel;
  onTogglePanel: (panel: Exclude<ExpandedPanel, null>) => void;
  token: string;
  onRefresh: () => void;
}

const OrderCard: React.FC<Props> = ({ order, expandedPanel, onTogglePanel, token, onRefresh }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersService.cancel(token, order.id, "Cancelled by customer.");
      onRefresh();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-surface border-b border-line">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-button">{order.order_number}</span>
            <span className={`caption2 px-3 py-0.5 rounded-full font-semibold ${STATUS_STYLE[order.status] ?? "bg-surface text-secondary"}`}>
              {order.status_label}
            </span>
          </div>
          <div className="caption2 text-secondary mt-1">
            {new Date(order.placed_at).toLocaleDateString("en-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            &nbsp;·&nbsp;
            {order.item_count} item{order.item_count !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="heading6">৳{order.total_amount.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-5 py-3">
        <button
          className={`caption1 px-4 py-2 border rounded-lg duration-200 font-semibold ${expandedPanel === "details" ? "bg-black text-white border-black" : "border-black hover:bg-black hover:text-white"}`}
          onClick={() => onTogglePanel("details")}>
          {expandedPanel === "details" ? "Hide Details" : "View Details"}
        </button>
        {order.status === "pending" && (
          <button
            className="caption1 px-4 py-2 border rounded-lg duration-200 font-semibold disabled:opacity-50"
            onClick={handleCancel}
            disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
        {order.status === "delivered" && (
          <button
            className="caption1 px-4 py-2 border rounded-lg duration-200 font-semibold"
            onClick={() => onTogglePanel("return")}
            >
            {expandedPanel === "return" ? "Cancel Return" : "Request Return"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;