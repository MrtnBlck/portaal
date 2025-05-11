import { P_svg } from "./P_svg";
import { useEditorStore } from "../_utils/editorStore";
import { useFrameStore } from "../_utils/frameStore";
import type { FrameData, FrameElementData } from "../_utils/editorTypes";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "../_utils/customScroll.css";
import "overlayscrollbars/overlayscrollbars.css";

export function FramesPanel(props: { name: string }) {
  const frames = useFrameStore((state) => state.frames);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);

  return (
    <div className="sidepanel flex max-h-60 min-h-44 flex-col overflow-hidden">
      <div className="items-center px-4 pb-2.5 pt-4">
        <P_svg />
      </div>
      <div className="px-4 pb-3 font-medium outline-none">{props.name}</div>
      <div className="px-4 pb-1 text-xs font-semibold text-neutral-400">
        Frames
      </div>
      <OverlayScrollbarsComponent
        options={{
          scrollbars: { theme: "os-theme-light", autoHide: "leave" },
        }}
      >
        <div className="flex flex-col gap-1.5 px-1.5">
          {frames.map((frame) => (
            <div
              key={frame.ID}
              className={`rounded-md px-2.5 py-1.5 text-xs hover:bg-white hover:bg-opacity-5 ${(selectedObject as FrameData)?.ID === frame.ID || (selectedObject as FrameElementData)?.frameID === frame.ID ? "bg-white bg-opacity-5" : "text-neutral-400"}`}
              onClick={() => setSelectedObject(frame)}
            >
              {frame.name}
            </div>
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
