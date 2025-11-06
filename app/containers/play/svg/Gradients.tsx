import React from "react";

export const GradientIds = {
  Crown: "crown-gradient",
  PassText: "pass-text",
  BidText: "bid-text",
};

export const Gradients = () => {
  return (
    <defs>
      <linearGradient id={GradientIds.Crown} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="rgb(255, 255, 0)" stopOpacity={1} />
        <stop offset="100%" stopColor="rgb(255, 180, 60)" stopOpacity={1} />
      </linearGradient>
      <linearGradient id={GradientIds.PassText} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#8F398F" stopOpacity={1} />
        <stop offset="100%" stopColor="#752F75" stopOpacity={1} />
      </linearGradient>
      <linearGradient id={GradientIds.BidText} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#F2B824" stopOpacity={1} />
        <stop offset="100%" stopColor="#F2B824" stopOpacity={1} />
      </linearGradient>
    </defs>
  );
};
