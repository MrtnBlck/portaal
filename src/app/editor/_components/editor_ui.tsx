export function EditorUI() {
  return (
    <>
      <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-2.5 p-2.5">
        <div className="rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Variants
        </div>
        <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Layers
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 flex w-64 flex-col gap-2.5 p-2.5">
        <div className="rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Actions
        </div>
        <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Properties
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 w-full max-w-64 -translate-x-1/2 p-2.5">
        <div className="w-full rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          fasz
        </div>
      </div>
    </>
  );
}
