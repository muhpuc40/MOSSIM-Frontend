"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import Loading from "@/components/Other/Loading";
import { useAuth } from "@/context/AuthContext";

import Sidebar from "@/components/MyAccount/Sidebar";
import DashboardTab from "@/components/MyAccount/DashboardTab";
import OrdersTab from "@/components/MyAccount/OrdersTab";
import AddressesTab from "@/components/MyAccount/AddressesTab";
import SettingsTab from "@/components/MyAccount/SettingsTab";

const TABS = ["dashboard", "orders", "address", "setting"];

const MyAccount = () => {
  const router = useRouter();
  const { user, token, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (TABS.includes(hash)) setActiveTab(hash);
  }, []);

  const gotoTab = (tab: string) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  if (loading || !user) return <Loading />;

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="My Account" subHeading="My Account" />
      </div>

      <div className="profile-block md:py-10 py-6">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col w-full">
            <Sidebar activeTab={activeTab} onTabChange={gotoTab} />
            <div className="right md:w-2/3 w-full pl-2.5">
              {activeTab === "dashboard" && token && (
                <DashboardTab token={token} onSeeAll={() => gotoTab("orders")} />
              )}
              {activeTab === "orders" && token && <OrdersTab token={token} />}
              {activeTab === "address" && token && <AddressesTab token={token} />}
              {activeTab === "setting" && token && <SettingsTab token={token} />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyAccount;