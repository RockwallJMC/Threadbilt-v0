'use client';

import {
  closestCorners,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useProjectKanbanContext } from './ProjectKanbanContext';
import ProjectKanbanElements from './ProjectKanbanElements';

const ProjectKanbanApp = () => {
  const { handleDragStart, handleDragOver, handleDragEnd } = useProjectKanbanContext();
  const { up } = useBreakpoints();
  const upMd = up('md');

  const dndContextProps = {
    collisionDetection: closestCorners,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
  };

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 250,
      distance: 0,
    },
  });

  const sensors = useSensors(upMd ? pointerSensor : touchSensor);

  return (
    <DndContext sensors={sensors} {...dndContextProps}>
      <ProjectKanbanElements />
    </DndContext>
  );
};

export default ProjectKanbanApp;
