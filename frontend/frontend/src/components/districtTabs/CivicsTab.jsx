import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatCard from "./StatCard";

export default function CivicsTab({ chartData }) {
    return (
        <>
            {/* Presidential Election Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="year" 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis 
                                label={{ value: 'Vote Share (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                domain={[0, 100]}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value) => `${value}%`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area 
                                type="monotone" 
                                dataKey="Democrat" 
                                stackId="1"
                                stroke="#3b82f6" 
                                fillOpacity={1}
                                fill="url(#colorDem)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="Republican" 
                                stackId="1"
                                stroke="#ef4444" 
                                fillOpacity={1}
                                fill="url(#colorRep)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="Other" 
                                stackId="1"
                                stroke="#94a3b8" 
                                fillOpacity={1}
                                fill="url(#colorOther)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        Loading election data...
                    </div>
                )}
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Most Recent Election"
                    value={chartData.length > 0 ? chartData[chartData.length - 1]?.year : "—"}
                    subtitle="Presidential election"
                />
                <StatCard 
                    title="Leading Party"
                    value={chartData.length > 0 ? getLeadingParty(chartData[chartData.length - 1]) : "—"}
                    subtitle="Latest result"
                />
                <StatCard 
                    title="Historical Trend"
                    value={chartData.length >= 2 ? getTrend(chartData) : "—"}
                    subtitle="Last 6 elections"
                />
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