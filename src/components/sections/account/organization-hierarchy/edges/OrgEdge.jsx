'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import { ROLE_STYLES } from 'services/swr/api-hooks/useOrganizationHierarchyApi';

const OrgEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const role = data?.role;
  const style = ROLE_STYLES[role] || ROLE_STYLES.member;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: style.color, strokeWidth: 2, opacity: 0.6 }}
    />
  );
};

export default memo(OrgEdge);
