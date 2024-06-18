import { createStore } from 'zustand';
import { createContext, memo, useRef, type FC, type PropsWithChildren } from 'react';

type GlobalProps = {
    courseCode: string;
    userCode: string;
};

export type GlobalState = {
    changeCourseCode: (courseCode: string) => void;
    changeUserCode: (userCode: string) => void;
} & GlobalProps;

type GlobalStore = ReturnType<typeof createGlobalStore>;
const createGlobalStore = (initProps: GlobalProps) => {
    return createStore<GlobalState>((set) => ({
        ...initProps,
        changeCourseCode: (courseCode) => set({ courseCode }),
        changeUserCode: (userCode) => set({ userCode }),
    }));
};

export const GlobalContext = createContext<GlobalStore | null>(null);

type GlobalStoreProviderProps = PropsWithChildren<GlobalProps>;
const GlobalStoreProvider: FC<GlobalStoreProviderProps> = memo(({ children, ...props }) => {
    const storeRef = useRef<GlobalStore>();
    if (!storeRef.current) storeRef.current = createGlobalStore(props);

    return <GlobalContext.Provider value={storeRef.current}>{children}</GlobalContext.Provider>;
});
GlobalStoreProvider.displayName = 'GlobalStoreProvider';
export default GlobalStoreProvider;
