"use client";

import { useEffect, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { EditorUI } from "./_components/editor_ui";
import { KonvaEventObject } from "konva/lib/Node";

const initialFrames = [
  {
    id: "frame-0",
    name: "Frame 0",
    width: 100,
    height: 300,
  },
];

export default function EditorPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedId, selectObject] = useState<string | null>(null);
  const [frames, setFrames] = useState(initialFrames);

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectObject(null);
    }
  };

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

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Render nothing until dimensions are set
  }

  return (
    <div className="relative h-full w-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable={true}
        className="bg-[#1A1A1A]"
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
              name={frame.name}
              rectProps={{
                width: frame.width,
                height: frame.height,
                id: frame.id,
                onSelect: () => selectObject(frame.id),
                isSelected: selectedId === frame.id,
                onChange: (newAttrs) => {
                  const framesCopy = frames.slice();
                  const frameI = framesCopy[i]!;
                  if(frameI){
                    frameI.height = newAttrs.height;
                    frameI.width = newAttrs.width;
                  }
                  setFrames(framesCopy);
                }
              }}
            />
          );
        })}
      </Stage>
      <EditorUI />
    </div>
  );
}
