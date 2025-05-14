import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface APIVersionInfo {
  version: string;
  build_date: string | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const APIVersionContext = createContext<APIVersionInfo | null>(null);

export const APIVersionInfoProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [apiVersionInfo, setAPIVersionInfo] = useState<APIVersionInfo | null>(
    null,
  );

  useEffect(() => {
    axios
      .get<APIVersionInfo>('/api/health')
      .then((response) => {
        setAPIVersionInfo({
          version: response.data.version,
          build_date: response.data.build_date,
        });
      })
      .catch((error) => {
        setAPIVersionInfo({ version: 'error', build_date: null });
        console.error('Failed to fetch api version info:', error);
      });
  }, []);

  return (
    <APIVersionContext value={apiVersionInfo}>{children}</APIVersionContext>
  );
};
