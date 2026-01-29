import { createPortal } from 'react-dom';
import { DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useOpportunitiesContext } from 'providers/OpportunitiesProvider';
import AddNewList from './list-container/AddNewList';
import SortableListItem from './list-container/SortableListItem';
import OpportunityCardOverlay from './overlays/OpportunityCardOverlay';
import ListContainerOverlay from './overlays/ListContainerOverlay';

const KanbanElements = () => {
  const { listItems, draggedList, draggedOpportunity } = useOpportunitiesContext();

  return (
    <>
      <SortableContext items={listItems} strategy={horizontalListSortingStrategy}>
        {listItems.map((item) => (
          <SortableListItem key={item.id} opportunityList={item} />
        ))}
        <AddNewList />
      </SortableContext>
      {createPortal(
        <DragOverlay>
          {draggedList && <ListContainerOverlay opportunityList={draggedList} />}
          {draggedOpportunity && <OpportunityCardOverlay opportunity={draggedOpportunity} />}
        </DragOverlay>,
        document.body,
      )}
    </>
  );
};

export default KanbanElements;
