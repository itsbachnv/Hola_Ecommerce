import React, { useState } from 'react';

interface OSMAddressAutocompleteProps {
  onSelect?: (data: { address: string; place: any }) => void;
}

export default function OSMAddressAutocomplete({ onSelect }: OSMAddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&countrycodes=VN&limit=5`
      );
      const data = await res.json();
      setSuggestions(data || []);
    } catch (err) {
      setError('Không thể lấy gợi ý địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          if (e.target.value.length > 2) fetchSuggestions(e.target.value);
          else setSuggestions([]);
        }}
        placeholder="Nhập địa chỉ..."
        className="address-input"
      />
      <div className="autocomplete-dropdown">
        {loading && <div>Đang tải...</div>}
        {suggestions.map(item => (
          <div
            key={item.place_id}
            className="suggestion"
            onClick={() => {
              setQuery(item.display_name);
              setSuggestions([]);
              if (onSelect) onSelect({ address: item.display_name, place: item });
            }}
          >
            {item.display_name}
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
