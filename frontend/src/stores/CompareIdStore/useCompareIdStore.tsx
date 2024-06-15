import { useContext } from 'react';
import { useStore } from 'zustand';
import { CompareIdContext, type CompareIdState } from './CompareIdStore';

export function useCompareIdContext<T>(selector: (state: CompareIdState) => T): T {
    const store = useContext(CompareIdContext);
    if (!store) throw new Error('useCompareIdContext must be used within a CompareIdStoreProvider');
    return useStore(store, selector);
}
