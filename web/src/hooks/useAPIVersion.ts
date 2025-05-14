import { use } from 'react';
import {
  APIVersionContext,
  type APIVersionInfo,
} from '../contexts/APIVersionContext';

export const useAPIVersion = (): APIVersionInfo | null => {
  return use(APIVersionContext);
};
