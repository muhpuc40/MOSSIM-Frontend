"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { Order } from "@/type/Order";
import { ordersService } from "@/services/orders";
import { STATUS_STYLE } from "./constants";

interface Props {
  orderId: string;
  token: string;
  onRefresh: () => void;
  onClose: () => void;
}

interface TrackingEvent {
  id: string;
  status: string;
  location?: string | null;
  note?: string | null;
  tracked_at: string;
}

interface Shipment {
  id: string;
  courier: string;
  tracking_number: string;
  status: string;
  status_label: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  tracking: TrackingEvent[];
}

/* ── Status meta (matches order-tracking page) ─────────────── */
const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  preparing: {
    label: "Preparing",
    icon: Icon.Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  dispatched: {
    label: "Dispatched",
    icon: Icon.Truck,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  in_transit: {
    label: "In Transit",
    icon: Icon.Path,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Icon.MapPin,
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  delivered: {
    label: "Delivered",
    icon: Icon.CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: Icon.XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
  },
};

const getStatusMeta = (status: string) =>
  STATUS_META[status] ?? {
    label: status,
    icon: Icon.CircleDashed,
    color: "text-gray-600 bg-gray-50 border-gray-200",
  };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const OrderDetailPanel: React.FC<Props> = ({ orderId, token, onRefresh, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ordersService
      .show(token, orderId)
      .then((data) => {
        if (mounted) setOrder(data);
      })
      .catch((err) => console.error("detail:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [orderId, token]);

  const handleCancel = async () => {
    if (!order || !confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersService.cancel(token, order.id, "Cancelled by customer.");
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err?.message || "Failed.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 p-6 border border-line rounded-xl space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-3 p-6 border border-line rounded-xl caption1 text-secondary text-center">
        Failed to load order details.
      </div>
    );
  }

  const shipment = (order as any).shipment as Shipment | undefined;
  const trackingNumber = (order as any).tracking_number as string | undefined;
  // API returns events newest-first; the order-tracking page keeps that order
  const trackingEvents = shipment?.tracking || [];
  const currentStatusMeta = shipment ? getStatusMeta(shipment.status) : null;

  return (
    <div className="mt-3 border border-line rounded-xl overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* LEFT — Items */}
        <div>
          <div className="caption2 text-secondary font-semibold uppercase mb-3">
            Order Items ({order.items?.length || 0})
          </div>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-line rounded-xl">
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
                    <div className="text-button text-sm line-clamp-1">{item.product?.name}</div>
                    <div className="caption2 text-secondary mt-0.5">
                      {item.variant?.color?.name && (
                        <span className="capitalize">{item.variant.color.name}</span>
                      )}
                      {item.variant?.color?.name && item.variant?.size?.name && <span> / </span>}
                      {item.variant?.size?.name && <span>{item.variant.size.name}</span>}
                    </div>
                    <div className="caption2 text-secondary mt-0.5 font-mono">{item.variant?.sku}</div>
                    <div className="caption1 text-secondary mt-1">
                      {item.qty} × ৳{item.unit_price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-button">৳{item.line_total.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="caption1 text-secondary py-6 text-center">No items.</div>
          )}
        </div>

        {/* RIGHT — Info + Address + Payment */}
        <div className="space-y-5">
          <div>
            <div className="caption2 text-secondary font-semibold uppercase mb-2">Order Info</div>
            <div className="p-4 bg-surface rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-button">{order.order_number}</span>
                <span
                  className={`caption2 px-3 py-1 rounded-full font-semibold ${
                    STATUS_STYLE[order.status] ?? "bg-surface text-secondary"
                  }`}>
                  {order.status_label}
                </span>
              </div>
              <div className="caption2 text-secondary">
                {new Date(order.placed_at).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {order.shipping_address && (
            <div>
              <div className="caption2 text-secondary font-semibold uppercase mb-2">
                Shipping Address
              </div>
              <div className="p-4 bg-surface rounded-xl">
                <div className="caption1 font-semibold">{order.shipping_address.recipient_name}</div>
                <div className="caption1 text-secondary mt-0.5">{order.shipping_address.phone}</div>
                <div className="caption1 mt-1">
                  {order.shipping_address.address_line_1}
                  {order.shipping_address.address_line_2
                    ? `, ${order.shipping_address.address_line_2}`
                    : ""}
                </div>
                <div className="caption1">
                  {order.shipping_address.city}
                  {order.shipping_address.state ? `, ${order.shipping_address.state}` : ""}
                  {order.shipping_address.postal_code ? ` ${order.shipping_address.postal_code}` : ""}
                </div>
                <div className="caption1">{order.shipping_address.country}</div>
              </div>
            </div>
          )}

          <div>
            <div className="caption2 text-secondary font-semibold uppercase mb-2">Payment Summary</div>
            <div className="p-4 bg-surface rounded-xl space-y-2">
              <div className="flex justify-between caption1">
                <span className="text-secondary">Subtotal</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between caption1">
                  <span className="text-secondary">
                    Discount{order.coupon ? ` (${order.coupon.code})` : ""}
                  </span>
                  <span className="text-red">-৳{order.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between caption1">
                <span className="text-secondary">Shipping</span>
                <span>
                  {order.shipping_fee === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    `৳${order.shipping_fee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between heading6 pt-2 border-t border-line">
                <span>Total</span>
                <span>৳{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.status === "pending" && (
            <button
              className="w-full caption1 px-4 py-3 border border-red-400 text-red-600 rounded-xl hover:bg-red-600 hover:text-white duration-200 font-semibold"
              onClick={handleCancel}
              disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* ════ Tracking section ════ */}
      {!trackingNumber ? (
        <div className="border-t border-line p-6">
          <div className="caption2 text-secondary font-semibold uppercase mb-3 flex items-center gap-2">
            <Icon.MapPin size={14} />
            Order Tracking
          </div>
          <div className="caption1 text-secondary py-4 text-center">
            Tracking will be available once your order is shipped.
          </div>
        </div>
      ) : (
        <div className="border-t border-line p-6 space-y-6">
          {/* ── Summary card ── */}
          {shipment && (
            <div className="summary p-5 rounded-2xl border border-line bg-surface">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="caption2 text-secondary uppercase">Order</div>
                  <div className="text-button mt-1 font-semibold">{order.order_number}</div>
                </div>
                {currentStatusMeta && (
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentStatusMeta.color}`}>
                    <currentStatusMeta.icon size={16} weight="bold" />
                    <span className="caption2 font-semibold">{shipment.status_label}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
                <div>
                  <div className="caption2 text-secondary uppercase">Tracking #</div>
                  <div className="caption1 mt-1 font-mono">{shipment.tracking_number}</div>
                </div>
                <div>
                  <div className="caption2 text-secondary uppercase">Courier</div>
                  <div className="caption1 mt-1">{shipment.courier}</div>
                </div>
                {shipment.estimated_delivery && (
                  <div>
                    <div className="caption2 text-secondary uppercase">Est. Delivery</div>
                    <div className="caption1 mt-1">{formatDateOnly(shipment.estimated_delivery)}</div>
                  </div>
                )}
                {shipment.delivered_at && (
                  <div>
                    <div className="caption2 text-secondary uppercase">Delivered</div>
                    <div className="caption1 mt-1 text-green-600">{formatDate(shipment.delivered_at)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tracking history timeline ── */}
          <div className="timeline">
            <div className="heading6 mb-5">Tracking History</div>

            <div className="relative">
              {trackingEvents.length === 0 ? (
                <div className="text-center py-8 text-secondary caption1">
                  No tracking updates yet.
                </div>
              ) : (
                trackingEvents.map((event, index) => {
                  const meta = getStatusMeta(event.status);
                  const StepIcon = meta.icon;
                  const isFirst = index === 0;
                  const isLast = index === trackingEvents.length - 1;

                  return (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-5 top-10 bottom-0 w-px bg-line" />
                      )}

                      <div
                        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                          isFirst
                            ? `${meta.color} border-current`
                            : "bg-white border-line text-secondary"
                        }`}>
                        <StepIcon size={16} weight={isFirst ? "fill" : "regular"} />
                      </div>

                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div
                            className={`text-button ${
                              isFirst ? "font-semibold" : "text-secondary2"
                            }`}>
                            {meta.label}
                          </div>
                          <div className="caption2 text-secondary whitespace-nowrap">
                            {formatDate(event.tracked_at)}
                          </div>
                        </div>

                        {event.location && (
                          <div className="caption1 text-secondary mt-1 flex items-center gap-1">
                            <Icon.MapPin size={12} />
                            {event.location}
                          </div>
                        )}

                        {event.note && (
                          <div className="caption1 text-secondary mt-1 italic">{event.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPanel;