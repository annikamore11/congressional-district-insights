import {
  PiggyBank,
  ChartLine,
  Map
} from "lucide-react";
import {
  useNavigate
} from "react-router-dom";

export default function LandingContent( {locationData} ) {
    const navigate = useNavigate();

    return (
        // LandingPage.jsx
        <div className="hero bg-gradient-to-br from-slate-700 to-emerald-900/50 text-slate-100 py-20">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-bold mb-4">
                    District and Civic Insights
                </h1>
                <p className="text-xl mb-8">
                    Explore your community's data, representation and campaign politics — 
                    all in.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-slate-100 px-8 py-3 rounded-lg font-semibold shadow-lg shadow-emerald-500/30"
                    onClick={() =>
                    navigate("/district-insights", {
                        state: {locationData},
                    })}
                    >
                        Explore Your District
                    </button>
                </div>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 mb-16">
                <div className="text-center">
                    <div className="flex justify-center mb-2">
                        <ChartLine className="w-8 h-8" />
                    </div>
                        <h3 className="font-bold mb-2">Comprehensive Data</h3>
                        <p className="text-sm">Civic, health, demographic, education & economy data</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <PiggyBank className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-2">Campaign Finance</h3>
                        <p className="text-sm">Live FEC data for your representatives</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Map className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-2">Interactive Maps</h3>
                        <p className="text-sm">Explore state & county-level insights</p>
                    </div>
                </div>
            

            <div className="py-16 bg-emerald-950">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                            <h3 className="font-bold mb-2">Enter Location</h3>
                            <p className="text-sm text-white">ZIP code or address</p>
                        </div>
                        <div className="text-4xl text-gray-300">→</div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                            <h3 className="font-bold mb-2">Fetch Data</h3>
                            <p className="text-sm text-white">Census, FEC, health data</p>
                        </div>
                        <div className="text-4xl text-gray-300">→</div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                            <h3 className="font-bold mb-2">Visualize</h3>
                            <p className="text-sm text-white">Interactive charts & insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}