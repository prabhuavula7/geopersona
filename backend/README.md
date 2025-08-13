# 🚀 GeoPersona Backend

**FastAPI-based backend server for the GeoPersona geography guessing game.** This backend provides AI-powered persona generation, intelligent city selection, and a robust API for the frontend application.

---

## 🏗️ **Architecture Overview**

The backend is built with modern Python patterns and follows a microservice architecture:

- **FastAPI** for high-performance API endpoints
- **OpenRouter Integration** Currently for Claude 3.5 Sonnet access
- **Deterministic City Selection Engine** for consistent gameplay
- **Population-Based Difficulty Classification** for fair challenge levels
- **Continental Diversity Management** for varied gameplay experience

---

## 📁 **Project Structure**

```
backend/
├── data/                    # City databases
│   ├── beginner_cities.json    # 150 cities for beginner level
│   ├── intermediate_cities.json # 100 cities for intermediate level
│   └── advanced_cities.json    # 100 cities for advanced level
├── main.py                 # FastAPI application & endpoints
├── persona_gen.py          # AI persona generation logic
├── city_database.py        # City selection & management engine
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Python 3.11+
- pip package manager
- OpenRouter API key 

### **Environment Setup**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### **Environment Variables**
```bash
# Required: Your OpenRouter API key
export OPENAI_API_KEY=your_openrouter_api_key_here

# Optional: CORS origins (defaults to localhost:5173)
export ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### **Running the Server**
```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Access**: http://localhost:8000
**API Docs**: http://localhost:8000/docs (Swagger UI)

---

## 🔌 **API Endpoints**

### **Root Endpoint**
```
GET /
```
**Purpose**: Health check and API information
**Response**: API version, status, and basic information

**Example Response:**
```json
{
  "message": "GeoPersona API v3.0.0",
  "status": "healthy",
  "endpoints": [
    "/api/game/cities/{difficulty}",
    "/api/generate_persona"
  ]
}
```

### **Game Cities Endpoint**
```
GET /api/game/cities/{difficulty}
```
**Purpose**: Get 5 cities for a game session based on difficulty
**Parameters**: `difficulty` (beginner, intermediate, advanced)
**Response**: Array of 5 cities with coordinates and metadata

**Example Request:**
```bash
curl "http://localhost:8000/api/game/cities/beginner"
```

**Example Response:**
```json
[
  {
    "name": "Tokyo",
    "country": "Japan",
    "continent": "Asia",
    "lat": 35.6762,
    "lon": 139.6503,
    "population": 13929286,
    "is_capital": true,
    "difficulty_tier": "beginner"
  }
]
```

### **Persona Generation Endpoint**
```
POST /api/generate_persona
```
**Purpose**: Generate AI persona for a specific city
**Request Body**: City information (name, country, continent, coordinates)
**Response**: AI-generated character profile with location-specific clues

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/generate_persona" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Tokyo",
    "country": "Japan",
    "continent": "Asia",
    "lat": 35.6762,
    "lon": 139.6503
  }'
```

**Example Response:**
```json
{
  "name": "Akira",
  "age": 28,
  "job": "Software Engineer",
  "routine": "I start my day with a quick breakfast at the local konbini...",
  "socialSnippets": {
    "food": "I love grabbing ramen from the tiny shop near Shibuya station...",
    "music": "On weekends, I explore the underground music scene...",
    "habits": "I always take the Yamanote line to work...",
    "media": "I stream J-pop and watch anime during my commute..."
  },
  "funFact": "Many people in this region prefer to eat standing up..."
}
```

---

## 🏙️ **City Selection Engine**

### **Core Components**

#### **City Dataclass**
```python
@dataclass
class City:
    name: str
    country: str
    continent: str
    population: int
    is_capital: bool
    city_rank: int
    lat: float
    lon: float
    airport_codes: List[str]
    landmarks: List[str]
    region: str
```

#### **CitySelectionEngine Class**
- **City Loading**: Loads cities from JSON files by difficulty
- **Deterministic Selection**: Same seed always produces same cities
- **Diversity Management**: Ensures continental and country variety
- **Anti-Repeat Logic**: Prevents duplicate cities in recent games

### **Selection Algorithm**

#### **1. Seed Generation**
```python
# Generate deterministic seed from current time
seed = int(time.time() // 3600)  # Changes every hour
random.seed(seed)
```

#### **2. City Filtering**
```python
# Filter cities by difficulty and population criteria
cities = [city for city in all_cities if city.meets_difficulty_criteria(difficulty)]
```

#### **3. Diversity Enforcement**
```python
# Ensure continental diversity (max 2 cities per continent)
# Ensure country diversity (max 1 city per country per game)
# Avoid recently used cities and countries
```

#### **4. Final Selection**
```python
# Select 5 cities using weighted random selection
# Weight based on population, recent usage, and diversity score
```

### **Difficulty Classification**

#### **Beginner Tier**
- **Criteria**: National capitals OR largest cities (rank ≤ 2) OR top 10% by population
- **Population**: ≥ 700k minimum
- **Examples**: Tokyo, London, New York, Delhi, Cairo
- **Allowed Clues**: State/province names, landmarks, airport codes, neighborhoods

#### **Intermediate Tier**
- **Criteria**: Tier-2 cities (rank 3-10, NOT capital, NOT largest)
- **Population**: 500k - 5M
- **Examples**: Pune, Munich, Houston, Adelaide, Marrakech
- **Allowed Clues**: Neighborhoods, regional airport codes, local culture
- **Forbidden**: State/province names, landmarks

#### **Advanced Tier**
- **Criteria**: Tier-3 cities (rank 11-30, NOT capital, NOT largest)
- **Population**: 100k - 2.5M
- **Examples**: Florence, Eugene, Visakhapatnam, Gold Coast
- **Allowed Clues**: Regional culture, local cuisine, transport patterns
- **Forbidden**: State/province, neighborhoods, airports, landmarks

---

## 🤖 **AI Persona Generation**

### **OpenRouter Integration**

#### **Configuration**
```python
# OpenRouter client setup
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)
```

#### **Model Selection**
- **Model**: `anthropic/claude-3.5-sonnet-20240620`
- **Capabilities**: Advanced reasoning, cultural knowledge, creative writing
- **Rate Limits**: OpenRouter's standard rate limiting

### **System Prompt Engineering**

#### **Base System Prompt**
The system prompt is carefully crafted to:
- Generate location-specific clues without revealing the city
- Adapt difficulty based on selected tier
- Ensure cultural accuracy and authenticity
- Prevent cheating through obvious location reveals

#### **Difficulty-Specific Rules**
Each difficulty level has specific allowed/forbidden identifiers:
- **Beginner**: Full access to landmarks, airports, state names
- **Intermediate**: Limited access, no major landmarks
- **Advanced**: Minimal identifiers, focus on cultural context

#### **Database Integration**
- **Airport Codes**: Uses pre-generated codes from city database (e.g., BER for Berlin, JFK for NYC)
- **Landmarks**: Uses verified landmarks from city database
- **No Fake Data**: LLM cannot invent airport codes or landmarks
- **Cultural Accuracy**: All clues based on real city data

### **Clue Categories**

#### **Routine (2-4 sentences)**
- Daily commute and transport methods
- Climate and weather conditions
- Street atmosphere and local character
- Work environment details
- Evening and weekend activities

#### **Social Snippets (4 clues)**
- **Food**: Regional cuisine, cooking methods, local ingredients
- **Music**: Local music styles, cultural preferences
- **Habits**: Daily routines, social customs, local behaviors
- **Media**: Entertainment preferences, cultural consumption

#### **Job**
- Realistic profession for the city and difficulty level
- Cultural context and local business practices
- No location-specific company names

#### **Fun Fact**
- General cultural observation applicable to the region
- No specific landmarks or unique identifiers
- Focus on lifestyle and cultural patterns

---

## 🗄️ **Data Management**

### **City Database Structure**

#### **JSON File Format**
```json
{
  "beginner": [
    {
      "name": "New York City",
      "country": "United States",
      "continent": "North America",
      "population": 8336817,
      "is_capital": false,
      "city_rank": 1,
      "lat": 40.7128,
      "lon": -74.0060,
      "airport_codes": ["JFK", "LGA", "EWR"],
      "landmarks": ["Statue of Liberty", "Times Square", "Central Park"],
      "region": "Northeast"
    }
  ]
}
```

#### **Data Sources**
- **Population Data**: United Nations World Urbanization Prospects
- **Coordinates**: OpenStreetMap and Google Maps APIs
- **Cultural Context**: Manual research and verification
- **Difficulty Classification**: Population-based algorithmic classification

### **Data Validation**

#### **Quality Checks**
- **Coordinate Accuracy**: Verified against multiple mapping services
- **Population Verification**: Cross-referenced with official sources
- **Cultural Accuracy**: Validated by native speakers and cultural experts
- **Difficulty Consistency**: Algorithmic verification of tier classification

#### **Update Process**
- **Regular Reviews**: Quarterly updates for population and cultural data
- **New Cities**: Addition of emerging cities and cultural centers
- **Quality Control**: Automated validation scripts and manual review
- **Version Control**: Git-based tracking of all data changes

---

## 🔒 **Security & Performance**

### **Rate Limiting**
```python
# In-memory rate limiting (configurable)
RATE_LIMIT_PER_MIN = 5    # Requests per minute (default) - 1 game per minute
RATE_LIMIT_PER_DAY = 25   # Requests per day (default) - 5 games per day
```

### **CORS Configuration**
```python
# Configurable CORS origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
```

### **Input Validation**
- **Pydantic Models**: Automatic request validation
- **Type Checking**: Runtime type verification
- **Sanitization**: Input cleaning and validation
- **Error Handling**: Graceful error responses

### **Performance Optimization**

#### **Caching Strategy**
```python
# Memoization for persona generation
@lru_cache(maxsize=1000)
def generate_persona(city, country, continent, lat, lon):
    # Implementation with caching
```

#### **Database Optimization**
- **Lazy Loading**: Cities loaded only when needed
- **Memory Management**: Efficient data structures
- **Query Optimization**: Minimal database operations
- **Connection Pooling**: Efficient resource utilization

---

## 🧪 **Development & Testing**

### **Development Workflow**

#### **Local Development**
```bash
# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Check API documentation
open http://localhost:8000/docs
```

#### **Code Quality**
- **Type Hints**: Full Python type annotation
- **Docstrings**: Comprehensive function documentation
- **Error Handling**: Robust error handling and logging
- **Code Style**: PEP 8 compliance with Black formatting

### **Testing Strategy**

#### **Unit Tests**
```bash
# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=backend tests/
```

#### **Integration Tests**
- **API Endpoint Testing**: Test all endpoints with various inputs
- **City Selection Testing**: Verify deterministic behavior
- **AI Integration Testing**: Test persona generation quality
- **Performance Testing**: Load testing and response time validation

### **Debugging & Logging**

#### **Logging Configuration**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

#### **Debug Mode**
```python
# Enable debug logging
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
if DEBUG:
    logging.getLogger().setLevel(logging.DEBUG)
```

---

## 📊 **Monitoring & Analytics**

### **Health Checks**
- **Endpoint Monitoring**: `/` endpoint for health status
- **Response Time Tracking**: Performance metrics collection
- **Error Rate Monitoring**: Track API errors and failures
- **Resource Usage**: Memory and CPU utilization

### **Metrics Collection**
- **Request Volume**: Track API usage patterns
- **City Selection Patterns**: Monitor difficulty distribution
- **AI Generation Quality**: Track persona generation success rates
- **User Behavior**: Analyze game session patterns

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **User Authentication**: JWT-based user management
- **Leaderboards**: Global and regional scoring systems
- **Multiplayer Support**: Real-time game sessions
- **Analytics Dashboard**: Detailed game statistics
- **Mobile API**: Optimized endpoints for mobile apps

### **Performance Improvements**
- **Redis Integration**: Distributed caching and rate limiting
- **Database Migration**: PostgreSQL for persistent data
- **Microservices**: Split into specialized services
- **Load Balancing**: Horizontal scaling support
- **CDN Integration**: Global content delivery

### **AI Enhancements**
- **Model Fine-tuning**: Custom training for geography-specific tasks
- **Multi-language Support**: Personas in multiple languages
- **Cultural Adaptation**: Region-specific clue generation
- **Difficulty Learning**: AI-powered difficulty adjustment

---

## 📚 **Dependencies**

### **Core Dependencies**
```
fastapi==0.115.6          # Web framework
uvicorn[standard]==0.34.0 # ASGI server
python-dotenv==1.0.1      # Environment management
openai==1.59.6            # OpenRouter client
```

### **Development Dependencies**
```
pytest                    # Testing framework
pytest-cov               # Coverage reporting
black                     # Code formatting
flake8                    # Linting
mypy                      # Type checking
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **API Key Errors**
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Verify in Python
python -c "import os; print(os.getenv('OPENAI_API_KEY'))"
```

#### **CORS Issues**
```bash
# Check allowed origins
export ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

#### **Port Conflicts**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Use different port
uvicorn main:app --port 8001
```

### **Debug Commands**
```bash
# Test city selection
python -c "from city_database import city_engine; print(city_engine.get_cities_by_difficulty('beginner', 5))"

# Test persona generation
python -c "from persona_gen import generate_persona; print(generate_persona('Tokyo', 'Japan', 'Asia', 35.6762, 139.6503))"
```

---

## 📄 **License**

This backend application is part of the GeoPersona project and follows the same license terms.

---

## 🤝 **Contributing**

Since this project is under the MIT License, you're free to use, modify, and contribute to the codebase!

### **How to Contribute:**

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test thoroughly
5. **Commit** with clear messages: `git commit -m "Add amazing feature"`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Submit** a pull request

### **Development Setup:**
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/geopersona.git
cd geopersona/backend

# Set up environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set API key
export OPENAI_API_KEY=your_openrouter_api_key

# Run locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **What We're Looking For:**
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Additional test coverage
- 🌍 New cities and cultural data
- 🔧 Performance optimizations

### **Code Standards:**
- Follow Python best practices (PEP 8)
- Maintain comprehensive test coverage
- Document all new endpoints and features
- Ensure backward compatibility
- Test with various city datasets
- Use type hints and docstrings

**Your contributions help make GeoPersona better for everyone!** 🌟
