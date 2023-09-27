import Image from "next/image"
import { useTheme } from 'next-themes'

export default function Header() {
    const { theme, setTheme } = useTheme()
    return (
        <nav className={theme === 'dark'? 'shadow shadow-gray-600': 'shadow'}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-12 justify-between">
                <div className="flex">
                    <div className="ml-6 flex space-x-8">
                    <a
                        href="#"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                        Draft
                    </a>
                    </div>
                </div>
                <div className="ml-6 flex items-center">
                    <button
                    type="button"
                    className="relative rounded-full p-1"
                    onClick={() => { theme === 'dark' ? setTheme('light'): setTheme('dark')}}
                    >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Switch theme</span>
                    <Image
                        src={theme === 'dark' ? '/icon_light_theme.svg' : '/icon_dark_theme.svg'}
                        alt=""
                        width={24}
                        height={24}/>
                    </button>

                
                </div>
                </div>
            </div>
        </nav>
    )
}
