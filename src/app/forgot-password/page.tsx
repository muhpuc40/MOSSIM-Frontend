"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { authService } from "@/services/auth";

type ApiError = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

const getErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError;

  if (apiError?.errors) {
    const validationMessages = Object.values(apiError.errors).flat();
    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return (
    apiError?.message ||
    apiError?.error ||
    "Unable to send the password reset link. Please try again."
  );
};

const ForgotPassword = () => {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = login.trim();

    if (!value) {
      setSuccess("");
      setError("Please enter your email address or phone number.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await authService.forgotPassword(value);
      setSuccess(
        response.message ||
          "If an active account with a valid email exists, a password reset link has been sent.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb
          heading="Forgot your password"
          subHeading="Forgot your password"
        />
      </div>

      <div className="forgot-pass md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Reset your password</div>

              <div className="body1 mt-2 text-secondary">
                Enter the email address or phone number linked to your account.
                We will send the reset link to your registered email address.
              </div>

              <form
                className="md:mt-7 mt-4"
                onSubmit={handleSubmit}
                noValidate
              >
                {error && (
                  <div
                    className="text-red caption1 mb-4 p-3 bg-red/5 rounded-lg border border-red/20"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="caption1 mb-4 p-3 rounded-lg border border-green/20 bg-green/5 text-success"
                    role="status"
                  >
                    {success}
                  </div>
                )}

                <div className="email">
                  <label htmlFor="forgot-login" className="sr-only">
                    Email address or phone number
                  </label>

                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="forgot-login"
                    name="login"
                    type="text"
                    placeholder="Email address or phone number *"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    autoComplete="username"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="block-button md:mt-7 mt-4">
                  <button
                    className="button-main bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending reset link..." : "Send reset link"}
                  </button>
                </div>

                <div className="mt-5">
                  <Link href="/login" className="font-semibold hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">New Customer</div>

                <div className="mt-2 text-secondary">
                  Create an account to access saved preferences, order history,
                  and personalized experiences.
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

export default ForgotPassword;
