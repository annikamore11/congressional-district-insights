import React from "react";

export default function DemographicsTab() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Demographics
            </h2>
            <p className="text-gray-600 text-sm mb-4">
                Population, age distribution, education levels, and more.
            </p>
            <div className="h-64 flex items-center justify-center text-gray-400">
                Demographic data coming soon
            </div>
        </div>
    );
}