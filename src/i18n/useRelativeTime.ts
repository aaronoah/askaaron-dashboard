import { useMemo } from "react";
import { useTranslation } from "./I18nProvider";

export function useRelativeStrings() {
  const { t, locale } = useTranslation();
  return useMemo(
    () => ({
      justNow: t("time.justNow"),
      minAgo: (n: number) => t("time.minAgo", { n }),
      hourAgo: (n: number) => (n === 1 ? t("time.hourAgo", { n }) : t("time.hoursAgo", { n })),
      yesterday: t("time.yesterday"),
      daysAgo: (n: number) => t("time.daysAgo", { n }),
      shortDate: (ts: number) =>
        new Date(ts).toLocaleDateString(locale === "cn" ? "zh-CN" : undefined, {
          month: "short",
          day: "numeric",
        }),
    }),
    [t, locale],
  );
}
