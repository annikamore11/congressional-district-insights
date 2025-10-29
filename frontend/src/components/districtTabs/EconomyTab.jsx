import React, { useMemo } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StatCarousel from "./StatCarousel";

export default function EconomyTab({ economyData }) {
    const processedData = useMemo(() => {
        if (!economyData || economyData.length === 0) return null;

        // Separate US data from local data
        const usData = economyData.filter(row => row.state === 'US' || row.state === 'us');
        const localData = economyData.filter(row => row.state !== 'US' && row.state !== 'us');

        // Get location name
        const locationName = localData.length > 0 ? localData[0].county : 'Local';

        // Sort by year
        const sortedLocal = localData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        const sortedUS = usData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        // Get latest and previous year data
        const latestLocal = sortedLocal[sortedLocal.length - 1];
        const latestUS = sortedUS[sortedUS.length - 1];
        const oneYearAgo = sortedLocal[sortedLocal.length - 2];
        const tenYearsAgo = sortedLocal[sortedLocal.length - 11];

        // Income trend (last 10 years)
        const incomeTrend = sortedLocal.slice(-11).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
            return {
                year: local.year,
                local: parseFloat(local.med_household_income) || null,
                us: parseFloat(usMatch?.med_household_income) || null
            };
        });

        // Unemployment trend
        const unemploymentTrend = sortedLocal.slice(-11).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
            return {
                year: local.year,
                local: parseFloat(local.unemployment_rate) || null,
                us: parseFloat(usMatch?.unemployment_rate) || null
            };
        });

        // Calculate changes (returns percentage change)
        const getChange = (latest, previous, field) => {
            if (!latest || !previous || !latest[field] || !previous[field]) return null;
            const latestVal = parseFloat(latest[field]);
            const prevVal = parseFloat(previous[field]);
            return ((latestVal - prevVal) / prevVal) * 100;
        };

        // 1yr and 10yr changes
        const medIncome1yr = getChange(latestLocal, oneYearAgo, 'med_household_income');
        const medIncome10Yr = getChange(latestLocal, tenYearsAgo, 'med_household_income');
        
        const poverty1yr = getChange(latestLocal, oneYearAgo, 'poverty_pop');
        const poverty10Yr = getChange(latestLocal, tenYearsAgo, 'poverty_pop');

        const unemployment1yr = getChange(latestLocal, oneYearAgo, 'unemployment_rate');
        const unemployment10yr = getChange(latestLocal, tenYearsAgo, 'unemployment_rate');

        const laborForce1yr = getChange(latestLocal, oneYearAgo, 'labor_force_rate');
        const laborForce10yr = getChange(latestLocal, tenYearsAgo, 'labor_force_rate');

        // Current stats
        const medianIncome = {
            value: parseFloat(latestLocal?.med_household_income) || null,
            year: latestLocal?.year,
            trend1yr: medIncome1yr,
            trend10yr: medIncome10Yr,
            usValue: parseFloat(latestUS?.med_household_income) || null
        };

        const povertyRate = {
            value: parseFloat(latestLocal?.poverty_pop) || null,
            year: latestLocal?.year,
            trend1yr: poverty1yr,
            trend10yr: poverty10Yr,
            usValue: parseFloat(latestUS?.poverty_pop) || null
        };

        const unemploymentRate = {
            value: parseFloat(latestLocal?.unemployment_rate) || null,
            year: latestLocal?.year,
            trend1yr: unemployment1yr,
            trend10yr: unemployment10yr,
            usValue: parseFloat(latestUS?.unemployment_rate) || null
        };

        const laborForce = {
            value: parseFloat(latestLocal?.labor_force_rate) || null,
            year: latestLocal?.year,
            trend1yr: laborForce1yr,
            trend10yr: laborForce10yr,
            usValue: parseFloat(latestUS?.labor_force_rate) || null
        };

        const medianRent = {
            value: parseFloat(latestLocal?.med_gross_rent) || null,
            year: latestLocal?.year,
            trend1yr: getChange(latestLocal, oneYearAgo, 'med_gross_rent'),
            usValue: parseFloat(latestUS?.med_gross_rent) || null
        };

        const medianHomeValue = {
            value: parseFloat(latestLocal?.med_home_value) || null,
            year: latestLocal?.year,
            trend1yr: getChange(latestLocal, oneYearAgo, 'med_home_value'),
            usValue: parseFloat(latestUS?.med_home_value) || null
        };

        const giniIndex = {
            value: parseFloat(latestLocal?.gini_index) || null,
            year: latestLocal?.year,
            trend1yr: getChange(latestLocal, oneYearAgo, 'gini_index'),
            usValue: parseFloat(latestUS?.gini_index) || null
        };

        const rentersCostBurdened = {
            value: parseFloat(latestLocal?.pct_renters_cost_burdened) || null,
            year: latestLocal?.year,
            trend1yr: getChange(latestLocal, oneYearAgo, 'pct_renters_cost_burdened'),
            usValue: parseFloat(latestUS?.pct_renters_cost_burdened) || null
        };

        const homeownersCostBurdened = {
            value: parseFloat(latestLocal?.pct_homeowners_cost_burdened) || null,
            year: latestLocal?.year,
            trend1yr: getChange(latestLocal, oneYearAgo, 'pct_homeowners_cost_burdened'),
            usValue: parseFloat(latestUS?.pct_homeowners_cost_burdened) || null
        };

        const pctRenters = parseFloat(latestLocal?.pct_renters) || null;
        const pctHomeowners = parseFloat(latestLocal?.pct_homeowners) || null;

        return {
            locationName,
            incomeTrend,
            unemploymentTrend,
            medianIncome,
            povertyRate,
            unemploymentRate,
            laborForce,
            medianRent,
            medianHomeValue,
            giniIndex,
            rentersCostBurdened,
            homeownersCostBurdened,
            pctRenters,
            pctHomeowners
        };
    }, [economyData]);

    if (!economyData || economyData.length === 0) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Economy</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading economic data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Economy</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No economic data available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Stats Grid */}
            <StatCarousel>
                <StatCard
                    title="Median Household Income"
                    value={`$${(processedData.medianIncome.value / 1000).toFixed(0)}k`}
                    subtitle={`US avg: $${(processedData.medianIncome.usValue / 1000).toFixed(0)}k`}
                    trend1Yr={processedData.medianIncome.trend1yr}
                    trend10Yr={processedData.medianIncome.trend10yr}
                />
                <StatCard
                    title="Poverty Rate"
                    value={`${processedData.povertyRate.value?.toFixed(1)}%`}
                    subtitle={`US avg: ${processedData.povertyRate.usValue?.toFixed(1)}%`}
                    trend1Yr={processedData.povertyRate.trend1yr}
                    trend10Yr={processedData.povertyRate.trend10yr}
                    inverse={true}
                />
                <StatCard
                    title="Labor Force Participation"
                    value={`${processedData.laborForce.value?.toFixed(1)}%`}
                    subtitle={`US avg: ${processedData.laborForce.usValue?.toFixed(1)}%`}
                    trend1Yr={processedData.laborForce.trend1yr}
                    trend10Yr={processedData.laborForce.trend10yr}
                />
                <StatCard
                    title="Unemployment Rate"
                    value={`${processedData.unemploymentRate.value?.toFixed(1)}%`}
                    subtitle={`US avg: ${processedData.unemploymentRate.usValue?.toFixed(1)}%`}
                    trend1Yr={processedData.unemploymentRate.trend1yr}
                    trend10Yr={processedData.unemploymentRate.trend10yr}
                    inverse={true}
                />
            </StatCarousel>

            {/* Income & Employment Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Median Household Income (Not Inflation Adjusted)
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Track income growth over time compared to national average
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={processedData.incomeTrend}>
                            <defs>
                                <linearGradient id="incomeLocal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="incomeUS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="year" 
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                interval="preserveStartEnd"  // Add this to show first and last labels
                                minTickGap={20}  // Add this to prevent label overlap
                            />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value, name) => {
                                    const label = name === 'local' ? processedData.locationName : 'United States';
                                    return [`$${value?.toLocaleString()}`, label];
                                }}
                            />
                            <Legend 
                                formatter={(value) => value === 'local' ? processedData.locationName : 'United States'}
                            />
                            <Area type="monotone" dataKey="local" stroke="#16a34a" fill="url(#incomeLocal)" />
                            <Area type="monotone" dataKey="us" stroke="#94a3b8" fill="url(#incomeUS)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Unemployment Rate
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Lower rates indicate stronger job markets
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={processedData.unemploymentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="year" 
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                interval="preserveStartEnd"  // Add this to show first and last labels
                                minTickGap={20}  // Add this to prevent label overlap
                            />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value, name) => {
                                    const label = name === 'local' ? processedData.locationName : 'United States';
                                    return [`${value?.toFixed(1)}%`, label];
                                }}
                            />
                            <Legend 
                                formatter={(value) => value === 'local' ? processedData.locationName : 'United States'}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="local" 
                                stroke="#991b1b" 
                                strokeWidth={3}
                                dot={{ r: 3 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="us" 
                                stroke="#94a3b8" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Housing Affordability */}
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Housing Costs
                </h2>

                <StatCarousel>
                    <StatCard
                        title="Median Rent"
                        value={`$${(processedData.medianRent.value).toLocaleString()}`}
                        subtitle={`US avg: $${(processedData.medianRent.usValue).toLocaleString()}`}
                        trend1Yr={processedData.medianRent.trend1yr}
                        inverse={true}
                        isHousing={true}
                    />
                    <StatCard
                        title="Median Home Value"
                        value={`$${(processedData.medianHomeValue.value).toLocaleString()}`}
                        subtitle={`US avg: $${(processedData.medianHomeValue.usValue).toLocaleString()}`}
                        trend1Yr={processedData.medianHomeValue.trend1yr}
                        isHousing={true}
                    />
                    <div className="bg-slate-50 rounded-lg shadow-sm border p-4 border-slate-300/50">
                        <p className="text-sm text-gray-600 mb-1">Renters Cost-Burdened</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {processedData.rentersCostBurdened.value?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            US avg: {processedData.rentersCostBurdened.usValue?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Renters spending 30%+ on rent
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg  shadow-sm p-4 border border-slate-300/50">
                        <p className="text-sm text-gray-600 mb-1">Homeowners Cost-Burdened</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {processedData.homeownersCostBurdened.value?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            US avg: {processedData.homeownersCostBurdened.usValue?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Homeowners spending 30%+ on mortgage
                        </p>
                    </div>
                </StatCarousel>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend1Yr, trend10Yr, inverse = false, isHousing = false }) {
    const getTrendDisplay = (trend, label) => {
        if (trend === null || trend === undefined || isNaN(trend)) return null;
        
        // Determine if trend is good or bad
        const isPositive = trend > 0;
        const isGoodTrend = inverse ? !isPositive : isPositive;
        
        const color = isGoodTrend ? "text-green-600" : "text-red-600";
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
        <div className={`${isHousing ? 'bg-slate-50 border-slate-300/50' : 'bg-indigo-50 border-gray-200'} rounded-lg shadow-sm border p-4`}>
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