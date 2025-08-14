// src/components/FadeText.tsx
import React, { useEffect, useState } from "react";

/**
 * Fades text whenever `children` changes.
 * Respects prefers-reduced-motion.
 */
export function FadeText({
  as: Tag = "div",
  className = "",
  children,
  duration = 400
}: {
  as?: any;
  className?: string;
  children: React.ReactNode;
  duration?: number; // ms
}) {
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState(children);

  useEffect(() => {
    // If content actually changed, fade out then in
    if (children === content) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) { setContent(children); return; }

    setVisible(false);
    const t1 = setTimeout(() => {
      setContent(children);
      setVisible(true);
    }, duration * 0.55);

    return () => clearTimeout(t1);
  }, [children, content, duration]);

  return (
    <Tag
      style={{ transition: `opacity ${duration}ms ease` }}
      className={`${className} ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {content}
    </Tag>
  );
}