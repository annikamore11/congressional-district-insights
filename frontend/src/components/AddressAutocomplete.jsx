import { useEffect, useState, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

function AddressAutocomplete({ onSelectAddress, initialValue="", isMobile = false }) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const isInitialized = useRef(false);
  const inputRef = useRef(null);

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

  // Also update the value when initialValue changes AND clear suggestions
  useEffect(() => {
    setValue(initialValue);
    setSuggestions([]); // Clear suggestions when location changes externally
    setShowDropdown(false);
  }, [initialValue]);

  return (
    <div className="relative">
      {/* Backdrop/Card when focused on mobile */}
      {isMobile && isFocused && (
        <div 
          className="fixed inset-0 bg-black/80 z-[90] md:hidden"
          onClick={() => {
            setIsFocused(false);
            inputRef.current?.blur();
          }}
        />
      )}
      
      {/* Input Container - enlarges on mobile when focused */}
      <div className={`
        ${isMobile && isFocused 
          ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[90vw] max-w-md bg-slate-800 p-4 rounded-xl shadow-2xl' 
          : 'relative'
        }
      `}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowDropdown(false);
              setIsFocused(false);
            }, 200);
          }}
          placeholder="ZIP code or address..."
          className={`
            border border-gray-600 bg-slate-900 text-slate-100 shadow-sm shadow-slate-500/30 
            placeholder-slate-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600
            ${isMobile && isFocused ? 'w-full text-base py-3' : 'w-48 md:w-64'}
          `}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && value) {
              handleSelect(value);
              setIsFocused(false);
              inputRef.current?.blur();
            }
          }}
        />
        
        {/* Suggestions dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className={`
            absolute top-full left-0 mt-2 bg-indigo-50 border border-slate-900 
            rounded-md shadow-lg max-h-60 overflow-auto z-[100]
            ${isMobile && isFocused ? 'w-full' : 'w-[400px]'}
          `}>
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(suggestion);
                  setIsFocused(false);
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
    </div>
  );

}

export default AddressAutocomplete;