"use client";

import { useState } from "react";
import { unboxingVideos } from "@/data/unboxing";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";
import ProductImage from "./ui/ProductImage";
import VideoModal from "./ui/VideoModal";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[45%] w-auto translate-x-[6%]" fill="currentColor" aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

function VideoCard({ title, thumbnail, video, onPlay }) {
  const playable = Boolean(video);

  return (
    <button
      type="button"
      onClick={onPlay}
      disabled={!playable}
      aria-label={playable ? `Play video: ${title}` : `${title} (video coming soon)`}
      className="group relative block aspect-1244/1428 w-[82vw] max-w-sm overflow-hidden rounded-xl bg-neutral-200 sm:w-72 sm:max-w-none lg:w-full"
    >
      <ProductImage
        src={thumbnail}
        alt={title}
        name={title}
        fit="cover"
        sizes="(min-width: 1024px) 25vw, 288px"
        placeholderClass="bg-neutral-200 text-neutral-400 rounded-none"
      />
      {/* Sized/coloured to sit exactly over the play button baked into the Figma thumbnails */}
      <span className="absolute top-1/2 left-1/2 grid h-[13.4%] w-[21.6%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-zinc-700 text-white transition-colors group-hover:bg-ink">
        <PlayIcon />
      </span>
    </button>
  );
}

export default function CustomerUnboxing() {
  const [playing, setPlaying] = useState(null);

  return (
    <section aria-labelledby="customer-unboxing" className="bg-[#f4f4f6] py-14 sm:py-16">
      <SectionHeader
        id="customer-unboxing"
        title="Digicon Customer’s Unboxing."
        subtitle="Enjoy Tech That Puts a Smile on Your Face."
      >
        We&apos;re showcasing African digital innovation across multiple industries, providing
        resources to help teams build products that truly resonate with their users. By curating
        these real-world solutions, we aim to help designers, developers, and product teams create
        impactful and relevant user experiences that drive growth and innovation across the
        continent.
      </SectionHeader>

      <ScrollCarousel label="Customer unboxing videos" gap="gap-4" fill className="mt-12 sm:mt-14">
        {unboxingVideos.map((v) => (
          <VideoCard key={v.thumbnail} {...v} onPlay={() => setPlaying(v)} />
        ))}
      </ScrollCarousel>

      <VideoModal video={playing?.video} title={playing?.title} onClose={() => setPlaying(null)} />
    </section>
  );
}
