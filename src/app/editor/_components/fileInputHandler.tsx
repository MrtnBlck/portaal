"use client";

import { createContext, useContext, useEffect, useRef } from "react";

const FileInputContext = createContext<FileInputContextType>(null!);

type FileInputContextType = {
  openFileInput: () => void;
  eventHandler: FileInputEventHandler;
};

class FileInputEventHandler extends EventTarget {
  onImgLoad(img: HTMLImageElement) {
    this.dispatchEvent(new CustomEvent("imgLoad", { detail: img }));
  }

  setNewImageFile(file: File) {
    this.dispatchEvent(new CustomEvent("setNewImageFile", { detail: file }));
  }
}

export function FileInputProvider(props: { children: React.ReactNode }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventHandlerRef = useRef(new FileInputEventHandler());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          eventHandlerRef.current.onImgLoad(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      eventHandlerRef.current.setNewImageFile(file);
    }
    e.target.value = "";
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <FileInputContext.Provider
      value={{ openFileInput, eventHandler: eventHandlerRef.current }}
    >
      {props.children}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </FileInputContext.Provider>
  );
}

export function useFileInput({
  imgOnload,
  setNewImageFile,
}: {
  imgOnload: (img: HTMLImageElement) => void;
  setNewImageFile: (file: File) => void;
}) {
  const context = useContext(FileInputContext);
  if (!context) {
    throw new Error("useFileInput must be used within a FileInputProvider");
  }

  useEffect(() => {
    const fn = (e: Event) => {
      const customEvent = e as CustomEvent;
      imgOnload(customEvent.detail as HTMLImageElement);
    };

    context.eventHandler.addEventListener("imgLoad", fn);
    return () => {
      context.eventHandler.removeEventListener("imgLoad", fn);
    };
  }, [imgOnload, context.eventHandler]);

  useEffect(() => {
    const fn = (e: Event) => {
      const customEvent = e as CustomEvent;
      setNewImageFile(customEvent.detail as File);
    };

    context.eventHandler.addEventListener("setNewImageFile", fn);
    return () => {
      context.eventHandler.removeEventListener("setNewImageFile", fn);
    };
  }, [setNewImageFile, context.eventHandler]);

  return context.openFileInput;
}
