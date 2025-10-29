import React, { useMemo, useState, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StatCarousel from "./StatCarousel";

export default function EducationTab({ educationData }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

    const processedData = useMemo(() => {
        if (!educationData || educationData.length === 0) return null;

        // Separate US data from local data
        const usData = educationData.filter(row => row.state === 'US' || row.state === 'us');
        const localData = educationData.filter(row => row.state !== 'US' && row.state !== 'us');

        // Get location name
        const locationName = localData.length > 0 ? localData[0].county : 'Local';

        // Sort by year
        const sortedLocal = localData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        const sortedUS = usData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        const getLatestValidYearFunding = (data) => {
            const validYears = data
                .filter(row => row.school_funding != null && row.school_funding !== '')
                .map(row => parseInt(row.year));
            return Math.max(...validYears);
        };

        const latestYearFunding = Math.min(
            getLatestValidYearFunding(sortedLocal),
            getLatestValidYearFunding(sortedUS)
        );

        // Arrays for graph
        const localLatest = sortedLocal.filter(row => parseInt(row.year) <= latestYearFunding);
        const usLatest = sortedUS.filter(row => parseInt(row.year) <= latestYearFunding);

        // Get latest and historical data
        const latestLocal = sortedLocal[sortedLocal.length - 1];
        const latestUS = sortedUS[sortedUS.length - 1];
        const oneYearAgo = sortedLocal[sortedLocal.length - 2];
        const tenYearsAgo = sortedLocal[sortedLocal.length - 11];

        const latestLocalFunding = localLatest[localLatest.length - 1];
        const latestUSFunding = usLatest[usLatest.length - 1];
        const oneYearAgoFunding = localLatest[localLatest.length - 2];
        const tenYearsAgoFunding = localLatest[localLatest.length - 10];

        // Educational attainment trend (last 10 years)
        const attainmentTrend = sortedLocal.slice(-11).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
            return {
                year: local.year,
                localHS: parseFloat(local.pct_hs_or_higher) || 0,
                localBA: parseFloat(local.pct_ba_or_higher) || 0,
                localDoctorate: parseFloat(local.pct_doctorate) || 0,
                usHS: parseFloat(usMatch?.pct_hs_or_higher) || 0,
                usBA: parseFloat(usMatch?.pct_ba_or_higher) || 0
            };
        });

        // School funding trend
        const fundingTrend = localLatest.slice(-10).map(local => {
            const usMatch = usLatest.find(us => us.year === local.year);
            return {
                year: local.year,
                local: parseFloat(local.school_funding) || 0,
                us: parseFloat(usMatch?.school_funding) || 0
            };
        });

        // Calculate changes
        const getChange = (latest, old, field) => {
            if (!old || !latest) return null;
            return parseFloat(latest[field]) - parseFloat(old[field]);
        };

        // 1yr and 10yr changes
        const hsChange1Yr = getChange(latestLocal, oneYearAgo, 'pct_hs_or_higher');
        const hsChange10Yr = getChange(latestLocal, tenYearsAgo, 'pct_hs_or_higher');
        
        const baChange1Yr = getChange(latestLocal, oneYearAgo, 'pct_ba_or_higher');
        const baChange10Yr = getChange(latestLocal, tenYearsAgo, 'pct_ba_or_higher');
        
        const enrollmentChange1Yr = getChange(latestLocal, oneYearAgo, 'pct_enrolled');
        const enrollmentChange10Yr = getChange(latestLocal, tenYearsAgo, 'pct_enrolled');
        
        const fundingChange1Yr = getChange(latestLocalFunding, oneYearAgoFunding, 'school_funding');
        const fundingChange10Yr = getChange(latestLocalFunding, tenYearsAgoFunding, 'school_funding');

        // Current stats
        const currentHS = parseFloat(latestLocal?.pct_hs_or_higher) || 0;
        const currentBA = parseFloat(latestLocal?.pct_ba_or_higher) || 0;
        const currentDoctorate = parseFloat(latestLocal?.pct_doctorate) || 0;
        const currentEnrollment = parseFloat(latestLocal?.pct_enrolled) || 0;
        const currentPublic = parseFloat(latestLocal?.pct_public_school) || 0;
        const currentPrivate = parseFloat(latestLocal?.pct_private_school) || 0;
        const currentFunding = parseFloat(latestLocalFunding?.school_funding) || 0;

        const usHS = parseFloat(latestUS?.pct_hs_or_higher) || 0;
        const usBA = parseFloat(latestUS?.pct_ba_or_higher) || 0;
        const usEnrollment =  parseFloat(latestUS?.pct_enrolled) || 0;
        const usFunding = parseFloat(latestUSFunding?.school_funding) || 0;

        // Calculate private school share of enrollment
        const privateShare = currentEnrollment > 0 ? (currentPrivate / currentEnrollment) * 100 : 0;

        return {
            locationName,
            latestYear: latestLocal?.year,
            latestYearFunding: latestLocalFunding?.year,
            attainmentTrend,
            fundingTrend,
            currentHS,
            currentBA,
            currentDoctorate,
            currentEnrollment,
            currentPublic,
            currentPrivate,
            currentFunding,
            usHS,
            usBA,
            usEnrollment,
            usFunding,
            hsChange1Yr,
            hsChange10Yr,
            baChange1Yr,
            baChange10Yr,
            enrollmentChange1Yr,
            enrollmentChange10Yr,
            fundingChange1Yr,
            fundingChange10Yr,
            privateShare
        };
    }, [educationData]);

    if (!educationData || educationData.length === 0) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Education</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading education data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Education</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No education data available
                </div>
            </div>
        );
    }



    return (
        <div className="space-y-6">
           {/* Educational Attainment Progress */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        Educational Attainment Over Time
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Track progress in high school and college completion rates
                    </p>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={processedData.attainmentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis 
                                label={!isMobile ? { 
                                    value: 'Percent (%)', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    style: { fill: '#6b7280', fontSize: 12 }
                                } : undefined}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                domain={[0,100]}
                                allowDecimals={false}
                                width={isMobile ? 35 : 60}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value) => `${value.toFixed(1)}%`}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="localHS" 
                                stroke="#2563eb" 
                                strokeWidth={3}
                                name="High School+"
                                dot={{ r: 3 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="localBA" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                name="Bachelor's+"
                                dot={{ r: 3 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="localDoctorate" 
                                stroke="#c026d3" 
                                strokeWidth={2}
                                name="Doctorate"
                                dot={{ r: 2 }}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Key Stats Grid */}
                <div className="flex flex-col gap-4">
                    <StatCarousel layout="vertical">
                        <StatCard
                            title="High School Grad Rate"
                            value={`${processedData.currentHS.toFixed(1)}%`}
                            subtitle={`US avg: ${processedData.usHS.toFixed(1)}%`}
                            trend1Yr={processedData.hsChange1Yr}
                            trend10Yr={processedData.hsChange10Yr}
                            source="Census Bureau ACS PUMS 5-Year Estimate"
                        />
                        <StatCard
                            title="Bachelor's Degree+"
                            value={`${processedData.currentBA.toFixed(1)}%`}
                            subtitle={`US avg: ${processedData.usBA.toFixed(1)}%`}
                            trend1Yr={processedData.baChange1Yr}
                            trend10Yr={processedData.baChange10Yr}
                            source="Census Bureau ACS PUMS 5-Year Estimate"
                        />
                        <StatCard
                            title="Student Funding Adequacy"
                            value={processedData.currentFunding >= 0 ? 'Adequate' : 'Below adequate'}
                            subtitle={`Gap: $${(Math.abs(processedData.currentFunding) / 1000).toFixed(1)}k per pupil`}
                            trend1Yr={processedData.fundingChange1Yr}
                            trend10Yr={processedData.fundingChange10Yr}
                            isFunding={true}
                            fundingValue={processedData.currentFunding}
                            source="County Health Rankings"
                        />
                    </StatCarousel>
                </div>
            </div>


            {/* Enrollment and Funding */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        School Enrollment Breakdown
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {processedData.privateShare.toFixed(1)}% of enrolled students attend private schools
                    </p>
                    <div className="space-y-4">
                        <StatCard
                            title="School Enrollment"
                            value={`${processedData.currentEnrollment.toFixed(1)}%`}
                            subtitle={`US avg: ${processedData.usEnrollment.toFixed(1)}%`}
                            trend1Yr={processedData.enrollmentChange1Yr}
                            trend10Yr={processedData.enrollmentChange10Yr}
                            source="Census Bureau ACS PUMS 5-Year Estimate"
                            changeBgColor={true}
                        />
                        <div className="bg-slate-50 rounded-lg shadow-sm p-4 border border-slate-300/50">
                            <div className="flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">
                                        {processedData.currentPublic.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Public School</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-fuchsia-600">
                                        {processedData.currentPrivate.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Private School</div>
                                </div>
                            </div>

                            <div className="mt-6 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                <div 
                                    className="bg-blue-600" 
                                    style={{ width: `${(processedData.currentPublic / processedData.currentEnrollment) * 100}%` }}
                                />
                                <div 
                                    className="bg-fuchsia-600" 
                                    style={{ width: `${(processedData.currentPrivate / processedData.currentEnrollment) * 100}%` }}
                                />
                            </div>
                        </div>
                        
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        School Funding Gap Trend
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Gap between actual and required spending per pupil—negative values = underfunded
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={processedData.fundingTrend}>
                            <defs>
                                <linearGradient id="fundLocalPositive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="fundLocalNegative" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="fundUS" x1="0" y1="0" x2="0" y2="1">
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
                                    return [`${value.toLocaleString()}`, label];
                                }}
                            />
                            <Legend 
                                formatter={(value) => value === 'local' ? processedData.locationName : 'United States'}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="local" 
                                stroke={processedData.currentFunding >= 0 ? "#16a34a" : "#dc2626"}
                                fill={processedData.currentFunding >= 0 ? "url(#fundLocalPositive)" : "url(#fundLocalNegative)"}
                            />
                            <Area type="monotone" dataKey="us" stroke="#94a3b8" fill="url(#fundUS)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend1Yr, trend10Yr, isFunding, fundingValue, changeBgColor = false }) {
    const getTrendDisplay = (trend, label) => {
        if (trend === null || trend === undefined) return null;
        const isPositive = trend > 0;
        const color = isPositive ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
        const Icon = isPositive ? TrendingUp : trend < 0 ? TrendingDown : Minus;

        // Format the trend value
        const formattedTrend = isFunding && Math.abs(trend) > 1000 
            ? `$${(Math.abs(trend)/1000).toFixed(1)}k`
            : isFunding 
                ? `$${Math.abs(trend).toFixed(0)}`
                : Math.abs(trend) > 1000 
                    ? `${(trend/1000).toFixed(1)}k` 
                    : `${trend.toFixed(1)}%`;

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
                    {isPositive ? '+' : ''}{formattedTrend}
                </span>
                <span className="text-gray-500">{label}</span>
            </div>
        );
    };

    const valueColor = isFunding && fundingValue !== undefined 
        ? fundingValue >= 0 ? 'text-green-600' : 'text-orange-600'
        : 'text-gray-900';

    return (
        <div className={`${changeBgColor ? 'bg-slate-50' : 'bg-indigo-50'} rounded-lg shadow-lg border border-gray-200 p-4`}>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl mb-2 font-bold ${valueColor}`}>{value}</p>
            <p className="text-xs text-gray-500 mb-1">{subtitle}</p>
            
            {(trend1Yr !== null || trend10Yr !== null) && (
                <div className="flex gap-5 text-xs">
                    {trend1Yr !== null && getTrendDisplay(trend1Yr, '1yr')}
                    {trend10Yr !== null && getTrendDisplay(trend10Yr, '10yr')}
                </div>
            )}

        </div>
    );
}
