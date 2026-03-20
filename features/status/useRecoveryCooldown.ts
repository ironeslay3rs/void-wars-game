"use client";

import { useEffect, useState } from "react";

export function useRecoveryCooldown(conditionRecoveryAvailableAt: number) {
  const [now, setNow] = useState(() => Date.now());
  const recoveryCooldownRemainingMs = Math.max(
    0,
    conditionRecoveryAvailableAt - now,
  );
  const recoveryCooldownRemainingSeconds = Math.ceil(
    recoveryCooldownRemainingMs / 1000,
  );
  const isRecoveryOnCooldown = recoveryCooldownRemainingMs > 0;

  useEffect(() => {
    if (!isRecoveryOnCooldown) return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRecoveryOnCooldown]);

  return {
    recoveryCooldownRemainingMs,
    recoveryCooldownRemainingSeconds,
    isRecoveryOnCooldown,
  };
}

