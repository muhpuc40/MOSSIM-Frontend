"use client";
import { useCallback, useEffect, useState } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { Order } from "@/type/Order";
import { ordersService } from "@/services/orders";
import { STATUS_STYLE } from "./constants";

interface Props {
  token: string;
  onSeeAll: () => void;
}

const DashboardTab: React.FC<Props> = ({ token, onSeeAll }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersService.list(token);
      setOrders(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { label: "Total Orders", value: meta?.total ?? "—", icon: <Icon.Package className="text-4xl" /> },
    { label: "Pending Orders", value: orders.filter((o) => o.status === "pending").length || "—", icon: <Icon.HourglassMedium className="text-4xl" /> },
    { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length || "—", icon: <Icon.CheckCircle className="text-4xl" /> },
  ];

  return (
    <>
      <div className="overview grid sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="item flex items-center justify-between p-5 border border-line rounded-xl box-shadow-xs">
            <div>
              <span className="text-secondary caption1">{stat.label}</span>
              <h5 className="heading5 mt-1">{stat.value}</h5>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h6 className="heading6">Recent Orders</h6>
          <button className="caption1 text-secondary hover:text-black duration-200 underline" onClick={onSeeAll}>
            View all
          </button>
        </div>
        {loading ? (
          <div className="space-y-3 pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-secondary caption1 py-6 text-center">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="border-b border-line">
                <tr>
                  <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Order</th>
                  <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Items</th>
                  <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Total</th>
                  <th className="pb-3 text-right caption1 text-secondary font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="py-3 text-button">{order.order_number}</td>
                    <td className="py-3 caption1 text-secondary">
                      {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3 caption1">৳{order.total_amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`caption2 px-3 py-1 rounded-full font-semibold ${STATUS_STYLE[order.status] ?? "bg-surface text-secondary"}`}>
                        {order.status_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardTab;