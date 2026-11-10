import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api.js';

export function useResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loader());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  // dependencies define when the resource should be reloaded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
