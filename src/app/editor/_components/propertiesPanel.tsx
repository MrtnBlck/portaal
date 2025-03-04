import type { ObjectData } from "../page";
import { PropertiesInput } from "./propertiesInput";

interface propertiesPanelProps {
  selectedObject: ObjectData | null;
  updateFrame: (frame: ObjectData) => void;
}

export function PropertiesPanel({
  selectedObject,
  updateFrame,
}: propertiesPanelProps) {
  return (
    <div className="sidepanel flex-1">
      <div className="px-3 pb-3 pt-3 text-sm font-bold">
        {selectedObject ? selectedObject?.type : "No object is selected"}
      </div>
      {selectedObject && (
        <>
          <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
            Position
          </div>
          <div className="flex gap-1.5 px-2.5">
            <div className="w-full rounded-md bg-white/5 px-2.5 py-1.5 text-xs">
              <span className="pr-2 font-medium text-neutral-400">X</span>
              {selectedObject.x}
            </div>
            <div className="w-full rounded-md bg-white/5 px-2.5 py-1.5 text-xs">
              <span className="pr-2 font-medium text-neutral-400">Y</span>
              {selectedObject.y}
            </div>
          </div>
          <div className="px-3 pb-1 pt-3 text-xs font-medium text-neutral-400">
            Dimensions
          </div>
          <div className="flex gap-1.5 px-2.5">
            <PropertiesInput
              name="W"
              max={1000}
              min={100}
              setValue={(e) => {
                updateFrame({ ...selectedObject, width: e });
              }}
              value={selectedObject.width}
            />
            <PropertiesInput
              name="H"
              max={1000}
              min={100}
              setValue={(e) => {
                updateFrame({ ...selectedObject, height: e });
              }}
              value={selectedObject.height}
            />
          </div>
        </>
      )}
    </div>
  );
}
