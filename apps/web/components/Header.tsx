export default function Header() {
    return (
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
            <div>
                {/* Breadcrumbs or Page Title could go here */}
            </div>
            <div className="flex items-center gap-4">
                {/* Theme Toggle could go here */}
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    A
                </div>
            </div>
        </header>
    );
}
