"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const router = useRouter();
  const { register, isLoggedIn, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms of Use.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, phone, password, confirm);
      router.push("/my-account");
    } catch (err: any) {
      const msg = err?.errors
        ? Object.values(err.errors).flat().join(" ")
        : err?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (!loading && isLoggedIn) router.replace("/my-account");
  }, [loading, isLoggedIn, router]);
  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb
          heading="Create An Account"
          subHeading="Create An Account"
        />
      </div>
      <div className="register-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Register</div>
              <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="error-msg text-red caption1 mb-4 p-3 bg-red/5 rounded-lg border border-red/20">
                    {error}
                  </div>
                )}
                <div className="name">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    type="text"
                    placeholder="Full name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="email mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    type="email"
                    placeholder="Email address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="phone mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    type="text"
                    placeholder="Phone number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="pass mt-5 relative">
                  <input
                    className="border-line px-4 pt-3 pb-3 pr-12 w-full rounded-lg"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password * (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }>
                    {showPassword ? (
                      <Icon.EyeSlash size={20} />
                    ) : (
                      <Icon.Eye size={20} />
                    )}
                  </button>
                </div>
                <div className="confirm-pass mt-5 relative">
                  <input
                    className="border-line px-4 pt-3 pb-3 pr-12 w-full rounded-lg"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password *"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }>
                    {showConfirmPassword ? (
                      <Icon.EyeSlash size={20} />
                    ) : (
                      <Icon.Eye size={20} />
                    )}
                  </button>
                </div>
                <div className="flex items-center mt-5">
                  <div className="block-input">
                    <input
                      type="checkbox"
                      name="remember"
                      id="remember"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <Icon.CheckSquare
                      size={20}
                      weight="fill"
                      className="icon-checkbox"
                    />
                  </div>
                  <label
                    htmlFor="remember"
                    className="pl-2 cursor-pointer text-secondary2">
                    I agree to the
                    <Link
                      href="/terms-of-use"
                      className="text-black hover:underline pl-1">
                      Terms of Use
                    </Link>
                  </label>
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <button
                    className="button-main bg-black text-white"
                    type="submit"
                    disabled={submitting}>
                    {submitting ? "Creating account..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">Already have an account?</div>
                <div className="mt-2 text-secondary">
                  Welcome back. Sign in to access your personalized experience,
                  saved preferences, and more.
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <Link href="/login" className="button-main">
                    Login
                  </Link>
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

export default Register;