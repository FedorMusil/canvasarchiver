import type { FC, ReactElement } from 'react';
import { Switch } from '@/src/components/ui/switch';
import type { SwitchProps } from '@radix-ui/react-switch';
import { useTheme } from 'next-themes';

const ThemeSwitcher: FC<SwitchProps> = (props): ReactElement => {
    const { theme, setTheme } = useTheme();
    return (
        <Switch checked={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} {...props} />
    );
};
ThemeSwitcher.displayName = 'ThemeSwitcher';
export default ThemeSwitcher;
