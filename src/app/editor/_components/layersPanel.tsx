import { useEditorStore, useFrameStore, useLinkStore } from "../store";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "./customScroll.css";
import type {
  FrameData,
  FrameElementData,
  TextData,
} from "../_utils/editorTypes";
import { cn } from "~/lib/utils";

export function LayersPanel() {
  let displayedFrame;
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const getFrame = useFrameStore((state) => state.getFrame);
  const userMode = useEditorStore((state) => state.userMode);
  const getRoleElements = useFrameStore((state) => state.getRoleElements);
  const getRelatedElements = useLinkStore((state) => state.getRelatedElements);

  if (userMode === "designer") {
    if (!selectedObject) {
      return null;
    }
    if ((selectedObject as FrameElementData).frameID) {
      displayedFrame = getFrame((selectedObject as FrameElementData).frameID);
    } else {
      displayedFrame = selectedObject as FrameData;
    }
    if (displayedFrame?.elements.length === 0) return null;
    return (
      <div className="sidepanel flex flex-col overflow-hidden">
        <div className="px-4 pb-2 pt-4 text-xs font-semibold">Elements</div>
        <OverlayScrollbarsComponent
          options={{
            scrollbars: { theme: "os-theme-light", autoHide: "leave" },
          }}
        >
          <div className="flex-1 space-y-1.5 px-1.5 pb-2">
            {displayedFrame?.elements?.map((element) => (
              <div
                key={element.ID}
                className={
                  element.ID === (selectedObject as FrameElementData).ID
                    ? "overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-white"
                    : "overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5"
                }
                onClick={() => setSelectedObject(element)}
              >
                <span className="pr-2 font-bold">{element.type[0]}</span>

                {element.name}
              </div>
            ))}
            {/* <div className="inline-flex gap-2 rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
          <span className="font-bold">P</span>Picture type
        </div>
        <div className="rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
          <span className="pr-2 font-bold">G</span>Group type
        </div>
        <div className="rounded-md px-2.5 py-1.5 indent-4 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
          <span className="pr-2 font-bold">S</span>Shape type
        </div>
        <div className="rounded-md px-2.5 py-1.5 indent-8 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
          <span className="pr-2 font-bold">S</span>Shape type
        </div> */}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    );
  }

  const elements = getRoleElements("parent");
  if (elements.length === 0) return null;

  let sElement = selectedObject as TextData;
  if (sElement && sElement.linkRole === "child") {
    sElement = getRelatedElements(sElement.ID, "child") as TextData;
  }

  return (
    <div className="sidepanel flex flex-col overflow-hidden">
      <div className="px-4 pb-2 pt-4 text-xs font-semibold">Elements</div>
      <OverlayScrollbarsComponent
        options={{ scrollbars: { theme: "os-theme-light", autoHide: "leave" } }}
      >
        <div className="flex-1 space-y-1.5 px-1.5 pb-2">
          {elements.map((element) => (
            <div
              key={element.ID}
              className={cn(
                "overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white/5",
                sElement &&
                  sElement.ID === element.ID &&
                  "bg-white/5 text-white",
              )}
              onClick={() => setSelectedObject(element)}
            >
              <span className="pr-2 font-bold">{element.type[0]}</span>
              {element.name}
            </div>
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
