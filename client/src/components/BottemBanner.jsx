import React from "react";
import assets, { features } from "../assets/assets";

const BottemBanner = () => {
  return (
    <div className="relative mt-24">
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block"
      />

      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full  md:hidden"
      />

      <div className="absolute inset-0 flex flex-col items-center md:justify-center md:items-end  pt-4 md:pt-0 md:pr-20  ">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
            Why We Are The Best
          </h1>
          {features.map((features, index) => (
            <div key={index} className="flex items-center gap-4 mt-6">
              <img
                src={features.icon}
                alt={features.title}
                className="md:w-11 w-9 md:h-11 h-10 object-contain"
                loading="lazy"
              />
              <div>
              <h3 className="text-lg md:text-xl font-semibold ">
                {features.title}
              </h3>
              <p className="text-gray-500/70 test-xs md:text-sm">
                {features.description}
              </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottemBanner;
