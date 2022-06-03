import { useTheme } from 'next-themes'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { FiMoon, FiSun } from 'react-icons/fi'

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()
    return (
        <ToggleGroup.Root
            type="single"
            defaultValue="light"
            aria-label="Change theme"
            className="flex divide-x-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB] dark:divide-neutral-600 dark:border-neutral-600"
        >
            <ToggleGroup.Item
                onClick={() => setTheme('light')}
                value="light"
                disabled={theme == "light"}
                className={`flex flex-auto select-none p-3 transition  ${
                  theme == "light"
                    ? 'cursor-not-allowed bg-[#F1E5FF] dark:bg-primary-900'
                    : 'hover:bg-[#F1E5FF] dark:hover:bg-primary-900'
                }`}
                aria-label="Light Mode"
            >
                <FiSun className="flex-auto" />
            </ToggleGroup.Item>
            <ToggleGroup.Item
                onClick={() => setTheme('dark')}
                value="dark"
                disabled={theme == "dark"}
                className={`flex flex-auto select-none p-3 transition  ${
                  theme == "dark"
                    ? 'cursor-not-allowed bg-[#F1E5FF] dark:bg-primary-900'
                    : 'hover:bg-[#F1E5FF] dark:hover:bg-primary-900'
                }`}
                aria-label="Dark Mode"
            >
                <FiMoon className="flex-auto" />
            </ToggleGroup.Item>
        </ToggleGroup.Root>
    )
}

export default ThemeSwitcher; 