import React from 'react';
import { useLocation } from 'react-router-dom';
import { ContentDispatcherService } from '../services/ContentDispatcherService';

const ContentDispatcher = ({ children }) => {
  const location = useLocation();
  const contentDispatcher = ContentDispatcherService();
  const navigationMethod = contentDispatcher.getNavigationMethod();

  // Handle navigation based on the selected method
  React.useEffect(() => {
    if (navigationMethod === 'tabs') {
      // Handle tab-based navigation
      console.log('Using tab-based navigation');
    } else {
      // Handle default navigation
      console.log('Using default navigation');
    }
  }, [navigationMethod, location]);

  return <>{children}</>;
};

export default ContentDispatcher; 