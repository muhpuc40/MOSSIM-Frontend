"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { login, isLoggedIn, loading } = useAuth();

  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginVal.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login(loginVal.trim(), password);
      router.push("/my-account");
    } catch (err: any) {
      setError(
        err?.message || err?.error || "Invalid credentials. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace("/my-account");
    }
  }, [loading, isLoggedIn, router]);

  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Login" subHeading="Login" />
      </div>

      <div className="login-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Login</div>

              <form
                className="md:mt-7 mt-4"
                onSubmit={handleSubmit}
                autoComplete="on">
                {error && (
                  <div
                    className="error-msg text-red caption1 mb-4 p-3 bg-red/5 rounded-lg border border-red/20"
                    role="alert">
                    {error}
                  </div>
                )}

                <div className="email">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="login"
                    name="login"
                    type="text"
                    placeholder="Email address or phone *"
                    value={loginVal}
                    onChange={(e) => setLoginVal(e.target.value)}
                    autoComplete="username"
                    inputMode="email"
                    required
                  />
                </div>

                <div className="pass mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center">
                    <div className="block-input">
                      <input type="checkbox" name="remember" id="remember" />

                      <Icon.CheckSquare
                        size={20}
                        weight="fill"
                        className="icon-checkbox"
                      />
                    </div>

                    <label htmlFor="remember" className="pl-2 cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="font-semibold hover:underline">
                    Forgot Your Password?
                  </Link>
                </div>

                <div className="block-button md:mt-7 mt-4">
                  <button
                    className="button-main bg-black text-white"
                    type="submit"
                    disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">New Customer</div>

                <div className="mt-2 text-secondary">
                  Be part of our growing family of new customers! Join us today
                  and unlock a world of exclusive benefits, offers, and
                  personalized experiences.
                </div>

                <div className="block-button md:mt-7 mt-4">
                  <Link href="/register" className="button-main">
                    Register
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

export default Login;
