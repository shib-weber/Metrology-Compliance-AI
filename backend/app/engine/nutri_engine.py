from typing import Dict, Any

def calculate_nutri_health(nutrition: Dict[str, Any]) -> Dict[str, Any]:
    sugar = float(nutrition.get("sugar_per_100g", 0.0))
    salt = float(nutrition.get("sodium_per_100g", 0.0))
    sat_fat = float(nutrition.get("saturated_fat_per_100g", 0.0))
    additives = int(nutrition.get("ins_additives_count", 0))

    penalty = (sugar * 1.5) + (sat_fat * 2.0) + (salt * 0.05) + (additives * 5.0)
    health_score = max(5, min(100, int(100 - penalty)))

    if health_score >= 80:
        grade = "A (Nutritious / Minimally Processed)"
    elif health_score >= 60:
        grade = "B (Moderately Healthy)"
    elif health_score >= 40:
        grade = "C (Consume in Moderation)"
    else:
        grade = "D (Ultra-Processed / High in Fat & Sugar)"

    return {
        "health_score": health_score,
        "grade": grade,
        "breakdown": {
            "sugar_g": sugar,
            "sat_fat_g": sat_fat,
            "sodium_mg": salt,
            "additives_detected": additives
        }
    }