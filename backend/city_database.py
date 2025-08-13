import json
import random
import hashlib
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from collections import defaultdict, deque
from pathlib import Path

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
    
    @property
    def state_province(self) -> str:
        """Return region as state/province for compatibility."""
        return self.region
    
    @property
    def neighborhoods(self) -> List[str]:
        """Return empty list for neighborhoods - not used in our current data."""
        return []

class CitySelectionEngine:
    def __init__(self):
        self.cities: Dict[str, List[City]] = {
            "beginner": [],
            "intermediate": [],
            "advanced": []
        }
        self.cities_by_continent: Dict[str, List[City]] = defaultdict(list)
        self.cities_by_country: Dict[str, List[City]] = defaultdict(list)
        self.recently_used_cities: deque = deque(maxlen=50)
        self.recently_used_countries: deque = deque(maxlen=20)
        
        self._load_city_database()
        self._categorize_cities()
    
    def _load_city_database(self):
        """Load cities from the three JSON files."""
        data_dir = Path(__file__).parent / "data"
        
        # Load beginner cities
        try:
            with open(data_dir / "beginner_cities.json", 'r', encoding='utf-8') as f:
                beginner_data = json.load(f)
                for city_info in beginner_data.get("beginner", []):
                    city = City(**city_info)
                    self.cities["beginner"].append(city)
            print(f"✅ Loaded {len(self.cities['beginner'])} beginner cities")
        except Exception as e:
            print(f"❌ Error loading beginner cities: {e}")
        
        # Load intermediate cities
        try:
            with open(data_dir / "intermediate_cities.json", 'r', encoding='utf-8') as f:
                intermediate_data = json.load(f)
                for city_info in intermediate_data.get("intermediate", []):
                    city = City(**city_info)
                    self.cities["intermediate"].append(city)
            print(f"✅ Loaded {len(self.cities['intermediate'])} intermediate cities")
        except Exception as e:
            print(f"❌ Error loading intermediate cities: {e}")
        
        # Load advanced cities
        try:
            with open(data_dir / "advanced_cities.json", 'r', encoding='utf-8') as f:
                advanced_data = json.load(f)
                for city_info in advanced_data.get("advanced", []):
                    city = City(**city_info)
                    self.cities["advanced"].append(city)
            print(f"✅ Loaded {len(self.cities['advanced'])} advanced cities")
        except Exception as e:
            print(f"❌ Error loading advanced cities: {e}")
    
    def _categorize_cities(self):
        """Categorize cities by continent and country."""
        for difficulty, city_list in self.cities.items():
            for city in city_list:
                self.cities_by_continent[city.continent].append(city)
                self.cities_by_country[city.country].append(city)
    
    def select_city(self, difficulty: str, seed: str = None, region_hint: str = None) -> City:
        """
        Select a city based on difficulty with guaranteed diversity.
        
        Args:
            difficulty: "beginner", "intermediate", or "advanced"
            seed: Optional seed for reproducible selection
            region_hint: Optional hint to prefer certain regions
            
        Returns:
            Selected City object
        """
        # Validate difficulty
        if difficulty not in self.cities:
            raise ValueError(f"Invalid difficulty: {difficulty}. Must be one of: {list(self.cities.keys())}")
        
        # Set random seed if provided
        if seed:
            # Create a deterministic seed from the string
            seed_hash = int(hashlib.md5(seed.encode()).hexdigest(), 16)
            random.seed(seed_hash)
        
        # Get available cities for this difficulty
        available_cities = self.cities[difficulty].copy()
        if not available_cities:
            raise ValueError(f"No cities available for difficulty: {difficulty}")
        
        # Filter out recently used cities and countries
        filtered_cities = [
            city for city in available_cities
            if city.name not in self.recently_used_cities
            and city.country not in self.recently_used_countries
        ]
        
        # If we're running low on diversity, reset some history
        if len(filtered_cities) < 5:
            # Keep only the last 10 cities and 5 countries
            self.recently_used_cities = deque(list(self.recently_used_cities)[-10:], maxlen=50)
            self.recently_used_countries = deque(list(self.recently_used_countries)[-5:], maxlen=20)
            filtered_cities = available_cities
        
        # Apply region hint if provided
        if region_hint:
            region_cities = [
                city for city in filtered_cities 
                if region_hint.lower() in city.region.lower() 
                or region_hint.lower() in city.continent.lower()
                or region_hint.lower() in city.country.lower()
            ]
            if region_cities:
                filtered_cities = region_cities
        
        # Ensure continental diversity - prefer continents with fewer recent selections
        if len(self.recently_used_cities) > 0:
            continent_counts = defaultdict(int)
            for city_name in self.recently_used_cities:
                # Find the city object to get its continent
                for difficulty_cities in self.cities.values():
                    for city in difficulty_cities:
                        if city.name == city_name:
                            continent_counts[city.continent] += 1
                            break
            
            if continent_counts:
                # Find continents with the lowest count
                min_count = min(continent_counts.values())
                least_used_continents = [cont for cont, count in continent_counts.items() if count == min_count]
                
                # Prefer cities from least used continents
                continent_cities = [city for city in filtered_cities if city.continent in least_used_continents]
                if continent_cities:
                    filtered_cities = continent_cities
        
        # If still no cities available, use all available cities for this difficulty
        if not filtered_cities:
            filtered_cities = available_cities
        
        # Select the city
        selected_city = random.choice(filtered_cities)
        
        # Update history
        self.recently_used_cities.append(selected_city.name)
        self.recently_used_countries.append(selected_city.country)
        
        return selected_city
    
    def select_cities_for_game(self, difficulty: str, count: int = 5, seed: str = None, 
                              region_hint: str = None, max_per_continent: int = 2) -> List[City]:
        """
        Select multiple cities for a game with continental diversity constraints.
        
        Args:
            difficulty: "beginner", "intermediate", or "advanced"
            count: Number of cities to select (default: 5)
            seed: Optional seed for reproducible selection
            region_hint: Optional hint to prefer certain regions
            max_per_continent: Maximum cities allowed from same continent (default: 2)
            
        Returns:
            List of selected City objects with continental diversity
        """
        # Validate difficulty
        if difficulty not in self.cities:
            raise ValueError(f"Invalid difficulty: {difficulty}. Must be one of: {list(self.cities.keys())}")
        
        # Set random seed if provided
        if seed:
            # Create a deterministic seed from the string
            seed_hash = int(hashlib.md5(seed.encode()).hexdigest(), 16)
            random.seed(seed_hash)
        
        # Get available cities for this difficulty
        available_cities = self.cities[difficulty].copy()
        if not available_cities:
            raise ValueError(f"No cities available for difficulty: {difficulty}")
        
        selected_cities = []
        used_continents = defaultdict(int)  # Track continent usage in this game
        
        for i in range(count):
            # Filter cities based on continental constraints
            filtered_cities = []
            
            for city in available_cities:
                # Skip if already selected
                if city in selected_cities:
                    continue
                
                # Skip if we've hit the limit for this continent
                if used_continents[city.continent] >= max_per_continent:
                    continue
                
                # Skip if recently used globally
                if city.name in self.recently_used_cities:
                    continue
                
                # Skip if country recently used
                if city.country in self.recently_used_countries:
                    continue
                
                filtered_cities.append(city)
            
            # If no cities meet constraints, relax some filters
            if not filtered_cities:
                # Relax the continent constraint
                for city in available_cities:
                    if city not in selected_cities and city.name not in self.recently_used_cities:
                        filtered_cities.append(city)
            
            # If still no cities, use any available city
            if not filtered_cities:
                for city in available_cities:
                    if city not in selected_cities:
                        filtered_cities.append(city)
            
            # Select the city
            if filtered_cities:
                selected_city = random.choice(filtered_cities)
                selected_cities.append(selected_city)
                used_continents[selected_city.continent] += 1
                
                # Update global history
                self.recently_used_cities.append(selected_city.name)
                self.recently_used_countries.append(selected_city.country)
            else:
                # Emergency fallback - this shouldn't happen with our city counts
                break
        
        return selected_cities
    
    def get_continental_diversity_stats(self, cities: List[City]) -> Dict[str, int]:
        """
        Get continental distribution for a list of cities.
        
        Args:
            cities: List of City objects
            
        Returns:
            Dictionary with continent counts
        """
        continent_counts = defaultdict(int)
        for city in cities:
            continent_counts[city.continent] += 1
        return dict(continent_counts)
    
    def select_cities_for_game_deterministic(self, difficulty: str, count: int = 5, seed: str = None, 
                                           region_hint: str = None, max_per_continent: int = 2) -> List[City]:
        """
        Select multiple cities for a game with continental diversity constraints.
        This version is TRULY deterministic - same seed always produces same cities.
        
        Args:
            difficulty: "beginner", "intermediate", or "advanced"
            count: Number of cities to select (default: 5)
            seed: Optional seed for reproducible selection
            region_hint: Optional hint to prefer certain regions
            max_per_continent: Maximum cities allowed from same continent (default: 2)
            
        Returns:
            List of selected City objects with continental diversity
        """
        # Validate difficulty
        if difficulty not in self.cities:
            raise ValueError(f"Invalid difficulty: {difficulty}. Must be one of: {list(self.cities.keys())}")
        
        # Set random seed if provided
        if seed:
            # Create a deterministic seed from the string
            seed_hash = int(hashlib.md5(seed.encode()).hexdigest(), 16)
            random.seed(seed_hash)
        
        # Get available cities for this difficulty
        available_cities = self.cities[difficulty].copy()
        if not available_cities:
            raise ValueError(f"No cities available for difficulty: {difficulty}")
        
        selected_cities = []
        used_continents = defaultdict(int)  # Track continent usage in this game
        
        for i in range(count):
            # Filter cities based on continental constraints
            filtered_cities = []
            
            for city in available_cities:
                # Skip if already selected
                if city in selected_cities:
                    continue
                
                # Skip if we've hit the limit for this continent
                if used_continents[city.continent] >= max_per_continent:
                    continue
                
                filtered_cities.append(city)
            
            # If no cities meet constraints, relax the continent constraint
            if not filtered_cities:
                for city in available_cities:
                    if city not in selected_cities:
                        filtered_cities.append(city)
            
            # Select the city
            if filtered_cities:
                selected_city = random.choice(filtered_cities)
                selected_cities.append(selected_city)
                used_continents[selected_city.continent] += 1
            else:
                # Emergency fallback - this shouldn't happen with our city counts
                break
        
        return selected_cities
    
    def get_city_info(self, city_name: str) -> Optional[City]:
        """Get city information by name."""
        for difficulty_cities in self.cities.values():
            for city in difficulty_cities:
                if city.name.lower() == city_name.lower():
                    return city
        return None
    
    def get_difficulty_stats(self) -> Dict[str, int]:
        """Get count of cities available for each difficulty level."""
        return {difficulty: len(cities) for difficulty, cities in self.cities.items()}
    
    def get_continental_distribution(self) -> Dict[str, int]:
        """Get distribution of cities across continents."""
        return {continent: len(cities) for continent, cities in self.cities_by_continent.items()}
    
    def get_cities_by_difficulty(self, difficulty: str) -> List[City]:
        """Get all cities for a specific difficulty level."""
        return self.cities.get(difficulty, [])

# Global instance
city_engine = CitySelectionEngine()
