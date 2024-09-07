import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHapticFeedback, useLaunchParams } from "@telegram-apps/sdk-react";

export const CompletionMessage: React.FC<{
  correctCount: number;
  totalCount: number;
}> = ({ correctCount, totalCount }) => {
  const { t } = useTranslation();
  const haptic = useHapticFeedback();
  const { initDataRaw } = useLaunchParams();
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);
  const [bonusReceived, setBonusReceived] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getBonusRating = async () => {
    haptic.impactOccurred("heavy");

    // if (correctCount < 5) {
    //   alert(t("gfys"));
    //   return;
    // }

    try {
      const response = await fetch("/english/award-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          _auth: initDataRaw || "",
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        alert(`Success! New balance: ${data.newBalance}`);
        setBonusReceived(true);
      } else if (response.status === 429 && data.timeLeft) {
        setCooldownTime(data.timeLeft);
      } else {
        throw new Error(data.err || "Failed to award points");
      }
    } catch (error) {
      alert("Error awarding points");
    }
  };

  const checkCooldown = async () => {
    try {
      const response = await fetch("/english/get-cooldown", {
        method: "GET",
        headers: {
          _auth: initDataRaw || "",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCooldownTime(data.cooldownTime);
      }
    } catch (error) {
      console.error("Error getting cooldown:", error);
    }
  };

  useEffect(() => {
    checkCooldown();
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    if (cooldownTime !== null && cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((prevTime) => {
          if (prevTime !== null && prevTime > 0) {
            return prevTime - 1;
          }
          return null;
        });
      }, 1000);
    }

    return () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
    };
  }, [cooldownTime]);

  return (
    <div className="mt-6 p-4 bg-tg-section-bg-color rounded-lg shadow-md animate-bounce-in border border-tg-section-separator-color">
      <h2 className="text-xl font-bold mb-2 text-tg-section-header-text-color">
        {t("greatJob")}
      </h2>
      <p className="text-lg text-tg-text-color">
        {t("score")}: {correctCount} / {totalCount}
      </p>
      {!bonusReceived && (
        <button
          onClick={getBonusRating}
          disabled={cooldownTime !== null && cooldownTime > 0}
          className={`w-full mt-4 py-2 px-4 rounded-lg text-white font-bold ${
            cooldownTime !== null && cooldownTime > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-tg-button-color"
          }`}
        >
          {cooldownTime !== null && cooldownTime > 0
            ? `${t("cooldown")}: ${formatTime(cooldownTime)}`
            : t("getBonus")}
        </button>
      )}
    </div>
  );
};
