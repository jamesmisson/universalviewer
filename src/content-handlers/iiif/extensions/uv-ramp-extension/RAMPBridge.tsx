import React from "react";
import { createPortal } from "react-dom";
import { IIIFPlayer, MediaPlayer, StructuredNavigation } from "@samvera/ramp";
import { UVSyncBridge } from "./UVSyncBridge";

interface RAMPBridgeProps {
  manifestUrl: string;
  centerPanelEl: HTMLElement | null;
  leftPanelEl: HTMLElement | null;
  extensionHost: any;
}

export function RAMPBridge({
  manifestUrl,
  centerPanelEl,
  leftPanelEl,
  extensionHost,
}: RAMPBridgeProps) {
  return (
    <IIIFPlayer manifestUrl={manifestUrl}>
      {/* Sync bridge lives inside the context tree but renders nothing */}
      <UVSyncBridge extensionHost={extensionHost} />

      {/* MediaPlayer portals into the center panel content area */}
      {centerPanelEl && createPortal(<MediaPlayer />, centerPanelEl)}

      {/* StructuredNavigation portals into the left panel content area */}
      {leftPanelEl && createPortal(<StructuredNavigation />, leftPanelEl)}
    </IIIFPlayer>
  );
}
