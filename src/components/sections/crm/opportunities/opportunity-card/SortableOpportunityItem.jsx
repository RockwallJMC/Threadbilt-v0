import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OpportunityCard from './OpportunityCard';

const SortableOpportunityItem = ({ opportunity }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: opportunity.id,
    data: {
      type: 'opportunity',
      opportunity: opportunity,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OpportunityCard opportunity={opportunity} />
    </div>
  );
};

export default SortableOpportunityItem;
