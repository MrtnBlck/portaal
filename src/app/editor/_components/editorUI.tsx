import { ToolBar } from "./toolbar";
import { ActionBar } from "./actionbar";

interface EditorUIProps {
  tool: "move" | "hand" | "frame";
  setTool: (tool: "move" | "hand" | "frame") => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
}

export function EditorUI({ tool, setTool, stageScale, setStageScale }: EditorUIProps) {
  return (
    <>
      {/* <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-2.5 p-2.5">
        <div className="rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
          Variants
        </div>
        <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
          Layers
        </div>
      </div> */}
      <div className="absolute inset-y-0 right-0 flex w-64 flex-col gap-2.5 p-2.5">
        <ActionBar stageScale={stageScale} setStageScale={setStageScale}/>
        {/* <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
          Properties
        </div> */}
      </div>
      <div className="absolute bottom-0 left-1/2 w-full max-w-64 -translate-x-1/2 p-2.5">
        <ToolBar tool={tool} setTool={setTool} className="w-full space-x-1 rounded-lg bg-[#1F1F1F] p-1.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]"/>
      </div>
    </>
  );
}
