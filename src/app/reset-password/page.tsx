"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";
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
    "Unable to reset your password. Please request a new reset link."
  );
};

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasResetDetails = Boolean(token && email);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasResetDetails) {
      setError(
        "This password reset link is incomplete or invalid. Please request a new one.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(
        response.message ||
          "Password reset successfully. You can now log in with your new password.",
      );
      setPassword("");
      setPasswordConfirmation("");
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
        <Breadcrumb heading="Reset password" subHeading="Reset password" />
      </div>

      <div className="forgot-pass md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Create a new password</div>

              <div className="body1 mt-2 text-secondary">
                Use at least 8 characters and choose a password you do not use
                elsewhere.
              </div>

              {!hasResetDetails && !success && (
                <div
                  className="text-red caption1 md:mt-7 mt-4 p-3 bg-red/5 rounded-lg border border-red/20"
                  role="alert"
                >
                  This password reset link is incomplete or invalid. Please
                  request a new one.
                </div>
              )}

              {success ? (
                <div className="md:mt-7 mt-4">
                  <div
                    className="caption1 p-3 rounded-lg border border-green/20 bg-green/5 text-success"
                    role="status"
                  >
                    {success}
                  </div>

                  <div className="block-button mt-5">
                    <Link href="/login" className="button-main bg-black text-white">
                      Go to login
                    </Link>
                  </div>
                </div>
              ) : (
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

                  <div className="pass relative">
                    <label htmlFor="new-password" className="sr-only">
                      New password
                    </label>

                    <input
                      className="border-line px-4 pt-3 pb-3 pr-12 w-full rounded-lg"
                      id="new-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New password *"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting || !hasResetDetails}
                    />

                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={submitting || !hasResetDetails}
                    >
                      {showPassword ? (
                        <Icon.EyeSlash size={20} />
                      ) : (
                        <Icon.Eye size={20} />
                      )}
                    </button>
                  </div>

                  <div className="confirm-pass mt-5 relative">
                    <label htmlFor="confirm-new-password" className="sr-only">
                      Confirm new password
                    </label>

                    <input
                      className="border-line px-4 pt-3 pb-3 pr-12 w-full rounded-lg"
                      id="confirm-new-password"
                      name="password_confirmation"
                      type={showConfirmation ? "text" : "password"}
                      placeholder="Confirm new password *"
                      value={passwordConfirmation}
                      onChange={(event) =>
                        setPasswordConfirmation(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting || !hasResetDetails}
                    />

                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                      onClick={() =>
                        setShowConfirmation((current) => !current)
                      }
                      aria-label={
                        showConfirmation
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                      disabled={submitting || !hasResetDetails}
                    >
                      {showConfirmation ? (
                        <Icon.EyeSlash size={20} />
                      ) : (
                        <Icon.Eye size={20} />
                      )}
                    </button>
                  </div>

                  <div className="block-button md:mt-7 mt-4">
                    <button
                      className="button-main bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={submitting || !hasResetDetails}
                    >
                      {submitting ? "Resetting password..." : "Reset password"}
                    </button>
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/forgot-password"
                      className="font-semibold hover:underline"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                </form>
              )}
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">Remember your password?</div>

                <div className="mt-2 text-secondary">
                  Return to the login page and continue using your account.
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

const ResetPassword = () => {
  return (
    <Suspense
      fallback={
        <>
          <TopNavOne props="style-one bg-black" />
          <div id="header" className="relative w-full">
            <MenuOne props="bg-transparent" />
            <Breadcrumb heading="Reset password" subHeading="Reset password" />
          </div>
          <div className="md:py-20 py-10 text-center">Loading...</div>
          <Footer />
        </>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
