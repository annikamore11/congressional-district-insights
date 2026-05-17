"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, BarChart3, ArrowRight, Landmark } from "lucide-react";
import { useLocationData } from "@/app/providers/LocationProvider";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5002";

// Latest local (non-US) row from a backend category array.
function latestRow(arr) {
  const local = (arr || []).filter((r) => r.state !== "US" && r.state !== "us");
  local.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return local[local.length - 1] || null;
}

export default function LandingView() {
  const router = useRouter();
  const { locationData, fetchLocation, displayAddress } = useLocationData();
  const [countyMetrics, setCountyMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  const stateAbbr = locationData?.state;
  const stateFull = locationData?.state_full;
  const county = locationData?.county;
  const city = locationData?.city;

  const fedReps = locationData?.fed_legislators || [];
  const repCount =
    fedReps.length +
    (locationData?.state_house_legislators?.length || 0) +
    (locationData?.state_senate_legislators?.length || 0);

  // Pull a few county-level metrics for the District Data preview.
  useEffect(() => {
    if (!stateAbbr || !county) {
      setCountyMetrics([]);
      return;
    }
    async function fetchCountyMetrics() {
      setLoading(true);
      try {
        const resp = await fetch(
          `${API_BASE}/api/county/${stateAbbr}/${county}?category=all`
        );
        const result = await resp.json();
        const metrics = [];
        if (result.data) {
          const demo = latestRow(result.data.demographics);
          const econ = latestRow(result.data.economy);
          if (demo?.total_pop) {
            metrics.push({
              label: "Population",
              value: parseInt(demo.total_pop).toLocaleString(),
            });
          }
          if (econ?.med_household_income) {
            metrics.push({
              label: "Median Household Income",
              value: `$${Math.round(
                parseFloat(econ.med_household_income)
              ).toLocaleString()}`,
            });
          }
          if (econ?.unemployment_rate) {
            metrics.push({
              label: "Unemployment Rate",
              value: `${parseFloat(econ.unemployment_rate).toFixed(1)}%`,
            });
          }
        }
        setCountyMetrics(metrics);
      } catch (err) {
        console.error("Failed to load county metrics:", err);
        setCountyMetrics([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCountyMetrics();
  }, [stateAbbr, county]);

  return (
    <div className="bg-gradient-to-br from-slate-500 to-slate-700 text-slate-100 min-h-full">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Heading + mission */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Know your district.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Explore the data behind where you live — and see how your district
            compares to your state and the nation. Get to know who represents
            you, so your next vote or message to a legislator is an informed
            one.
          </p>
        </div>

        {/* Prominent location search */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Search size={18} className="text-indigo-400" />
            <h2 className="text-lg font-bold">Find your district</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Enter a full street address for the most accurate legislator and
            district mapping — ZIP codes can span multiple districts and may
            map to the wrong representatives.
          </p>
          <AddressAutocomplete
            prominent
            initialValue={displayAddress}
            onSelectAddress={(query) => fetchLocation(query)}
          />
          <div className="mt-3 flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-indigo-400 flex-shrink-0" />
            {locationData ? (
              <span className="text-slate-400">
                Showing data for{" "}
                <span className="text-slate-200 font-medium">
                  {city ? `${city}, ` : ""}
                  {county ? `${county}, ` : ""}
                  {stateFull}
                </span>
              </span>
            ) : (
              <span className="text-slate-500">Detecting your location…</span>
            )}
          </div>
        </div>

        {/* Explore cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* District data */}
          <button
            onClick={() => router.push("/district-insights")}
            className="group text-left bg-slate-800/60 border border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800 rounded-xl p-6 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex p-2.5 rounded-lg bg-indigo-500/15 text-indigo-300">
                <BarChart3 size={22} />
              </div>
              <ArrowRight
                size={18}
                className="text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-lg font-bold mb-1">District Data</h3>
            <p className="text-sm text-slate-400">
              Demographics, economy, health, education, and civics — for your
              county and state, benchmarked against the nation.
            </p>

            {/* County metric ticker */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              {countyMetrics.length > 0 ? (
                <MetricTicker metrics={countyMetrics} county={county} />
              ) : loading ? (
                <div className="space-y-2">
                  <div className="h-7 w-32 bg-slate-700/60 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-700/60 rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Civics",
                    "Demographics",
                    "Economy",
                    "Health",
                    "Education",
                  ].map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-0.5 rounded-full bg-slate-700/70 text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>

          {/* Representatives */}
          <button
            onClick={() => router.push("/representatives")}
            className="group text-left bg-slate-800/60 border border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800 rounded-xl p-6 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex p-2.5 rounded-lg bg-emerald-500/15 text-emerald-300">
                <Landmark size={22} />
              </div>
              <ArrowRight
                size={18}
                className="text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-lg font-bold mb-1">Your Representatives</h3>
            <p className="text-sm text-slate-400">
              Federal and state legislators for your address, with contact
              details and live campaign-finance data.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-700">
              {fedReps.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {fedReps.slice(0, 6).map((m) => (
                      <img
                        key={m.bio_id}
                        src={m.photo_url}
                        alt={m.name}
                        className="w-9 h-9 rounded-full border-2 border-slate-800 object-cover bg-slate-700"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {repCount} representative{repCount === 1 ? "" : "s"} total
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">
                  Set your location to see who represents you
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Auto-advancing strip of county metrics that slides across the card.
function MetricTicker({ metrics, county }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (metrics.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % metrics.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [metrics]);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1.5">{county}</p>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {metrics.map((m) => (
            <div key={m.label} className="w-full flex-shrink-0">
              <p className="text-2xl font-bold text-slate-100">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
      {metrics.length > 1 && (
        <div className="flex gap-1.5 mt-2.5">
          {metrics.map((m, idx) => (
            <span
              key={m.label}
              className={`h-1.5 rounded-full transition-all ${
                idx === index ? "w-4 bg-indigo-400" : "w-1.5 bg-slate-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
