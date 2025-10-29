import { useEffect, useState, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { X } from "lucide-react";

function AddressAutocomplete({ onSelectAddress, onCancel }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const isInitialized = useRef(false);

  // Initialize Google Places
  useEffect(() => {
    const initGooglePlaces = async () => {
      if (isInitialized.current) return;
      
      try {
        // Initialize the API loader
        setOptions({
          key: import.meta.env.VITE_GOOGLE_API_KEY
        });
        

        // Import the places library
        const { AutocompleteService, AutocompleteSessionToken } = await importLibrary("places");
        
        autocompleteService.current = new AutocompleteService();
        sessionToken.current = new AutocompleteSessionToken();
        isInitialized.current = true;
      } catch (err) {
        console.error("Error loading Google Maps:", err);
      }
    };

    initGooglePlaces();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!value || value.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const request = {
          input: value,
          sessionToken: sessionToken.current,
          componentRestrictions: { country: "us" },
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === "OK" && predictions) {
            setSuggestions(predictions.map(p => p.description));
            setShowDropdown(true);
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Autocomplete error:", err);
        setSuggestions([]);
        setShowDropdown(false);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = async (address) => {
    setValue(address);
    setSuggestions([]);
    setShowDropdown(false);
    
    // Create new session token after selection
    try {
      const { AutocompleteSessionToken } = await importLibrary("places");
      sessionToken.current = new AutocompleteSessionToken();
    } catch (err) {
      console.error("Error creating new session token:", err);
    }
    
    onSelectAddress(address);
  };

  return (
    <div className="relative flex items-center">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder="Full address..."
          className="border border-gray-600 bg-slate-900 text-slate-100 shadow-sm shadow-slate-500/30 placeholder-slate-300 px-3 py-1.5 rounded-l text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && value) {
              handleSelect(value);
            }
          }}
        />
        
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-[400px] mt-1 bg-indigo-50 border border-slate-900 rounded-md shadow-lg max-h-60 overflow-auto z-[100]">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(suggestion);
                }}
                className="px-3 py-2 hover:bg-indigo-200 cursor-pointer text-sm text-slate-800 border-b border-indigo-100 last:border-b-0"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <button
        onClick={onCancel}
        className="border border-l-0 border-gray-600 bg-slate-900 text-white shadow-sm shadow-slate-500/30 px-2 py-1.5 rounded-r text-xs hover:bg-slate-700 flex items-center"
        title="Switch to ZIP code"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default AddressAutocomplete;