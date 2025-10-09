import React, { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function DemographicsTab({ demographicsData }) {
    const processedData = useMemo(() => {
        if (!demographicsData || demographicsData.length === 0) return null;

        // Separate US data from local data
        const usData = demographicsData.filter(row => row.state === 'US' || row.state === 'us');
        const localData = demographicsData.filter(row => row.state !== 'US' && row.state !== 'us');

        // Get location name
        const locationName = localData.length > 0 ? localData[0].county : 'Local';

        // Sort by year
        const sortedLocal = localData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        const sortedUS = usData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        // Process racial diversity trends over time (last 10 years)
        const diversityTrend = sortedLocal.slice(-10).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
            return {
                year: local.year,
                localWhite: parseFloat(local.pct_white) || 0,
                localBlack: parseFloat(local.pct_black) || 0,
                localAsian: parseFloat(local.pct_asian) || 0,
                localHispanic: parseFloat(local.pct_hispanic) || 0,
                localTwoOrMore: parseFloat(local.pct_two_or_more) || 0,
                usWhite: parseFloat(usMatch?.pct_white) || 0,
                usBlack: parseFloat(usMatch?.pct_black) || 0,
                usAsian: parseFloat(usMatch?.pct_asian) || 0,
                usHispanic: parseFloat(usMatch?.pct_hispanic) || 0,
                usTwoOrMore: parseFloat(usMatch?.pct_two_or_more) || 0
            };
        });

        // Current year comparison
        const latestLocal = sortedLocal[sortedLocal.length - 1];
        const latestUS = sortedUS[sortedUS.length - 1];
        const oldestInTrend = sortedLocal[Math.max(0, sortedLocal.length - 11)];

        // Calculate changes over last 10 years
        const getChange = (latest, oldest, field) => {
            if (!oldest) return null;
            return parseFloat(latest[field]) - parseFloat(oldest[field]);
        };

        const raceComparison = [
            { 
                category: 'White', 
                local: parseFloat(latestLocal?.pct_white) || 0,
                us: parseFloat(latestUS?.pct_white) || 0,
                change: getChange(latestLocal, oldestInTrend, 'pct_white')
            },
            { 
                category: 'Black', 
                local: parseFloat(latestLocal?.pct_black) || 0,
                us: parseFloat(latestUS?.pct_black) || 0,
                change: getChange(latestLocal, oldestInTrend, 'pct_black')
            },
            { 
                category: 'Asian', 
                local: parseFloat(latestLocal?.pct_asian) || 0,
                us: parseFloat(latestUS?.pct_asian) || 0,
                change: getChange(latestLocal, oldestInTrend, 'pct_asian')
            },
            { 
                category: 'Hispanic', 
                local: parseFloat(latestLocal?.pct_hispanic) || 0,
                us: parseFloat(latestUS?.pct_hispanic) || 0,
                change: getChange(latestLocal, oldestInTrend, 'pct_hispanic')
            },
            { 
                category: 'Two or More', 
                local: parseFloat(latestLocal?.pct_two_or_more) || 0,
                us: parseFloat(latestUS?.pct_two_or_more) || 0,
                change: getChange(latestLocal, oldestInTrend, 'pct_two_or_more')
            }
        ];

        // Divorce rate trend
        const divorceTrend = sortedLocal.slice(-10).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
            return {
                year: local.year,
                local: parseFloat(local.pct_divorced) * 100 || 0, // Convert to percentage
                us: parseFloat(usMatch?.pct_divorced) * 100 || 0
            };
        });

        // Key stats
        const latestYear = latestLocal?.year;
        const totalPop = parseInt(latestLocal?.total_pop) || 0;
        const pctFemale = parseFloat(latestLocal?.pct_female) || 0;
        const pctMale = parseFloat(latestLocal?.pct_male) || 0;
        const pctDivorced = parseFloat(latestLocal?.pct_divorced) * 100 || 0;

        // Calculate population growth
        const fiveYearsAgo = sortedLocal[sortedLocal.length - 6];
        const popGrowth = fiveYearsAgo ? 
            ((totalPop - parseInt(fiveYearsAgo.total_pop)) / parseInt(fiveYearsAgo.total_pop)) * 100 : null;

        // Calculate diversity index change (higher = more diverse)
        const calcDiversityIndex = (data) => {
            const groups = [
                parseFloat(data.pct_white) || 0,
                parseFloat(data.pct_black) || 0,
                parseFloat(data.pct_asian) || 0,
                parseFloat(data.pct_hispanic) || 0,
                parseFloat(data.pct_two_or_more) || 0
            ];
            return 100 - Math.max(...groups); // Higher when no single group dominates
        };

        const currentDiversity = calcDiversityIndex(latestLocal);
        const oldDiversity = oldestInTrend ? calcDiversityIndex(oldestInTrend) : null;
        const diversityChange = oldDiversity ? currentDiversity - oldDiversity : null;
        const usDiversity = latestUS ? calcDiversityIndex(latestUS) : null;

        return {
            locationName,
            diversityTrend,
            raceComparison,
            divorceTrend,
            latestYear,
            totalPop,
            pctFemale,
            pctMale,
            pctDivorced,
            popGrowth,
            currentDiversity,
            diversityChange,
            usDiversity
        };
    }, [demographicsData]);

    if (!demographicsData || demographicsData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Demographics</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading demographic data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Demographics</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No demographic data available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Population"
                    value={processedData.totalPop.toLocaleString()}
                    subtitle={`Latest: ${processedData.latestYear}`}
                    trend={processedData.popGrowth}
                    trendLabel="5-year growth"
                />
                <StatCard
                    title="Diversity Index"
                    value={`${processedData.currentDiversity.toFixed(1)}`}
                    subtitle={`US avg: ${processedData.usDiversity ? processedData.usDiversity.toFixed(1) : '—'}`}
                    trend={processedData.diversityChange}
                    trendLabel="10-year change"
                    localValue={processedData.currentDiversity}
                />
                <StatCard
                    title="Gender Distribution"
                    value={`${processedData.pctFemale.toFixed(1)}% F / ${processedData.pctMale.toFixed(1)}% M`}
                    subtitle={processedData.latestYear}
                />
            </div>

            
            {/* Current Snapshot */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                    Current Racial Composition
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    {processedData.latestYear} data—10-year changes shown
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {processedData.raceComparison.map((race) => (
                        <DemographicCard
                            key={race.category}
                            category={race.category}
                            value={race.local}
                            change={race.change}
                        />
                    ))}
                </div>
            </div>

            {/* Divorce Rate Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Divorce Rate Trend
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Rising divorce rates may indicate need for family support services
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={processedData.divorceTrend}>
                            <defs>
                                <linearGradient id="divLocal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="divUS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value, name) => {
                                    const label = name === 'local' ? processedData.locationName : 'United States';
                                    return [`${value.toFixed(2)}%`, label];
                                }}
                            />
                            <Legend 
                                formatter={(value) => value === 'local' ? processedData.locationName : 'United States'}
                            />
                            <Area type="monotone" dataKey="local" stroke="#ef4444" fill="url(#divLocal)" />
                            <Area type="monotone" dataKey="us" stroke="#94a3b8" fill="url(#divUS)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                        Policy Implications
                    </h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <PolicyPoint 
                            icon="📊"
                            text="Track diversity changes to ensure equitable representation and resource allocation"
                        />
                        <PolicyPoint 
                            icon="🏥"
                            text="Rising diversity may indicate need for culturally competent services and multilingual support"
                        />
                        <PolicyPoint 
                            icon="👨‍👩‍👧"
                            text="Monitor divorce trends to assess family support service needs"
                        />
                        <PolicyPoint 
                            icon="🏘️"
                            text="Population growth may require infrastructure and housing policy adjustments"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend, trendLabel, usComparison, localValue }) {
    const getTrendDisplay = () => {
        if (trend === null || trend === undefined) return null;
        const isPositive = trend > 0;
        const color = isPositive ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
        const Icon = isPositive ? TrendingUp : trend < 0 ? TrendingDown : Minus;
        
        return (
            <div className="flex items-center gap-1 text-xs mt-1">
                <Icon size={14} className={color} />
                <span className={color}>
                    {isPositive ? '+' : ''}{trend.toFixed(1)} {trendLabel}
                </span>
            </div>
        );
    };

    const getUSComparisonDisplay = () => {
        if (!usComparison || !localValue) return null;
        const difference = localValue - usComparison;
        const color = Math.abs(difference) < 1 ? 'text-gray-500' : 
                     difference > 0 ? 'text-green-600' : 'text-orange-600';
        
        return (
            <p className={`text-xs font-medium ${color} mt-1`}>
                {difference > 0 ? '+' : ''}{difference.toFixed(1)} vs US
            </p>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
            {getTrendDisplay()}
            {getUSComparisonDisplay()}
        </div>
    );
}

function DemographicCard({ category, value, change }) {
    const getChangeColor = () => {
        if (change === null || Math.abs(change) < 0.5) return 'text-gray-500';
        return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-1">{category}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}%</p>
            {change !== null && (
                <div className="flex items-center gap-1 mt-1">
                    {Math.abs(change) < 0.5 ? 
                        <Minus size={12} className="text-gray-400" /> :
                        change > 0 ? 
                            <TrendingUp size={12} className="text-green-600" /> :
                            <TrendingDown size={12} className="text-red-600" />
                    }
                    <span className={`text-xs font-medium ${getChangeColor()}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">10yr</span>
                </div>
            )}
        </div>
    );
}

function PolicyPoint({ icon, text }) {
    return (
        <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="text-sm">{text}</p>
        </div>
    );
}