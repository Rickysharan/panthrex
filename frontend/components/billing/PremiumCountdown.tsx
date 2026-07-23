"use client";

import { useEffect, useState } from "react";

type PremiumCountdownProps = {
  expiry: string | null;
};

function calculateRemaining(expiry: string | null) {
  if (!expiry) {
    return null;
  }

  const difference =
    new Date(expiry).getTime() -
    Date.now();

  if (difference <= 0) {
    return "Expired";
  }

  const hours = Math.floor(
    difference / (1000 * 60 * 60),
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60,
  );

  const seconds = Math.floor(
    (difference / 1000) % 60,
  );

  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function PremiumCountdown({
  expiry,
}: PremiumCountdownProps) {
  const [remaining, setRemaining] =
    useState(
      calculateRemaining(expiry),
    );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(
        calculateRemaining(expiry),
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [expiry]);

  if (!remaining) {
    return null;
  }

  return (
    <p className="mt-2 text-xs text-white/50">
      Expires in:
      <span className="ml-1 font-semibold text-indigo-300">
        {remaining}
      </span>
    </p>
  );
}
