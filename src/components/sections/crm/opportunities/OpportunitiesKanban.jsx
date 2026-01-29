import {
  closestCorners,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useOpportunitiesContext } from 'providers/OpportunitiesProvider';
import KanbanElements from './KanbanElements';

const OpportunitiesKanban = () => {
  const { handleDragStart, handleDragOver, handleDragEnd } = useOpportunitiesContext();
  const { up } = useBreakpoints();
  const upMd = up('md');

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

  const dndContextProps = {
    collisionDetection: closestCorners,
    onDragStart: (event) => handleDragStart(event),
    onDragOver: (event) => handleDragOver(event),
    onDragEnd: (event) => handleDragEnd(event),
  };

  return (
    <DndContext sensors={sensors} {...dndContextProps}>
      <KanbanElements />
    </DndContext>
  );
};

export default OpportunitiesKanban;
