import React, { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function EducationTab({ educationData }) {
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

        // Get latest and historical data
        const latestLocal = sortedLocal[sortedLocal.length - 1];
        const latestUS = sortedUS[sortedUS.length - 1];
        const fiveYearsAgo = sortedLocal[sortedLocal.length - 6];
        const tenYearsAgo = sortedLocal[sortedLocal.length - 11];

        // Educational attainment trend (last 10 years)
        const attainmentTrend = sortedLocal.slice(-10).map(local => {
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

        // Enrollment composition over time
        const enrollmentTrend = sortedLocal.slice(-10).map(local => {
            return {
                year: local.year,
                public: parseFloat(local.pct_public_school) || 0,
                private: parseFloat(local.pct_private_school) || 0,
                total: parseFloat(local.pct_enrolled) || 0
            };
        });

        // School funding trend
        const fundingTrend = sortedLocal.slice(-10).map(local => {
            const usMatch = sortedUS.find(us => us.year === local.year);
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

        const hsChange = getChange(latestLocal, tenYearsAgo, 'pct_hs_or_higher');
        const baChange = getChange(latestLocal, tenYearsAgo, 'pct_ba_or_higher');
        const enrollmentChange = getChange(latestLocal, tenYearsAgo, 'pct_enrolled');
        const fundingChange = getChange(latestLocal, fiveYearsAgo, 'school_funding');

        // Current stats
        const currentHS = parseFloat(latestLocal?.pct_hs_or_higher) || 0;
        const currentBA = parseFloat(latestLocal?.pct_ba_or_higher) || 0;
        const currentDoctorate = parseFloat(latestLocal?.pct_doctorate) || 0;
        const currentEnrollment = parseFloat(latestLocal?.pct_enrolled) || 0;
        const currentPublic = parseFloat(latestLocal?.pct_public_school) || 0;
        const currentPrivate = parseFloat(latestLocal?.pct_private_school) || 0;
        const currentFunding = parseFloat(latestLocal?.school_funding) || 0;

        const usHS = parseFloat(latestUS?.pct_hs_or_higher) || 0;
        const usBA = parseFloat(latestUS?.pct_ba_or_higher) || 0;
        const usFunding = parseFloat(latestUS?.school_funding) || 0;

        // Calculate private school share of enrollment
        const privateShare = currentEnrollment > 0 ? (currentPrivate / currentEnrollment) * 100 : 0;

        return {
            locationName,
            latestYear: latestLocal?.year,
            attainmentTrend,
            enrollmentTrend,
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
            usFunding,
            hsChange,
            baChange,
            enrollmentChange,
            fundingChange,
            privateShare
        };
    }, [educationData]);

    if (!educationData || educationData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Education</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading education data...
                </div>
            </div>
        );
    }

    if (!processedData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Education</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No education data available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="High School Grad Rate"
                    value={`${processedData.currentHS.toFixed(1)}%`}
                    subtitle={`US avg: ${processedData.usHS.toFixed(1)}%`}
                    trend={processedData.hsChange}
                    trendLabel="10yr"
                />
                <StatCard
                    title="Bachelor's Degree+"
                    value={`${processedData.currentBA.toFixed(1)}%`}
                    subtitle={`US avg: ${processedData.usBA.toFixed(1)}%`}
                    trend={processedData.baChange}
                    trendLabel="10yr"
                />
                <StatCard
                    title="School Enrollment"
                    value={`${processedData.currentEnrollment.toFixed(1)}%`}
                    subtitle={`Latest: ${processedData.latestYear}`}
                    trend={processedData.enrollmentChange}
                    trendLabel="10yr"
                />
                <StatCard
                    title="Student Funding Adequacy"
                    value={processedData.currentFunding >= 0 ? 'Adequately funded' : 'Below adequate'}
                    subtitle={`Gap: ${(Math.abs(processedData.currentFunding) / 1000).toFixed(1)}k per pupil`}
                    trend={processedData.fundingChange}
                    trendLabel="5yr"
                    isFunding={true}
                    fundingValue={processedData.currentFunding}
                />
            </div>

            {/* Educational Attainment Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                            formatter={(value) => `${value.toFixed(1)}%`}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="localHS" 
                            stroke="#3b82f6" 
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
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            name="Doctorate"
                            dot={{ r: 2 }}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Enrollment and Funding */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800">
                        School Enrollment Breakdown
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Public vs private school enrollment—currently {processedData.privateShare.toFixed(0)}% of enrolled students go to private school
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={processedData.enrollmentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                formatter={(value) => `${value.toFixed(1)}%`}
                            />
                            <Legend />
                            <Bar dataKey="public" stackId="enrollment" fill="#3b82f6" name="Public School" />
                            <Bar dataKey="private" stackId="enrollment" fill="#ec4899" name="Private School" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

            {/* Policy Implications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                    Policy Implications
                </h2>
                <div className="space-y-3 text-sm text-gray-700">
                    <PolicyPoint 
                        icon="📚"
                        text={`${processedData.currentHS.toFixed(1)}% high school graduation rate ${processedData.currentHS >= processedData.usHS ? 'exceeds' : 'trails'} national average—${processedData.currentHS >= processedData.usHS ? 'maintain' : 'improve'} dropout prevention programs`}
                    />
                    <PolicyPoint 
                        icon="🎓"
                        text={`Bachelor's degree attainment at ${processedData.currentBA.toFixed(1)}% suggests need for ${processedData.currentBA < processedData.usBA ? 'increased' : 'continued'} college access and affordability initiatives`}
                    />
                    <PolicyPoint 
                        icon="🏫"
                        text={`${processedData.privateShare.toFixed(0)}% of enrolled students attend private schools—monitor school choice policies and public school competitiveness`}
                    />
                    <PolicyPoint 
                        icon="💰"
                        text={`Funding gap of ${Math.abs(processedData.currentFunding).toLocaleString()} per pupil ${processedData.currentFunding >= 0 ? 'exceeds' : 'falls short of'} adequate levels—${processedData.currentFunding >= 0 ? 'maintain' : 'advocate for increased'} investment in education`}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend, trendLabel, isFunding, fundingValue }) {
    const getTrendDisplay = () => {
        if (trend === null || trend === undefined) return null;
        const isPositive = trend > 0;
        const color = isPositive ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
        const Icon = isPositive ? TrendingUp : trend < 0 ? TrendingDown : Minus;
        
        return (
            <div className="flex items-center gap-1 text-xs mt-1">
                <Icon size={14} className={color} />
                <span className={color}>
                    {isPositive ? '+' : ''}{Math.abs(trend) > 1000 ? `${(trend/1000).toFixed(1)}k` : trend.toFixed(1)} {trendLabel}
                </span>
            </div>
        );
    };

    const valueColor = isFunding && fundingValue !== undefined 
        ? fundingValue >= 0 ? 'text-green-600' : 'text-orange-600'
        : 'text-gray-900';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
            {getTrendDisplay()}
        </div>
    );
}

function PolicyPoint({ icon, text }) {
    return (
        <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="text-sm">{text}</p>
        </div>
    );
}