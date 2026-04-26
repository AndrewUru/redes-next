import { Composition } from "remotion";
import {
  BrandSnapshotVideo,
  brandSnapshotDefaultProps,
  brandSnapshotSchema
} from "./BrandSnapshotVideo";

export function RemotionRoot() {
  return (
    <Composition
      id="BrandSnapshot"
      component={BrandSnapshotVideo}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={brandSnapshotDefaultProps}
      schema={brandSnapshotSchema}
    />
  );
}
