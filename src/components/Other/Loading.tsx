"use client";
import React from "react";
import Image from "next/image";

interface Props {
  fullScreen?: boolean;
  text?: string;
}

const Loading: React.FC<Props> = ({ fullScreen = false, text }) => {
  return (
    <div
      className={`mossim-loader flex flex-col items-center justify-center gap-4 ${fullScreen ? "fixed inset-0 z-[9999] bg-white" : "py-20"}`}>
      <Image
        src="/images/mossim.png"
        alt="MOSSIM"
        width={80}
        height={80}
        priority
        className="animate-pulse"
      />

      <div className="text-center">
        <div className="text-xl font-bold tracking-widest animate-pulse">
          MOSSIM
        </div>
        {text && <div className="caption1 text-secondary mt-1">{text}</div>}
      </div>
    </div>
  );
};

export default Loading;
