import { useEditorStore, useFrameStore } from "../store";
import { PlaceholderInput } from "./placeholderInput";
import { P_svg } from "./P_svg";

export function PlaceholderPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const updateElement = useFrameStore((state) => state.updateElement);
  const getPlaceholders = useFrameStore((state) => state.getPlaceholders);

  const setValue = (property: string, value: string) => {
    if (!selectedObject?.parentID) return;
    updateElement(selectedObject.parentID, {
      ...selectedObject,
      [property]: value,
    });
  };

  const elements = getPlaceholders();

  return (
    <div className="sidepanel flex-1">
      {/* <div className="items-center px-3 pb-2.5 pt-4">
        <P_svg />
      </div>
      <div className="px-3 pb-2 font-medium outline-none">Untitled</div> */}
      <div className="flex flex-col pt-2"> {/* v1 -pt-2 */}
        {elements.map((element) => (
          <div
            key={element.id}
            className={
              selectedObject?.id === element.id
                ? "flex flex-col overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-white"
                : "flex flex-col overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-neutral-400"
            }
            onClick={() => setSelectedObject(element)}
          >
            <div className="px-0.5 pb-1 text-xs font-medium">
              {element.name}
            </div>
            <PlaceholderInput
              value={element.textValue}
              setValue={(value) => {
                setValue("textValue", value);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
