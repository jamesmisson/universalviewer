## RAMP Integration proof of concept

The `uv-ramp-extension` integrates [RAMP](https://github.com/samvera-labs/ramp)
(@samvera/ramp) into UV using React portals.

It uses a single React root mounted by `Extension.ts`, which allows all RAMP child components to share the context provided by IIIFPlayer.

Individual RAMP components are then rendered into UV's existing panels using React portals in `RAMPBridge`

`UVSyncBridge` will sync RAMP state with outer UV state (e.g. to fire events, update URL etc)

`uv-rampcenterpanel-module` and `uv-rampleftpanel-module` provide the root elements for the portals and styling.

The extension is based off the av-extension so it currently uses that config etc.
