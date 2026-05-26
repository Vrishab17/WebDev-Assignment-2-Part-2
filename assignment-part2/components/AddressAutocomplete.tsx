"use client";

import { useEffect, useState } from "react";
import type { AddressResult } from "@/types/cabsonline";

type Props = {
  label: string;
  value: string;
  onSelect: (result: AddressResult) => void;
};

export default function AddressAutocomplete({ label, value, onSelect }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 4) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=nz&q=" +
          encodeURIComponent(query);

        const response = await fetch(url);
        const data = await response.json();

        setResults(data);
      } catch {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="addressBox">
      <label>{label}</label>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Start typing a New Zealand address"
      />

      {results.length > 0 && (
        <div className="suggestions">
          {results.map((result) => (
            <button
              type="button"
              key={result.display_name}
              onClick={() => {
                setQuery(result.display_name);
                setResults([]);
                onSelect(result);
              }}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}