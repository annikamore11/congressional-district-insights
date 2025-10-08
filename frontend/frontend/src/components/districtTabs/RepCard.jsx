import React from "react";

export default function RepCard({ member, isHighlighted }) {
    const partyColors = {
        Democrat: "border-blue-300",
        Republican: "border-red-300",
        Independent: "border-gray-300"
    };
    
    const partyBgColors = {
        Democrat: "bg-blue-50",
        Republican: "bg-red-50",
        Independent: "bg-gray-50"
    };
    
    const highlightStyle = isHighlighted 
        ? "ring-2 ring-purple-400 shadow-md" 
        : "opacity-60";
    
    const borderColor = partyColors[member.party] || "border-gray-300";
    const bgColor = partyBgColors[member.party] || "bg-gray-50";
    
    return (
        <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-3 mb-2 transition-all ${highlightStyle}`}>
            <div className="flex items-start gap-3">
                {member.photo_url ? (
                    <img 
                        src={member.photo_url} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full flex-shrink-0 object-cover border-2 border-white"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600">
                        {member.role === "sen" ? "U.S. Senator" : `U.S. Rep., District ${member.district || "?"}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{member.party}</p>
                </div>
            </div>
        </div>
    );
}