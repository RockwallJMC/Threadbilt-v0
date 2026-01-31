'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const PageContext = createContext({});

const PageContextProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageActions, setPageActions] = useState([]);

  const setTitle = useCallback((title) => {
    setPageTitle(title);
  }, []);

  const clearPageContext = useCallback(() => {
    setPageTitle('');
    setBreadcrumbs([]);
    setPageActions([]);
  }, []);

  const value = useMemo(
    () => ({
      pageTitle,
      breadcrumbs,
      pageActions,
      setTitle,
      setBreadcrumbs,
      setPageActions,
      clearPageContext,
    }),
    [pageTitle, breadcrumbs, pageActions, setTitle, clearPageContext],
  );

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);

export default PageContextProvider;
