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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 4) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (query.trim() === value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (!focused) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=nz&q=" +
          encodeURIComponent(query);

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        setResults(data);
        setOpen(focused);
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, value, focused]);

  function selectResult(result: AddressResult) {
    setQuery(result.display_name);
    setResults([]);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div className="addressBox">
      <label>{label}</label>

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          if (results.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setFocused(false);
          setOpen(false);
        }}
        placeholder="Start typing a New Zealand address"
      />

      {loading && <span className="addressLoading">Searching NZ addresses...</span>}

      {open && results.length > 0 && (
        <div className="suggestions">
          {results.map((result) => (
            <button
              type="button"
              key={result.display_name}
              onMouseDown={(event) => {
                event.preventDefault();
                selectResult(result);
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
