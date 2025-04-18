import { useState, useEffect, useCallback } from 'react';

const useDataFetching = (fetchFunction, initialParams = {}, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (overrideParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...params, ...overrideParams };
      const response = await fetchFunction(mergedParams);
      
      setData(response.data.data || response.data);
      
      if (response.data.pagination) {
        setTotalItems(response.data.pagination.totalItems || 0);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [fetchFunction, params]);

  const updateParams = useCallback((newParams) => {
    setParams(prevParams => ({
      ...prevParams,
      ...newParams
    }));
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [params, autoFetch, fetchData]);

  return {
    data,
    totalItems,
    loading,
    error,
    params,
    updateParams,
    fetchData,
    setData
  };
};

export default useDataFetching;