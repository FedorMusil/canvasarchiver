import { useContext } from 'react';
import { useStore } from 'zustand';
import { ChangeContext, type ChangeState } from './ChangeStore';

export function useChangeContext<T>(selector: (state: ChangeState) => T): T {
    const store = useContext(ChangeContext);
    if (!store) throw new Error('useChangeContext must be used within a ChangeStoreProvider');
    return useStore(store, selector);
}
