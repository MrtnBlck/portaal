import { useEditorStore } from "../store";


export function LayersPanel() {
  const selectedObject = useEditorStore((state) => state.selectedObject);

  if (!selectedObject) {
    return null;
  }

  if (selectedObject.type === "Frame" && selectedObject?.elements?.length === 0) {
    return null;
  }

  return (
    <div className="sidepanel flex-1">
      <div className="px-4 pb-2 pt-4 text-xs font-semibold">Elements</div>
      <div className="flex flex-col gap-1.5 px-1.5">
        {
          selectedObject?.elements?.map((element) => (
            <div key={element.id} className="rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
              <span className="pr-2 font-bold">{element.type[0]}</span>{element.name}
            </div>
          ))
        }
        {/* <div className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-white">
          <span className="pr-2 font-bold">T</span>Text type
        </div>
        <div className="inline-flex gap-2 rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
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
    </div>
  );
}
