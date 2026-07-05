"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { Order } from "@/type/Order";
import { ordersService } from "@/services/orders";
import OrderCard from "./OrderCard";
import OrderDetailPanel from "./OrderDetailPanel";
import ReturnRequestPanel from "./ReturnRequestPanel";

export type ExpandedPanel = "details" | "return" | null;

interface Props {
  token: string;
}

const OrdersTab: React.FC<Props> = ({ token }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, ExpandedPanel>>({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersService.list(token);
      setOrders(res.data);
    } catch (err) {
      console.error("orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const togglePanel = (orderId: string, panel: Exclude<ExpandedPanel, null>) => {
    setExpanded((prev) => ({
      ...prev,
      [orderId]: prev[orderId] === panel ? null : panel,
    }));
  };

  if (loading) {
    return (
      <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
        <h6 className="heading6 mb-5">My Orders</h6>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
        <h6 className="heading6 mb-5">My Orders</h6>
        <div className="text-center py-16">
          <Icon.Package size={48} className="opacity-20 mx-auto mb-3" />
          <div className="heading6 mb-1">No orders found</div>
          <div className="caption1 text-secondary mb-5">
            You haven&apos;t placed any orders yet.
          </div>
          <Link href="/shop" className="button-main bg-black inline-block">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
      <h6 className="heading6 mb-5">My Orders</h6>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id}>
            <OrderCard
              order={order}
              expandedPanel={expanded[order.id] || null}
              onTogglePanel={(panel) => togglePanel(order.id, panel)}
              token={token}
              onRefresh={loadOrders}
            />
            {expanded[order.id] === "details" && (
              <OrderDetailPanel
                orderId={order.id}
                token={token}
                onRefresh={loadOrders}
                onClose={() => togglePanel(order.id, "details")}
              />
            )}
            {expanded[order.id] === "return" && (
              <ReturnRequestPanel
                orderId={order.id}
                token={token}
                onSubmitted={() => {
                  loadOrders();
                  togglePanel(order.id, "return");
                }}
                onClose={() => togglePanel(order.id, "return")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;