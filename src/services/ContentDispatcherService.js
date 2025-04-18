import { useTabState } from '../contexts/TabStateContext';

export const ContentDispatcherService = () => {
  const { getTabState, setTabStateValue } = useTabState();

  const getNavigationMethod = () => {
    return getTabState('navigationMethod');
  };

  const setNavigationMethod = (method) => {
    setTabStateValue('navigationMethod', method);
  };

  return {
    getNavigationMethod,
    setNavigationMethod
  };
}; 