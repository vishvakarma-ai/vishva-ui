"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface StreamOutputProps {
  content: string;
  streaming: boolean;
  className?: string;
}

/**
 * Renders streaming LLM output with a blinking cursor while streaming
 * and auto-scrolls to the bottom as tokens arrive.
 *
 * Renders content as pre-formatted text. For markdown rendering,
 * a markdown library like react-markdown could be added here.
 */
export function StreamOutput({ content, streaming, className }: StreamOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new tokens arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [content]);

  return (
    <div className={clsx("relative", className)}>
      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-mono break-words">
        {content}
        {streaming && <span className="streaming-cursor" />}
      </div>
      <div ref={endRef} />
    </div>
  );
}
