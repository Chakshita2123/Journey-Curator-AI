"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { MapPin, Search, X } from "lucide-react";

import { getVerifiedDestinationImage } from "@/data/destinationImages";

export interface CuratedDestination {
  name: string; city: string; state: string; category: string; photo?: string;
}

const CURATED: CuratedDestination[] = [
  // Uttar Pradesh
  { name: "Taj Mahal",               city: "Agra",      state: "Uttar Pradesh",   category: "Historic" },
  { name: "Sarnath",                 city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious" },
  { name: "Varanasi Ghats",          city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious" },
  { name: "Kashi Vishwanath Temple", city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious" },
  { name: "Durgakund Temple",          city: "Varanasi",  state: "Uttar Pradesh",   category: "Religious" },
  { name: "Ramnagar Fort",           city: "Varanasi",  state: "Uttar Pradesh",   category: "Historic" },
  { name: "Vrindavan",               city: "Mathura",   state: "Uttar Pradesh",   category: "Religious" },
  { name: "Mathura",                 city: "Mathura",   state: "Uttar Pradesh",   category: "Religious" },
  // Delhi
  { name: "India Gate",              city: "New Delhi", state: "Delhi",           category: "Monument" },
  { name: "Red Fort",                city: "Old Delhi", state: "Delhi",           category: "Historic" },
  { name: "Humayun's Tomb",          city: "New Delhi", state: "Delhi",           category: "Historic" },
  { name: "Lotus Temple",            city: "New Delhi", state: "Delhi",           category: "Religious" },
  { name: "Jantar Mantar",           city: "New Delhi", state: "Delhi",           category: "Historic" },
  { name: "Qutub Minar",             city: "New Delhi", state: "Delhi",           category: "Historic" },
  // Rajasthan
  { name: "Hawa Mahal",              city: "Jaipur",    state: "Rajasthan",       category: "Historic" },
  { name: "Amber Fort",              city: "Jaipur",    state: "Rajasthan",       category: "Historic" },
  { name: "City Palace",             city: "Jaipur",    state: "Rajasthan",       category: "Historic" },
  { name: "Nahargarh Fort",          city: "Jaipur",    state: "Rajasthan",       category: "Historic" },
  { name: "Jal Mahal",               city: "Jaipur",    state: "Rajasthan",       category: "Historic" },
  // Maharashtra
  { name: "Gateway of India",        city: "Mumbai",    state: "Maharashtra",     category: "Monument" },
  { name: "Elephanta Caves",         city: "Mumbai",    state: "Maharashtra",     category: "Historic" },
  { name: "Marine Drive",            city: "Mumbai",    state: "Maharashtra",     category: "Natural" },
  { name: "Juhu Beach",              city: "Mumbai",    state: "Maharashtra",     category: "Natural" },
  { name: "Siddhivinayak Temple",    city: "Mumbai",    state: "Maharashtra",     category: "Religious" },
  { name: "Chhatrapati Shivaji Museum", city: "Mumbai", state: "Maharashtra",     category: "Cultural" },
  // J&K
  { name: "Dal Lake",                city: "Srinagar",  state: "J&K",             category: "Natural" },
  { name: "Mughal Gardens",          city: "Srinagar",  state: "J&K",             category: "Natural" },
  { name: "Hazratbal Shrine",        city: "Srinagar",  state: "J&K",             category: "Religious" },
  { name: "Shankaracharya Temple",   city: "Srinagar",  state: "J&K",             category: "Religious" },
  { name: "Pari Mahal",              city: "Srinagar",  state: "J&K",             category: "Historic" },
  { name: "Gulmarg Gondola",         city: "Gulmarg",   state: "J&K",             category: "Adventure" },
  // Himachal Pradesh
  { name: "Hadimba Temple",          city: "Manali",    state: "Himachal Pradesh",category: "Religious" },
  { name: "Beas River",              city: "Manali",    state: "Himachal Pradesh",category: "Natural" },
  { name: "Solang Valley",           city: "Manali",    state: "Himachal Pradesh",category: "Adventure" },
  { name: "Rohtang Pass",            city: "Manali",    state: "Himachal Pradesh",category: "Adventure" },
  { name: "Old Manali",              city: "Manali",    state: "Himachal Pradesh",category: "Cultural" },
  // West Bengal
  { name: "Victoria Memorial",       city: "Kolkata",   state: "West Bengal",     category: "Monument" },
  { name: "Howrah Bridge",           city: "Kolkata",   state: "West Bengal",     category: "Monument" },
  { name: "Indian Museum",           city: "Kolkata",   state: "West Bengal",     category: "Cultural" },
  { name: "Science City",            city: "Kolkata",   state: "West Bengal",     category: "Cultural" },
  { name: "Dakshineswar Kali Temple", city: "Kolkata",  state: "West Bengal",     category: "Religious" },
  { name: "Sundarbans",              city: "South 24 Parganas", state: "West Bengal", category: "Natural" },
  // Telangana
  { name: "Charminar",               city: "Hyderabad", state: "Telangana",       category: "Historic" },
  { name: "Golconda Fort",           city: "Hyderabad", state: "Telangana",       category: "Historic" },
  { name: "Ramoji Film City",        city: "Hyderabad", state: "Telangana",       category: "Cultural" },
  { name: "Salar Jung Museum",       city: "Hyderabad", state: "Telangana",       category: "Cultural" },
  { name: "Birla Mandir",            city: "Hyderabad", state: "Telangana",       category: "Religious" },
  // Punjab
  { name: "Golden Temple",           city: "Amritsar",  state: "Punjab",          category: "Religious" },
  { name: "Wagah Border",            city: "Amritsar",  state: "Punjab",          category: "Cultural" },
  { name: "Jallianwala Bagh",        city: "Amritsar",  state: "Punjab",          category: "Historic" },
  { name: "Durgiana Temple",         city: "Amritsar",  state: "Punjab",          category: "Religious" },
  { name: "Partition Museum",        city: "Amritsar",  state: "Punjab",          category: "Cultural" },
  // Karnataka
  { name: "Mysore Palace",           city: "Mysore",    state: "Karnataka",       category: "Historic" },
  { name: "Chamundi Hill",           city: "Mysore",    state: "Karnataka",       category: "Religious" },
  { name: "Mysore Zoo",              city: "Mysore",    state: "Karnataka",       category: "Natural" },
  { name: "Karanji Lake",            city: "Mysore",    state: "Karnataka",       category: "Natural" },
  { name: "Brindavan Gardens",       city: "Mysore",    state: "Karnataka",       category: "Natural" },
  { name: "St. Philomena's Church",  city: "Mysore",    state: "Karnataka",       category: "Religious" },
  // Kerala
  { name: "Backwaters",              city: "Alleppey",  state: "Kerala",          category: "Natural" },
  { name: "Alappuzha Beach",         city: "Alleppey",  state: "Kerala",          category: "Natural" },
  { name: "Marari Beach",            city: "Alleppey",  state: "Kerala",          category: "Resort" },
  { name: "Krishnapuram Palace",     city: "Alleppey",  state: "Kerala",          category: "Historic" },
  // Tamil Nadu
  { name: "Meenakshi Temple",        city: "Madurai",   state: "Tamil Nadu",      category: "Religious" },
  { name: "Gandhi Museum",           city: "Madurai",   state: "Tamil Nadu",      category: "Cultural" },
  { name: "Samanar Hills",           city: "Madurai",   state: "Tamil Nadu",      category: "Natural" },
  { name: "Thirumalai Nayakkar Palace", city: "Madurai", state: "Tamil Nadu",     category: "Historic" },
  { name: "Koodal Azhagar Temple",   city: "Madurai",   state: "Tamil Nadu",      category: "Religious" },
  { name: "Ooty Lake",               city: "Ooty",      state: "Tamil Nadu",      category: "Natural" },
  { name: "Doddabetta Peak",         city: "Ooty",      state: "Tamil Nadu",      category: "Natural" },
  { name: "Rose Garden",             city: "Ooty",      state: "Tamil Nadu",      category: "Natural" },
  { name: "Botanical Garden",        city: "Ooty",      state: "Tamil Nadu",      category: "Natural" },
  { name: "Emerald Lake",            city: "Ooty",      state: "Tamil Nadu",      category: "Natural" },
  { name: "Ooty Toy Train",          city: "Ooty",      state: "Tamil Nadu",      category: "Cultural" },
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
      photo: getVerifiedDestinationImage(dest.name, dest.category),
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
        .map((city) => ({
          label: city,
          sublabel: "India",
          photo: getVerifiedDestinationImage(city),
          isCurated: false,
        }))
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
