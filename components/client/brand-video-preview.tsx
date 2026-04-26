"use client";

import { Player } from "@remotion/player";
import {
  BrandSnapshotVideo,
  type BrandSnapshotProps
} from "@/remotion/BrandSnapshotVideo";

export function BrandVideoPreview({
  inputProps
}: {
  inputProps: BrandSnapshotProps;
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border-2 border-border bg-black p-2 shadow-[6px_8px_0_0_rgba(0,0,0,1)]">
      <Player
        component={BrandSnapshotVideo}
        compositionHeight={1920}
        compositionWidth={1080}
        controls
        durationInFrames={180}
        fps={30}
        inputProps={inputProps}
        loop
        style={{
          aspectRatio: "9 / 16",
          backgroundColor: "black",
          borderRadius: 6,
          overflow: "hidden",
          width: "100%"
        }}
      />
    </div>
  );
}
