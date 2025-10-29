import { useNavigate, useLocation } from "react-router-dom";

function NavButton({ to, icon, label, locationData, onClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === to;
    
    const handleClick = () => {
        navigate(to, { 
            state: { locationData } 
        });
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