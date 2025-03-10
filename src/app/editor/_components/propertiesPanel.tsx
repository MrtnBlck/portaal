import { PropertiesInput } from "./propertiesInput";
import { useFrameStore, useEditorStore } from "../store";

export function PropertiesPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateFrame = useFrameStore((state) => state.updateFrame);

  if (!selectedObject) {
    return null;
  }

  return (
    <div className="sidepanel flex-1">
      <div className="px-3 pb-3 pt-3 text-sm font-bold">
        {selectedObject ? selectedObject?.type : "No object is selected"}
      </div>
      <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
        Position
      </div>
      <div className="flex gap-1.5 px-2.5">
        <PropertiesInput
          name="X"
          setValue={(e) => {
            updateFrame({ ...selectedObject, x: e });
          }}
          value={selectedObject.x}
        />
        <PropertiesInput
          name="Y"
          setValue={(e) => {
            updateFrame({ ...selectedObject, y: e });
          }}
          value={selectedObject.y}
        />
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
    </div>
  );
}
