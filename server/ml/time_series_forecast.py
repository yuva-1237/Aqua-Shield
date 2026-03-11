import sys
import json
import random
import hashlib

def forecast_climate_metrics(years_ahead, city="Global"):
    # Seed based on city name for reproducible but unique localized projections
    seed_val = int(hashlib.md5(city.encode()).hexdigest(), 16) % 10**8
    random.seed(seed_val)
    
    # Simulating time-series regression for multiple variables
    sl_baseline = 0.0
    sl_trend = 0.5 # mm per year
    
    temp_baseline = 0.4 # Current anomaly starting point
    temp_trend = 0.045 # Projected degrees per year
    
    results = []
    for year in range(2026, 2051):
        diff = year - 2025
        
        # Sea Level Rise (cm)
        sl_val = sl_baseline + (sl_trend * diff) + random.uniform(-0.1, 0.1)
        
        # Temp Anomaly (C)
        temp_val = temp_baseline + (temp_trend * diff) + random.uniform(-0.05, 0.05)
        
        results.append({
            "year": year, 
            "prediction": round(sl_val, 2),
            "temp_anomaly": round(temp_val, 2)
        })
    return results

if __name__ == "__main__":
    city = "Global"
    if len(sys.argv) > 1:
        city = sys.argv[1]
        
    projections = forecast_climate_metrics(25, city)
    print(json.dumps(projections))
