"use client";
import { useState } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<Props> = ({ id, label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="caption1">
        {label} <span className="text-red">*</span>
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="border-line px-4 py-3 pr-12 w-full rounded-lg"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-black duration-200"
          onClick={() => setShow((p) => !p)}>
          {show ? <Icon.EyeSlash size={18} /> : <Icon.Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;