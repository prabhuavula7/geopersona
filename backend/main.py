import os
import time
from typing import Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from persona_gen import generate_persona  # Uses OpenRouter (Claude 4 Sonnet) and returns clues + answer
from city_database import city_engine  # Import city engine for monitoring

app = FastAPI(title="GeoPersona API")

@app.on_event("startup")
async def startup_event():
    """Log startup information for debugging."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("🚀 GeoPersona API starting up...")
        logger.info(f"🌍 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'development')}")
        logger.info(f"🔑 API Key configured: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
        logger.info(f"🌐 CORS origins: {allowed_origins}")
        
        # Test city engine loading
        city_count = sum(city_engine.get_difficulty_stats().values())
        logger.info(f"📊 Total cities loaded: {city_count}")
        
        # Network debugging info
        port = int(os.getenv("PORT", 8000))
        logger.info(f"🌐 Server will listen on port {port}")
        logger.info(f"🔗 Health check endpoint: /ping")
        logger.info(f"📡 CORS origins: {allowed_origins}")
        
        logger.info("✅ Startup complete!")
        
        # Test network binding
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('0.0.0.0', port))
            sock.close()
            logger.info(f"✅ Port {port} is available for binding")
        except Exception as e:
            logger.warning(f"⚠️ Port binding test failed: {str(e)}")
        
        # Add a small delay to ensure everything is ready
        import asyncio
        await asyncio.sleep(1)
        logger.info("⏰ Startup delay completed - app is ready for requests")
            
    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        # Don't fail startup, just log the error

# CORS configuration via environment variable for production safety
# ALLOWED_ORIGINS should be a comma-separated list, e.g. "http://localhost:5173,https://yourdomain.com"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins_env if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IP-based rate limiter for Railway deployment
# 5 games per day per IP (each game = 5 API calls)
requests_per_minute_limit = int(os.getenv("RATE_LIMIT_PER_MIN", "25"))  # 5 games per minute
requests_per_day_limit = int(os.getenv("RATE_LIMIT_PER_DAY", "25"))    # 5 games per day

recent_requests_by_ip: Dict[str, list] = {}
daily_counters_by_ip: Dict[str, Dict[str, int]] = {}

def _get_client_ip(request: Request) -> str:
    # Try common proxy headers first
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Use the first IP in the list
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    # Fallback to client host
    client_host = request.client.host if request.client else "unknown"
    return client_host

def enforce_rate_limit(request: Request) -> None:
    ip = _get_client_ip(request)
    now = time.time()

    # Per-minute sliding window
    window_start = now - 60
    if ip not in recent_requests_by_ip:
        recent_requests_by_ip[ip] = []
    # Drop old timestamps
    recent_requests_by_ip[ip] = [t for t in recent_requests_by_ip[ip] if t > window_start]
    if len(recent_requests_by_ip[ip]) >= requests_per_minute_limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. You can play 5 games per minute. Please wait a moment and try again.")
    recent_requests_by_ip[ip].append(now)

    # Per-day fixed window
    day_key = time.strftime("%Y-%m-%d", time.gmtime(now))
    if ip not in daily_counters_by_ip:
        daily_counters_by_ip[ip] = {}
    if day_key not in daily_counters_by_ip[ip]:
        daily_counters_by_ip[ip][day_key] = 0
    if daily_counters_by_ip[ip][day_key] >= requests_per_day_limit:
        raise HTTPException(status_code=429, detail="Daily limit reached! You've played 5 games today. Come back tomorrow for more geography fun! 🌍")
    daily_counters_by_ip[ip][day_key] += 1

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "GeoPersona API",
        "version": "3.0.0",
        "description": "Backend API for GeoPersona game with three difficulty levels and deterministic city selection",
        "difficulty_levels": {
            "beginner": "Major world cities, capitals, and tourist destinations",
            "intermediate": "Regional centers and secondary cities", 
            "advanced": "Lesser-known cities and specialized locations"
        },
        "endpoints": {
            "ping": "/ping",
            "env": "/env",
            "health": "/health",
            "startup": "/startup",
            "generate_persona": "/generate_persona",
            "api_generate_persona": "/api/generate_persona",
            "city_stats": "/api/city_stats",
            "cities_by_difficulty": "/api/cities/{difficulty}",
            "search_cities": "/api/cities/search/{query}",
            "game_cities": "/api/game/cities/{difficulty}"
        },
        "total_cities": sum(city_engine.get_difficulty_stats().values())
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/startup")
async def startup_test():
    """Simple startup test endpoint."""
    return {"status": "startup", "message": "API is starting up", "timestamp": time.time()}

@app.get("/ping")
async def ping():
    """Simple ping endpoint for network testing."""
    return {"status": "pong", "message": "API is responding", "timestamp": time.time()}

@app.get("/ready")
async def ready():
    """Readiness endpoint for Railway health checks."""
    return {"status": "ready", "message": "API is ready to serve requests", "timestamp": time.time()}

@app.get("/env")
async def environment_check():
    """Environment check endpoint for debugging."""
    return {
        "status": "environment",
        "port": os.getenv("PORT", "8000"),
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development"),
        "api_key_configured": bool(os.getenv("OPENAI_API_KEY")),
        "cors_origins": allowed_origins,
        "timestamp": time.time()
    }



@app.get("/api/city_stats")
async def get_city_stats():
    """Get statistics about the city selection engine."""
    try:
        difficulty_stats = city_engine.get_difficulty_stats()
        continent_dist = city_engine.get_continental_distribution()
        
        return {
            "status": "success",
            "difficulty_distribution": difficulty_stats,
            "continental_distribution": continent_dist,
            "total_cities": sum(difficulty_stats.values()),
            "timestamp": time.time()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/cities/{difficulty}")
async def get_cities_by_difficulty(difficulty: str):
    """
    Get list of cities available for a specific difficulty level.
    
    Args:
        difficulty: "beginner", "intermediate", or "advanced"
    
    Returns:
        List of cities with basic information
    """
    if difficulty.lower() not in ["beginner", "intermediate", "advanced"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid difficulty. Must be 'beginner', 'intermediate', or 'advanced'"
        )
    
    try:
        cities = city_engine.get_cities_by_difficulty(difficulty.lower())
        city_list = []
        
        for city in cities:
            city_list.append({
                "name": city.name,
                "country": city.country,
                "continent": city.continent,
                "population": city.population,
                "is_capital": city.is_capital,
                "city_rank": city.city_rank,
                "lat": city.lat,
                "lon": city.lon,
                "region": city.region
            })
        
        return {
            "status": "success",
            "difficulty": difficulty.lower(),
            "count": len(city_list),
            "cities": city_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cities: {str(e)}")

@app.get("/api/cities/search/{query}")
async def search_cities(query: str):
    """
    Search for cities by name, country, or region.
    
    Args:
        query: Search term for city name, country, or region
    
    Returns:
        List of matching cities
    """
    try:
        query = query.lower()
        matching_cities = []
        
        # Search through all difficulty levels
        for difficulty in ["beginner", "intermediate", "advanced"]:
            cities = city_engine.get_cities_by_difficulty(difficulty)
            for city in cities:
                if (query in city.name.lower() or 
                    query in city.country.lower() or 
                    query in city.region.lower()):
                    matching_cities.append({
                        "name": city.name,
                        "country": city.country,
                        "continent": city.continent,
                        "difficulty": difficulty,
                        "population": city.population,
                        "is_capital": city.is_capital,
                        "lat": city.lat,
                        "lon": city.lon,
                        "region": city.region
                    })
        
        return {
            "status": "success",
            "query": query,
            "count": len(matching_cities),
            "cities": matching_cities
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/game/cities/{difficulty}")
async def get_cities_for_game(
    difficulty: str,
    count: int = 5,
    seed: str = None,
    region_hint: str = None,
    max_per_continent: int = 2
):
    """
    Get cities for a game with continental diversity constraints.
    
    Args:
        difficulty: "beginner", "intermediate", or "advanced"
        count: Number of cities to select (default: 5)
        seed: Optional seed for reproducible selection
        region_hint: Optional hint to prefer certain regions
        max_per_continent: Maximum cities allowed from same continent (default: 2)
    
    Returns:
        List of cities with continental diversity information
    """
    if difficulty.lower() not in ["beginner", "intermediate", "advanced"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid difficulty. Must be 'beginner', 'intermediate', or 'advanced'"
        )
    
    try:
        # Select cities with continental diversity
        selected_cities = city_engine.select_cities_for_game_deterministic(
            difficulty=difficulty.lower(),
            count=count,
            seed=seed,
            region_hint=region_hint,
            max_per_continent=max_per_continent
        )
        
        # Get continental distribution
        continent_stats = city_engine.get_continental_diversity_stats(selected_cities)
        
        # Format response
        city_list = []
        for city in selected_cities:
            city_list.append({
                "name": city.name,
                "country": city.country,
                "continent": city.continent,
                "population": city.population,
                "is_capital": city.is_capital,
                "city_rank": city.city_rank,
                "lat": city.lat,
                "lon": city.lon,
                "region": city.region
            })
        
        return {
            "status": "success",
            "difficulty": difficulty.lower(),
            "count": len(city_list),
            "max_per_continent": max_per_continent,
            "continental_distribution": continent_stats,
            "cities": city_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cities for game: {str(e)}")

@app.get("/generate_persona")
async def fetch_persona_legacy(request: Request, difficulty: str | None = None):
    """
    Endpoint to generate a culturally grounded persona.
    - Returns 'clues' (shown to user) and 'answer' (revealed after guess).
    """
    enforce_rate_limit(request)
    return await generate_persona(difficulty=difficulty)


# Preferred API path for frontend usage and proxying
@app.get("/api/generate_persona")
async def fetch_persona(
    request: Request,
    difficulty: str | None = None,
    seed: str | None = None,
    region_hint: str | None = None,
    theme: str | None = None,
    warmup: bool | None = None,
    city: str | None = None,
    country: str | None = None,
    continent: str | None = None,
    lat: str | None = None,
    lon: str | None = None,
):
    """
    Generate a culturally grounded persona for the GeoPersona game.
    
    Args:
        difficulty: "beginner", "intermediate", or "advanced"
        seed: Optional seed for reproducible city selection
        region_hint: Optional hint to prefer certain regions
        theme: Optional theme for persona generation
        warmup: Optional warmup call to prime caches
        city: Specific city to generate persona for
        country: Country of the specific city
        continent: Continent of the specific city
        lat: Latitude of the specific city
        lon: Longitude of the specific city
    
    Returns:
        JSON with 'clues' (shown to user) and 'answer' (revealed after guess)
    """
    enforce_rate_limit(request)
    
    # Validate difficulty parameter
    if difficulty and difficulty.lower() not in ["beginner", "intermediate", "advanced"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid difficulty. Must be 'beginner', 'intermediate', or 'advanced'"
        )
    
    try:
        result = await generate_persona(
            difficulty=difficulty, 
            seed=seed, 
            region_hint=region_hint, 
            theme=theme, 
            warmup=warmup,
            city=city,
            country=country,
            continent=continent,
            lat=lat,
            lon=lon
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Persona generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Railway automatically sets PORT environment variable
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting GeoPersona backend on port {port}")
    print(f"🌍 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'development')}")
    print(f"🔑 API Key configured: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
    print(f"🌐 Binding to 0.0.0.0:{port}")
    print(f"🔗 Health check endpoint: http://0.0.0.0:{port}/ping")
    
    # Force reload=False for production
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False, log_level="info")
