export function LayersPanel() {
  return (
    <div className="flex-1 rounded-lg bg-[#1F1F1F] px-0.5 pb-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
      <div className="px-4 pb-2 pt-4 text-xs font-semibold">Elements: non functional</div>
      <div className="flex flex-col gap-1.5 px-1.5">
        <div className="rounded-sm px-2.5 py-1 text-xs font-extralight hover:bg-white hover:bg-opacity-5">
          <span className="font-black pr-2">T</span>Text type
        </div>
        <div className="rounded-sm px-2.5 py-1 text-xs font-extralight hover:bg-white hover:bg-opacity-5">
          <span className="font-black pr-2">P</span>Picture type
        </div>
        <div className="rounded-sm px-2.5 py-1 text-xs font-extralight hover:bg-white hover:bg-opacity-5">
          <span className="font-black pr-2">S</span>Shape type
        </div>
        <div className="rounded-sm px-2.5 py-1 text-xs font-extralight hover:bg-white hover:bg-opacity-5">
          <span className="font-black pr-2">G</span>Group type
        </div>
      </div>
    </div>
  );
}
