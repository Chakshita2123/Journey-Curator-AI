# ✈️ Journey Curator AI

**Journey Curator AI** is a full-stack, machine learning and LLM-powered travel intelligence platform. It predicts exact trip costs using trained ML pipelines, classifies user travel personas, recommends curated destinations, and generates personalized day-by-day travel itineraries.

Built with **Next.js 15**, **React 19**, **TailwindCSS v4**, **Framer Motion**, **Python FastAPI**, **XGBoost**, **Scikit-learn**, and a **Dual Gemini / Groq LLM Fallback Provider**.

---

## 🌐 Scope & Roadmap

- **Cost Predictor:** Supports global destinations worldwide (trained on global travel datasets covering 138 global routes & major travel hubs).
- **Destination Recommendations, Map & Discover:** Currently focus on India (13,000-record dataset, 74 curated destinations, 18 featured map pins) with architecture designed for global expansion in a future phase.

---

## 🎨 Design & Aesthetic System

The platform features a modern tech product aesthetic inspired by Linear and Notion, built around an elevated 3-accent color palette:
- **Canvas Background:** `#F4F2FA` (Subtle lavender-grey)
- **Headings & Primary Text:** `#2D2A4A` (Deep indigo)
- **Primary Accent:** `#6C5CE7` (Indigo-violet)
- **Secondary Accent:** `#00B894` (Emerald teal)
- **Highlight Accent:** `#FF9776` (Warm sunset peach)

### 3D & Animation Highlights
- **Interactive 3D Tilt Cards (`TiltCard`)**: Perspective cursor tracking tilt up to 8° with double-layer soft shadows.
- **Sheen Sweep Buttons (`btn-shimmer`)**: Diagonal sheen sweep across raised soft-3D pill buttons on hover.
- **Animated Gradient Mesh (`animate-mesh`)**: Multi-layered background blobs moving in slow ambient motion.
- **Cursor Glow (`CursorGlow`)**: Soft blurred ambient follower tracking mouse coordinates.
- **Scroll Storytelling (`CountUpNumber`)**: Key statistics count up dynamically from 0 on scroll into view.

---

## 📊 Complete Phase Breakdown & Methodology

### Phase 1 — Trip Cost Predictor (ML Model)
Trained on `data/Travel details dataset.csv` across global destinations (Paris, Tokyo, Bali, Rio, Sydney, New York, etc.) to estimate total trip cost based on destination, duration, accommodation, transport, travel style, season, and demographics.

#### Model Performance Comparison (80/20 Train/Test Split)
| Model | RMSE | MAE | R² Accuracy |
| :--- | :--- | :--- | :--- |
| Linear Regression | $550.14 | $451.67 | 0.8586 |
| Random Forest Regressor | $455.30 | $272.90 | 0.9031 |
| **XGBoost Regressor ★** | **$348.45** | **$223.89** | **0.9433** |

*5-fold Cross-Validation Mean R²:* `0.7174 ± 0.3471`.

> ⚠️ **Small-Dataset Disclosure:** The training dataset consists of 138 curated global trip records. While the XGBoost model achieves an R² of 0.94 within the trained feature space, predictions for highly atypical or rare route combinations rely on tree feature interpolations.

---

### Phase 2 — Next.js 15 App Architecture & UI Polish
- Built with Next.js 15 App Router, React 19, and TailwindCSS v4 `@theme` design tokens.
- Complete client-side Next.js API proxy routes (`/api/predict-cost`, `/api/predict-persona`, `/api/recommend-destinations`, `/api/generate-itinerary`) for secure backend communication and CORS management.

---

### Phase 3 — Travel Persona Classifier
Classifies travelers into 1 of 5 distinct travel personas based on 6 key preference vectors (scale 1–5):
1. `nature_vs_nightlife`
2. `budget_vs_luxury`
3. `activity_level`
4. `food_preference`
5. `travel_pace`
6. `cultural_depth`

#### 5 Travel Personas
- **Adventurer** 🧗
- **Relaxed Vacationer** 🏖️
- **Culture & Food Explorer** 🎨
- **Budget Backpacker** 🎒
- **Luxury Wellness Seeker** 👑

#### Model Metrics & Synthetic Dataset Disclosure
Due to the absence of a publicly available labeled traveler-persona dataset, a 3,000-row preference dataset was generated using domain-engineered **heuristic scoring functions** with a 4% random noise mask to simulate human decision variance.

| Model | Test Accuracy | Weighted F1 | 5-Fold CV Mean F1 |
| :--- | :--- | :--- | :--- |
| **RandomForestClassifier ★** | **97.83%** | **0.9782** | **0.9754 ± 0.0051** |
| LogisticRegression | 95.83% | 0.9582 | 0.9550 ± 0.0062 |

---

### Phase 4 — Content-Based Destination Recommender
Matches travel personas to optimal destinations using **Cosine Similarity** across a 6-dimensional feature vector (budget level, rating, weather suitability, travel type alignment, category encoding, and season).

#### Dataset & Schema Integration Story
- **Dataset:** `data/indian_tourist_places_dataset.csv` (13,000+ tourist spots).
- **Corpus Coverage:** 74 curated destinations across 12 states with coordinates, ratings, entry fees, and travel categories.
- **Globally Extensible Architecture:** Architected to seamlessly ingest global destination datasets by passing normalized feature vectors into the vector matcher.
- **Schema Mapping Resolution:** Resolved schema mismatch during integration by mapping dataset columns (`Rating`, `Entry_Fee_INR`, `Latitude`, `Longitude`) safely to Pydantic FastAPI models.

---

### Phase 5 — AI Day-by-Day Itinerary Generator
Generates structured day-by-day travel plans incorporating predicted cost insights, budget optimization tips, travel persona intelligence, and recommended attractions.

#### Dual LLM Fallback Provider Setup
1. **Primary Provider:** Google Gemini API (`gemini-1.5-flash`).
2. **Secondary Fallback:** Groq API (`llama-3.3-70b-versatile`).
- **Resilience:** If Gemini hits rate limits (`429`) or quota errors, the backend automatically fails over to Groq without user disruption.
- **Interactive Tweak:** Supports quick follow-up prompt modifications (e.g., *"Make Day 2 more relaxed with a local cafe visit"*).

---

### Phase 6 — Polish, Error Resilience & Edge Cases

- **Universal Loading States:** All async actions render `<LoadingStateCard message="..." />` with pulsing skeletons and animated compass icons to guarantee zero blank or frozen screens.
- **Friendly Error Handling:** Failed API requests render a friendly `<ErrorStateCard>` with clear explanations and a prominent **"🔄 Try Again"** button (`onRetry`).
- **Input Sanitization & Validation:**
  - Destination names truncated/sanitized to <= 100 characters.
  - Duration clamped between 1 and 365 days.
  - Group size clamped between 1 and 50 people.
  - Negative budgets or invalid inputs automatically sanitized before payload dispatch.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS v4, Framer Motion, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | XGBoost, Scikit-learn, Pandas, NumPy, Joblib |
| **LLM Integration** | Google Gemini API (`gemini-1.5-flash`), Groq API (`llama-3.3-70b`) |

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 2. Environment Setup

Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start FastAPI Backend

```bash
# Install Python dependencies
pip install fastapi uvicorn xgboost scikit-learn pandas numpy joblib google-genai groq python-dotenv

# Run Uvicorn backend server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```

### 4. Start Next.js Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Run Next.js dev server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `POST /predict-cost` | `POST` | Returns ML cost prediction & savings suggestions |
| `POST /predict-persona` | `POST` | Returns ML travel persona classification & affinity breakdown |
| `POST /recommend-destinations` | `POST` | Returns cosine similarity destination matches |
| `POST /generate-itinerary` | `POST` | Generates LLM day-by-day itinerary (Gemini + Groq fallback) |
| `GET /recommender-stats` | `GET` | Returns corpus statistics for recommender engine |

---

## ⚠️ Known Limitations

1. **Cost Predictor Training Size:** The Cost Predictor dataset contains ~138 historical records. While XGBoost achieves `R² = 0.94` on in-domain inputs, unusual custom trip inputs rely on feature tree interpolation.
2. **Persona Synthetic Dataset:** Persona Classifier training data is synthetically labeled using domain-engineered heuristics.
3. **Recommender Initial Scope:** Initial destination corpus comprises 13,000+ Indian tourist places; adding global destinations requires appending regional datasets into the feature pipeline.
