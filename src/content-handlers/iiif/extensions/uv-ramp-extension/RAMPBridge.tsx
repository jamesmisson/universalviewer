import React from "react";
import { createPortal } from "react-dom";
import {
  IIIFPlayer,
  MediaPlayer,
  StructuredNavigation,
  Transcript,
} from "@samvera/ramp";
import { UVSyncBridge } from "./UVSyncBridge";

interface RAMPBridgeProps {
  manifestUrl: string;
  centerPanelEl: HTMLElement | null;
  navEl: HTMLElement | null;
  transcriptEl: HTMLElement | null;
  extensionHost: any;
}

export function RAMPBridge({
  manifestUrl,
  centerPanelEl,
  navEl,
  transcriptEl,
  extensionHost,
}: RAMPBridgeProps) {
  return (
    <IIIFPlayer manifestUrl={manifestUrl}>
      {/* Sync bridge lives inside the context tree but renders nothing */}
      <UVSyncBridge extensionHost={extensionHost} />

      {/* MediaPlayer portals into the center panel content area */}
      {centerPanelEl &&
        createPortal(
          <div className="ramp-player-scope">
            <MediaPlayer />
          </div>,
          centerPanelEl
        )}

      {navEl && createPortal(<StructuredNavigation />, navEl)}

      {transcriptEl &&
        createPortal(
          <Transcript playerID="ramp-player" manifestUrl={manifestUrl} />,
          transcriptEl
        )}
    </IIIFPlayer>
  );
}
