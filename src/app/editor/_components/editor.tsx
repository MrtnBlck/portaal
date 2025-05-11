"use client";

import { useEffect, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "../_components/frame";
import { MenuWrapper } from "../_components/menuWrapper";
import { EditorUI } from "../_components/editorUI";
import { useEditorStore } from "../_utils/editorStore";
import { useStageUtils } from "../_utils/useStageUtils";
import { EventListener } from "../_utils/eventListener";
import { Spinner } from "~/components/ui/spinner";
import { useFrameStore } from "../_utils/frameStore";
import { useLinkStore } from "../_utils/linkStore";
import type { EditorData } from "../_utils/editorTypes";

interface Editorprops {
  id: string;
  name: string;
  type: "project" | "template";
  filterIds?: number[];
  isPublic?: boolean;
  isEditable: boolean;
  isTemplateOwner: boolean;
  data: EditorData;
}

export default function Editor(props: Editorprops) {
  const { isTemplateOwner, data, ...rest } = props;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Frame store
  const frameIDs = useFrameStore((state) => state.getFrameIDs);
  const setFrames = useFrameStore((state) => state.setFrames);

  // Link store
  const setLinks = useLinkStore((state) => state.setLinks);

  // Editor store
  const tool = useEditorStore((state) => state.tool);
  const stageScale = useEditorStore((state) => state.stageScale);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const setIsEditable = useEditorStore((state) => state.setIsEditable);
  const setUserMode = useEditorStore((state) => state.toggleUserMode);
  const setIsTemplateOwner = useEditorStore(
    (state) => state.setIsTemplateOwner,
  );

  const {
    handleStageOnMouseDown,
    handleStageOnMouseMove,
    handleStageOnMouseUp,
    onScroll,
  } = useStageUtils();

  // Set stage dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.floor(window.innerWidth),
        height: Math.floor(window.innerHeight),
      });
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const { frames, links } = data;
    setFrames(frames);
    setLinks(links);
    setSelectedObject(null);
    setUserMode(props.isTemplateOwner ? "designer" : "normal");
    setIsEditable(props.isEditable);
    setIsTemplateOwner(isTemplateOwner);
  }, [
    setFrames,
    setLinks,
    setSelectedObject,
    setUserMode,
    setIsEditable,
    setIsTemplateOwner,
    props,
    data,
    isTemplateOwner,
  ]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" className="bg-black dark:bg-white" />
      </div>
    );
  }

  return (
    <>
      <div className="relative h-full w-full">
        <EventListener />
        <MenuWrapper>
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            draggable={tool.type === "hand"}
            className="bg-[#1A1A1A]"
            onMouseDown={handleStageOnMouseDown}
            onTouchStart={handleStageOnMouseDown}
            onMouseMove={handleStageOnMouseMove}
            onTouchMove={handleStageOnMouseMove}
            onWheel={onScroll}
            onMouseUp={handleStageOnMouseUp}
            onTouchEnd={handleStageOnMouseUp}
            style={{
              cursor:
                tool.type === "hand"
                  ? "grab"
                  : tool.type === "move"
                    ? "default"
                    : "crosshair",
            }}
            scale={{ x: stageScale, y: stageScale }}
          >
            {frameIDs().map((ID) => {
              return <Frame ID={ID} key={ID} />;
            })}
          </Stage>
        </MenuWrapper>
      </div>
      <EditorUI {...rest} />
    </>
  );
}
