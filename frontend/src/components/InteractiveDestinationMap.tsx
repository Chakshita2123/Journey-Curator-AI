"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapPin, Star, Compass, Tag, Sparkles, Navigation, ArrowRight, X, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "@/components/motion";
import Link from "next/link";

export interface MapDestination {
  id: string;
  name: string;
  city: string;
  state: string;
  category: "Historic" | "Natural" | "Religious" | "Cultural" | "Adventure";
  rating: number;
  entryFee: string;
  lat: number;
  lng: number;
  flag: string;
  bestSeason: string;
  travelType: string;
  description: string;
}

const DESTINATIONS: MapDestination[] = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Historic",
    rating: 4.9,
    entryFee: "₹250",
    lat: 27.172633,
    lng: 78.044633,
    flag: "🕌",
    bestSeason: "Oct - Mar",
    travelType: "Couple & Family",
    description: "UNESCO World Heritage marble mausoleum and iconic symbol of eternal love built by Emperor Shah Jahan.",
  },
  {
    id: "hawa-mahal",
    name: "Hawa Mahal",
    city: "Jaipur",
    state: "Rajasthan",
    category: "Historic",
    rating: 4.5,
    entryFee: "₹75",
    lat: 26.925533,
    lng: 75.828842,
    flag: "🏰",
    bestSeason: "Nov - Feb",
    travelType: "Culture & Solo",
    description: "The Palace of Winds features 953 honeycombed jharokhas (windows) designed for royal women to observe street life.",
  },
  {
    id: "india-gate",
    name: "India Gate",
    city: "Delhi",
    state: "Delhi",
    category: "Historic",
    rating: 5.0,
    entryFee: "Free",
    lat: 28.614239,
    lng: 77.23296,
    flag: "🏛️",
    bestSeason: "Oct - Mar",
    travelType: "Family & Friends",
    description: "Majestic 42m war memorial archway surrounded by lush lawns and vibrant evening food stalls.",
  },
  {
    id: "mughal-gardens",
    name: "Dal Lake & Gardens",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    category: "Natural",
    rating: 4.8,
    entryFee: "Free",
    lat: 34.121399,
    lng: 74.86692,
    flag: "🚣",
    bestSeason: "May - Sep",
    travelType: "Honeymoon & Nature",
    description: "Shikara rides on serene Dal Lake surrounded by snow-capped Zabarwan mountains and terraced Mughal gardens.",
  },
  {
    id: "victoria-memorial",
    name: "Victoria Memorial",
    city: "Kolkata",
    state: "West Bengal",
    category: "Historic",
    rating: 4.6,
    entryFee: "₹30",
    lat: 22.547106,
    lng: 88.342383,
    flag: "🏛️",
    bestSeason: "Oct - Feb",
    travelType: "History & Art",
    description: "Grand white marble museum building nestled within 64 acres of landscaped gardens and reflecting pools.",
  },
  {
    id: "meenakshi-temple",
    name: "Meenakshi Temple",
    city: "Madurai",
    state: "Tamil Nadu",
    category: "Religious",
    rating: 4.9,
    entryFee: "₹50",
    lat: 9.919018,
    lng: 78.120913,
    flag: "🛕",
    bestSeason: "Oct - Mar",
    travelType: "Cultural & Pilgrimage",
    description: "Dravidian architectural wonder adorned with 14 towering gopurams featuring thousands of colorful deity sculptures.",
  },
  {
    id: "elephanta-caves",
    name: "Elephanta Caves",
    city: "Mumbai",
    state: "Maharashtra",
    category: "Historic",
    rating: 4.2,
    entryFee: "₹75",
    lat: 18.96082,
    lng: 72.934038,
    flag: "🗿",
    bestSeason: "Nov - Mar",
    travelType: "History & Day Trip",
    description: "5th-century rock-cut cave temples dedicated to Lord Shiva, accessible via a ferry ride from Gateway of India.",
  },
  {
    id: "ooty-lake",
    name: "Ooty Lake & Hills",
    city: "Ooty",
    state: "Tamil Nadu",
    category: "Natural",
    rating: 4.3,
    entryFee: "₹40",
    lat: 11.410666,
    lng: 76.69164,
    flag: "🌲",
    bestSeason: "Oct - Jun",
    travelType: "Relaxation & Nature",
    description: "Artificial mountain lake surrounded by Nilgiri eucalyptus trees, boating docks, and misty tea plantations.",
  },
  {
    id: "ramoji-film-city",
    name: "Ramoji Film City",
    city: "Hyderabad",
    state: "Telangana",
    category: "Cultural",
    rating: 4.8,
    entryFee: "₹1,350",
    lat: 17.254139,
    lng: 78.679795,
    flag: "🎬",
    bestSeason: "Oct - Feb",
    travelType: "Family & Entertainment",
    description: "World's largest film studio complex featuring movie sets, amusement rides, and live stunt performances.",
  },
  {
    id: "karanji-lake",
    name: "Karanji Lake & Aviary",
    city: "Mysore",
    state: "Karnataka",
    category: "Natural",
    rating: 4.5,
    entryFee: "₹50",
    lat: 12.297936,
    lng: 76.649413,
    flag: "🦚",
    bestSeason: "Sep - Feb",
    travelType: "Bird Watching & Eco",
    description: "Picturesque lake housing India's largest walk-through aviary, butterfly park, and serene rowing boats.",
  },
  {
    id: "golden-temple",
    name: "Golden Temple",
    city: "Amritsar",
    state: "Punjab",
    category: "Religious",
    rating: 4.9,
    entryFee: "Free",
    lat: 31.61998,
    lng: 74.876485,
    flag: "🛕",
    bestSeason: "Oct - Mar",
    travelType: "Spiritual & Cultural",
    description: "The holiest Sikh Gurdwara gilded with pure gold, famed for its tranquil Amrit Sarovar lake and 24/7 free community kitchen.",
  },
  {
    id: "calangute-beach",
    name: "Calangute Beach",
    city: "North Goa",
    state: "Goa",
    category: "Natural",
    rating: 4.6,
    entryFee: "Free",
    lat: 15.5437,
    lng: 73.7553,
    flag: "🏖️",
    bestSeason: "Nov - Apr",
    travelType: "Beach & Nightlife",
    description: "'Queen of Beaches' known for golden sands, parasailing, seaside shacks, and vibrant coastal sunset vibes.",
  },
  {
    id: "solang-valley",
    name: "Solang Valley",
    city: "Manali",
    state: "Himachal Pradesh",
    category: "Adventure",
    rating: 4.8,
    entryFee: "Free",
    lat: 32.3163,
    lng: 77.1575,
    flag: "🏔️",
    bestSeason: "Oct - May",
    travelType: "Adventure & Snow",
    description: "High-altitude mountain valley famous for paragliding, skiing, zorbing, and breathtaking views of Himalayan peaks.",
  },
  {
    id: "alleppey-backwaters",
    name: "Alleppey Backwaters",
    city: "Alleppey",
    state: "Kerala",
    category: "Natural",
    rating: 4.9,
    entryFee: "Free",
    lat: 9.4981,
    lng: 76.3388,
    flag: "🌴",
    bestSeason: "Sep - Mar",
    travelType: "Wellness & Cruise",
    description: "Network of tranquil lagoons, paddy fields, and coconut palm groves best explored on a private traditional houseboat.",
  },
  {
    id: "kaziranga",
    name: "Kaziranga Park",
    city: "Golaghat",
    state: "Assam",
    category: "Natural",
    rating: 4.7,
    entryFee: "₹100",
    lat: 26.5775,
    lng: 93.1711,
    flag: "🦏",
    bestSeason: "Nov - Apr",
    travelType: "Wildlife & Safari",
    description: "UNESCO World Heritage park sanctuary hosting two-thirds of the world's great one-horned rhinoceroses.",
  },
  {
    id: "sun-temple-konark",
    name: "Sun Temple Konark",
    city: "Konark",
    state: "Odisha",
    category: "Historic",
    rating: 4.7,
    entryFee: "₹40",
    lat: 19.8876,
    lng: 86.0945,
    flag: "☀️",
    bestSeason: "Oct - Mar",
    travelType: "Architecture & History",
    description: "13th-century monument conceived as a giant stone chariot for the Sun God Surya, complete with 24 carved wheels.",
  },
  {
    id: "ajanta-caves",
    name: "Ajanta Caves",
    city: "Aurangabad",
    state: "Maharashtra",
    category: "Historic",
    rating: 4.8,
    entryFee: "₹40",
    lat: 20.5519,
    lng: 75.7033,
    flag: "🎨",
    bestSeason: "Oct - Mar",
    travelType: "Art & Heritage",
    description: "30 rock-cut Buddhist cave monuments housing masterwork ancient murals and frescoes dating back to 2nd century BCE.",
  },
  {
    id: "ranthambore-fort",
    name: "Ranthambore Fort",
    city: "Sawai Madhopur",
    state: "Rajasthan",
    category: "Adventure",
    rating: 4.6,
    entryFee: "₹100",
    lat: 26.0173,
    lng: 76.4529,
    flag: "🐅",
    bestSeason: "Oct - Jun",
    travelType: "Safari & Adventure",
    description: "Historic hill fort set inside a tiger reserve, offering panoramic wildlife vistas and ancient ruined temples.",
  },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Historic:  { bg: "#EEECFC", text: "#6C5CE7", dot: "#6C5CE7", border: "#A29BFE" },
  Natural:   { bg: "#E6F8F4", text: "#008F73", dot: "#00B894", border: "#55EFC4" },
  Religious: { bg: "#FFF0EB", text: "#E05A36", dot: "#FF9776", border: "#FF9776" },
  Cultural:  { bg: "#F3E8FF", text: "#7E22CE", dot: "#A855F7", border: "#C084FC" },
  Adventure: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B", border: "#FCD34D" },
};

function loadLeafletScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");

    if ((window as any).L) {
      return resolve((window as any).L);
    }

    if (!document.getElementById("leaflet-cdn-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-cdn-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById("leaflet-cdn-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve((window as any).L));
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-cdn-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

export default function InteractiveDestinationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  // Filtered destinations based on category
  const filteredDestinations = useMemo(() => {
    return selectedCategory === "All"
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const selectedDest = filteredDestinations[currentIndex] ?? filteredDestinations[0] ?? null;

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    let isSubscribed = true;

    loadLeafletScript()
      .then((L) => {
        if (!isSubscribed || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [22.5937, 78.9629],
          zoom: 5,
          zoomControl: false,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
        setLeafletLib(L);
        setIsLoaded(true);
      })
      .catch((err) => console.error("Failed to load Leaflet script", err));

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Auto-Rotation Timer Loop (every 4.5 seconds)
  useEffect(() => {
    if (!isAutoRotating || filteredDestinations.length === 0 || !isLoaded) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % filteredDestinations.length;
        const nextDest = filteredDestinations[nextIndex];

        if (mapInstanceRef.current && nextDest) {
          mapInstanceRef.current.flyTo([nextDest.lat, nextDest.lng], 6.5, {
            duration: 1.2,
          });
        }
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoRotating, filteredDestinations, isLoaded]);

  // Update Markers & Active Pin Pulsing
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !leafletLib) return;

    const L = leafletLib;
    const map = mapInstanceRef.current;

    // Clear existing markers map
    markersMapRef.current.forEach((m) => m.remove());
    markersMapRef.current.clear();

    filteredDestinations.forEach((dest, idx) => {
      const isActive = dest.id === selectedDest?.id;
      const catStyle = CATEGORY_STYLES[dest.category] ?? CATEGORY_STYLES.Historic;

      // Active Pin scale-up & glowing pulse ring vs Normal Pin
      const pinHtml = isActive
        ? `
          <div class="relative group cursor-pointer transition-all duration-300 scale-135 z-30" style="width: 44px; height: 44px;">
            <div class="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${catStyle.dot};"></div>
            <div class="relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-base shadow-2xl border-3 border-white ring-4 ring-[#6C5CE7]/40" style="background: ${catStyle.bg}; border-color: ${catStyle.border};">
              <span>${dest.flag}</span>
            </div>
          </div>
        `
        : `
          <div class="relative group cursor-pointer transition-all duration-300 hover:scale-125 opacity-80 hover:opacity-100" style="width: 34px; height: 34px;">
            <div class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white" style="background: ${catStyle.bg}; border-color: ${catStyle.border};">
              <span>${dest.flag}</span>
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        iconSize: isActive ? [44, 44] : [34, 34],
        iconAnchor: isActive ? [22, 44] : [17, 34],
        popupAnchor: [0, -32],
        html: pinHtml,
      });

      const marker = L.marker([dest.lat, dest.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div class="p-3 w-56 font-sans">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:${catStyle.bg}; color:${catStyle.text};">
              ${dest.category}
            </span>
            <span class="text-xs font-bold text-[#E05A36] flex items-center gap-0.5">
              ★ ${dest.rating}
            </span>
          </div>
          <p class="font-bold text-sm text-[#2D2A4A] leading-snug">${dest.flag} ${dest.name}</p>
          <p class="text-xs text-[#6E6B8E] mt-0.5">${dest.city}, ${dest.state}</p>
          <div class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span class="text-[#6E6B8E] font-medium">Entry: <strong class="text-[#2D2A4A]">${dest.entryFee}</strong></span>
            <span class="text-[#6C5CE7] font-semibold">View details →</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
      });

      marker.on("mouseover", () => marker.openPopup());
      marker.on("mouseout", () => marker.closePopup());

      // Manual Click pauses auto-rotation & updates active index
      marker.on("click", () => {
        setIsAutoRotating(false);
        setCurrentIndex(idx);
        map.flyTo([dest.lat, dest.lng], 6.5, { duration: 1.2 });
      });

      markersMapRef.current.set(dest.id, marker);
    });
  }, [selectedCategory, currentIndex, selectedDest, isLoaded, leafletLib, filteredDestinations]);

  const categories = ["All", "Historic", "Natural", "Religious", "Cultural", "Adventure"];

  return (
    <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3.5 py-1 rounded-full bg-[#EEECFC] text-[#6C5CE7] mb-3 border border-[#6C5CE7]/20 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-[#6C5CE7]" />
          Phase 4 Recommender Dataset · 18 Featured Spots
        </span>
        <h2 className="font-heading font-800 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
          Explore India on the <span className="coral-text">Interactive Map</span>
        </h2>
        <p className="text-[var(--color-muted)] max-w-lg mx-auto font-medium text-sm leading-relaxed">
          Hover over map pins to discover top-rated destinations. Auto-rotating showcase cycles through all featured spots (click any pin to pause and explore).
        </p>
      </motion.div>

      {/* Filter Tabs & Auto-Play Status Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setIsAutoRotating(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#6C5CE7] text-white shadow-coral"
                    : "bg-white text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] shadow-xs hover:border-[var(--color-coral-mid)]"
                }`}
              >
                {cat === "All" && "🌐 All Places"}
                {cat === "Historic" && "🏰 Historic"}
                {cat === "Natural" && "🌲 Natural"}
                {cat === "Religious" && "🛕 Religious"}
                {cat === "Cultural" && "🎭 Cultural"}
                {cat === "Adventure" && "🏔️ Adventure"}
              </button>
            );
          })}
        </div>

        {/* Auto-Play Toggle Controls */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border ${
            isAutoRotating
              ? "bg-[#E6F8F4] text-[#008F73] border-[#55EFC4]/50 hover:bg-[#d0f3eb]"
              : "bg-[#FFF0EB] text-[#E05A36] border-[#FF9776]/50 hover:bg-[#ffe3da]"
          }`}
        >
          {isAutoRotating ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-[#008F73] text-[#008F73]" />
              <span>Auto-Play Active (Pause)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#E05A36] text-[#E05A36]" />
              <span>Resume Auto-Play</span>
            </>
          )}
        </button>
      </div>

      {/* Main Map Wrapper Container */}
      <div className="card p-3 md:p-4 rounded-3xl border border-[var(--color-border)] shadow-soft relative overflow-hidden bg-white">
        <div
          ref={mapContainerRef}
          className="w-full h-[450px] md:h-[490px] rounded-2xl z-10"
        />

        {/* Selected Pin Info Card with Smooth Fade + Slide Animation */}
        <AnimatePresence mode="wait">
          {selectedDest && (
            <motion.div
              key={selectedDest.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-md z-20 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-border-mid)] shadow-coral"
            >
              <button
                onClick={() => setIsAutoRotating(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
                title="Pause Auto-Rotation"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3">
                <div className="text-3xl p-2.5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] shrink-0">
                  {selectedDest.flag}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: CATEGORY_STYLES[selectedDest.category]?.bg ?? "#EEECFC",
                        color: CATEGORY_STYLES[selectedDest.category]?.text ?? "#6C5CE7",
                      }}
                    >
                      {selectedDest.category}
                    </span>
                    <span className="text-xs font-bold text-[#E05A36] flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#FF9776] text-[#E05A36]" /> {selectedDest.rating}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--color-muted)] ml-auto">
                      {currentIndex + 1} of {filteredDestinations.length}
                    </span>
                  </div>
                  <h3 className="font-heading font-700 text-lg text-[var(--color-text)] leading-tight">
                    {selectedDest.name}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] font-medium">
                    {selectedDest.city}, {selectedDest.state}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--color-muted)] mt-3 leading-relaxed font-medium line-clamp-2">
                {selectedDest.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--color-border)] text-xs">
                <div>
                  <span className="text-[var(--color-muted)] block text-[10px] uppercase tracking-wider font-semibold">Entry Fee</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedDest.entryFee}</span>
                </div>
                <div>
                  <span className="text-[var(--color-muted)] block text-[10px] uppercase tracking-wider font-semibold">Best Season</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedDest.bestSeason}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[var(--color-teal-dark)] font-semibold bg-[var(--color-teal-light)] px-2.5 py-1 rounded-lg">
                  {selectedDest.travelType}
                </span>
                <Link
                  href={`/predict?destination=${encodeURIComponent(selectedDest.name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white btn-3d-primary shadow-xs"
                >
                  Plan Trip Here
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
