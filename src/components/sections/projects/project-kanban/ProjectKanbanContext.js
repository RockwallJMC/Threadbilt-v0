'use client';

import { createContext, use } from 'react';

export const ProjectKanbanContext = createContext({});

export const useProjectKanbanContext = () => use(ProjectKanbanContext);
