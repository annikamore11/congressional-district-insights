import {
  PiggyBank,
  ChartLine,
  Map,
  Users,
  TrendingUp,
  MapPin,
  Search,
  BarChart3
} from "lucide-react";
import {
  useNavigate
} from "react-router-dom";

export default function LandingContent({ locationData }) {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-br from-slate-500 to-slate-700 text-slate-100">
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center py-20 px-6">
                <h1 className="text-5xl font-bold mb-6">
                    Know Your District.<br />Know Your Representatives.
                </h1>
                <p className="text-xl mb-4 text-slate-200 max-w-3xl mx-auto">
                    Your one-stop platform for transparent civic data and campaign finance tracking — 
                    empowering you to make informed decisions about your community and representatives.
                </p>
                <p className="text-lg mb-8 text-slate-300 max-w-2xl mx-auto">
                    From demographics to dollars, see how policy impacts your district and where campaign money flows.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <button 
                        className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-slate-100 px-8 py-4 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all text-lg"
                        onClick={() => navigate("/district-insights", { state: { locationData } })}
                    >
                        Explore Your District
                    </button>
                    <button 
                        className="bg-gradient-to-r from-slate-700 to-slate-900 text-slate-100 px-8 py-4 rounded-lg font-semibold shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 hover:scale-105 transition-all text-lg"
                        onClick={() => navigate("/representatives", { state: { locationData } })}
                    >
                        View Your Representatives
                    </button>
                </div>
            </div>
            
            {/* What You Can Explore */}
            <div className="bg-slate-700 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">What You Can Explore</h2>
                    <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">
                        We automatically detect your location to show relevant data. Change locations anytime using the address bar at the top.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-slate-800 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-center mb-4">
                                <ChartLine className="w-10 h-10 text-fuchsia-700" />
                            </div>
                            <h3 className="font-bold mb-3 text-lg text-center">District Data</h3>
                            <p className="text-sm text-slate-300 text-center">
                                Demographics, economy, health, education, and civic engagement metrics for your state and county
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-center mb-4">
                                <Users className="w-10 h-10 text-yellow-700" />
                            </div>
                            <h3 className="font-bold mb-3 text-lg text-center">Your Representatives</h3>
                            <p className="text-sm text-slate-300 text-center">
                                Contact info and profiles for your federal and state legislators — all in one place
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-center mb-4">
                                <PiggyBank className="w-10 h-10 text-emerald-700" />
                            </div>
                            <h3 className="font-bold mb-3 text-lg text-center">Campaign Finance</h3>
                            <p className="text-sm text-slate-300 text-center">
                                Live FEC data showing contributions, spending, and top donors for federal representatives
                            </p>
                        </div>
                        
                        <div className="bg-slate-800 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-center mb-4">
                                <TrendingUp className="w-10 h-10 text-violet-700" />
                            </div>
                            <h3 className="font-bold mb-3 text-lg text-center">Trend Analysis</h3>
                            <p className="text-sm text-slate-300 text-center">
                                Track changes over time in key metrics — see how your community is evolving
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Statement */}
            <div className="py-16 bg-slate-800/30">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl font-bold mb-6">Transparency for Informed Voters</h2>
                    <p className="text-lg text-slate-200 mb-4">
                        Democracy works best when voters have access to clear, comprehensive information. 
                        We believe every citizen should understand how their district compares, who represents them, 
                        and where campaign dollars are flowing.
                    </p>
                    <p className="text-lg text-slate-300">
                        Our mission is simple: make civic data accessible, transparent, and actionable — 
                        so you can see the real story behind policy impacts and political campaigns.
                    </p>
                </div>
            </div>
        </div>
    );
}