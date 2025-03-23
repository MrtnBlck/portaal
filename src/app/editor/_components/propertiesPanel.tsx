import { PropertiesInput } from "./propertiesInput";
import { useFrameStore, useEditorStore } from "../store";
import { PlaceholderInput } from "./placeholderInput";

export function PropertiesPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const updateElement = useFrameStore((state) => state.updateElement);
  const userMode = useEditorStore((state) => state.userMode);
  const getPlaceholders = useFrameStore((state) => state.getPlaceholders);

  if (userMode === "designer") {
    if (!selectedObject) {
      return null;
    }

    const setValue = (property: string, value: number) => {
      if (selectedObject.type === "Frame") {
        updateFrame({ ...selectedObject, [property]: value });
      } else if (selectedObject.parentID) {
        updateElement(selectedObject.parentID, {
          ...selectedObject,
          [property]: value,
        });
      }
    };

    return (
      <div className="sidepanel flex-1">
        <div className="px-3 pb-3 pt-3 text-sm font-bold">
          {selectedObject.type}
        </div>
        <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
          Position
        </div>
        <div className="flex gap-1.5 px-2.5">
          <PropertiesInput
            name="X"
            setValue={(value) => {
              setValue("x", value);
            }}
            value={selectedObject.x}
          />
          <PropertiesInput
            name="Y"
            setValue={(value) => {
              setValue("y", value);
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
            setValue={(value) => {
              setValue("width", value);
            }}
            value={selectedObject.width}
          />
          <PropertiesInput
            name="H"
            max={1000}
            min={100}
            setValue={(value) => {
              setValue("height", value);
            }}
            value={selectedObject.height}
          />
        </div>
      </div>
    );
  }

  const setValue = (property: string, value: string) => {
    if (!selectedObject?.parentID) return;
    updateElement(selectedObject.parentID, {
      ...selectedObject,
      [property]: value,
    });
  };

  return (
    <div className="sidepanel flex flex-1 flex-col gap-3 p-3">
      <div className="px-1 text-sm font-bold">Placeholders</div>
      {getPlaceholders().map((placeholder) => (
        <div key={placeholder.id}>
          <div className="px-1 pb-1 text-xs font-medium text-neutral-400">
            {placeholder.name}
          </div>
          <div
            className={
              selectedObject?.id === placeholder.id ? "flex gap-1.5" : "flex gap-1.5 text-neutral-400"
            }
          >
            <PlaceholderInput
              setValue={(value) => {
                setValue("textValue", value);
              }}
              value={placeholder.textValue}
              element={placeholder}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
