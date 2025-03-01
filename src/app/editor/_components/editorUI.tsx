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
}

export function EditorUI({
  tool,
  setTool,
  stageScale,
  setStageScale,
  frames,
  selectedObject,
  setSelectedObject
}: EditorUIProps) {
  return (
    <>
      <div className="absolute inset-y-0 left-0 flex w-72 select-none flex-col gap-2.5 p-2.5">
        <VariantsPanel frames={frames} selectedObject={selectedObject} setSelectedObject={(e) => setSelectedObject(e)}/>
        <LayersPanel />
      </div>
      <div className="absolute inset-y-0 right-0 flex w-72 flex-col gap-2.5 p-2.5 select-none">
        <ActionBar stageScale={stageScale} setStageScale={setStageScale}/>
        <PropertiesPanel selectedObject={selectedObject}/>
      </div>
      <div className="absolute bottom-0 left-1/2 w-full max-w-64 -translate-x-1/2 p-2.5 select-none">
        <ToolBar
          tool={tool}
          setTool={setTool}
          className="w-full space-x-1 rounded-lg bg-[#1F1F1F] p-1.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]"
        />
      </div>
    </>
  );
}
