import React from "react";
import { Link } from "react-router-dom";

/**
 * StatCard
 * Props:
 * - icon: Lucide icon component
 * - label: string
 * - value: string | number
 * - trend?: { direction: 'up' | 'down', value: string }
 * - color?: 'primary' | 'success' | 'warning' | 'neutral'
 * - size?: 'sm' | 'md' | 'lg'
 * - subtle?: boolean (lower visual weight)
 * - to?: string (if provided, wraps with Link hover affordance)
 */
const COLORS = {
  primary: {
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400",
  },
  success: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    chip: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    icon: "text-purple-600 dark:text-purple-400",
  },
  neutral: {
    chip: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
    icon: "text-gray-600 dark:text-gray-400",
  },
};

const SIZES = {
  sm: { pad: "p-3", label: "text-xs", value: "text-lg", iconBox: "w-8 h-8", icon: "h-4 w-4" },
  md: { pad: "p-4", label: "text-sm", value: "text-2xl", iconBox: "w-10 h-10", icon: "h-5 w-5" },
  lg: { pad: "p-5", label: "text-sm", value: "text-3xl", iconBox: "w-12 h-12", icon: "h-6 w-6" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "neutral",
  size = "md",
  subtle = false,
  to,
}) {
  const c = COLORS[color] || COLORS.neutral;
  const s = SIZES[size] || SIZES.md;

  const Content = (
    <div
      className={[
        "rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors",
        subtle ? "bg-white/60 dark:bg-gray-900/60" : "bg-white dark:bg-gray-900",
        s.pad,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={[
              "rounded-lg flex items-center justify-center",
              s.iconBox,
              c.chip,
            ].join(" ")}
          >
            <Icon className={s.icon} />
          </div>
        )}
        <div className="flex-1">
          <div className={`text-gray-500 dark:text-gray-400 ${s.label}`}>{label}</div>
          <div className={`font-semibold text-gray-900 dark:text-white ${s.value}`}>{value}</div>
        </div>
        {trend && (
          <div
            className={[
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
            ].join(" ")}
            title="Trend"
          >
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block hover:shadow-md hover:-translate-y-0.5 transition">
      {Content}
    </Link>
  ) : (
    Content
  );
}

export default React.memo(StatCard);
