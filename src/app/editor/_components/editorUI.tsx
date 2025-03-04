import { ToolBar } from "./toolBar";
import { ActionBar } from "./actionBar";
import { PropertiesPanel } from "./propertiesPanel";
import { LayersPanel } from "./layersPanel";
import { VariantsPanel } from "./variantsPanel";
import type { ObjectData } from "../page";

interface EditorUIProps {
  tool: "move" | "hand" | "frame";
  setTool: (tool: "move" | "hand" | "frame") => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
  frames: ObjectData[];
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
  updateFrame: (frame: ObjectData) => void;
}

export function EditorUI({
  tool,
  setTool,
  stageScale,
  setStageScale,
  frames,
  selectedObject,
  setSelectedObject,
  updateFrame,
}: EditorUIProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex h-min w-72 select-none flex-col gap-2.5 p-2.5">
        <VariantsPanel
          frames={frames}
          selectedObject={selectedObject}
          setSelectedObject={(e) => setSelectedObject(e)}
        />
        {selectedObject && <LayersPanel />}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex h-min w-72 select-none flex-col gap-2.5 p-2.5">
        <ActionBar stageScale={stageScale} setStageScale={setStageScale} />
        {selectedObject && (
          <PropertiesPanel
            selectedObject={selectedObject}
            updateFrame={updateFrame}
          />
        )}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-auto -translate-x-1/2 select-none p-2.5">
        <ToolBar
          tool={tool}
          setTool={setTool}
          className="pointer-events-auto w-full space-x-1 rounded-lg border border-neutral-800 bg-[#1F1F1FEB] p-1.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg"
        />
      </div>
    </>
  );
}
