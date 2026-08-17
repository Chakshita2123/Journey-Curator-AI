"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { MapPin, Search, X } from "lucide-react";

// ── Curated dataset — 74 destinations + city/state/category/photo ─────────────
export interface CuratedDestination {
  name: string; city: string; state: string; category: string; photo: string;
}

const CURATED: CuratedDestination[] = [
  // Uttar Pradesh
  { name: "Taj Mahal",               city: "Agra",      state: "Uttar Pradesh",   category: "Historic",  photo: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=120&q=60" },
  { name: "Sarnath",                 city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious", photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=120&q=60" },
  { name: "Varanasi Ghats",          city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious", photo: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=120&q=60" },
  { name: "Kashi Vishwanath Temple", city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious", photo: "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=120&q=60" },
  { name: "Ramnagar Fort",           city: "Varanasi",  state: "Uttar Pradesh",   category: "Historic",  photo: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=120&q=60" },
  { name: "Vrindavan",               city: "Mathura",   state: "Uttar Pradesh",   category: "Religious", photo: "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=120&q=60" },
  { name: "Mathura",                 city: "Mathura",   state: "Uttar Pradesh",   category: "Religious", photo: "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=120&q=60" },
  // Delhi
  { name: "India Gate",              city: "New Delhi", state: "Delhi",           category: "Monument",  photo: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=120&q=60" },
  { name: "Red Fort",                city: "Old Delhi", state: "Delhi",           category: "Historic",  photo: "https://images.unsplash.com/photo-1599420183985-e43e9e00f9ef?auto=format&fit=crop&w=120&q=60" },
  { name: "Humayun's Tomb",          city: "New Delhi", state: "Delhi",           category: "Historic",  photo: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=120&q=60" },
  { name: "Lotus Temple",            city: "New Delhi", state: "Delhi",           category: "Religious", photo: "https://images.unsplash.com/photo-1585490737634-89ae37f3a2f3?auto=format&fit=crop&w=120&q=60" },
  { name: "Jantar Mantar",           city: "New Delhi", state: "Delhi",           category: "Historic",  photo: "https://images.unsplash.com/photo-1624461386880-fd0c8e47534b?auto=format&fit=crop&w=120&q=60" },
  // Rajasthan
  { name: "Hawa Mahal",              city: "Jaipur",    state: "Rajasthan",       category: "Historic",  photo: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=120&q=60" },
  { name: "Amber Fort",              city: "Jaipur",    state: "Rajasthan",       category: "Historic",  photo: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=120&q=60" },
  { name: "City Palace",             city: "Jaipur",    state: "Rajasthan",       category: "Historic",  photo: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=120&q=60" },
  { name: "Nahargarh Fort",          city: "Jaipur",    state: "Rajasthan",       category: "Historic",  photo: "https://images.unsplash.com/photo-1610733038069-a862843e9ee6?auto=format&fit=crop&w=120&q=60" },
  { name: "Jal Mahal",               city: "Jaipur",    state: "Rajasthan",       category: "Historic",  photo: "https://images.unsplash.com/photo-1622397706988-d4c5e37aed46?auto=format&fit=crop&w=120&q=60" },
  // Maharashtra
  { name: "Gateway of India",        city: "Mumbai",    state: "Maharashtra",     category: "Monument",  photo: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=120&q=60" },
  { name: "Elephanta Caves",         city: "Mumbai",    state: "Maharashtra",     category: "Historic",  photo: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=120&q=60" },
  { name: "Marine Drive",            city: "Mumbai",    state: "Maharashtra",     category: "Natural",   photo: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=120&q=60" },
  { name: "Juhu Beach",              city: "Mumbai",    state: "Maharashtra",     category: "Natural",   photo: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=120&q=60" },
  // J&K
  { name: "Dal Lake",                city: "Srinagar",  state: "J&K",             category: "Natural",   photo: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=120&q=60" },
  { name: "Mughal Gardens",          city: "Srinagar",  state: "J&K",             category: "Natural",   photo: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=120&q=60" },
  { name: "Gulmarg Gondola",         city: "Gulmarg",   state: "J&K",             category: "Adventure", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=120&q=60" },
  // Himachal Pradesh
  { name: "Hadimba Temple",          city: "Manali",    state: "Himachal Pradesh",category: "Religious", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=120&q=60" },
  { name: "Solang Valley",           city: "Manali",    state: "Himachal Pradesh",category: "Adventure", photo: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=120&q=60" },
  { name: "Rohtang Pass",            city: "Manali",    state: "Himachal Pradesh",category: "Adventure", photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=60" },
  { name: "Old Manali",              city: "Manali",    state: "Himachal Pradesh",category: "Cultural",  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=120&q=60" },
  // West Bengal
  { name: "Victoria Memorial",       city: "Kolkata",   state: "West Bengal",     category: "Monument",  photo: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=120&q=60" },
  { name: "Howrah Bridge",           city: "Kolkata",   state: "West Bengal",     category: "Monument",  photo: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=120&q=60" },
  { name: "Sundarbans",              city: "South 24 Parganas", state: "West Bengal", category: "Natural", photo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=120&q=60" },
  // Telangana
  { name: "Charminar",               city: "Hyderabad", state: "Telangana",       category: "Historic",  photo: "https://images.unsplash.com/photo-1548195667-1f6a4e1dc46f?auto=format&fit=crop&w=120&q=60" },
  { name: "Golconda Fort",           city: "Hyderabad", state: "Telangana",       category: "Historic",  photo: "https://images.unsplash.com/photo-1548195667-1f6a4e1dc46f?auto=format&fit=crop&w=120&q=60" },
  { name: "Ramoji Film City",        city: "Hyderabad", state: "Telangana",       category: "Cultural",  photo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=120&q=60" },
  // Punjab
  { name: "Golden Temple",           city: "Amritsar",  state: "Punjab",          category: "Religious", photo: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=120&q=60" },
  { name: "Wagah Border",            city: "Amritsar",  state: "Punjab",          category: "Cultural",  photo: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=120&q=60" },
  { name: "Jallianwala Bagh",        city: "Amritsar",  state: "Punjab",          category: "Historic",  photo: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=120&q=60" },
  // Karnataka
  { name: "Mysore Palace",           city: "Mysore",    state: "Karnataka",       category: "Historic",  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=120&q=60" },
  { name: "Chamundi Hill",           city: "Mysore",    state: "Karnataka",       category: "Religious", photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=120&q=60" },
  { name: "Brindavan Gardens",       city: "Mysore",    state: "Karnataka",       category: "Natural",   photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=120&q=60" },
  // Kerala
  { name: "Backwaters",              city: "Alleppey",  state: "Kerala",          category: "Natural",   photo: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=120&q=60" },
  { name: "Alappuzha Beach",         city: "Alleppey",  state: "Kerala",          category: "Natural",   photo: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=120&q=60" },
  { name: "Marari Beach",            city: "Alleppey",  state: "Kerala",          category: "Resort",    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=60" },
  // Tamil Nadu
  { name: "Meenakshi Temple",        city: "Madurai",   state: "Tamil Nadu",      category: "Religious", photo: "https://images.unsplash.com/photo-1648470074665-571c1b62ba55?auto=format&fit=crop&w=120&q=60" },
  { name: "Ooty Lake",               city: "Ooty",      state: "Tamil Nadu",      category: "Natural",   photo: "https://images.unsplash.com/photo-1439853949212-36589f9f8b7c?auto=format&fit=crop&w=120&q=60" },
  { name: "Doddabetta Peak",         city: "Ooty",      state: "Tamil Nadu",      category: "Natural",   photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=60" },
  { name: "Ooty Toy Train",          city: "Ooty",      state: "Tamil Nadu",      category: "Cultural",  photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=60" },
];

// ── Extended Indian cities/tourist spots for generic fallback ─────────────────
const GENERIC_INDIA: string[] = [
  "Goa","Jaipur","Agra","Manali","Shimla","Darjeeling","Rishikesh","Haridwar",
  "Udaipur","Jodhpur","Jaisalmer","Pushkar","Ajmer","Kochi","Munnar",
  "Thiruvananthapuram","Coorg","Hampi","Badami","Puri","Bhubaneswar",
  "Konark","Leh","Ladakh","Spiti Valley","Kasol","Kufri","Dalhousie","Chail",
  "Mussoorie","Nainital","Jim Corbett","Chopta","Auli","Ranthambore","Bikaner",
  "Bundi","Varanasi","Lucknow","Allahabad","Ayodhya","Chitrakoot","Khajuraho",
  "Orchha","Bandhavgarh","Pachmarhi","Chennai","Mahabalipuram","Pondicherry",
  "Thanjavur","Kanyakumari","Varkala","Wayanad","Thrissur","Kovalam",
  "Bangalore","Chikmagalur","Udupi","Gokarna","Hyderabad","Warangal","Tirupati",
  "Pune","Aurangabad","Lonavala","Mahabaleshwar","Nashik","Ahmedabad","Surat",
  "Vadodara","Dwarka","Somnath","Gir Forest","Bhopal","Jabalpur","Sanchi",
  "Ujjain","Kolkata","Digha","Gangtok","Pelling","Lachung","Yumthang Valley",
  "Shillong","Cherrapunji","Mawlynnong","Kaziranga","Majuli","Tawang","Ziro",
  "Port Blair","Havelock Island","Neil Island","Diu","Daman","Chandigarh",
  "Patiala","Srinagar","Pahalgam","Sonamarg","Nubra Valley","Pangong Lake",
  "Tso Moriri","Kedarnath","Badrinath","Char Dham","Kanha","Satpura",
  "Kabini","Munsiyari","Dhanaulti","Chakrata","Lansdowne",
];

// ── Fuzzy scorer ─────────────────────────────────────────────────────────────
function fuzzyScore(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase().trim();
  if (n === q) return 100;
  if (n.startsWith(q)) return 90;
  if (n.includes(q)) return 75;
  const qTokens = q.split(/\s+/);
  const matched = qTokens.filter((t) => n.includes(t));
  if (matched.length === qTokens.length) return 60;
  if (matched.length > 0) return 40 + (matched.length / qTokens.length) * 20;
  return 0;
}

export interface AutocompleteSuggestion {
  label: string; sublabel: string; photo?: string; category?: string; isCurated: boolean;
}

function getSuggestions(query: string): AutocompleteSuggestion[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const curatedMatches = CURATED
    .map((d) => ({
      dest: d,
      score: Math.max(
        fuzzyScore(d.name, q),
        fuzzyScore(d.city, q) * 0.7,
        fuzzyScore(d.state, q) * 0.5,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ dest }): AutocompleteSuggestion => ({
      label: dest.name,
      sublabel: `${dest.city}, ${dest.state}`,
      photo: dest.photo,
      category: dest.category,
      isCurated: true,
    }));

  const curatedNames = new Set(curatedMatches.map((s) => s.label.toLowerCase()));
  const remaining = 7 - curatedMatches.length;

  const genericMatches: AutocompleteSuggestion[] = remaining > 0
    ? GENERIC_INDIA
        .filter((city) => {
          const c = city.toLowerCase();
          const ql = q.toLowerCase();
          return !curatedNames.has(c) && (c.includes(ql) || ql.includes(c.substring(0, 3)));
        })
        .slice(0, remaining)
        .map((city) => ({ label: city, sublabel: "India", isCurated: false }))
    : [];

  return [...curatedMatches, ...genericMatches];
}

// ── Category badge colours ────────────────────────────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Natural:   { bg: "#D1FAE5", text: "#065F46" },
  Adventure: { bg: "#EDE9FE", text: "#4C3DBA" },
  Cultural:  { bg: "#FFFBEB", text: "#92400E" },
  Religious: { bg: "#FEE2E2", text: "#991B1B" },
  Historic:  { bg: "#EEF2FF", text: "#3730A3" },
  Monument:  { bg: "#F3F4F6", text: "#374151" },
  Resort:    { bg: "#ECFDF5", text: "#047857" },
};

// ── Highlight matched text ────────────────────────────────────────────────────
function highlightMatch(label: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q || q.length < 2) return label;
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5 font-bold not-italic">
        {label.slice(idx, idx + q.length)}
      </mark>
      {label.slice(idx + q.length)}
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  /** Show magnifier icon inside input */
  showIcon?: boolean;
  /** "sm" | "md" | "lg" */
  size?: "sm" | "md" | "lg";
  /** Debounce delay in ms (default 300) */
  debounceMs?: number;
  /** Called on Enter or suggestion click — final confirmed value */
  onConfirm?: (value: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "Search destinations — Goa, Manali, Taj Mahal...",
  id,
  className = "",
  showIcon = true,
  size = "md",
  debounceMs = 300,
  onConfirm,
}: DestinationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce — only update debouncedQuery after user pauses typing
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebouncedQuery(value);
      setActiveIdx(-1);
    }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, debounceMs]);

  const suggestions = getSuggestions(debouncedQuery);
  const showDropdown = open && suggestions.length > 0;

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Scroll active row into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  function select(label: string) {
    onChange(label);
    setOpen(false);
    setActiveIdx(-1);
    onConfirm?.(label);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === "Enter") onConfirm?.(value);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIdx >= 0) { select(suggestions[activeIdx].label); }
        else { setOpen(false); onConfirm?.(value); }
        break;
      case "Escape":
        setOpen(false); setActiveIdx(-1);
        break;
    }
  }

  const padLeft = showIcon ? "pl-9" : "";
  const padRight = value ? "pr-9" : "";
  const sizeClass = { sm: "py-2.5 text-sm", md: "py-3 text-sm", lg: "py-3.5 text-[15px]" }[size];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        {showIcon && (
          <Search className="absolute left-3.5 w-4 h-4 text-[var(--color-muted)] pointer-events-none z-10" />
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? "dest-ac-list" : undefined}
          aria-activedescendant={activeIdx >= 0 ? `dest-ac-opt-${activeIdx}` : undefined}
          value={value}
          placeholder={placeholder}
          className={`w-full input-base font-medium ${sizeClass} ${padLeft} ${padRight}`}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIdx(-1); }}
          onFocus={() => { if (value.trim().length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={() => { onChange(""); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 z-10 p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="dest-ac-list"
          role="listbox"
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-[var(--color-border)] bg-white z-[999] overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(45,42,74,0.18), 0 2px 8px rgba(0,0,0,0.08)" }}
        >
          {/* Curated header */}
          {suggestions.some((s) => s.isCurated) && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                🗺️ Curated Destinations
              </span>
            </div>
          )}

          {suggestions.map((s, idx) => {
            const active = idx === activeIdx;
            const cat = s.category ? CAT_COLORS[s.category] : null;
            const prevCurated = idx > 0 ? suggestions[idx - 1].isCurated : true;
            const showGenericHdr = !s.isCurated && prevCurated;
            return (
              <div key={`${s.label}__${idx}`}>
                {showGenericHdr && (
                  <div className="px-3 pt-2 pb-1 border-t border-[var(--color-border)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                      📍 Other Places
                    </span>
                  </div>
                )}
                <button
                  id={`dest-ac-opt-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={active}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(s.label); }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${active ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-bg)]"}
                    ${idx < suggestions.length - 1 ? "border-b border-[var(--color-border)]/50" : ""}
                  `}
                >
                  {/* Thumbnail */}
                  {s.photo ? (
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                      <img src={s.photo} alt={s.label} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg)] flex items-center justify-center flex-shrink-0 ring-1 ring-[var(--color-border)]">
                      <MapPin className="w-4 h-4 text-[var(--color-muted)]" />
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-[var(--color-coral)]" : "text-[var(--color-text)]"}`}>
                      {highlightMatch(s.label, debouncedQuery)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] truncate">{s.sublabel}</p>
                  </div>

                  {/* Category badge */}
                  {cat && s.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cat.bg, color: cat.text }}>
                      {s.category}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Keyboard hint footer */}
          <div className="px-3 py-2 border-t border-[var(--color-border)] flex items-center gap-1.5 bg-[var(--color-bg)]/50">
            <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-[var(--color-border-mid)] text-[var(--color-muted)]">↑↓</kbd>
            <span className="text-[10px] text-[var(--color-muted)]">navigate</span>
            <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-[var(--color-border-mid)] text-[var(--color-muted)] ml-1">↵</kbd>
            <span className="text-[10px] text-[var(--color-muted)]">select</span>
            <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-[var(--color-border-mid)] text-[var(--color-muted)] ml-1">Esc</kbd>
            <span className="text-[10px] text-[var(--color-muted)]">close</span>
          </div>
        </div>
      )}
    </div>
  );
}
