import { P_svg } from "./P_svg";
import { useFrameStore, useEditorStore } from "../store";
import type { FrameData, FrameElementData } from "../_utils/editorTypes";

export function VariantsPanel() {
  const frames = useFrameStore((state) => state.frames);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);

  return (
    <div className="sidepanel">
      <div className="items-center px-4 pb-2.5 pt-4">
        <P_svg />
      </div>
      <div className="px-4 pb-3 font-medium outline-none">Untitled</div>
      <div className="px-4 pb-1 text-xs text-neutral-400">Variants</div>
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
    </div>
  );
}
