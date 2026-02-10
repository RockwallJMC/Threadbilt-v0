'use client';

import { createPortal } from 'react-dom';
import { DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useProjectKanbanContext } from './ProjectKanbanContext';
import ProjectKanbanColumn from './ProjectKanbanColumn';
import AddNewColumn from './AddNewColumn';
import ProjectTaskDragOverlay from './ProjectTaskDragOverlay';
import ProjectColumnDragOverlay from './ProjectColumnDragOverlay';

const ProjectKanbanElements = () => {
  const { columns, tasks, draggedColumn, draggedTask } = useProjectKanbanContext();

  const columnIds = columns.map(col => col.id);

  return (
    <>
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        {columns.map((column) => {
          const columnTasks = tasks
            .filter(t => t.column_id === column.id)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

          return (
            <ProjectKanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}
        <AddNewColumn />
      </SortableContext>

      {typeof document !== 'undefined' && createPortal(
        <DragOverlay>
          {draggedColumn && <ProjectColumnDragOverlay column={draggedColumn} />}
          {draggedTask && <ProjectTaskDragOverlay task={draggedTask} />}
        </DragOverlay>,
        document.body
      )}
    </>
  );
};

export default ProjectKanbanElements;
