"use client";

import { Input } from "~/components/ui/input";
import { useNewPageStore } from "../newPageStore";

export function TitleInput() {
  const titleInput = useNewPageStore((state) => state.titleInput);
  const setTitleInput = useNewPageStore((state) => state.setTitleInput);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 40) {
      setTitleInput(value);
    }
  };

  const handleOnBlur = () => {
    if (titleInput === "") {
      setTitleInput("Untitled");
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOnBlur();
      e.currentTarget.blur();
    }
  };

  return (
    <>
      <div className="pb-2 font-light">Project Title</div>
      <Input
        className="!rounded-lg border-neutral-600/40 bg-neutral-600/10 py-1.5 text-neutral-400 focus-visible:multi-[border-neutral-600/80;ring-0;text-white]"
        value={titleInput}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
      />
    </>
  );
}
