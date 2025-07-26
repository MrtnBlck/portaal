import { cn } from "~/lib/utils";
import { useEditorStore } from "../_utils/editorStore";
import { useFrameStore } from "../_utils/frameStore";
import { useLinkStore } from "../_utils/linkStore";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "../_utils/customScroll.css";
import type {
  FrameData,
  FrameElementData,
  ObjectData,
  TextData,
} from "../_utils/editorTypes";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

export function ElementsPanel() {
  const getRoleElements = useFrameStore((state) => state.getRoleElements);
  const userMode = useEditorStore((state) => state.userMode);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const elements = getRoleElements("parent");

  if (elements.length === 0 && userMode === "normal") return null;
  if (userMode === "designer") {
    if (!selectedObject) return null;
    if (
      selectedObject.type === "Frame" &&
      (selectedObject as FrameData).elements.length === 0
    )
      return null;
  }

  return (
    <div className="sidepanel flex flex-col overflow-hidden">
      <div className="px-4 pb-2 pt-4 text-xs font-semibold">Elements</div>
      <OverlayScrollbarsComponent
        options={{
          scrollbars: { theme: "os-theme-light", autoHide: "leave" },
        }}
      >
        <div className="flex-1 space-y-1.5 px-1.5 pb-2">
          {userMode === "designer" ? (
            <Elements selectedObject={selectedObject} />
          ) : (
            <LinkParents selectedObject={selectedObject} elements={elements} />
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}

function Elements({ selectedObject }: { selectedObject: ObjectData | null }) {
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 1,
    },
  });

  let displayedFrame;
  const getFrame = useFrameStore((state) => state.getFrame);
  const getElement = useFrameStore((state) => state.getElement);
  const setFrameElements = useFrameStore((state) => state.setFrameElements);
  if (!selectedObject) {
    return null;
  }
  if ((selectedObject as FrameElementData).frameId) {
    displayedFrame = getFrame((selectedObject as FrameElementData).frameId);
  } else {
    displayedFrame = selectedObject as FrameData;
  }
  if (!displayedFrame || displayedFrame.elements.length === 0) return null;
  const reorderedElements = displayedFrame.elements.slice().reverse();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = displayedFrame.elements.findIndex(
        (element) => element.id === active.id,
      );
      const newIndex = displayedFrame.elements.findIndex(
        (element) => element.id === over.id,
      );
      const updatedElements = arrayMove(
        displayedFrame.elements,
        oldIndex,
        newIndex,
      );
      setFrameElements(displayedFrame.id, updatedElements);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const element = getElement(displayedFrame.id, String(active.id));
    if (element) {
      setSelectedObject(element);
    }
  };

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={[sensor]}
    >
      <SortableContext items={reorderedElements}>
        {reorderedElements?.map((element) => (
          <ElementsItem
            element={element}
            selected={element.id === (selectedObject as FrameElementData).id}
            key={element.id}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function ElementsItem(props: { element: FrameElementData; selected: boolean }) {
  const { element, selected } = props;
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: element.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      key={element.id}
      className={cn(
        "overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs",
        !selected && "text-neutral-400 hover:bg-white hover:bg-opacity-5",
        selected && "bg-white/5 text-white",
      )}
      onClick={() => setSelectedObject(element)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      <span className="pr-2 font-bold">{element.type[0]}</span>
      {element.name}
    </div>
  );
}

function LinkParents({
  selectedObject,
  elements,
}: {
  selectedObject: ObjectData | null;
  elements: FrameElementData[];
}) {
  const getRelatedElements = useLinkStore((state) => state.getRelatedElements);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);

  let sElement = selectedObject as TextData;
  if (sElement && sElement.linkRole === "child") {
    sElement = getRelatedElements(sElement.id, "child") as TextData;
  }

  return (
    <>
      {elements.map((element) => (
        <div
          key={element.id}
          className={cn(
            "overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white/5",
            sElement && sElement.id === element.id && "bg-white/5 text-white",
          )}
          onClick={() => setSelectedObject(element)}
        >
          <span className="pr-2 font-bold">{element.type[0]}</span>
          {element.name}
        </div>
      ))}
    </>
  );
}

{
  // This is a placeholder for the future implementation of grouped elements
  /* <div className="inline-flex gap-2 rounded-md px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white hover:bg-opacity-5">
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
  </div> */
}
