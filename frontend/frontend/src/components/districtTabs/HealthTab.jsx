
function RiskFactorCard({ title, value, unit = "", change, year, inverse = false, decimals = 0, formatAsRatio=false, isDecimalPercent=false, subtitle = "" }) {
    const getTrendIcon = () => {
        if (change === null || change === undefined) return <Minus size={16} className="text-gray-400" />;
        
        const isPositive = change > 0;
        const isGood = inverse ? !isPositive : isPositive;
        
        if (Math.abs(change) < 0.5) return <Minus size={16} className="text-gray-400" />;
        
        return isPositive ? 
            <TrendingUp size={16} className={isGood ? "text-green-600" : "text-red-600"} /> :
            <TrendingDown size={16} className={isGood ? "text-green-600" : "text-red-600"} />;
    };

    const getChangeColor = () => {
        if (change === null || change === undefined || Math.abs(change) < 0.5) return "text-gray-500";
        const isPositive = change > 0;
        const isGood = inverse ? !isPositive : isPositive;
        return isGood ? "text-green-600" : "text-red-600";
    };

    return (
        <div className="border-b pb-3 last:border-b-0 last:pb-0">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900">
                    {value !== null && value !== undefined ? 
                    formatAsRatio ? `1:${Math.round(value)}` : 
                    isDecimalPercent ? `${(value * 100).toFixed(decimals)}${unit}` :  // <-- THIS LINE
                    `${value.toFixed(decimals)}${unit}`
                    : "—"}
                </p>
                <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className={`text-sm font-medium ${getChangeColor()}`}>
                        {change !== null && change !== undefined && Math.abs(change) >= 0.5 ? 
                            `${change > 0 ? '+' : ''}${change.toFixed(1)}% vs prior year` : "—"}
                    </span>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {subtitle && `${subtitle} • `}{year ? `${year}` : "No data"}
            </p>
        </div>
    );
}import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

export default function HealthTab({ healthData }) {
    // Process data for each metric
    const processedData = useMemo(() => {
        if (!healthData || healthData.length === 0) return null;

        // Group by measure name
        const byMeasure = healthData.reduce((acc, row) => {
            if (!acc[row.measurename]) {
                acc[row.measurename] = [];
            }
            acc[row.measurename].push(row);
            return acc;
        }, {});

        // Process premature death for line chart (last 10 years only)
        const prematureDeath = byMeasure.premature_death
            ?.sort((a, b) => a.year_numeric - b.year_numeric)
            .slice(-10)  // Take last 10 years
            .map(d => ({
                year: d.year_numeric,
                value: d.rawvalue
            })) || [];

        // Get latest values for stat cards
        const getLatest = (measureName) => {
            const data = byMeasure[measureName];
            if (!data || data.length === 0) return null;
            const sorted = data.sort((a, b) => b.year_numeric - a.year_numeric);
            const latest = sorted[0];
            const previous = sorted[1];
            return {
                value: latest.rawvalue,
                year: latest.year_numeric,
                change: previous ? ((latest.rawvalue - previous.rawvalue) / previous.rawvalue) * 100 : null
            };
        };

        const uninsuredAdults = getLatest("uninsured");
        const primaryCarePhysicians = getLatest("prim_care_physicians");
        const dentists = getLatest("dentists");
        const mammography = getLatest("mammography_screening");
        const fluVaccinations = getLatest("flu_vaccinations");
        const alcoholDeaths = getLatest("alcohol_impaired_driving_deaths");
        const stiRate = getLatest("sexually_transmitted_infections");
        const preventableStays = getLatest("preventable_hospital_stays");

        return {
            prematureDeath,
            uninsuredAdults,
            primaryCarePhysicians,
            dentists,
            mammography,
            fluVaccinations,
            alcoholDeaths,
            stiRate,
            preventableStays
        };
    }, [healthData]);

    if (!healthData || healthData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Health</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading health data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Health</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No health data available
                </div>
            </div>
        );
    }

    const preventiveCareData = [
        { 
            name: "Mammography Screening", 
            value: processedData.mammography?.value * 100 || 0,
            fill: "#3b82f6"
        },
        { 
            name: "Flu Vaccinations", 
            value: processedData.fluVaccinations?.value *100 || 0,
            fill: "#8b5cf6"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Health Outcomes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                    Health Outcomes
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Years of potential life lost before age 75 per 100,000 population
                </p>

                {processedData.prematureDeath.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={processedData.prematureDeath}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="year" 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis 
                                label={{ value: 'Years Lost', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value) => [value.toLocaleString(), "Years Lost"]}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                dot={{ fill: '#ef4444', r: 4 }}
                                name="Premature Death"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        No premature death data available
                    </div>
                )}
            </div>

            {/* Healthcare Access */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Healthcare Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HealthStatCard
                        title="Uninsured Adults"
                        value={processedData.uninsuredAdults?.value}
                        unit="%"
                        change={processedData.uninsuredAdults?.change}
                        year={processedData.uninsuredAdults?.year}
                        inverse={true}
                        isDecimalPercent={true}
                        decimals={1}
                    />
                    <HealthStatCard
                        title="Primary Care Physicians to Patient Ratio"
                        value={processedData.primaryCarePhysicians?.value}
                        unit=""
                        change={processedData.primaryCarePhysicians?.change}
                        year={processedData.primaryCarePhysicians?.year}
                        inverse={true}
                        decimals={0}
                        formatAsRatio={true}
                    />
                    <HealthStatCard
                        title="Dentists to Patient Ratio"
                        value={processedData.dentists?.value}
                        unit=""
                        change={processedData.dentists?.change}
                        year={processedData.dentists?.year}
                        inverse={true}
                        decimals={0}
                        formatAsRatio={true}
                    />
                </div>
            </div>

            {/* Preventive Care & Risk Factors Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preventive Care */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                        Preventive Care Utilization
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={preventiveCareData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                type="number" 
                                domain={[0, 100]}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                unit="%"
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                width={150}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value) => [`${value.toFixed(1)}%`, "Coverage"]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk Factors */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                        Risk Factors
                    </h2>
                    <div className="space-y-4">
                        <RiskFactorCard
                            title="Alcohol-Impaired Driving Deaths"
                            value={processedData.alcoholDeaths?.value}
                            unit="%"
                            change={processedData.alcoholDeaths?.change}
                            year={processedData.alcoholDeaths?.year}
                            inverse={true}
                            isDecimalPercent={true}
                            decimals={1}
                        />
                        <RiskFactorCard
                            title="Sexually Transmitted Infections"
                            value={processedData.stiRate?.value}
                            unit=" per 100k"
                            change={processedData.stiRate?.change}
                            year={processedData.stiRate?.year}
                            inverse={true}
                            decimals={0}
                        />
                        <RiskFactorCard
                            title="Preventable Hospital Stays"
                            value={processedData.preventableStays?.value}
                            unit=" per 100k"
                            change={processedData.preventableStays?.change}
                            year={processedData.preventableStays?.year}
                            inverse={true}
                            decimals={0}
                            subtitle="Medicare enrollees"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthStatCard({ title, value, unit = "", change, year, inverse = false, decimals = 0, formatAsRatio = false, isDecimalPercent = false }) {
    const getTrendIcon = () => {
        if (change === null || change === undefined) return <Minus size={16} className="text-gray-400" />;
        
        const isPositive = change > 0;
        const isGood = inverse ? !isPositive : isPositive;
        
        if (Math.abs(change) < 0.5) return <Minus size={16} className="text-gray-400" />;
        
        return isPositive ? 
            <TrendingUp size={16} className={isGood ? "text-green-600" : "text-red-600"} /> :
            <TrendingDown size={16} className={isGood ? "text-green-600" : "text-red-600"} />;
    };

    const getChangeColor = () => {
        if (change === null || change === undefined || Math.abs(change) < 0.5) return "text-gray-500";
        const isPositive = change > 0;
        const isGood = inverse ? !isPositive : isPositive;
        return isGood ? "text-green-600" : "text-red-600";
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">
                {value !== null && value !== undefined ? 
                    formatAsRatio ? `1:${Math.round(value)}` : 
                    isDecimalPercent ? `${(value * 100).toFixed(decimals)}${unit}` :  // <-- THIS LINE
                    `${value.toFixed(decimals)}${unit}`
                    : "—"}
            </p>
            <div className="flex items-center gap-1 text-xs">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getChangeColor()}`}>
                        {change !== null && change !== undefined && Math.abs(change) >= 0.5 ? 
                            `${change > 0 ? '+' : ''}${change.toFixed(1)}% vs prior year` : "—"}
                </span>
            </div>
            {year && (
                <p className="text-xs text-gray-500 mt-1">
                    Latest: {year}
                </p>
            )}
        </div>
    );
}