"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const router = useRouter();
  const { user, token, logout, setUser } = useAuth();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarSaving(true);
    try {
      const { avatar_url } = await authService.uploadAvatar(token, file);
      setUser({ ...user!, avatar_url });
    } catch {
      console.error("Avatar upload failed");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) return null;
  const avatarSrc = user.avatar_url || "/images/avatar/1.png";

  const tabs = [
    { key: "dashboard", icon: <Icon.HouseLine size={20} />, label: "Dashboard" },
    { key: "orders", icon: <Icon.Package size={20} />, label: "My Orders" },
    { key: "address", icon: <Icon.MapPin size={20} />, label: "My Addresses" },
    { key: "setting", icon: <Icon.GearSix size={20} />, label: "Settings" },
  ];

  return (
    <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
      <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
        <div className="heading flex flex-col items-center justify-center">
          <div className="avatar relative cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <Image
              src={avatarSrc}
              width={140}
              height={140}
              alt="avatar"
              className="md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full object-cover"
              unoptimized={avatarSrc.startsWith("http")}
            />
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center">
              {avatarSaving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon.Camera size={13} color="white" />
              )}
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarSaving}
            />
          </div>
          <div className="name heading6 mt-4 text-center">{user.name}</div>
          <div className="caption1 text-secondary text-center mt-1">{user.email}</div>
        </div>

        <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === tab.key ? "active bg-white" : ""}`}
              onClick={() => onTabChange(tab.key)}>
              {tab.icon}
              <strong className="heading6">{tab.label}</strong>
            </div>
          ))}
          <div
            className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5"
            onClick={handleLogout}>
            <Icon.SignOut size={20} />
            <strong className="heading6">Logout</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;