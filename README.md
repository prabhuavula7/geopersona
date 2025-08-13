# 🌍 GeoPersona

**GeoPersona** is an interactive, AI-powered geography guessing game where players must pinpoint fictional characters' locations on a world map using AI-generated clues. It's like *GeoGuessr* meets *AI storytelling* with a sophisticated city selection engine.

---

## 🎮 **Game Overview**

- **🎭 AI-Persona Clues**: AI generates unique character profiles with location-specific hints
- **🗺️ Interactive World Map**: Click-to-guess gameplay with Leaflet.js integration
- **📈 Smart Scoring**: 5000 points for perfect guesses (≤7km), dynamic scoring for distances up to 20,000km
- **🌍 Continental Diversity**: Each game features cities from different continents for varied gameplay
- **🎯 Three Difficulty Levels**: Beginner, Intermediate, Advanced
- **🔁 5 Rounds per Game**: Progressive difficulty with comprehensive scoring
- **🌗 Theme Toggle**: Light/Dark mode with persistent preferences
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

---

## 🏗️ **Architecture**

**Frontend**: React + Vite + TailwindCSS + Leaflet.js
**Backend**: FastAPI + Python + OpenRouter 
**Data**: Cities across all continents with population-based difficulty classification

---

## 📁 **Project Structure**

```
geopersona/
├── frontend/           # React application
│   ├── src/           # Source code
│   ├── public/        # Static assets & favicons
│   └── package.json   # Dependencies
├── backend/           # FastAPI server
│   ├── data/         # City JSON databases
│   ├── main.py       # API endpoints
│   ├── persona_gen.py # AI integration
│   ├── city_database.py # City selection engine
│   ├── Dockerfile    # Docker container configuration
│   └── .dockerignore # Docker build exclusions
├── railway.json       # Railway deployment configuration
├── DEPLOYMENT.md      # Deployment guide
└── README.md         # This file
```

---

## 🚀 **Quick Start**

### **1. Clone & Setup**
```bash
git clone https://github.com/prabhuavula7/geopersona.git
cd geopersona
```

### **2. Backend Setup**

#### **Local Development:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_openrouter_api_key
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### **Docker (Production):**
```bash
cd backend
docker build -t geopersona-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key geopersona-backend
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**Visit**: http://localhost:5173

---

## 🔧 **Key Features**

### **City Selection Engine**
- **Deterministic Selection**: Same seed always produces same cities
- **Population-Based Tiers**: Cities classified by actual population data
- **Continental Diversity**: Automatic distribution across continents
- **Anti-Repeat Logic**: Prevents duplicate cities within recent games

### **AI Persona Generation**
- **Claude 3.5 Sonnet**: Advanced AI for realistic character creation
- **Difficulty-Specific Clues**: Clues adapt to selected difficulty level
- **Location-Accurate Hints**: Real landmarks, airport codes, and cultural details
- **Anti-Cheating**: No city names or obvious location reveals

### **Scoring System**
- **Perfect Score Zone**: 5000 points for guesses within 7km
- **Dynamic Curve**: Exponential decay from 7km to 20,000km
- **Haversine Formula**: Accurate distance calculations using real coordinates

---

## 🛡️ **Anti-Cheating Features**

- **No Console Leaks**: All location information removed from logs
- **Deterministic Selection**: Consistent city selection prevents manipulation
- **Secure API**: Rate limiting and CORS protection
- **Clean Frontend**: No hidden location data in source code

---

## 📊 **Data Sources**

- **285+ Cities**: Curated from major world cities
- **Real Coordinates**: Accurate latitude/longitude data
- **Population Data**: Actual city population and ranking information
- **Cultural Context**: Real landmarks, airports, and regional details

---

## 🎯 **Difficulty Levels**

### **Beginner**
- National capitals and major tourist destinations
- Population: 700k+ minimum
- Allowed: State names, landmarks, airport codes, neighborhoods

### **Intermediate**
- Regional centers and secondary cities
- Population: 500k - 5M
- Allowed: Neighborhoods, regional airports, local culture
- Forbidden: State names, major landmarks

### **Advanced**
- Lesser-known cities and specialized locations
- Population: 100k - 2.5M
- Allowed: Regional culture, local cuisine, transport patterns
- Forbidden: State names, neighborhoods, airports, landmarks

---

## 🔌 **API Endpoints**

- `GET /` - Health check and API info
- `GET /api/game/cities/{difficulty}` - Get cities for a game session
- `POST /api/generate_persona` - Generate AI persona for selected city

---

## 🧪 **Development**

- **Hot Reload**: Both frontend and backend support live reloading
- **Environment Variables**: Configurable API keys and settings
- **Type Safety**: Full TypeScript support in frontend
- **Error Handling**: Comprehensive error handling and user feedback

---

## 🚀 **Deployment**

### **Frontend (Vercel - Recommended)**
```bash
cd frontend
npm run build
# Upload dist/ folder to Vercel
```

### **Backend (Railway - Free Tier)**
1. Connect your GitHub repo to Railway
2. Deploy the `backend/` folder (uses Dockerfile automatically)
3. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenRouter API key
   - `ALLOWED_ORIGINS`: Your frontend domain
   - `RATE_LIMIT_PER_MIN`: 25 (5 games per minute per IP)
   - `RATE_LIMIT_PER_DAY`: 25 (5 games per day per IP)

### **Docker Support**
The backend includes a production-ready Dockerfile for containerized deployment:
```bash
cd backend
docker build -t geopersona-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key geopersona-backend
```

---

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **License**

This project is open source and available under the MIT License.

---

## 🙋‍♂️ **Author**

**Prabhu Kiran Avula**  
📍 Built with ❤️ to learn geography  
🔗 [LinkedIn](https://www.linkedin.com/in/prabhuavula)

---

## 💡 **Project History**

GeoPersona was built from scratch as a creative coding experiment combining world geography with AI storytelling. The project evolved from a simple guessing game to a sophisticated platform featuring:

- **Version 1.0**: Basic city guessing with manual city selection
- **Version 2.0**: AI integration and difficulty tiers
- **Version 3.0**: Deterministic city selection and continental diversity
- **Current**: Advanced scoring, anti-cheating, and professional polish

---

## 🌟 **Future Roadmap**

- User accounts and leaderboards
- Multiplayer support
- Additional difficulty modes
- Mobile app development
- Social sharing features
- Educational content integration
