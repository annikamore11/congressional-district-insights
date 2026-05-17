"use client";

import { useRouter, usePathname } from "next/navigation";

function NavButton({ to, icon, label, onClick }) {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = pathname === to;

    const handleClick = () => {
        router.push(to);
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                    ? "bg-slate-800 text-slate-100 shadow-lg shadow-slate-500/30"
                    : "text-slate-100 hover:bg-slate-800/20"
            }`}
        >
            <span className="flex-shrink-0">
                {icon}
            </span>
            <span>{label}</span>
        </button>
    );
}

export default NavButton;
