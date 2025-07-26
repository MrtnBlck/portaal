"use client";

import { useEffect, useRef, useState } from "react";
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
import type { ProjectQueryData } from "../_utils/editorTypes";
import { FileInputProvider } from "./fileInputHandler";
import { Toaster } from "~/components/ui/sonner";

export default function Editor(props: {
  type: "project" | "template";
  project: ProjectQueryData;
  filterIds?: number[];
}) {
  const { type, project, filterIds } = props;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Frame store
  const frameIds = useFrameStore((state) => state.getFrameIds);
  const setFrames = useFrameStore((state) => state.setFrames);

  // Link store
  const setLinks = useLinkStore((state) => state.setLinks);

  // Editor store
  const setProjectData = useEditorStore((state) => state.setProjectData);
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

  // Run only on project load
  const initialEditorValuesSet = useRef(false);
  useEffect(() => {
    if (initialEditorValuesSet.current) return;
    const isTemplateOwner =
      type === "template" ? true : project.ownerId === project.templateOwnerId;
    const { frames, links } = project.data;
    setIsEditable(project.isTemplateEditable ?? true);
    setIsTemplateOwner(isTemplateOwner);
    setUserMode(isTemplateOwner ? "designer" : "normal");
    setFrames(frames);
    setLinks(links);
    setSelectedObject(null);
    initialEditorValuesSet.current = true; // Mark as executed
  }, [
    project,
    type,
    filterIds,
    setIsEditable,
    setIsTemplateOwner,
    setProjectData,
    setUserMode,
    setSelectedObject,
    setFrames,
    setLinks,
  ]);

  // Run on every project update
  useEffect(() => {
    setProjectData({
      id: project.id,
      name: project.name,
      type: type,
      filterIds: filterIds,
      templateOwnerId: project.templateOwnerId,
    });
  }, [project, type, filterIds, setProjectData]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" className="bg-black dark:bg-white" />
      </div>
    );
  }

  return (
    <FileInputProvider>
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
            {frameIds().map((id) => {
              return <Frame id={id} key={id} />;
            })}
          </Stage>
        </MenuWrapper>
      </div>
      <Toaster
        position="top-center"
        offset={10}
        className="!w-full max-w-[364px]"
      />
      <EditorUI />
    </FileInputProvider>
  );
}
