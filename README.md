# 🌍 GeoPersona

**GeoPersona** is an interactive, AI-powered geography guessing game. Given fictional character clues and habits, players must pinpoint their location on the map. It's like *GeoGuessr* meets *AI storytelling* — powered by React, Python, FastAPI, and Leaflet.

Quick backstory: I wanted to teach my niece and nephew some geography during their summer break, but I was having a hard time with youtube videos, guoguessr and conventional book knowldege. That's when I decided to use User Personas to teach them and that is how this idea came to fruition.

---

## 🚀 Features

- 🎭 **AI-Persona Clue Generation**
- 🗺️ **Interactive Map with Click-to-Guess**
- 📈 **Smart Scoring Logic**
  - 100 points → Exact city
  - 75 points → Within 100 km
  - 50 points → Right country
  - 25 points → Elsewhere
- 🔁 **5 Rounds of Play**
- 🌗 **Theme Toggle (Light/Dark)**
- 📍 **Line Between Guess and Correct Location**

---

## 🧠 Tech Stack

**Frontend**
- React + Vite
- Leaflet.js (with markers + polylines)
- TailwindCSS

**Backend**
- FastAPI (Python)
- Randomized Persona Generator
- CORS enabled for dev use

---

## 📁 Project Structure

```
GeoPersona/
│
├── backend/
│   ├── main.py
│   ├── persona_generator.py
│   └── ...
│
├── frontend/
│   ├── App.jsx
│   ├── index.css
│   └── ...
│
├── venv/
├── node_modules/
├── .gitignore
├── README.md
└── ...
```

---

## ⚙️ Getting Started

### ✅ Clone and Setup

```bash
git clone https://github.com/prabhuavula7/geopersona.git
cd geopersona
```

### 🧪 Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 💻 Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

> Visit the app at: **http://localhost:5173**

---

## 🎮 Gameplay Walkthrough

1. Click **Start Game**
2. Read your persona’s profile
3. Guess their location on the map
4. Submit your guess
5. See the score and the correct answer
6. Proceed to the next round!

---

## 🛡️ .gitignore Includes

- `frontend/node_modules/`
- `backend/__pycache__/`
- `backend/.env`
- `venv/`
- `s1.png` to `s6.png`
- `.DS_Store`, logs, and editor configs

---

## 🙋‍♂️ Author

**Prabhu Avula.**  
📍 Based in curiosity & creativity  
🔗 [LinkedIn](https://www.linkedin.com/in/prabhuavula) – let’s connect!

---

## 💡 Fun Fact

"GeoPersona" was built from scratch in a few nights as a creative coding experiment — where world geography meets AI storytelling.
