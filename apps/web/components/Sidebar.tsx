import Link from 'next/link';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-zinc-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Uni LMS</h1>
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    <li>
                        <Link href="/" className="block p-2 rounded hover:bg-zinc-800 transition-colors">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/faculties" className="block p-2 rounded hover:bg-zinc-800 transition-colors">
                            Faculties
                        </Link>
                    </li>
                    <li>
                        <Link href="/departments" className="block p-2 rounded hover:bg-zinc-800 transition-colors">
                            Departments
                        </Link>
                    </li>
                    <li>
                        <Link href="/users" className="block p-2 rounded hover:bg-zinc-800 transition-colors">
                            Users
                        </Link>
                    </li>
                    <li>
                        <Link href="/admissions-review" className="block p-2 rounded hover:bg-zinc-800 transition-colors">
                            Admissions
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="pt-4 border-t border-zinc-700">
                <p className="text-sm text-zinc-400">Admin User</p>
            </div>
        </aside>
    );
}
