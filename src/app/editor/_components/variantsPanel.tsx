import { P_svg } from "./P_svg";
import type { ObjectData } from "../page";

interface VariantsPanelProps {
  frames: ObjectData[];
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
}

export function VariantsPanel({
  frames,
  selectedObject,
  setSelectedObject,
}: VariantsPanelProps) {
  return (
    <div className="rounded-lg bg-[#1F1F1F] pb-2.5 px-0.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
      <div className="items-center px-4 pt-4 pb-2.5">
        <P_svg />
      </div>
      <div className="px-4 font-extralight pb-1">Untitled</div>
      <div className="px-4 pb-2 text-xs font-semibold">Variants</div>
      <div className="flex flex-col gap-1.5 px-1.5">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className={`rounded-sm px-2.5 py-1 text-xs font-extralight hover:bg-white hover:bg-opacity-5 ${selectedObject?.id === frame.id ? "bg-white bg-opacity-5" : ""}`}
            onClick={() => setSelectedObject(frame)}
          >
            {frame.name}
          </div>
        ))}
      </div>
    </div>
  );
}
