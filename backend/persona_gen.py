import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI
from collections import deque, Counter
from city_database import city_engine, City

# OpenRouter Integration: This backend uses OpenRouter
# Model: anthropic/claude-3.5-sonnet-20240620

# Load environment variables
load_dotenv()
# OpenRouter API key (same env var name for compatibility)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# Configure OpenRouter client with Claude 4 Sonnet
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
) if OPENAI_API_KEY else None

BASE_SYSTEM = (
        """You generate HIGH-QUALITY GeoPersona clues for a location-guessing game. Each persona must be engaging, realistic, and provide the perfect balance of challenge and fun.

QUALITY STANDARDS - EVERY PERSONA MUST MEET THESE:
- Clues must be SPECIFIC to the chosen city, not generic regional descriptions
- All airport codes must be REAL, valid codes (e.g., JFK, LHR, CDG, NRT, LAX)
- Landmarks must be REAL, famous structures (e.g., Eiffel Tower, Statue of Liberty, Burj Khalifa)
- State/province names must be REAL, accurate locations
- Each clue should be 12-20 words and provide genuine location-specific insight
- City selection is now deterministic and handled by the backend for optimal diversity

1. DIFFICULTY → CITY CHOICE + ALLOWED IDENTIFIERS

BEGINNER: Major world cities, capitals, and tourist destinations
ALLOWED: State/province names, neighborhood names, REAL airport codes, REAL famous landmarks, famous local dish names

INTERMEDIATE: Regional centers and secondary cities
ALLOWED: Neighborhood names, REGIONAL airport codes, local business districts, regional cultural practices
FORBIDDEN: State/province names, major international landmarks

ADVANCED: Lesser-known cities and specialized locations
ALLOWED: Regional business districts, regional cultural practices, local cuisine specialties, regional transport patterns
FORBIDDEN: State/province names, neighborhood names, airport codes, landmarks

NOTE: City selection is now handled automatically by the backend based on difficulty criteria.

2. PERSONA STRUCTURE (MAX 200 WORDS TOTAL)

routine: 2-4 sentences, first person, natural daily life story including:
- Commute/transport method (specific to the city)
- Climate/weather conditions (seasonal if relevant)
- Street atmosphere and local character
- Work environment details
- Evening/weekend activities

socialSnippets: EXACTLY 4 clues, each 12-20 words, from these categories:
- food: Regional cuisine, cooking methods, meal timing, local ingredients
- music: Local music styles, street performances, cultural preferences
- habits: Daily routines, social customs, weekend activities, local behaviors
- media: Entertainment preferences, commute habits, cultural consumption
- slang: Local expressions, greetings, common phrases (in context)
- sportsCulture: Sports preferences, local games, fitness habits (NO team names)
- workdayPattern: Work schedules, office culture, local business practices
- touristDestinations: Popular local attractions, cultural sites, scenic spots
- festivals: Cultural celebrations, seasonal events, local traditions
- airportCodes: REAL airport codes with context (only for beginner/intermediate)

job: Must be realistic for the chosen city and difficulty level (see difficulty-specific rules below)

name: First name only, culturally appropriate for the location

3. CURRENCY RULES
ALLOWED: Symbols $ € £ ¥ ₹ (no spaces)
FORBIDDEN: Currency names (dollar, euro, rupee), ISO codes (USD, EUR), minor units (cent, pence)

4. STRICTLY FORBIDDEN (unless explicitly allowed above)
- City names, country names, continent names
- Fake or made-up information
- Generic descriptions that could apply to many cities
- Currency names or ISO codes
- Team names, university names, brand names tied to location
- Government bodies or festivals that uniquely reveal location

5. CLUE QUALITY REQUIREMENTS
- Each clue must provide genuine insight about the specific city
- No generic "European city" or "Asian city" descriptions
- Climate hints must be accurate for the chosen location
- Transport details must reflect the city's actual infrastructure
- Cultural references must be authentic to the region

6. FUN FACT RULE
MUST be a general cultural or lifestyle observation that could apply to multiple cities in the region. NEVER mention specific landmarks, city names, or unique identifiers. Focus on general cultural practices, weather patterns, or lifestyle habits common in that climate/region.

📦 OUTPUT: Strict, minified JSON only (no markdown, no extra whitespace):
{
  "name": string,
  "age": int,
  "job": string,
  "routine": string,
  "socialSnippets": {
    "food": string,
    "music": string,
    "habits": string,
    "media": string,
    "slang": string,
    "sportsCulture": string,
    "workdayPattern": string,
    "touristDestinations": string,
    "festivals": string,
    "airportCodes": string
  },
  "correctCity": string,
  "correctLocation": string,
  "correctLat": float,
  "correctLon": float,
  "continent": string,
  "funFact": string
}

CRITICAL: Select exactly 4 social clues from the socialSnippets options above. Each clue must be 12-20 words and provide genuine, location-specific insight without revealing the city name. The city has been pre-selected by the backend, so focus on generating authentic clues for the specific location. Verify all airport codes, landmarks, and state names are REAL and accurate.
"""
)

# Streamlined difficulty prompts - city selection handled by backend
DIFFICULTY_PROMPTS = {
    "beginner": (
        "\n\nDIFFICULTY: Beginner - MAJOR WORLD CITIES & CAPITALS"
        "\n- City: {city_name} (pre-selected by backend)"
        "\n- ALLOWED: State/province names, neighborhood names, REAL airport codes, REAL famous landmarks/monuments, famous local dish names"
        "\n- Jobs: Use GENERIC, worldwide jobs only (teacher, nurse, bus driver, shopkeeper, barista, delivery driver, construction worker, electrician, office admin, call-center agent, warehouse picker, security guard, cleaner, software tester)"
        "\n- Clues: Provide SPECIFIC location hints including famous landmarks, climate, transit type, cuisine styles, and daily rhythms. Make it moderately challenging but gettable."
        "\n- Landmarks: You may mention the actual landmark names (e.g., 'I can see the Eiffel Tower from my café', 'The Statue of Liberty is visible from the waterfront')."
        "\n- Food: You may mention famous local dish names (e.g., 'I serve authentic paella', 'We make traditional croissants', 'I love eating sushi for lunch')."
        "\n- Social Clues: Select exactly 4 from: food, music, habits, media, slang, sports culture (no team names), workday pattern, popular tourist destinations, festivals/celebrations, airport codes."
        "\n- Fun Fact: Include city-specific facts like 'most densely populated in the world', 'produces most of the world's chillies', 'famous for pharmaceuticals', 'this company has HQ here', or general cultural observations that could apply to multiple cities in the region."
    ),
    "intermediate": (
        "\n\nDIFFICULTY: Intermediate - REGIONAL CENTERS & SECONDARY CITIES"
        "\n- City: {city_name} (pre-selected by backend)"
        "\n- ALLOWED: Neighborhood names, REGIONAL airport codes, local business districts, regional cultural practices, local cuisine specialties"
        "\n- FORBIDDEN: State/province names, major international landmarks, major international airport codes"
        "\n- Jobs: Mix of generic and SOME local/region-specific jobs (e.g., dock worker, vineyard hand, textile worker, call-center agent, software developer, teacher, nurse)"
        "\n- Clues: VERY SPECIFIC and LOCALLY-TYPICAL clues using REGIONAL context:"
        "\n  * ALWAYS include at least ONE specific neighborhood name, famous park, or museum name"
        "\n  * Use regional airport codes from the city or nearby cities"
        "\n  * Focus on local business districts, tech parks, educational institutions, local markets"
        "\n  * Include regional cultural practices, local cuisine specialties, regional transport patterns"
        "\n- Social Clues: Select exactly 4 from: food, music, habits, media, slang, sports culture (no team names), workday pattern, popular tourist destinations, festivals/celebrations, airport codes. AT LEAST ONE clue must reference a specific neighborhood name, famous park, or museum name."
        "\n- Fun Fact: Include city-specific facts like 'most densely populated in the world', 'produces most of the world's chillies', 'famous for pharmaceuticals', 'this company has HQ here', or general cultural observations that could apply to multiple cities in the region."
    ),
    "advanced": (
        "\n\nDIFFICULTY: Advanced - LESSER-KNOWN & SPECIALIZED CITIES"
        "\n- City: {city_name} (pre-selected by backend)"
        "\n- ALLOWED: Regional business districts, regional cultural practices, local cuisine specialties, regional transport patterns, local festivals, regional business practices"
        "\n- FORBIDDEN: State/province names, neighborhood names, airport codes, landmarks/monuments, city/country names"
        "\n- Jobs: Mix of LOCATION-SPECIFIC OCCUPATIONS (e.g., tea plantation worker, spice trader, coffee farmer, textile weaver, diamond cutter) and SOME GLOBAL JOBS (e.g., software developer, teacher, nurse, accountant). At least 50% should be location-specific to reveal the region/country."
        "\n- Clues: VERY SPECIFIC and REGIONALLY-IDENTIFIABLE daily life that reveals the COUNTRY and REGION:"
        "\n  * Use regional business districts, local festivals, regional trade patterns, local transport systems"
        "\n  * Include regional climate patterns, local agricultural practices, regional industries"
        "\n  * Reference regional social customs, local business hours, regional entertainment preferences"
        "\n  * Focus on seasonal rhythms, local business practices, regional cultural nuances"
        "\n  * Include famous universities/institutions (without revealing names) and regional business facts"
        "\n  * Use business facts like 'this company has HQ here', 'we produce most of the world's chillies', 'we are famous for pharmaceuticals'"
        "\n- Social Clues: Select exactly 4 from: food, music, habits, media, slang, sports culture (no team names), workday pattern, popular tourist destinations, festivals/celebrations. NO airport codes allowed for advanced difficulty."
        "\n- Fun Fact: Include city-specific facts like 'most densely populated in the world', 'produces most of the world's chillies', 'famous for pharmaceuticals', 'this company has HQ here', or general cultural observations that could apply to multiple cities in the region."
    ),
}

def _build_system_prompt(difficulty: str, selected_city: City) -> str:
    """Build system prompt with pre-selected city information."""
    base = BASE_SYSTEM
    
    if difficulty and difficulty in DIFFICULTY_PROMPTS:
        difficulty_prompt = DIFFICULTY_PROMPTS[difficulty].format(city_name=selected_city.name)
        base += difficulty_prompt
    
    return base



# Simple in-memory memo cache
_persona_cache: dict[tuple, dict] = {}
_CACHE_MAX = 200

# Recent history for diversity constraints
_recent_names: deque[str] = deque(maxlen=12)
_recent_jobs: deque[str] = deque(maxlen=12)

async def generate_persona(difficulty: str | None = None, seed: str | None = None, region_hint: str | None = None, theme: str | None = None, warmup: bool | None = None, city: str | None = None, country: str | None = None, continent: str | None = None, lat: str | None = None, lon: str | None = None):
    try:
        if not client:
            return {"error": "OPENAI_API_KEY (OpenRouter) not configured", "raw_response": "Missing API key"}

        # Validate difficulty and set default
        if difficulty and difficulty.lower() in ["beginner", "intermediate", "advanced"]:
            difficulty = difficulty.lower()
        else:
            difficulty = "intermediate"  # Default to intermediate

        # Use provided city if available, otherwise use city selection engine
        if city and country and continent:
            print(f"🔍 Backend received city parameters")
            # Create a city object from provided parameters
            from dataclasses import dataclass
            @dataclass
            class ProvidedCity:
                name: str
                country: str
                continent: str
                region: str = ""
                airport_codes: list = None
                landmarks: list = None
                population: int = 0
                is_capital: bool = False
                city_rank: int = 0
                lat: float = 0.0
                lon: float = 0.0
                
                def __post_init__(self):
                    if self.airport_codes is None:
                        self.airport_codes = []
                    if self.landmarks is None:
                        self.landmarks = []
            
            selected_city = ProvidedCity(
                name=city,
                country=country,
                continent=continent,
                region=country,  # Use country as region if not specified
                lat=float(lat) if lat else 0.0,
                lon=float(lon) if lon else 0.0
            )
            print(f"🎯 Using provided city for persona generation")
        else:
            print(f"🔍 Backend did not receive city parameters, using city selection engine")
            # Use deterministic city selection engine
            try:
                selected_city = city_engine.select_city(difficulty, seed, region_hint)
                print(f"🎯 Selected city for persona generation")
            except Exception as e:
                return {"error": f"City selection failed: {str(e)}", "raw_response": "City selection error"}

        # Build system prompt with pre-selected city
        system_prompt = _build_system_prompt(difficulty, selected_city)

        # Warm-up call: tiny generation to prime caches
        if warmup:
            client.chat.completions.create(
                model="anthropic/claude-3.5-sonnet-20240620",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "ok"},
                ],
                max_tokens=1,
                temperature=0.3,
                top_p=0.9,
                response_format={"type": "json_object"},
            )
            return {"status": "warmed"}

        # Memoization key
        if city and country and continent:
            cache_key = (difficulty, seed or "", region_hint or "", theme or "", city, country, continent, lat or "", lon or "")
        else:
            cache_key = (difficulty, seed or "", region_hint or "", theme or "", selected_city.name)
        if cache_key in _persona_cache:
            return _persona_cache[cache_key]

        # Build small diversity delta
        recent_names_list = list(dict.fromkeys(list(_recent_names)))[:5]
        job_counts = Counter(list(_recent_jobs))
        avoid_jobs = [job for job, cnt in job_counts.most_common() if cnt >= 2][:3]

        diversity_note = {
            "avoid_names": recent_names_list,
            "avoid_jobs": avoid_jobs,
            "guidance": "VARY first names by locale and gender; prefer names common to the chosen place's language/ethnicity. Age 19–65. Rotate jobs; avoid repeats from avoid_jobs. Do not use any avoid_names."
        }
        diversity_msg = {
            "role": "system",
            "content": f"diversity: {json.dumps(diversity_note, separators=(',', ':'))}"
        }

        # Add city context to help AI generate accurate clues
        city_context = {
            "role": "system",
            "content": f"city_context: {json.dumps({{'name': selected_city.name, 'country': selected_city.country, 'continent': selected_city.continent, 'region': selected_city.region, 'airport_codes': selected_city.airport_codes, 'landmarks': selected_city.landmarks, 'population': selected_city.population, 'is_capital': selected_city.is_capital, 'city_rank': selected_city.city_rank}}, separators=(',', ':'))}"
        }

        response = client.chat.completions.create(
            model="anthropic/claude-3.5-sonnet-20240620",
            messages=[
                {"role": "system", "content": system_prompt},
                city_context,
                diversity_msg,
                _build_user_delta(seed, region_hint, theme),
            ],
            max_tokens=420,
            temperature=0.5,
            top_p=0.9,
            presence_penalty=0.6,
            frequency_penalty=0.4,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content.strip()
        print("🟢 Raw response received")

        # Clean any markdown syntax and extract JSON
        raw = raw.replace("```json", "").replace("```", "").strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            return {"error": "No JSON object found", "raw_response": raw}

        persona = json.loads(match.group(0))

        # Extract clues and override city data with deterministic selection
        clues = {
            "name": persona["name"],
            "age": persona["age"],
            "job": persona["job"],
            "routine": persona["routine"],
            "socialSnippets": persona["socialSnippets"],
            "funFact": persona["funFact"]
        }

        answer = {
            "correctCity": selected_city.name,
            "correctLocation": f"{selected_city.name}, {selected_city.country}",
            "correctLat": selected_city.lat,
            "correctLon": selected_city.lon,
            "continent": selected_city.continent
        }

        # Update history and return result
        if isinstance(clues.get("name"), str):
            _recent_names.append(clues["name"].split(" ")[0])
        if isinstance(clues.get("job"), str):
            _recent_jobs.append(clues["job"].lower())

        result = {"clues": clues, "answer": answer}
        if len(_persona_cache) > _CACHE_MAX:
            _persona_cache.clear()
        _persona_cache[cache_key] = result
        return result

    except Exception as e:
        return {"error": str(e), "raw_response": "Exception triggered"}

def _build_user_delta(seed: str | None, region_hint: str | None, theme: str | None) -> dict:
    payload = {"seed": seed or "", "region_hint": region_hint or "", "theme": theme or ""}
    return {
        "role": "user",
        "content": f"delta: {json.dumps(payload, separators=(',', ':'))}"
    }
