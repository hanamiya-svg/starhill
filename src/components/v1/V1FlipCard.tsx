"use client";

import type { ComponentProps } from "react";
import { ResidenceFlipCard } from "@/components/sections/ResidenceFlipCard";
import { V1_ZOOM_EVENT, type V1ZoomDetail } from "./V1ImageViewer";

/** V1's residence card: the shared flip card plus a full-screen button wired to the v1 viewer. */
export function V1FlipCard({ zoom, ...props }: Omit<ComponentProps<typeof ResidenceFlipCard>, "zoom"> & { zoom: { photo: string; photoAlt: string; label: string } }) {
  return (
    <ResidenceFlipCard
      {...props}
      zoom={{
        ...zoom,
        onZoom: (image) => window.dispatchEvent(new CustomEvent<V1ZoomDetail>(V1_ZOOM_EVENT, { detail: image })),
      }}
    />
  );
}
