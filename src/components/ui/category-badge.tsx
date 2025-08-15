import React from "react";

type Props = {
  name: string;
  colorClass?: string | null;
  className?: string;
};

const palette: Record<string, string> = {
  "accent-blue": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  "accent-green": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  "accent-purple": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  "accent-rose": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  "accent-amber": "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
};

export default function CategoryBadge({ name, colorClass, className = "" }: Props) {
  const tone = colorClass && palette[colorClass] ? palette[colorClass] : "bg-secondary text-secondary-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tone} ${className}`}>
      <span className="size-1.5 rounded-full bg-current/60" />
      {name}
    </span>
  );
}