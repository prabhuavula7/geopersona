# 🎮 GeoPersona Frontend

**React-based frontend application for the GeoPersona geography guessing game.** This application provides an interactive, responsive interface for players to guess locations based on AI-generated character clues.

---

## 🏗️ **Architecture Overview**

The frontend is built with modern React patterns and follows a component-based architecture:

- **React 18+** with functional components and hooks
- **Vite** for fast development and optimized builds
- **TailwindCSS** for utility-first styling
- **Leaflet.js** for interactive world maps
- **Local Storage** for persistent game state and preferences

---

## 📁 **Project Structure**

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── EntryScreen.jsx  # Difficulty selection & game start
│   │   ├── GameMap.jsx      # Interactive world map
│   │   ├── GameRecap.jsx    # Game results & history
│   │   ├── PersonaPanel.jsx # Character clues & game info
│   │   └── ThemeToggle.jsx  # Light/dark mode toggle
│   ├── utils/
│   │   └── geo.js          # Geographic calculations & scoring
│   ├── assets/              # Static assets (favicons, etc.)
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles & TailwindCSS
├── public/                  # Static assets
│   ├── favicon.ico         # Main favicon
│   ├── favicon-16x16.png   # Small favicon
│   ├── favicon-32x32.png   # Medium favicon
│   └── apple-touch-icon.png # iOS touch icon
├── package.json             # Dependencies & scripts
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm 8+ or yarn 1.22+
- Backend server running on port 8000

### **Installation**
```bash
cd frontend
npm install
```

### **Development Server**
```bash
npm run dev
```
**Access**: http://localhost:5173

### **Build for Production**
```bash
npm run build
```
**Output**: `dist/` folder with optimized production build

### **Preview Production Build**
```bash
npm run preview
```

---

## 🧩 **Component Architecture**

### **App.jsx** - Main Application
- **State Management**: Centralized game state using React hooks
- **Game Flow**: Controls game progression and round management
- **API Integration**: Handles communication with backend services
- **Loading States**: Manages loading screens and user feedback

**Key State Variables:**
```javascript
const [gameStarted, setGameStarted] = useState(false)
const [currentRound, setCurrentRound] = useState(0)
const [gameCities, setGameCities] = useState([])
const [currentPersona, setCurrentPersona] = useState(null)
const [isLoading, setIsLoading] = useState(false)
const [theme, setTheme] = useState('light')
```

### **EntryScreen.jsx** - Game Entry Point
- **Difficulty Selection**: Beginner, Intermediate, Advanced buttons
- **Game Initialization**: Triggers city selection and persona generation
- **Loading States**: Shows loading during game setup

### **GameMap.jsx** - Interactive World Map
- **Leaflet Integration**: World map with click-to-guess functionality
- **Marker Management**: Displays guess location and correct answer
- **Distance Visualization**: Shows line between guess and actual location
- **Responsive Design**: Adapts to different screen sizes

**Key Features:**
- Click anywhere on map to place guess
- Visual feedback for guess placement
- Distance calculation and display
- Theme-aware styling

### **PersonaPanel.jsx** - Character Information
- **Clue Display**: Shows AI-generated character profile
- **Game Information**: Current round, score, and progress
- **Anti-Cheating**: No location-specific information revealed
- **Responsive Layout**: Adapts to different screen sizes

**Clue Categories:**
- Routine: Daily life and habits
- Social Snippets: Food, music, habits, media preferences
- Job: Profession and work details
- Fun Fact: Cultural observation (non-location specific)

### **GameRecap.jsx** - Game Results
- **Score Summary**: Final score and round-by-round breakdown
- **Map Display**: Interactive map showing all guesses
- **History Table**: Detailed results for each round
- **Theme Integration**: Responsive to light/dark mode changes

### **ThemeToggle.jsx** - Theme Management
- **Light/Dark Mode**: Toggle between themes
- **Persistent Storage**: Saves preference in localStorage
- **Global State**: Updates theme across all components

---

## 🎨 **Styling & Design**

### **TailwindCSS Integration**
- **Utility-First**: Rapid development with utility classes
- **Responsive Design**: Mobile-first approach with breakpoints
- **Theme Support**: Dark/light mode with CSS variables
- **Custom Components**: Consistent design system

### **Color Scheme**
```css
/* Light Theme */
--primary: #3b82f6      /* Blue */
--secondary: #64748b     /* Slate */
--background: #ffffff     /* White */
--text: #1e293b         /* Dark slate */

/* Dark Theme */
--primary: #60a5fa      /* Light blue */
--secondary: #94a3b8    /* Light slate */
--background: #0f172a    /* Dark blue */
--text: #f1f5f9         /* Light slate */
```

### **Responsive Breakpoints**
- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🗺️ **Map Integration**

### **Leaflet.js Setup**
- **World Map**: OpenStreetMap tiles for global coverage
- **Interactive Elements**: Click handlers, markers, and polylines
- **Performance**: Optimized rendering for smooth gameplay
- **Accessibility**: Keyboard navigation and screen reader support

### **Map Features**
- **Click-to-Guess**: Click anywhere to place guess marker
- **Distance Calculation**: Real-time distance using Haversine formula
- **Visual Feedback**: Clear indication of guess placement
- **Theme Integration**: Map styling adapts to light/dark mode

---

## 🔧 **State Management**

### **Game State Flow**
1. **Entry Screen** → User selects difficulty
2. **Loading** → Backend fetches cities and generates persona
3. **Game Round** → User reads clues and makes guess
4. **Feedback** → Score calculation and distance display
5. **Next Round** → Repeat until 5 rounds complete
6. **Game Recap** → Final score and round history

### **State Persistence**
- **Theme Preference**: Stored in localStorage
- **Game Progress**: Maintained during session
- **User Preferences**: Remembered across visits

---

## 🌐 **API Integration**

### **Backend Communication**
- **Base URL**: Configurable via environment variables
- **Endpoints**: City selection and persona generation
- **Error Handling**: Graceful fallbacks and user feedback
- **Loading States**: Visual feedback during API calls

### **API Calls**
```javascript
// Fetch cities for game
const response = await fetch(`${API_BASE}/api/game/cities/${difficulty}`)

// Generate persona for city
const response = await fetch(`${API_BASE}/api/generate_persona`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(cityData)
})
```

---

## 🎯 **Game Logic**

### **Scoring System**
- **Perfect Score**: 5000 points for guesses ≤7km
- **Dynamic Scoring**: Exponential decay from 7km to 20,000km
- **Distance Calculation**: Accurate using Haversine formula
- **Score Display**: Real-time feedback and round summary

### **Anti-Cheating Measures**
- **No Console Logs**: Location information removed from logs
- **Clean Source**: No hidden location data in code
- **Secure API**: Backend handles sensitive information
- **User Experience**: Focus on gameplay, not technical details

---

## 📱 **Responsive Design**

### **Mobile Optimization**
- **Touch-Friendly**: Large touch targets and gestures
- **Adaptive Layout**: Components stack vertically on small screens
- **Performance**: Optimized for mobile devices
- **Accessibility**: Screen reader and keyboard navigation support

### **Breakpoint Strategy**
```css
/* Mobile First */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 640px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; }
}
```

---

## 🧪 **Development Workflow**

### **Available Scripts**
```json
{
  "dev": "Start development server",
  "build": "Create production build",
  "preview": "Preview production build",
  "lint": "Run ESLint checks",
  "lint:fix": "Auto-fix ESLint issues"
}
```

### **Code Quality**
- **ESLint**: Code style and best practices
- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety (optional)
- **Component Testing**: Unit tests for critical components

### **Hot Reload**
- **Instant Updates**: Changes reflect immediately in browser
- **State Preservation**: Game state maintained during development
- **Error Overlay**: Clear error messages and stack traces

---

## 🐛 **Troubleshooting**

### **Common Issues**

**Map Not Loading**
- Check if backend is running on port 8000
- Verify API_BASE_URL environment variable
- Check browser console for CORS errors

**Styling Issues**
- Ensure TailwindCSS is properly imported
- Check for CSS conflicts in index.css
- Verify theme toggle is working

**Performance Issues**
- Check for memory leaks in useEffect hooks
- Optimize map rendering for large datasets
- Monitor bundle size with build analysis

### **Debug Mode**
```javascript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log('Debug info:', data)
```

---

## 📚 **Dependencies**

### **Core Dependencies**
- **React 18+**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Leaflet**: Interactive maps

### **Development Dependencies**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (optional)

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **PWA Support**: Offline functionality and app-like experience
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Enhanced screen reader and keyboard support
- **Internationalization**: Multi-language support
- **Analytics**: Game performance and user behavior tracking

### **Performance Improvements**
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: WebP format and responsive images
- **Bundle Analysis**: Optimize JavaScript bundle size
- **Caching Strategy**: Service worker for offline support

---

## 📄 **License**

This frontend application is part of the GeoPersona project and follows the same license terms.

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly on different devices
5. **Submit** a pull request

### **Development Guidelines**
- Follow React best practices
- Maintain responsive design principles
- Ensure accessibility compliance
- Write clear component documentation
- Test across different browsers and devices
