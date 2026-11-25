"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "../icons";

// Extracts a YouTube video ID from common link formats, or returns null.
function youTubeId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

// Native <dialog> modal: Esc, focus trapping and backdrop come for free.
export default function VideoModal({ video, title, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (video && dialog && !dialog.open) dialog.showModal();
  }, [video]);

  if (!video) return null;
  const ytId = youTubeId(video);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      aria-label={title}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => ref.current?.close()}
        aria-label="Close video"
        className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <CloseIcon className="size-5" />
      </button>

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        {ytId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        ) : (
          <video src={video} controls autoPlay playsInline className="size-full">
            <track kind="captions" />
          </video>
        )}
      </div>
    </dialog>
  );
}
