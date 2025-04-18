import React, { createContext, useContext, useState, useCallback } from 'react';

const TabStateContext = createContext();

export const TabStateProvider = ({ children }) => {
  const [tabState, setTabState] = useState({});
  const [listeners, setListeners] = useState({});

  const addListener = useCallback((event, callback) => {
    setListeners(prev => ({
      ...prev,
      [event]: [...(prev[event] || []), callback]
    }));
  }, []);

  const removeListener = useCallback((event, callback) => {
    setListeners(prev => ({
      ...prev,
      [event]: (prev[event] || []).filter(cb => cb !== callback)
    }));
  }, []);

  const dispatch = useCallback((event, data) => {
    const eventListeners = listeners[event] || [];
    eventListeners.forEach(callback => callback(data));
  }, [listeners]);

  const getTabState = useCallback((tabId) => {
    return tabState[tabId];
  }, [tabState]);

  const setTabStateValue = useCallback((tabId, value) => {
    setTabState(prev => ({
      ...prev,
      [tabId]: value
    }));
  }, []);

  return (
    <TabStateContext.Provider value={{
      tabState,
      setTabState: setTabStateValue,
      getTabState,
      addListener,
      removeListener,
      dispatch
    }}>
      {children}
    </TabStateContext.Provider>
  );
};

export const useTabState = () => {
  const context = useContext(TabStateContext);
  if (!context) {
    throw new Error('useTabState must be used within a TabStateProvider');
  }
  return context;
}; 