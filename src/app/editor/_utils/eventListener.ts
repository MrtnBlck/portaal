"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "./editorStore";
import { useStageUtils } from "./useStageUtils";

export function EventListener() {
  // TODO: change to useRef
  const [mouseButton, setMouseButton] = useState<number | null>(null);
  const storeTool = useEditorStore((state) => state.tool);
  const setStoreTool = useEditorStore((state) => state.setTool);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const userMode = useEditorStore((state) => state.userMode);
  const { deleteSelectedObject } = useStageUtils();

  // wheel & contextmenu
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // mousedown
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setMouseButton(e.button); // 0: left button, 1: middle button, 2: right button
      if (e.button !== 0 && e.button !== 2) {
        //TODO: fix onmousedown for other buttons
        setStoreTool({ type: "hand", method: "toggle" });
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setStoreTool]);

  // mouseup
  useEffect(() => {
    const handleMouseUp = () => {
      setMouseButton(null);
      if (
        (storeTool.type === "hand" && storeTool.method === "toggle") ||
        storeTool.type === "frame" ||
        storeTool.type === "rectangle" ||
        storeTool.type === "text" ||
        storeTool.type === "image"
      ) {
        setStoreTool({ type: "move", method: "selected" });
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [storeTool, setStoreTool]);

  // keyup
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        storeTool.type === "hand" &&
        storeTool.method === "toggle" &&
        mouseButton === null
      ) {
        // TODO: Add check for previous tool
        setStoreTool({ type: "move", method: "selected" });
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [storeTool, mouseButton, setStoreTool]);

  // keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Disable shortcuts for tools other than hand/move if userMode is "normal"
      if (userMode === "normal" && e.code !== "Space" && e.code !== "KeyV") {
        return;
      }

      switch (e.code) {
        case "Space":
          if (storeTool.type !== "hand") {
            setStoreTool({ type: "hand", method: "toggle" });
          }
          break;
        case "KeyV":
          setStoreTool({ type: "move", method: "selected" });
          break;
        case "KeyH":
          setStoreTool({ type: "hand", method: "selected" });
          break;
        case "KeyF":
          setStoreTool({ type: "frame", method: "selected" });
          break;
        case "KeyR":
          setStoreTool({ type: "rectangle", method: "selected" });
          break;
        case "KeyT":
          setStoreTool({ type: "text", method: "selected" });
          break;
        /* case "KeyI":
          setStoreTool({ type: "image", method: "selected" });
          break; */
        case "Delete":
          void deleteSelectedObject();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [storeTool, setStoreTool, deleteSelectedObject, selectedObject, userMode]);

  return null;
}
