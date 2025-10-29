
import { useState } from "react";
import { X, Phone, Globe, Mail, MousePointerClick } from "lucide-react";
import FECContent from "../components/fecContent";
import AccuracyBanner from "../components/addressBanner";

export default function RepresentativesPage({ locationData }) {
    const [selectedRep, setSelectedRep] = useState(null);
    const [fecCache, setFecCache] = useState({});

    if (!locationData) {
        return (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">No location data available</p>
                    <p className="text-sm text-gray-400">
                        Please enter a ZIP code or address in the header
                    </p>
                </div>
            </div>
        );
    }

    const fedMembers = locationData.fed_legislators || [];
    const senators = fedMembers.filter(m => m.role === "sen");
    const houseReps = fedMembers.filter(m => m.role === "rep");
    const stateHouse = locationData.state_house_legislators || [];
    const stateSenate = locationData.state_senate_legislators || [];

    const handleRepClick = (rep) => {
        setSelectedRep(rep);
    };

    const handleClose = () => {
        setSelectedRep(null);
    };

    return (
        <div className="h-screen w-full">
            <AccuracyBanner />
            <div className="max-w-7xl mx-auto px-4">
                {/* Compact Header */}
                <div className="text-center mb-6 py-4">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">
                        Your Representatives
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
                        <span>
                            {locationData.city && `${locationData.city} • `}
                            {locationData.county} • {locationData.state_full}
                        </span>
                    </div>
                </div>

                {/* Federal Representatives Section */}
                <div className="mb-12">
                    <h2 className="flex items-center gap-2 mb-4">
                        <span className="w-1 h-6 bg-slate-900 rounded-full flex-shrink-0"></span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-100">Federal Representatives</span>
                            <span className="hidden md:inline font-bold text-slate-100">- Click member for Campaign Finance Details</span>
                        </div>
                    </h2>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Senators */}
                        {senators.map((senator) => (
                            <RepCard
                                key={senator.bio_id}
                                member={senator}
                                onClick={() => handleRepClick(senator)}
                                isFederal={true}
                            />
                        ))}
                        
                        {/* House Reps */}
                        {houseReps.map((rep) => (
                            <RepCard
                                key={rep.bio_id}
                                member={rep}
                                onClick={() => handleRepClick(rep)}
                                isFederal={true}
                            />
                        ))}
                    </div>
                </div>

                {/* State Representatives Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-slate-900 rounded-full"></span>
                        State Representatives
                    </h2>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* State Senate */}
                        {stateSenate.map((senator) => (
                            <StateRepCard
                                key={senator.openstates_id}
                                member={senator}
                                type={senator.role}
                            />
                        ))}
                        
                        {/* State House */}
                        {stateHouse.map((rep) => (
                            <StateRepCard
                                key={rep.openstates_id}
                                member={rep}
                                type={rep.role}
                            />
                        ))}
                    </div>

                    {(stateSenate.length === 0 && stateHouse.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                            No state legislators found for this location
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay for Campaign Finance */}
            {selectedRep && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={handleClose}
                >
                    <div 
                        className="bg-slate-100 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CampaignFinanceCard
                            rep={selectedRep}
                            onClose={handleClose}
                            fecCache={fecCache}
                            setFecCache={setFecCache}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


function RepCard({ member, onClick, isFederal }) {
    const roleLabel = member.role === "sen" 
        ? "U.S. Senator" 
        : `U.S. Representative, District ${member.district}`;
    
    const partyColors = {
        "Democrat": "bg-blue-100 text-blue-700 border-blue-300",
        "Republican": "bg-red-100 text-red-700 border-red-300",
        "Independent": "bg-gray-100 text-gray-700 border-gray-300"
    };

    return (
        <button
            onClick={onClick}
            className="relative bg-indigo-50 rounded-2xl shadow-lg shadow-indigo-600/20 p-6 border-2 border-slate-300 hover:bg-indigo-100 hover:border-slate-900 hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
        >
            {/* Photo */}
            <div className="flex items-start gap-4 mb-4">
                <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-800"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                        {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {roleLabel}
                    </p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                        partyColors[member.party] || partyColors["Independent"]
                    }`}>
                        {member.party}
                    </span>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <a 
                        href={member.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Website
                    </a>
                </div>
            </div>

            {/* Finance Badge */}
            {isFederal && (
                <div className="absolute top-3 right-3">
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <MousePointerClick size={12} />
                        Finance Data
                    </span>
                </div>
            )}
        </button>
    );
}

function StateRepCard({ member, type }) {
    const partyColors = {
        "Democrat": "bg-blue-100 text-blue-700 border-blue-300",
        "Republican": "bg-red-100 text-red-700 border-red-300",
        "Independent": "bg-gray-100 text-gray-700 border-gray-300"
    };

    const type_label = {
        "rep": "State Representative",
        "tribal_rep": "State Tribal Representative",
        "sen": "State Senator"
    }[type] || "Unknown Role"

    return (
        <div className="bg-indigo-50 rounded-2xl p-6 border-2 shadow-lg shadow-indigo-600/20 border-slate-300 transition-all duration-300">
            {/* Photo */}
            <div className="flex items-start gap-4 mb-4">
                <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-800"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                        {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                        {type_label}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                        {member.district}
                    </p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                        partyColors[member.party] || partyColors["Independent"]
                    }`}>
                        {member.party}
                    </span>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{member.phone}</span>
                </div>
                {member.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <a 
                            href={`mailto:${member.email}`}
                            className="text-indigo-600 hover:underline truncate"
                        >
                            {member.email}
                        </a>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <a 
                        href={member.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                    >
                        Website
                    </a>
                </div>
            </div>
        </div>
    );
}

function CampaignFinanceCard({ rep, onClose, fecCache, setFecCache }) {
    const partyColors = {
        "Democrat": "bg-blue-600",
        "Republican": "bg-red-600",
        "Independent": "bg-gray-600"
    };

    return (
        <>
            {/* Header with Photo */}
            <div className={`bg-gradient-to-r from-slate-800 to-slate-950 text-white p-6 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <img
                        src={rep.photo_url}
                        alt={rep.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-1">
                            Campaign Finance
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <p className="text-slate-100 text-lg font-medium">{rep.name}</p>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-300">2023-24 Cycle</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                <FECContent 
                    member={rep} 
                    fecCache={fecCache}
                    setFecCache={setFecCache}
                />
            </div>
        </>
    );
}
