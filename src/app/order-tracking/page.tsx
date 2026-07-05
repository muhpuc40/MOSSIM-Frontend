"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  note: string | null;
  tracked_at: string;
}

interface ShipmentData {
  id: string;
  courier: string;
  tracking_number: string;
  status: string;
  status_label: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  tracking: TrackingEvent[];
}

interface TrackResponse {
  success: boolean;
  message?: string;
  order_number?: string;
  data?: ShipmentData | null;
}

const STATUS_META: Record<string, { label: string; icon: any; color: string }> =
  {
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

const OrderTracking = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResponse | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/shipments/track/${encodeURIComponent(code.trim())}`,
      );
      const json: TrackResponse = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Tracking number not found.");
        return;
      }
      setResult(json);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shipment = result?.data;
  const currentStatusMeta = shipment ? getStatusMeta(shipment.status) : null;

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Order Tracking" subHeading="Order Tracking" />
      </div>
      <div className="order-tracking md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Order Tracking</div>
              <div className="mt-2">
                Enter your tracking number or order number below to see the
                latest status of your shipment. You will find these on your
                order confirmation email or receipt.
              </div>

              <form onSubmit={handleTrack} className="md:mt-7 mt-4">
                <div className="flex gap-3 max-md:flex-col">
                  <input
                    className="border-line px-4 pt-3 pb-3 flex-1 rounded-lg"
                    id="tracking-code"
                    type="text"
                    placeholder="Tracking number or order number *"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: "#000", color: "#fff" }}
                    className="px-6 py-3 rounded-lg font-semibold whitespace-nowrap hover:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? "Tracking..." : "Track Order"}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-6 p-4 rounded-lg border border-red bg-red-50 text-red flex items-center gap-3">
                  <Icon.WarningCircle size={20} weight="fill" />
                  <span className="body2">{error}</span>
                </div>
              )}

              {result?.success && !shipment && result.message && (
                <div className="mt-6 p-5 rounded-lg border border-line bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon.Hourglass size={20} weight="bold" />
                    </div>
                    <div>
                      <div className="text-button">
                        Order {result.order_number}
                      </div>
                      <div className="caption1 text-secondary mt-0.5">
                        {result.message}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {shipment && (
                <div className="mt-6">
                  <div className="summary p-5 rounded-2xl border border-line bg-surface">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="caption2 text-secondary uppercase">
                          Order
                        </div>
                        <div className="text-button mt-1 font-semibold">
                          {result?.order_number}
                        </div>
                      </div>
                      {currentStatusMeta && (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentStatusMeta.color}`}>
                          <currentStatusMeta.icon size={16} weight="bold" />
                          <span className="caption2 font-semibold">
                            {shipment.status_label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
                      <div>
                        <div className="caption2 text-secondary uppercase">
                          Tracking #
                        </div>
                        <div className="caption1 mt-1 font-mono">
                          {shipment.tracking_number}
                        </div>
                      </div>
                      <div>
                        <div className="caption2 text-secondary uppercase">
                          Courier
                        </div>
                        <div className="caption1 mt-1">{shipment.courier}</div>
                      </div>
                      {shipment.estimated_delivery && (
                        <div>
                          <div className="caption2 text-secondary uppercase">
                            Est. Delivery
                          </div>
                          <div className="caption1 mt-1">
                            {formatDateOnly(shipment.estimated_delivery)}
                          </div>
                        </div>
                      )}
                      {shipment.delivered_at && (
                        <div>
                          <div className="caption2 text-secondary uppercase">
                            Delivered
                          </div>
                          <div className="caption1 mt-1 text-green-600">
                            {formatDate(shipment.delivered_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="timeline mt-6">
                    <div className="heading6 mb-5">Tracking History</div>

                    <div className="relative">
                      {shipment.tracking.length === 0 ? (
                        <div className="text-center py-8 text-secondary caption1">
                          No tracking updates yet.
                        </div>
                      ) : (
                        shipment.tracking.map((event, index) => {
                          const meta = getStatusMeta(event.status);
                          const StepIcon = meta.icon;
                          const isFirst = index === 0;
                          const isLast = index === shipment.tracking.length - 1;

                          return (
                            <div
                              key={event.id}
                              className="relative flex gap-4 pb-6 last:pb-0">
                              {!isLast && (
                                <div className="absolute left-5 top-10 bottom-0 w-px bg-line" />
                              )}

                              <div
                                className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                  isFirst
                                    ? `${meta.color} border-current`
                                    : "bg-white border-line text-secondary"
                                }`}>
                                <StepIcon
                                  size={16}
                                  weight={isFirst ? "fill" : "regular"}
                                />
                              </div>

                              <div className="flex-1 pt-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div
                                    className={`text-button ${isFirst ? "font-semibold" : "text-secondary2"}`}>
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
                                  <div className="caption1 text-secondary mt-1 italic">
                                    {event.note}
                                  </div>
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

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex flex-col gap-10">
              <div className="login-block">
                <div className="heading4">Already have an account?</div>
                <div className="mt-2 text-secondary">
                  Welcome back. Sign in to view all your orders, save
                  preferences, and track shipments faster — straight from your
                  account.
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <Link href={"/login"} className="button-main">
                    Login
                  </Link>
                </div>
              </div>

              <div className="contact-block pt-8 border-t border-line">
                <div className="heading4">Need Help?</div>
                <div className="mt-2 text-secondary">
                  If you have any questions about your order or shipment, feel
                  free to reach out — we&apos;re happy to help.
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href="tel:+8801322447700"
                    className="flex items-center gap-3 text-secondary hover:text-black duration-300">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                      <Icon.Phone size={18} weight="bold" />
                    </div>
                    <div>
                      <div className="caption2 text-secondary uppercase">
                        Phone
                      </div>
                      <div className="text-button">+88 01322-447700</div>
                    </div>
                  </a>

                  <a
                    href="mailto:info@mossim.net"
                    className="flex items-center gap-3 text-secondary hover:text-black duration-300">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                      <Icon.EnvelopeSimple size={18} weight="bold" />
                    </div>
                    <div>
                      <div className="caption2 text-secondary uppercase">
                        Email
                      </div>
                      <div className="text-button">info@mossim.net</div>
                    </div>
                  </a>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                      <Icon.MapPin size={18} weight="bold" />
                    </div>
                    <div>
                      <div className="caption2 text-secondary uppercase">
                        Display Center
                      </div>
                      <div className="text-button">
                        01 (Kha), Block #A, House No. 14,
                      </div>
                      <div className="text-button">
                        Road No. 2/Ka/A, Chattogram 4203
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                      <Icon.Clock size={18} weight="bold" />
                    </div>
                    <div>
                      <div className="caption2 text-secondary uppercase">
                        Open Hours
                      </div>
                      <div className="text-button">
                        Sat – Thu: 10:00 AM – 6:00 PM
                      </div>
                      <div className="caption1 text-secondary">
                        Friday: Closed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderTracking;
