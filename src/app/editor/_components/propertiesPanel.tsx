import { cn } from "~/lib/utils";
import { PropertiesInput } from "./propertiesInput";
import { useFrameStore } from "../_utils/frameStore";
import { useLinkStore } from "../_utils/linkStore";
import { useEditorStore } from "../_utils/editorStore";
import { PlaceholderInput } from "./placeholderInput";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { LinkSettings, LinkList } from "./linkSettings";
import { ColorInput, ColorOpacityInput } from "./colorInput";
import type {
  FrameData,
  FrameElementData,
  TextData,
} from "../_utils/editorTypes";

export function PropertiesPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject) as
    | FrameData
    | FrameElementData
    | null;
  const userMode = useEditorStore((state) => state.userMode);
  const getRoleElements = useFrameStore((state) => state.getRoleElements);
  const elements = getRoleElements("parent");

  if (userMode === "designer" && !selectedObject) return null;
  if (userMode === "normal" && elements.length === 0) return null;

  return (
    <div className="sidepanel flex flex-col overflow-hidden">
      <div className="p-3 text-sm font-bold">
        {userMode === "designer" ? selectedObject?.type : "Linked elements"}
      </div>
      <OverlayScrollbarsComponent
        options={{
          scrollbars: { theme: "os-theme-light", autoHide: "leave" },
        }}
      >
        {userMode === "designer" ? (
          <ProperyList selectedObject={selectedObject} />
        ) : (
          <LinkedElementInputs
            elements={elements}
            selectedObject={selectedObject}
          />
        )}
      </OverlayScrollbarsComponent>
    </div>
  );
}

function ProperyList({
  selectedObject,
}: {
  selectedObject: FrameElementData | FrameData | null;
}) {
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const updateElement = useFrameStore((state) => state.updateElement);

  if (!selectedObject) {
    return null;
  }
  const setValue = (property: string, value: number) => {
    if (selectedObject.type === "Frame") {
      const sFrame = selectedObject as FrameData;
      updateFrame({ ...sFrame, [property]: value });
    } else {
      const sElement = selectedObject as FrameElementData;
      updateElement(sElement.frameId, {
        ...sElement,
        [property]: value,
      });
    }
  };

  return (
    <>
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
            max={5000}
            min={100}
            setValue={(value) => {
              setValue("width", value);
            }}
            value={selectedObject.width}
          />
          <PropertiesInput
            name="H"
            max={5000}
            min={100}
            setValue={(value) => {
              setValue("height", value);
            }}
            value={selectedObject.height}
          />
        </div>
      </div>
      {selectedObject.type !== "Image" && (
        <div className="pb-2">
          <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
            Color
          </div>
          <div className="flex gap-1.5 px-2.5">
            <ColorInput
              id={selectedObject.id}
              frameId={
                selectedObject.type === "Frame"
                  ? undefined
                  : (selectedObject as FrameElementData).frameId
              }
              fillOpacity={selectedObject.fillOpacity}
              fill={selectedObject.fill}
            />
            <ColorOpacityInput
              id={selectedObject.id}
              frameId={
                selectedObject.type === "Frame"
                  ? undefined
                  : (selectedObject as FrameElementData).frameId
              }
              fillOpacity={selectedObject.fillOpacity}
            />
          </div>
        </div>
      )}
      {selectedObject.type === "Text" && (
        <div className="pb-2">
          <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
            Links
          </div>
          <div className="flex flex-col gap-1.5 px-2.5">
            <LinkSettings />
            <LinkList />
          </div>
        </div>
      )}
    </>
  );
}

function LinkedElementInputs({
  selectedObject,
  elements,
}: {
  selectedObject: FrameElementData | FrameData | null;
  elements: FrameElementData[];
}) {
  const updateTextValue = useFrameStore((state) => state.updateTextValue);
  const getRelatedElements = useLinkStore((state) => state.getRelatedElements);

  let sElement = selectedObject as TextData;
  if (sElement && sElement.linkRole === "child") {
    sElement = getRelatedElements(sElement.id, "child") as TextData;
  }

  const setValue = (value: string) => {
    if (!sElement) return;
    updateTextValue(sElement.frameId, sElement.id, value);
  };

  return (
    <div className="flex-1 space-y-2 pb-2">
      {elements.map((element) => (
        <div key={element.id} className="pb-0.5">
          <div className="px-3 pb-1 text-xs font-medium text-neutral-400">
            {element.name}
          </div>
          <div
            className={cn(
              "px-2.5 text-neutral-400",
              sElement && sElement.id === element.id && "text-white",
            )}
          >
            <PlaceholderInput
              setValue={(value) => {
                setValue(value);
              }}
              value={(element as TextData).textValue}
              element={element}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
