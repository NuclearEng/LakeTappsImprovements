'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface ParcelResult {
  parcelNumber: string;
  address: string;
  ownerName: string;
  acres: string;
}

interface ParcelLookupProps {
  onParcelFound: (parcelNumber: string, result: ParcelResult) => void;
}

type LookupState = 'collapsed' | 'expanded' | 'selected';

const ARCGIS_URL =
  'https://services2.arcgis.com/1UvBaQ5y1ubjUPmd/ArcGIS/rest/services/Tax_Parcels/FeatureServer/0/query';

export default function ParcelLookup({ onParcelFound }: ParcelLookupProps) {
  const [state, setState] = useState<LookupState>('collapsed');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [selected, setSelected] = useState<ParcelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state === 'expanded' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  const searchParcels = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sanitize input to prevent injection into the WHERE clause
      const sanitized = searchQuery.toUpperCase().replace(/'/g, "''");
      const params = new URLSearchParams({
        where: `Site_Address LIKE '%${sanitized}%'`,
        outFields: 'TaxParcelNumber,Site_Address,Land_Acres,Landuse_Description',
        returnGeometry: 'false',
        f: 'json',
        resultRecordCount: '10',
      });

      const response = await fetch(`${ARCGIS_URL}?${params}`);
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Query error');
      }

      if (data.features && data.features.length > 0) {
        const mapped: ParcelResult[] = data.features.map(
          (f: { attributes: Record<string, string | number> }) => ({
            parcelNumber: String(f.attributes.TaxParcelNumber || ''),
            address: String(f.attributes.Site_Address || ''),
            ownerName: String(f.attributes.Landuse_Description || ''),
            acres: String(f.attributes.Land_Acres || ''),
          })
        );
        setResults(mapped);
      } else {
        setResults([]);
        setError('No parcels found for that address.');
      }
    } catch {
      setError('Failed to search parcels. Please try again or enter manually.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { longitude, latitude } = position.coords;

      // Spatial query: find parcel polygon containing this point
      // The Tax_Parcels layer uses WKID 2927 (WA State Plane South) but
      // we can pass WGS84 (4326) and let ArcGIS reproject
      const params = new URLSearchParams({
        geometry: `${longitude},${latitude}`,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields:
          'TaxParcelNumber,Site_Address,Land_Acres,Landuse_Description',
        returnGeometry: 'false',
        f: 'json',
        resultRecordCount: '5',
      });

      const response = await fetch(`${ARCGIS_URL}?${params}`);
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Query error');
      }

      if (data.features && data.features.length > 0) {
        const mapped: ParcelResult[] = data.features.map(
          (f: { attributes: Record<string, string | number> }) => ({
            parcelNumber: String(f.attributes.TaxParcelNumber || ''),
            address: String(f.attributes.Site_Address || ''),
            ownerName: String(f.attributes.Landuse_Description || ''),
            acres: String(f.attributes.Land_Acres || ''),
          })
        );
        setResults(mapped);

        // If exactly one result, auto-select it
        if (mapped.length === 1) {
          setSelected(mapped[0]);
          setState('selected');
          onParcelFound(mapped[0].parcelNumber, mapped[0]);
        } else {
          setState('expanded');
        }
      } else {
        setState('expanded');
        setError(
          'No parcel found at your location. You may be outside Pierce County. Try searching by address instead.'
        );
      }
    } catch (err) {
      setState('expanded');
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              'Location access denied. Please allow location access or search by address.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              'Location unavailable. Try searching by address instead.'
            );
            break;
          case err.TIMEOUT:
            setError(
              'Location request timed out. Try searching by address instead.'
            );
            break;
          default:
            setError(
              'Could not determine your location. Try searching by address.'
            );
        }
      } else {
        setError(
          'Failed to look up parcel at your location. Try searching by address.'
        );
      }
    } finally {
      setLoading(false);
      setLocating(false);
    }
  }, [onParcelFound]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchParcels(value);
    }, 300);
  };

  const handleSelect = (result: ParcelResult) => {
    setSelected(result);
    setState('selected');
    onParcelFound(result.parcelNumber, result);
  };

  const handleReset = () => {
    setState('collapsed');
    setQuery('');
    setResults([]);
    setSelected(null);
    setError('');
  };

  if (state === 'collapsed') {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setState('expanded')}
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Look up parcel by address
        </button>
        <span className="text-slate-300 text-sm">|</span>
        <button
          type="button"
          onClick={searchByLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
          {locating ? 'Locating...' : 'Use my current location'}
        </button>
      </div>
    );
  }

  if (state === 'selected' && selected) {
    return (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Parcel found and applied
            </p>
            <p className="text-xs text-green-700 mt-1">
              {selected.address} &mdash; {selected.parcelNumber}
            </p>
            {selected.ownerName && (
              <p className="text-xs text-green-600 mt-0.5">
                Land Use: {selected.ownerName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-green-600 hover:text-green-800 text-xs font-medium underline"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // expanded state
  return (
    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-700">
          Search Pierce County parcels
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-600 text-xs"
        >
          Cancel
        </button>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter street address..."
          className="w-full px-3 py-2 pr-8 text-sm rounded-lg border border-slate-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 focus:outline-none"
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={searchByLocation}
        disabled={locating}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {locating ? (
          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        {locating ? 'Locating...' : 'Or use my current location'}
      </button>

      {error && (
        <p className="mt-2 text-xs text-amber-600">{error}</p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
          {results.map((r, i) => (
            <li key={`${r.parcelNumber}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800">
                  {r.address}
                </p>
                <p className="text-xs text-slate-500">
                  Parcel: {r.parcelNumber}
                  {r.ownerName ? ` | ${r.ownerName}` : ''}
                  {r.acres ? ` | ${r.acres} acres` : ''}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
