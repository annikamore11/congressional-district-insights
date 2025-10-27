
import { useState } from "react";
import { X, Phone, Globe, Mail, DollarSign, TrendingUp, Users, MousePointerClick, MapPinHouse, School, GraduationCap } from "lucide-react";
import FECContent from "../components/fecContent";

export default function RepresentativesPage({ locationData }) {
    const [selectedRep, setSelectedRep] = useState(null);
    const [hasFecData, setHasFecData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showAccuracyBanner, setShowAccuracyBanner] = useState(true);

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
        setHasFecData(true)
        setIsLoading(true);
        // Simulate loading - replace with actual API call
        setTimeout(() => setIsLoading(false), 1000);
    };

    const handleClose = () => {
        setSelectedRep(null);
    };

    return (
        <div className="h-screen w-full">
            {showAccuracyBanner && (
                    <div className="bg-red-50 border-b border-red-200 p-3">
                        <div className="max-w-6xl mx-auto flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-red-800">
                                    <span className="font-medium">District or representative look wrong?</span> ZIP codes can span multiple districts. Use the{' '}
                                    <span className="inline-flex items-center gap-1 font-semibold">
                                        <MapPin size={12} className="inline" /> address input
                                    </span>{' '}
                                    in the header above for better accuracy.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowAccuracyBanner(false)}
                                className="flex-shrink-0 text-red-600 hover:text-red-800"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <h1 className="text-4xl font-bold text-slate-100 sm:pt-6 mb-3 drop-shadow-lg">
                            Your Representatives
                        </h1>
                        <div className="h-1 bg-gradient-to-r from-transparent via-slate-950 to-transparent rounded-full mb-4"></div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-200">
                        <span className="font-medium text-lg">
                            {locationData.city && `${locationData.city} • `}
                            {locationData.county} • {locationData.state_full}
                        </span>
                    </div>
                    
                    {locationData.school_district && (
                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700">
                            <span className="text-slate-200 text-sm font-medium">School District: {locationData.school_district}</span>
                        </div>
                    )}
                </div>

                {/* Federal Representatives Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
                        Federal Representatives
                    </h2>
                    
                    <div className={`transition-all duration-700 ease-in-out ${
                        selectedRep ? "mb-6" : ""
                    }`}>
                        <div className={`grid gap-6 transition-all duration-700 ease-in-out ${
                            selectedRep 
                                ? "grid-cols-1 sm:grid-cols-3" 
                                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }`}>
                            {/* Senators */}
                            {senators.map((senator) => (
                                <RepCard
                                    key={senator.bio_id}
                                    member={senator}
                                    isSelected={selectedRep?.bio_id === senator.bio_id}
                                    isBlurred={selectedRep && selectedRep.bio_id !== senator.bio_id}
                                    onClick={() => handleRepClick(senator)}
                                    isFederal={true}
                                />
                            ))}
                            
                            {/* House Reps */}
                            {houseReps.map((rep) => (
                                <RepCard
                                    key={rep.bio_id}
                                    member={rep}
                                    isSelected={selectedRep?.bio_id === rep.bio_id}
                                    isBlurred={selectedRep && selectedRep.bio_id !== rep.bio_id}
                                    onClick={() => handleRepClick(rep)}
                                    isFederal={true}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Campaign Finance Card */}
                    {selectedRep && (
                        <div className="animate-fadeIn mt-6">
                            <CampaignFinanceCard
                                rep={selectedRep}
                                isLoading={isLoading}
                                onClose={handleClose}
                            />
                        </div>
                    )}
                </div>

                {/* State Representatives Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
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
        </div>
    );
}

function RepCard({ member, isSelected, isBlurred, onClick, isFederal }) {
    const roleLabel = member.role === "sen" 
        ? "U.S. Senator" 
        : `U.S. Representative, District ${member.district}`;
    
    const partyColors = {
        "Democrat": "bg-sky-100 text-sky-700 border-sky-300",
        "Republican": "bg-red-100 text-red-700 border-red-300",
        "Independent": "bg-gray-100 text-gray-700 border-gray-300"
    };

    return (
        <button
            onClick={onClick}
            className={`relative bg-indigo-100 rounded-2xl shadow-lg p-6 border-2 border-indigo-600 transition-all duration-700 ease-in-out text-left ${
                isSelected 
                    ? "border-indigo-600 shadow-xl shadow-slate-950/20 scale-100" 
                    : isBlurred
                    ? "blur-sm opacity-40 scale-95 cursor-default"
                    : "border-indigo-600 hover:border-indigo-400 hover:shadow-lg cursor-pointer"
            }`}
            disabled={isBlurred}
        >
            {/* Photo */}
            <div className="flex items-start gap-4 mb-4">
                <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600"
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

            {/* Selected Indicator & Finance Badge */}
            {isSelected && (
                <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
                </div>
            )}
            {isFederal && !isSelected && !isBlurred && (
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
        "Democrat": "bg-sky-100 text-sky-700 border-sky-300",
        "Republican": "bg-red-100 text-red-700 border-red-300",
        "Independent": "bg-gray-100 text-gray-700 border-gray-300"
    };

    const type_label = {
        "rep": "State Representative",
        "tribal_rep": "State Tribal Representative",
        "sen": "State Senator"
    }[type] || "Unknown Role"

    return (
        <div className="bg-indigo-100 rounded-2xl p-6 border-2 shadow-lg border-indigo-600 transition-all duration-300">
            {/* Photo */}
            <div className="flex items-start gap-4 mb-4">
                <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600"
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

function CampaignFinanceCard({ rep, isLoading, onClose }) {
    return (
        <div className="bg-slate-100 rounded-2xl border-2 border-indigo-600 shadow-2xl shadow-inndigo-500/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Campaign Finance</h2>
                    <p className="text-indigo-100">{rep.name}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <FECContent member={rep} />
        </div>
    );
}
