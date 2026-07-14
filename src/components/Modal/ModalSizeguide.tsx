"use client";

import React, { useState } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from "@/type/ProductType";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface Props {
  data: ProductType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ModalSizeguide: React.FC<Props> = ({ data, isOpen, onClose }) => {
  const [activeSize, setActiveSize] = useState<string>("");
  const [totalInches, setTotalInches] = useState<number>(66);
  const [weight, setWeight] = useState<number>(60);

  // Convert total inches into feet and inches
  const heightFeet = Math.floor(totalInches / 12);
  const heightInches = totalInches % 12;

  const calculateSize = (inches: number, currentWeight: number) => {
    const heightCm = inches * 2.54;

    if (heightCm > 180 || currentWeight > 70) {
      setActiveSize("2XL");
    } else if (heightCm > 170 || currentWeight > 60) {
      setActiveSize("XL");
    } else if (heightCm > 160 || currentWeight > 50) {
      setActiveSize("L");
    } else if (heightCm > 155 || currentWeight > 45) {
      setActiveSize("M");
    } else if (heightCm > 150 || currentWeight > 40) {
      setActiveSize("S");
    } else {
      setActiveSize("XS");
    }
  };

  const handleHeightChange = (values: number | number[]) => {
    const value = Array.isArray(values) ? values[0] : values;

    setTotalInches(value);
    calculateSize(value, weight);
  };

  const handleWeightChange = (values: number | number[]) => {
    const value = Array.isArray(values) ? values[0] : values;

    setWeight(value);
    calculateSize(totalInches, value);
  };

  return (
    <div className="modal-sizeguide-block" onClick={onClose}>
      <div
        className={`modal-sizeguide-main relative w-[94vw] max-w-[900px] max-h-[85vh] overflow-y-auto md:p-8 p-5 rounded-[32px] ${
          isOpen ? "open" : ""
        }`}
        onClick={(event) => event.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          aria-label="Close size guide"
          className="close-btn absolute right-5 top-5 z-10 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
          onClick={onClose}>
          <Icon.X size={14} />
        </button>

        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-10 gap-7">
          {/* Left side */}
          <div className="md:pr-2">
            <div className="heading3 pr-10">MOSSIM Size Guide</div>

            <div className="md:mt-8 mt-6 progress">
              {/* Height */}
              <div>
                <div className="flex items-center gap-8">
                  <span className="flex-shrink-0 w-14">Height</span>

                  <div className="flex items-center justify-center w-32 gap-1 py-2 border border-line rounded-lg flex-shrink-0">
                    <span>{heightFeet}</span>
                    <span className="caption1 text-secondary">ft</span>

                    <span className="ml-1">{heightInches}</span>
                    <span className="caption1 text-secondary">in</span>
                  </div>
                </div>

                <div className="mt-5 px-1">
                  <Slider
                    min={36}
                    max={84}
                    value={totalInches}
                    onChange={handleHeightChange}
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="mt-7">
                <div className="flex items-center gap-8">
                  <span className="flex-shrink-0 w-14">Weight</span>

                  <div className="flex items-center justify-center w-32 gap-1 py-2 border border-line rounded-lg flex-shrink-0">
                    <span>{weight}</span>
                    <span className="caption1 text-secondary">Kg</span>
                  </div>
                </div>

                <div className="mt-5 px-1">
                  <Slider
                    min={30}
                    max={150}
                    value={weight}
                    onChange={handleWeightChange}
                  />
                </div>
              </div>
            </div>

            {/* Suggested size */}
            <div className="heading6 mt-8">Suggested size for you:</div>

            <div className="list-size flex items-center gap-2 flex-wrap mt-3">
              {data?.sizes?.map((item, index) => (
                <button
                  type="button"
                  className={`size-item w-12 h-12 flex items-center justify-center text-button rounded-full bg-white border border-line ${
                    activeSize === item ? "active" : ""
                  }`}
                  key={`${item}-${index}`}
                  onClick={() => setActiveSize(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Size table */}
          <div className="md:border-l md:border-line md:pl-10">
            <div className="heading5 mb-5">Size Chart</div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust</th>
                    <th>Waist</th>
                    <th>Low Hip</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className={activeSize === "XS" ? "bg-surface" : ""}>
                    <td>XS</td>
                    <td>32</td>
                    <td>24-25</td>
                    <td>33-34</td>
                  </tr>

                  <tr className={activeSize === "S" ? "bg-surface" : ""}>
                    <td>S</td>
                    <td>34-35</td>
                    <td>26-27</td>
                    <td>35-36</td>
                  </tr>

                  <tr className={activeSize === "M" ? "bg-surface" : ""}>
                    <td>M</td>
                    <td>36-37</td>
                    <td>28-29</td>
                    <td>38-40</td>
                  </tr>

                  <tr className={activeSize === "L" ? "bg-surface" : ""}>
                    <td>L</td>
                    <td>38-39</td>
                    <td>30-31</td>
                    <td>42-44</td>
                  </tr>

                  <tr className={activeSize === "XL" ? "bg-surface" : ""}>
                    <td>XL</td>
                    <td>40-41</td>
                    <td>32-33</td>
                    <td>45-47</td>
                  </tr>

                  <tr className={activeSize === "2XL" ? "bg-surface" : ""}>
                    <td>2XL</td>
                    <td>42-43</td>
                    <td>34-35</td>
                    <td>48-50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSizeguide;
