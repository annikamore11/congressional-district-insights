import React, { useMemo, useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CivicsTab({ civicsData }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chartData = useMemo(() => {
        if (!civicsData || civicsData.length === 0) return [];

        // Get last 6 election years
        const years = [...new Set(civicsData.map(r => r.year))].sort((a, b) => b - a).slice(0, 6).reverse();
        
        // Helper function to normalize party names to title case
        const normalizePartyName = (party) => {
            if (!party) return '';
            const lower = party.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        };
        
        return years.map(year => {
            const yearData = civicsData.filter(r => r.year === year);
            
            const dem = yearData.filter(r => r.party && r.party.toLowerCase() === "democrat")
                .reduce((sum, r) => sum + r.candidatevotes, 0);
            const rep = yearData.filter(r => r.party && r.party.toLowerCase() === "republican")
                .reduce((sum, r) => sum + r.candidatevotes, 0);
            
            // Get parties that actually exist in this year (excluding Dem/Rep)
            const otherPartiesInYear = [...new Set(
                yearData
                    .filter(r => r.party && r.party.toLowerCase() !== "democrat" && r.party.toLowerCase() !== "republican")
                    .map(r => normalizePartyName(r.party))
            )];
            
            // Create result object
            const result = {
                year: year.toString(),
                Democrat: 0,
                Republican: 0
            };
            
            // Calculate vote counts for each party present in this year
            otherPartiesInYear.forEach(party => {
                const votes = yearData.filter(r => r.party && normalizePartyName(r.party) === party)
                    .reduce((sum, r) => sum + r.candidatevotes, 0);
                result[party] = votes;
            });
            
            // Calculate total votes
            const total = dem + rep + Object.values(result).reduce((sum, val) => {
                return typeof val === 'number' && val !== dem && val !== rep ? sum + val : sum;
            }, 0);
            
            // Convert to percentages
            result.Democrat = total > 0 ? parseFloat(((dem / total) * 100).toFixed(1)) : 0;
            result.Republican = total > 0 ? parseFloat(((rep / total) * 100).toFixed(1)) : 0;
            
            otherPartiesInYear.forEach(party => {
                result[party] = total > 0 ? parseFloat(((result[party] / total) * 100).toFixed(1)) : 0;
            });
            
            return result;
        });
    }, [civicsData]);

    // Get all unique parties across ALL years for rendering
    const allPartiesAcrossYears = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        
        const parties = new Set();
        chartData.forEach(year => {
            Object.keys(year).forEach(key => {
                if (key !== 'year' && key !== 'Democrat' && key !== 'Republican') {
                    parties.add(key);
                }
            });
        });
        return Array.from(parties);
    }, [chartData]);

    // Color mapping for parties
    const partyColors = {
        'Green': { stroke: '#15803d', gradient: 'colorGreen' },
        'Libertarian': { stroke: '#ca8a04', gradient: 'colorLibertarian' },
        'Other': { stroke: '#94a3b8', gradient: 'colorOther' }
    };

    return (
        <>
            {/* Main Layout: Chart 4/5, Stats 1/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Presidential Election Results Chart */}
                <div className="lg:col-span-3 bg-indigo-50 rounded-lg shadow-md border border-slate-100 p-4 md:p-6">
                    <h2 className="text-xl font-semibold mb-1 text-gray-800">
                        Presidential Popular Vote Results
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Vote share by party over time
                    </p>
                    
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorDem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorLibertarian" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis 
                                    label={!isMobile ? { 
                                        value: 'Vote Share (%)', 
                                        angle: -90, 
                                        position: 'insideLeft', 
                                        style: { fill: '#6b7280', fontSize: 12 }
                                    } : undefined}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    domain={[0, 100]}
                                    allowDecimals={false}
                                    ticks={[0, 25, 50, 75, 100]}
                                    width={isMobile ? 35 : 60}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                    formatter={(value) => `${value}%`}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                
                                {/* Always show Democrat and Republican */}
                                <Area 
                                    type="monotone" 
                                    dataKey="Democrat" 
                                    stackId="1"
                                    stroke="#0369a1" 
                                    fillOpacity={1}
                                    fill="url(#colorDem)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Republican" 
                                    stackId="1"
                                    stroke="#b91c1c" 
                                    fillOpacity={1}
                                    fill="url(#colorRep)" 
                                />
                                
                                {/* Dynamically render other parties that exist in the data */}
                                {allPartiesAcrossYears.map(party => {
                                    const colors = partyColors[party] || { stroke: '#94a3b8', gradient: 'colorOther' };
                                    return (
                                        <Area 
                                            key={party}
                                            type="monotone" 
                                            dataKey={party}
                                            stackId="1"
                                            stroke={colors.stroke}
                                            fillOpacity={1}
                                            fill={`url(#${colors.gradient})`}
                                            connectNulls={false}
                                        />
                                    );
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Loading election data...
                        </div>
                    )}
                </div>

                {/* Key Stats Column (3 rows, less padding) */}
                <div className="flex flex-col gap-4">
                    <StatCard 
                        title="Most Recent Election"
                        value={chartData.length > 0 ? chartData[chartData.length - 1]?.year : "—"}
                        subtitle="Presidential election"
                    />
                    <StatCard 
                        title="Leading Party"
                        value={chartData.length > 0 ? getLeadingParty(chartData[chartData.length - 1]) : "—"}
                        subtitle="Latest result"
                        color={true}
                    />
                    <StatCard 
                        title="Historical Trend"
                        value={chartData.length >= 2 ? getTrend(chartData) : "—"}
                        subtitle="Last 6 elections"
                        color={true}
                    />
                </div>
            </div>
        </>
    );
}

function getLeadingParty(yearData) {
    if (!yearData) return "—";
    const dem = parseFloat(yearData.Democrat);
    const rep = parseFloat(yearData.Republican);
    if (dem > rep) return "Democrat";
    if (rep > dem) return "Republican";
    return "Tie";
}

function getTrend(chartData) {
    if (chartData.length < 2) return "—";
    const recent = chartData.slice(-3);
    const demWins = recent.filter(d => parseFloat(d.Democrat) > parseFloat(d.Republican)).length;
    const repWins = recent.filter(d => parseFloat(d.Republican) > parseFloat(d.Democrat)).length;
    
    if (demWins > repWins) return "Lean D";
    if (repWins > demWins) return "Lean R";
    return "Competitive";
}

function StatCard({ title, value, subtitle, color }) {
    const getColor = () => {
        if (!color) return 'text-gray-900';
        if (value === 'Democrat' || value === 'Lean D') return 'text-blue-600';
        if (value === 'Republican' || value === 'Lean R') return 'text-red-600';
        if (value === 'Competitive') return 'text-purple-600';
        return 'text-gray-900';
    };

    return (
        <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6 gap-2 flex flex-col justify-center h-full">
            <p className="text-md text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${getColor()}`}>{value}</p>
            <p className="text-xs text-gray-700">{subtitle}</p>
        </div>
    );
}