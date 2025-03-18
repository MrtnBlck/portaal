import { ToolBar } from "./toolBar";
import { ActionBar } from "./actionBar";
import { PropertiesPanel } from "./propertiesPanel";
import { LayersPanel } from "./layersPanel";
import { VariantsPanel } from "./variantsPanel";

export function EditorUI() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex h-min w-72 select-none flex-col gap-2.5 p-2.5 z-20">
        <VariantsPanel />
        <LayersPanel />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex h-min w-72 select-none flex-col gap-2.5 p-2.5 z-20">
        <ActionBar />
        <PropertiesPanel />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-auto -translate-x-1/2 select-none p-2.5 z-20">
        <ToolBar className="pointer-events-auto w-full space-x-1 rounded-lg border border-neutral-800 bg-[#1F1F1FEB] p-1.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg" />
      </div>
    </>
  );
}
