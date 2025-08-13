export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeScore(distanceKm) {
  // Perfect score (5000 points) for guesses within 7km
  if (distanceKm <= 7) {
    return 5000;
  }
  
  // Dynamic scoring for distances beyond 7km
  // Score decreases from 5000 to 0 as distance increases from 7km to 20,000km
  const maxScore = 5000;
  const maxDistance = 20000; // ~ half Earth circumference
  
  // Calculate score based on distance from 7km to maxDistance
  const adjustedDistance = distanceKm - 7; // Start from 7km
  const adjustedMaxDistance = maxDistance - 7; // Max distance minus 7km
  
  const normalized = Math.max(0, 1 - adjustedDistance / adjustedMaxDistance);
  const curve = Math.pow(normalized, 2.5); // Exponential decay curve
  
  // Scale the score from 0 to 5000 for distances beyond 7km
  return Math.round(maxScore * curve);
}

// Helper function to show scoring examples
export function getScoringExamples() {
  return [
    { distance: "0-7 km", score: "5000 points", description: "Perfect score - very close guess!" },
    { distance: "10 km", score: "~4500 points", description: "Excellent guess" },
    { distance: "25 km", score: "~3500 points", description: "Very good guess" },
    { distance: "50 km", score: "~2500 points", description: "Good guess" },
    { distance: "100 km", score: "~1500 points", description: "Decent guess" },
    { distance: "500 km", score: "~500 points", description: "Fair guess" },
    { distance: "1000+ km", score: "0-500 points", description: "Far away guess" }
  ];
}
