import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanContext } from 'providers/KanbanProvider';
import { TASK_DETAILS_OPEN } from 'reducers/KanbanReducer';
import TaskCard from './TaskCard';

const SortableTaskItem = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task: task,
    },
  });
  const { kanbanDispatch } = useKanbanContext();

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => kanbanDispatch({ type: TASK_DETAILS_OPEN, payload: task })}
      {...attributes}
    >
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: 18,
          height: 18,
          cursor: 'grab',
          zIndex: 2,
        }}
      />
      <TaskCard task={task} />
    </div>
  );
};

export default SortableTaskItem;
