"use client";

import React, { useEffect } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import PaymentInfoContent from "@/components/Checkout/PaymentInfoContent";

interface ModalPaymentInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalPaymentInfo: React.FC<ModalPaymentInfoProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 md:p-6 p-3"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-info-title"
        className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white md:p-8 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close payment information"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center duration-200 hover:bg-black hover:text-white"
        >
          <Icon.X size={16} />
        </button>

        <div id="payment-info-title" className="heading4 pr-12">
          Payment Information
        </div>
        <div className="caption1 text-secondary mt-2 mb-6">
          Choose a payment option and use the details shown below.
        </div>

        <PaymentInfoContent />
      </div>
    </div>
  );
};

export default ModalPaymentInfo;
