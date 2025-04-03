import { PropertiesInput } from "./propertiesInput";
import { useFrameStore, useEditorStore } from "../store";
import { PlaceholderInput } from "./placeholderInput";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { LinkSettings, LinkList } from "./linkSettings";


export function PropertiesPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const updateElement = useFrameStore((state) => state.updateElement);
  const userMode = useEditorStore((state) => state.userMode);
  const getLinkParents = useFrameStore((state) => state.getLinkParents);
  const updateTextValue = useFrameStore((state) => state.updateTextValue);

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
      <div className="sidepanel flex flex-col overflow-hidden">
        <div className="p-3 text-sm font-bold">{selectedObject.type}</div>
        <OverlayScrollbarsComponent options={{ scrollbars: { theme: "os-theme-light", autoHide: "leave" } }}>
          <div className="pb-3">
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
          </div>
          <div className="pb-2">
            <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
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
          {selectedObject.type === "Text" && <div className="pb-2">
            <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
              Links
            </div>
            <div className="px-2.5 gap-1.5 flex flex-col">
              <LinkSettings/>
              <LinkList/>
            </div>
          </div>}
        </OverlayScrollbarsComponent>
      </div>
    );
  }

  const setValue = (value: string) => {
    if (!selectedObject?.parentID) return;
    updateTextValue(selectedObject.parentID, selectedObject.id, value);
  };

  return (
    <div className="sidepanel flex flex-col overflow-hidden">
      <div className="p-3 text-sm font-bold">Linked elements</div>
      <OverlayScrollbarsComponent
        options={{ scrollbars: { theme: "os-theme-light", autoHide: "leave" }  }}
      >
        <div className="flex-1 space-y-2 pb-2">
          {getLinkParents().map((element) => (
            <div key={element.id} className="pb-0.5">
              <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
                {element.name}
              </div>
              <div
                className={
                  selectedObject?.id === element.id
                    ? "px-2.5"
                    : "px-2.5 text-neutral-400"
                }
              >
                <PlaceholderInput
                  setValue={(value) => {
                    setValue(value);
                  }}
                  value={element.textValue}
                  element={element}
                />
              </div>
            </div>
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
