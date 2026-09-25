import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
          <GraduationCap className="h-12 w-12 text-blue-400" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight">University LMS</h1>
        <p className="mt-3 text-slate-300">
          A multi-tenant learning management system for faculties, departments, teachers and students.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a href="/login"
            className="w-full py-3 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition-colors">
            Sign in to your portal
          </a>
          <a href="/admissions"
            className="w-full py-3 rounded-xl border border-slate-600 text-slate-200 font-medium hover:bg-slate-800 transition-colors">
            Apply for admission
          </a>
        </div>
        <p className="mt-8 text-xs text-slate-500">Faculty of Engineering &middot; Demo environment</p>
      </div>
    </div>
  );
}
