import React, { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StatCarousel from "./StatCarousel";

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


        // Current year comparison
        const latestLocal = sortedLocal[sortedLocal.length - 1];
        const latestUS = sortedUS[sortedUS.length - 1];
        const oldestInTrend = sortedLocal[Math.max(0, sortedLocal.length - 11)];

        
        // Calculate changes over last 10 years
        const getChange = (latest, oldest, field) => {
            if (!oldest) return null;
            return parseFloat(latest[field]) - parseFloat(oldest[field]);
        };


        // Helper function to sum "Other" categories
        const sumOtherCategories = (data) => {
            return (parseFloat(data?.pct_two_or_more) || 0) + 
                   (parseFloat(data?.pct_am_indian) || 0) +
                   (parseFloat(data?.pct_pacificI) || 0) +
                   (parseFloat(data?.pct_other) || 0);
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
                category: 'Other', 
                local: sumOtherCategories(latestLocal),
                us: sumOtherCategories(latestUS),
                change: sumOtherCategories(latestLocal) - sumOtherCategories(oldestInTrend)
            }
        ];
        
        // Separate ethnicity data
        const ethnicityData = {
            category: 'Hispanic/Latino',
            local: parseFloat(latestLocal?.pct_hispanic) || 0,
            us: parseFloat(latestUS?.pct_hispanic) || 0,
            change: getChange(latestLocal, oldestInTrend, 'pct_hispanic')
        };

        // Divorce rate trend
        const divorceTrend = sortedLocal.slice(-11).map(local => {
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

        // Calculate diversity index using Simpson's Diversity Index (0-100, higher = more diverse)
        const calcDiversityIndex = (data) => {
            const groups = [
                parseFloat(data.pct_white) || 0,
                parseFloat(data.pct_black) || 0,
                parseFloat(data.pct_asian) || 0,
                parseFloat(data.pct_hispanic) || 0,
                parseFloat(data.pct_two_or_more) || 0,
                parseFloat(data.pct_am_indian) || 0,
                parseFloat(data.pct_pacificI) || 0,
                parseFloat(data.pct_other) || 0
            ];
            
            // Convert percentages to proportions and calculate Simpson's Index
            const proportions = groups.map(g => g / 100);
            const simpson = proportions.reduce((sum, p) => sum + (p * p), 0);
            
            // Diversity score: higher when groups are more evenly distributed
            return (1 - simpson) * 100;
        };

        const currentDiversity = calcDiversityIndex(latestLocal);
        const oldDiversity = oldestInTrend ? calcDiversityIndex(oldestInTrend) : null;
        const diversityChange = oldDiversity ? currentDiversity - oldDiversity : null;
        const usDiversity = latestUS ? calcDiversityIndex(latestUS) : null;

        // Calculate 1-year changes
        const oneYearAgo = sortedLocal[sortedLocal.length - 2];
        const popGrowth1Yr = oneYearAgo ? 
            ((totalPop - parseInt(oneYearAgo.total_pop)) / parseInt(oneYearAgo.total_pop)) * 100 : null;

        // Calculate 10-year population growth
        const tenYearsAgo = sortedLocal[sortedLocal.length - 11];
        const popGrowth10Yr = tenYearsAgo ? 
            ((totalPop - parseInt(tenYearsAgo.total_pop)) / parseInt(tenYearsAgo.total_pop)) * 100 : null;

        // Calculate 1-year diversity change
        const diversityChange1Yr = oneYearAgo ? calcDiversityIndex(latestLocal) - calcDiversityIndex(oneYearAgo) : null;
        return {
            locationName,
            raceComparison,
            ethnicityData,  // Add this
            divorceTrend,
            latestYear,
            totalPop,
            pctFemale,
            pctMale,
            pctDivorced,
            popGrowth1Yr,
            popGrowth10Yr,
            currentDiversity,
            diversityChange1Yr,
            diversityChange,
            usDiversity
        };
    }, [demographicsData]);

    if (!demographicsData || demographicsData.length === 0) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Demographics</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading demographic data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Demographics</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No demographic data available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Stats Grid */}
            <StatCarousel>
                <StatCard
                    title="Total Population"
                    value={processedData.totalPop.toLocaleString()}
                    subtitle={`Latest: ${processedData.latestYear}`}
                    trend1Yr={processedData.popGrowth1Yr}
                    trend10Yr={processedData.popGrowth10Yr}
                />
                <StatCard
                    title="Diversity Index"
                    value={`${processedData.currentDiversity.toFixed(1)}`}
                    subtitle={`US avg: ${processedData.usDiversity ? processedData.usDiversity.toFixed(1) : '—'}`}
                    trend1Yr={processedData.diversityChange1Yr}
                    trend10Yr={processedData.diversityChange}
                />
                <StatCard
                    title="Gender Distribution"
                    value={`${processedData.pctFemale.toFixed(1)}% F / ${processedData.pctMale.toFixed(1)}% M`}
                    subtitle={`Latest: ${processedData.latestYear}`}
                />
            </StatCarousel>

            
            {/* Current Snapshot - Race */}
            <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                    Current Racial Composition
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    {processedData.latestYear} data—10-year changes shown. Note: Race categories are independent of Hispanic/Latino ethnicity.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Divorce Rate Trend + Hispanic/Latino Ethnicity side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hispanic/Latino Ethnicity - Left Side */}
                <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Hispanic/Latino Ethnicity
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Hispanic/Latino is an ethnicity, not a race. Individuals may identify as Hispanic/Latino and also identify with any racial category above.
                    </p>

                    <div className="space-y-4">
                        <DemographicCard
                            category={processedData.ethnicityData.category}
                            value={processedData.ethnicityData.local}
                            change={processedData.ethnicityData.change}
                        />
                        <div className="bg-slate-50 rounded-lg shadow-sm p-4 border border-slate-300/50">
                            <p className="text-xs font-medium text-gray-500 mb-1">U.S. Average</p>
                            <p className="text-2xl font-bold text-gray-900">{processedData.ethnicityData.us.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500 mt-2">National comparison</p>
                        </div>
                    </div>
                </div>

                {/* Divorce Rate Trend - Right Side */}
                <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Divorce Rate Trend
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Rising divorce rates may indicate need for family support services
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={processedData.divorceTrend}>
                            <defs>
                                <linearGradient id="divLocal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="divUS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="year" 
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                interval="preserveStartEnd"
                                minTickGap={20}
                            />
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
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend1Yr, trend10Yr }) {
    const getTrendDisplay = (trend, label) => {
        if (trend === null || trend === undefined) return null;
        const isPositive = trend > 0;
        const color = isPositive ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
        const Icon = isPositive ? TrendingUp : trend < 0 ? TrendingDown : Minus;

        if (Math.abs(trend) < 0.5) {
            return (
                <div className="flex items-center gap-1 text-xs">
                    <Minus size={12} className="text-gray-500" />
                    <span className="text-gray-500">Stable {label}</span>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-1">
                <Icon size={12} className={color} />
                <span className={color}>
                    {isPositive ? '+' : ''}{Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-gray-500">{label}</span>
            </div>
        );
    };

    return (
        <div className="bg-indigo-50 rounded-lg shadow-lg border border-slate-100 p-4">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            
            {(trend1Yr !== null || trend10Yr !== null) && (
                <div className="flex gap-5 text-xs">
                    {trend1Yr !== null && getTrendDisplay(trend1Yr, '1yr')}
                    {trend10Yr !== null && getTrendDisplay(trend10Yr, '10yr')}
                </div>
            )}
        </div>
    );
}

function DemographicCard({ category, value, change }) {
    const getChangeColor = () => {
        if (change === null || Math.abs(change) < 0.5) return 'text-gray-500';
        return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-300/50">
            <p className="text-xs font-medium text-gray-500 mb-1">{category}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}%</p>
            {change !== null && (
                <div className="flex items-center gap-1 mt-1">
                    {Math.abs(change) < 0.5 ? 
                        <Minus size={12} className="text-gray-500" /> :
                        change > 0 ? 
                            <TrendingUp size={12} className="text-green-600" /> :
                            <TrendingDown size={12} className="text-red-600" />
                    }
                    <span className={`text-xs font-medium ${getChangeColor()}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">10yr</span>
                </div>
            )}
        </div>
    );
}

