"use client";

import React, { useState } from "react";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const MFS_NUMBER = "01XXXXXXXXX";

const BANK_DETAILS = {
  bankName: "Example Bank Limited",
  accountName: "MOSSIM",
  accountNumber: "0000000000000",
  branchName: "Example Branch",
  routingNumber: "000000000",
  swiftCode: "EXAMPLEBD",
};

const PaymentInfoContent = () => {
  const [activeTab, setActiveTab] = useState<"mfs" | "bank">("mfs");
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(MFS_NUMBER);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy payment number:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 p-1 bg-surface rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("mfs")}
          className={`w-1/2 px-4 py-3 rounded-lg text-button duration-200 ${
            activeTab === "mfs" ? "bg-black text-white" : "text-secondary"
          }`}>
          MFS Payment
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`w-1/2 px-4 py-3 rounded-lg text-button duration-200 ${
            activeTab === "bank" ? "bg-black text-white" : "text-secondary"
          }`}>
          Bank Details
        </button>
      </div>

      {activeTab === "mfs" ? (
        <div className="mt-6">
          <div className="text-center">
            <div className="heading5">Pay with bKash or Nagad</div>

            <div className="caption1 text-secondary mt-2">
              Scan the QR code or send payment to the number below.
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="relative sm:w-[260px] w-[220px] aspect-square rounded-2xl overflow-hidden border border-line bg-white p-3">
              <Image
                src="/images/payment/qr.png"
                alt="MOSSIM payment QR code"
                fill
                sizes="260px"
                className="object-contain p-3"
                priority
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyNumber}
            className="w-full mt-6 rounded-2xl border border-line bg-surface p-5 text-center cursor-pointer duration-200 hover:border-black"
            aria-label="Copy bKash or Nagad payment number">
            <div className="caption1 text-secondary">bKash / Nagad Number</div>

            <div className="heading4 mt-2 tracking-wide">{MFS_NUMBER}</div>

            <div className="caption1 text-secondary mt-2">
              Account Type: Personal
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-button">
              {copied ? (
                <>
                  <Icon.CheckCircle size={18} weight="fill" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Icon.Copy size={18} />
                  <span>Click to copy</span>
                </>
              )}
            </div>
          </button>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-line p-4">
            <Icon.Info size={20} className="mt-0.5 shrink-0" />

            <div className="caption1 text-secondary">
              Use your order number as the payment reference and keep the
              transaction ID for confirmation.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="text-center">
            <div className="heading5">Bank Transfer Details</div>

            <div className="caption1 text-secondary mt-2">
              Transfer the payable amount using the account information below.
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line overflow-hidden">
            {[
              ["Bank Name", BANK_DETAILS.bankName],
              ["Account Name", BANK_DETAILS.accountName],
              ["Account Number", BANK_DETAILS.accountNumber],
              ["Branch", BANK_DETAILS.branchName],
              ["Routing Number", BANK_DETAILS.routingNumber],
              ["SWIFT Code", BANK_DETAILS.swiftCode],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`grid sm:grid-cols-[160px_1fr] grid-cols-1 gap-1 sm:gap-5 px-5 py-4 ${
                  index !== 5 ? "border-b border-line" : ""
                }`}>
                <div className="caption1 text-secondary">{label}</div>

                <div className="text-button break-all">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-line p-4">
            <Icon.Info size={20} className="mt-0.5 shrink-0" />

            <div className="caption1 text-secondary">
              Add your order number in the transfer remarks and keep the bank
              receipt for payment verification.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInfoContent;
