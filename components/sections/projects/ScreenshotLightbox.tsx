"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content";
import { ArrowIcon } from "@/components/ui";
import { screenshotSrcSet } from "@/lib/images";

export function ScreenshotLightbox({
  name,
  screenshots,
  initialIndex,
  onClose,
}: {
  name: string;
  screenshots: Project["screenshots"];
  initialIndex: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const screenshot = screenshots[index]!;
  const step = (delta: number) => {
    setZoomed(false);
    setIndex((current) => (current + delta + screenshots.length) % screenshots.length);
  };

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    if (zoomed) imageRef.current?.focus({ preventScroll: true });
  }, [zoomed]);

  return (
    <dialog
      ref={dialogRef}
      className="screenshot-lightbox"
      aria-label={`${name} screenshot viewer`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (!zoomed && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="lightbox-content">
        <div className="lightbox-toolbar">
          <p className="flex-1 font-mono text-mono text-text-muted" aria-live="polite">
            {index + 1} / {screenshots.length}
          </p>
          <button
            type="button"
            className="lightbox-button"
            aria-label={zoomed ? "Fit screenshot to screen" : "Zoom into screenshot"}
            aria-pressed={zoomed}
            onClick={() => setZoomed((value) => !value)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 6 6M7 10h6" />
              {!zoomed && <path d="M10 7v6" />}
            </svg>
          </button>
          <button
            type="button"
            className="lightbox-button"
            aria-label="Close screenshot viewer"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <figure className="lightbox-figure">
          <div
            ref={imageRef}
            className="lightbox-image"
            role="group"
            aria-label="Enlarged screenshot"
            tabIndex={zoomed ? 0 : -1}
            data-zoomed={zoomed ? "" : undefined}
            onPointerDown={(event) => {
              gesture.current = event.isPrimary
                ? { x: event.clientX, y: event.clientY, id: event.pointerId }
                : null;
            }}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            onPointerUp={(event) => {
              const start = gesture.current;
              gesture.current = null;
              if (zoomed || !start || start.id !== event.pointerId) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- statik export, mevcut srcset */}
            <img
              src={screenshot.src}
              srcSet={screenshotSrcSet(screenshot.src)}
              sizes={zoomed ? "(min-width: 1250px) 96vw, 1200px" : "96vw"}
              alt={screenshot.alt}
              width={1792}
              height={1120}
              draggable={false}
            />
          </div>
          <figcaption className="text-body-s text-text-muted" aria-live="polite">
            {screenshot.caption}
          </figcaption>
        </figure>
        {screenshots.length > 1 && (
          <div className="lightbox-controls">
            <button
              type="button"
              className="lightbox-button"
              aria-label="Previous enlarged screenshot"
              onClick={() => step(-1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="lightbox-button"
              aria-label="Next enlarged screenshot"
              onClick={() => step(1)}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
