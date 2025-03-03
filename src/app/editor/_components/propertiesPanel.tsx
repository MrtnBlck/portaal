import type { ObjectData } from "../page";

interface propertiesPanelProps {
  selectedObject: ObjectData | null;
}

export function PropertiesPanel({ selectedObject }: propertiesPanelProps) {
  return (
    <div className="flex-1 rounded-lg bg-[#1F1F1F] px-0.5 pb-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
      <div className="px-3 pb-2 pt-3 text-sm font-bold">
        {selectedObject ? selectedObject?.type : "No object is selected"}
      </div>
      {selectedObject && (
        <>
          <div className="px-3 pb-2 text-xs font-semibold">Position</div>
          <div className="flex gap-1.5 px-2.5">
            <div className="w-full rounded-sm bg-white bg-opacity-5 px-2.5 py-1 text-xs font-extralight">
              <span className="pr-2 font-medium">X</span>
              {selectedObject.x}
            </div>
            <div className="w-full rounded-sm bg-white bg-opacity-5 px-2.5 py-1 text-xs font-extralight">
              <span className="pr-2 font-medium">Y</span>
              {selectedObject.y}
            </div>
          </div>
          <div className="px-3 pb-2 pt-3 text-xs font-semibold">Layout</div>
          <div className="flex gap-1.5 px-2.5">
            <div className="w-full rounded-sm bg-white bg-opacity-5 px-2.5 py-1 text-xs font-extralight">
              <span className="pr-2 font-medium">W</span>
              {selectedObject.width}
            </div>
            <div className="w-full rounded-sm bg-white bg-opacity-5 px-2.5 py-1 text-xs font-extralight">
              <span className="pr-2 font-medium">H</span>
              {selectedObject.height}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
