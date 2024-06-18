import { memo } from 'react';
import { ThemeProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';

const NextThemesProvider = ({ children, ...props }: ThemeProviderProps) => {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
};

const MemoizedNextThemesProvider = memo(NextThemesProvider);
export { MemoizedNextThemesProvider as NextThemesProvider };
