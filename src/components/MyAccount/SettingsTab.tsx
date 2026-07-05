"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";
import PasswordInput from "./PasswordInput";

interface Props { token: string; }

const SettingsTab: React.FC<Props> = ({ token }) => {
  const { user, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email, phone: user.phone });
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess(""); setProfileSaving(true);
    try {
      const updated = await authService.updateProfile(token, profileForm);
      setUser(updated);
      setProfileSuccess("Profile updated successfully.");
    } catch (err: any) {
      const msg = err?.errors ? Object.values(err.errors).flat().join(" ") : err?.message || "Failed.";
      setProfileError(msg);
    } finally { setProfileSaving(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.new_password_confirmation) {
      setPassError("New passwords do not match.");
      return;
    }
    setPassError(""); setPassSuccess(""); setPassSaving(true);
    try {
      await authService.changePassword(token, passForm);
      setPassSuccess("Password changed successfully.");
      setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err: any) {
      setPassError(err?.message || "Failed to change password.");
    } finally { setPassSaving(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarSaving(true);
    try {
      const { avatar_url } = await authService.uploadAvatar(token, file);
      setUser({ ...user!, avatar_url });
    } catch { console.error("Avatar upload failed"); }
    finally { setAvatarSaving(false); }
  };

  if (!user) return null;
  const avatarSrc = user.avatar_url || "/images/avatar/1.png";

  return (
    <div className="tab text-content w-full p-7 border border-line rounded-xl">
      <form onSubmit={handleProfileSave}>
        <div className="heading5 pb-4">Profile Information</div>

        <div className="flex flex-wrap items-center gap-5 mb-6">
          <div className="relative w-[7.5rem] h-[7.5rem] rounded-xl overflow-hidden bg-surface flex-shrink-0">
            <Image src={avatarSrc} width={300} height={300} alt="avatar" className="w-full h-full object-cover" unoptimized={avatarSrc.startsWith("http")} />
          </div>
          <div>
            <strong className="text-button">Profile Photo</strong>
            <p className="caption1 text-secondary mt-1 mb-3">JPG, PNG — max 2MB</p>
            <label htmlFor="uploadAvatar" className="caption1 px-4 py-2 border border-line rounded-lg cursor-pointer hover:border-black duration-200">
              {avatarSaving ? "Uploading..." : "Change Photo"}
            </label>
            <input type="file" id="uploadAvatar" accept="image/*" className="hidden" ref={avatarRef} onChange={handleAvatarChange} disabled={avatarSaving} />
          </div>
        </div>

        {profileError && <div className="text-red caption1 mb-4 p-3 bg-red/5 rounded-lg border border-red/20">{profileError}</div>}
        {profileSuccess && <div className="text-success caption1 mb-4 p-3 bg-green/5 rounded-lg border border-green/20">{profileSuccess}</div>}

        <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
          <div className="sm:col-span-2">
            <label htmlFor="profileName" className="caption1">Full Name <span className="text-red">*</span></label>
            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profileName" type="text" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label htmlFor="profileEmail" className="caption1">Email <span className="text-red">*</span></label>
            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profileEmail" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label htmlFor="profilePhone" className="caption1">Phone <span className="text-red">*</span></label>
            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profilePhone" type="text" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} required />
          </div>
        </div>
        <div className="block-button mt-6">
          <button className="button-main bg-black" type="submit" disabled={profileSaving}>
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSave} className="mt-10 pt-10 border-t border-line">
        <div className="heading5 pb-4">Change Password</div>

        {passError && <div className="text-red caption1 mb-4 p-3 bg-red/5 rounded-lg border border-red/20">{passError}</div>}
        {passSuccess && <div className="text-success caption1 mb-4 p-3 bg-green/5 rounded-lg border border-green/20">{passSuccess}</div>}

        <div className="space-y-5">
          <PasswordInput id="currentPass" label="Current Password" value={passForm.current_password} onChange={(v) => setPassForm((p) => ({ ...p, current_password: v }))} placeholder="Enter current password" />
          <PasswordInput id="newPass" label="New Password" value={passForm.new_password} onChange={(v) => setPassForm((p) => ({ ...p, new_password: v }))} placeholder="Minimum 8 characters" />
          <PasswordInput id="confirmPass" label="Confirm New Password" value={passForm.new_password_confirmation} onChange={(v) => setPassForm((p) => ({ ...p, new_password_confirmation: v }))} placeholder="Re-enter new password" />
        </div>
        <div className="block-button mt-6">
          <button className="button-main bg-black" type="submit" disabled={passSaving}>
            {passSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;