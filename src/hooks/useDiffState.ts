import { useRef, useState } from 'react';

interface DiffStateOptions<T> {
  compareKeys?: (keyof T)[];
  compareAll?: boolean;
}

export function useDiffState<T>(
  initialState: T,
  options: DiffStateOptions<T> = { compareAll: true }
) {
  const [state, setState] = useState<T>(initialState);
  const prevRef = useRef<T>(initialState);

  const updateState = (newState: T) => {
    const prev = prevRef.current;
    
    if (options.compareAll) {
      // Deep comparison for primitive arrays/objects
      if (JSON.stringify(prev) === JSON.stringify(newState)) {
        return false; // No change
      }
    } else if (options.compareKeys) {
      // Compare only specified keys
      const hasChanges = options.compareKeys.some(key => prev[key] !== newState[key]);
      if (!hasChanges) {
        return false; // No change
      }
    }
    
    prevRef.current = newState;
    setState(newState);
    return true; // Changed
  };

  return [state, updateState] as const;
}