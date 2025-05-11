"use client";

import type Konva from "konva";
import { Html } from "react-konva-utils";
import { Rect, Transformer, Text, Image as KImage } from "react-konva";
import { useEditorStore } from "../_utils/editorStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PictureData,
  TextData,
  FrameElementData,
} from "../_utils/editorTypes";
import { TinyColor } from "@ctrl/tinycolor";
import useImage from "use-image";
import { useFrameStore } from "../_utils/frameStore";

interface ElementProps {
  element: FrameElementData;
  frameXY: { x: number; y: number };
}
interface ElementTextProps {
  props: CommonProps;
  isSelected: boolean;
  element: TextData;
  elementRef: Konva.Text;
  setElementRef: (ref: Konva.Text) => void;
}

interface ElementImageProps {
  props: CommonProps;
  imageURL: string;
  setElementRef: (ref: Konva.Image) => void;
}
interface CommonProps {
  id: string;
  frameID: string | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  onClick: () => void;
  onTap: () => void;
  onDragStart: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

function ElementText({
  isSelected,
  element,
  props,
  elementRef,
  setElementRef,
}: ElementTextProps) {
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  const updateTextValue = useFrameStore((state) => state.updateTextValue);
  const deleteElement = useFrameStore((state) => state.deleteElement);
  const toggleTextEditing = useFrameStore((state) => state.toggleTextEditing);

  const style = useMemo(() => {
    if (!elementRef) return undefined;
    return {
      width: `${element.width - elementRef.padding() * 2}px`,
      height: `${element.height - elementRef.padding() * 2 + 5}px`,
      fontSize: `${elementRef.fontSize()}px`,
      border: "none",
      padding: "0px",
      margin: "0px",
      background: "none",
      outline: "none",
      resize: "none" as const,
      lineHeight: `${elementRef.lineHeight()}`,
      fontFamily: elementRef.fontFamily(),
      transformOrigin: "left top",
      textAlign: elementRef.align() as "left" | "center" | "right" | "justify",
      color: elementRef.fill() as string,
      marginTop: isFirefox ? "-4px" : "0px",
      overflow: "hidden",
    };
  }, [element, elementRef, isFirefox]);

  const [textAreaRef, setTextAreaRef] = useState<HTMLTextAreaElement | null>(
    null,
  );

  // Focus & select upon switching to edit mode
  useEffect(() => {
    if (element.beingEdited && textAreaRef) {
      textAreaRef.focus();
      textAreaRef.select();
    }
  }, [element.beingEdited, textAreaRef]);

  // After drawing a text element switch to edit mode
  useEffect(() => {
    if (element.beingDrawn !== undefined && !element.beingDrawn) {
      toggleTextEditing(element.frameID, element.ID, true);
    }
  }, [element.beingDrawn, toggleTextEditing, element.frameID, element.ID]);

  // If the element gets unselected, turn off beingEdited
  useEffect(() => {
    if (!isSelected && element.beingEdited) {
      toggleTextEditing(element.frameID, element.ID, false);
    }
  }, [isSelected, element, toggleTextEditing]);

  // Handle edit mode turn off outside of this function, so we can set the proper behavior
  const handleOnBlur = () => {
    if (!element.frameID || !textAreaRef) return;
    const inputValue = textAreaRef.value;
    if (inputValue !== element.textValue && inputValue !== "") {
      updateTextValue(element.frameID, element.ID, inputValue);
    } else if (inputValue === "") {
      // remove if empty
      deleteElement(element.frameID, element.ID);
    }
  };

  return (
    <>
      {element.beingEdited && (
        <Html
          groupProps={{ x: props.x, y: props.y }}
          divProps={{ style: { opacity: 1 } }}
        >
          <textarea
            defaultValue={element.textValue}
            ref={setTextAreaRef}
            style={style}
            onBlur={handleOnBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                toggleTextEditing(element.frameID, element.ID, false);
                handleOnBlur();
              }
            }}
          />
        </Html>
      )}
      <Text
        text={element.textValue}
        fontSize={20}
        ref={setElementRef}
        onTransform={(e) => {
          e.cancelBubble = true;
          if (!elementRef || !element.frameID) return;
          const scaleX = elementRef.scaleX();
          const scaleY = elementRef.scaleY();
          const size = {
            width: Math.round(Math.max(5, elementRef.width() * scaleX)),
            height: Math.round(Math.max(5, elementRef.height() * scaleY)),
          };
          elementRef.setSize(size);
          elementRef.scaleX(1);
          elementRef.scaleY(1);
        }}
        onDblClick={() => toggleTextEditing(element.frameID, element.ID, true)}
        onDblTap={() => toggleTextEditing(element.frameID, element.ID, true)}
        visible={!element.beingEdited}
        {...props}
      />
    </>
  );
}

function ElementImage({ props, imageURL, setElementRef }: ElementImageProps) {
  const [image, status] = useImage(imageURL);
  // handle image loading upon url change
  const [shownImage, setShownImage] = useState<HTMLImageElement | undefined>(
    image,
  );
  useEffect(() => {
    if (status === "loaded") {
      setShownImage(image);
    }
  }, [image, status]);

  return <KImage image={shownImage} {...props} ref={setElementRef} fill="" />;
}

export function Element({ element, frameXY }: ElementProps) {
  const tool = useEditorStore((state) => state.tool);
  const isSelected = useEditorStore(
    (state) => (state.selectedObject as FrameElementData)?.ID === element.ID,
  );
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const setSelectedObject = useCallback(() => {
    if (tool.type === "move") setStoreSelectedObject(element);
  }, [tool.type, element, setStoreSelectedObject]);
  const updateElement = useFrameStore((state) => state.updateElement);
  const draggable = useEditorStore((state) => state.tool.type === "move");
  const userMode = useEditorStore((state) => state.userMode);
  const trRef = useRef<Konva.Transformer>(null);
  const [elementRef, setElementRef] = useState<
    Konva.Rect | Konva.Text | Konva.Image | null
  >(null);

  // Attach transformer to the element
  useEffect(() => {
    if (isSelected && trRef.current && elementRef) {
      trRef.current.nodes([elementRef]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, elementRef]);

  // Breaks element drawing, hotfixed with text drawing indicator
  const commonProps = useMemo<CommonProps>(() => {
    const { R, G, B } = element.fill;
    const color = new TinyColor({
      r: R,
      g: G,
      b: B,
      a: element.fillOpacity / 100,
    });
    return {
      id: element.ID,
      frameID: element.frameID,
      x: element.x + frameXY.x,
      y: element.y + frameXY.y,
      width: element.width,
      height: element.height,
      fill: color.toHex8String(),
      draggable: draggable && userMode === "designer",
      onClick: setSelectedObject,
      onTap: setSelectedObject,
      onDragStart: setSelectedObject,
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        e.cancelBubble = true;
        if (!elementRef || !element.frameID) return;
        const scaleX = elementRef.scaleX();
        const scaleY = elementRef.scaleY();
        const size = {
          width: Math.round(Math.max(5, elementRef.width() * scaleX)),
          height: Math.round(Math.max(5, elementRef.height() * scaleY)),
        };
        elementRef.setSize(size);
        elementRef.scaleX(1);
        elementRef.scaleY(1);
        updateElement(element.frameID, {
          ...element,
          x: Math.round(elementRef.x() - frameXY.x),
          y: Math.round(elementRef.y() - frameXY.y),
          ...size,
        });
      },
      onDragEnd: (e: Konva.KonvaEventObject<Event>) => {
        e.cancelBubble = true;
        if (!elementRef || !element.frameID) return;
        updateElement(element.frameID, {
          ...element,
          x: Math.round(elementRef.x() - frameXY.x),
          y: Math.round(elementRef.y() - frameXY.y),
        });
      },
    };
  }, [
    draggable,
    element,
    elementRef,
    frameXY.x,
    frameXY.y,
    setSelectedObject,
    updateElement,
    userMode,
  ]);

  return (
    <>
      {element.type === "Rectangle" && (
        <Rect {...commonProps} ref={setElementRef} />
      )}
      {element.type === "Image" && (element as PictureData).imageURL && (
        <ElementImage
          props={commonProps}
          imageURL={(element as PictureData).imageURL}
          setElementRef={setElementRef}
        />
      )}
      {element.type === "Text" && (
        <ElementText
          isSelected={isSelected}
          element={element as TextData}
          props={commonProps}
          elementRef={elementRef as Konva.Text}
          setElementRef={setElementRef}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          keepRatio={element.type === "Image"}
          // TODO: enable later
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 2 || Math.abs(newBox.height) < 2) {
              return oldBox;
            }
            return newBox;
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
          }}
          enabledAnchors={(element as TextData).beingEdited ? [] : undefined}
          resizeEnabled={userMode === "designer"}
        />
      )}
      {element.beingDrawn && (
        <Rect
          x={element.x + frameXY.x}
          y={element.y + frameXY.y}
          width={element.width}
          height={element.height}
          stroke="#19AAFF"
          strokeWidth={1}
        />
      )}
    </>
  );
}
