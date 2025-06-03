import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) #Make sure to set your OpenAI API key in the .env file

SYSTEM_PROMPT = (
    "You are generating a fictional persona for a geography guessing game. Each persona should reflect the cultural, daily life, "
    "and personality of someone living in a specific **city**, without explicitly revealing the city or country in the clue fields.\n\n"

    "🎯 Objective:\n"
    "- Help the player guess the **city** using indirect, realistic, culturally grounded clues.\n\n"

    "🌍 Geographic Coverage:\n"
    "- Rotate between countries from **different continents** (Asia, Africa, Europe, North America, South America, Oceania).\n"
    "- Avoid repeating the same region too often — diversify across urban cultures globally.\n\n"

    "✅ Clue Guidelines:\n"
    "- **Job**: Choose only globally common roles (e.g., teacher, developer, delivery driver, store clerk). Avoid jobs that suggest local identity or place.\n"
    "- **Routine**: Describe daily habits tied to climate, religion, transportation, urban rhythm, or working hours — without naming cities or countries.\n"
    "- **SocialSnippets**: Include authentic slang, food, routines, and media. You may **name local dishes** as long as they don’t include a country or city name (e.g., 'pho' is okay, 'Turkish coffee' is not).\n"
    "- **Currency Reference**: Mention the **currency name** or use prices in local format (e.g., '50 pesos', 'paid 12 rupees for lunch').\n"
    "- **Landmarks or Parks**: You may name famous landmarks (e.g., 'Eiffel Tower', 'Burj Khalifa', 'Table Mountain') to give richer city-specific clues.\n"
    "- **Fun Fact**: Add a quirky city-specific detail (e.g., annual festival, urban myth, odd law) — again, no city or country name outside the answer fields.\n\n"

    "🚫 DO NOT:\n"
    "- Mention the city or country name in any field except 'correctCity' and 'correctLocation'.\n"
    "- Include terms that contain the city or country name (e.g., 'Turkish delight', 'Brazilian beach').\n"
    "- Use job names or phrases that give away the location explicitly.\n\n"

    "✅ Return your output as **strict valid JSON only** — no extra commentary or explanation.\n\n"

    "JSON fields:\n"
    "- name (string)\n"
    "- age (integer)\n"
    "- job (globally common only)\n"
    "- routine (string)\n"
    "- socialSnippets (object with keys: slang, food, habits, media)\n"
    "- correctCity (string)\n"
    "- correctLocation (string)\n"
    "- correctLat (float)\n"
    "- correctLon (float)\n"
    "- continent (string)\n"
    "- funFact (string — city-specific)\n"
)

USER_PROMPT = {
    "role": "user",
    "content": (
        "Generate a fictional persona for a geography guessing game.\n\n"
        "Return valid JSON with the following structure:\n"
        "{\n"
        '  "name": string,\n'
        '  "age": integer,\n'
        '  "job": string (common/global only),\n'
        '  "routine": string,\n'
        '  "socialSnippets": {\n'
        '    "slang": string,\n'
        '    "food": string,\n'
        '    "habits": string,\n'
        '    "media": string\n'
        "  },\n"
        '  "correctCity": string,\n'
        '  "correctLocation": string,\n'
        '  "correctLat": float,\n'
        '  "correctLon": float,\n'
        '  "continent": string,\n'
        '  "funFact": string\n'
        "}"
    )
}


async def generate_persona():
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                USER_PROMPT
            ],
            temperature=0.9
        )

        raw = response.choices[0].message.content.strip()
        print("🟢 Raw response:")
        print(raw)

        # Clean any markdown syntax
        raw = raw.replace("```json", "").replace("```", "").strip()

        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            return {"error": "No JSON object found", "raw_response": raw}

        persona = json.loads(match.group(0))

        clues = {
            "name": persona["name"],
            "age": persona["age"],
            "job": persona["job"],
            "routine": persona["routine"],
            "socialSnippets": persona["socialSnippets"],
            "funFact": persona["funFact"]
        }

        answer = {
            "correctCity": persona["correctCity"],
            "correctLocation": persona["correctLocation"],
            "correctLat": persona["correctLat"],
            "correctLon": persona["correctLon"],
            "continent": persona["continent"]
        }

        return {"clues": clues, "answer": answer}

    except Exception as e:
        return {"error": str(e), "raw_response": "Exception triggered"}
