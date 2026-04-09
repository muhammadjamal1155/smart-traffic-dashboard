# Smart Traffic Dashboard

A modern Live Traffic UI module for a Smart Traffic & Road Safety web application. The dashboard works as a smart city control room where users can view a live TomTom traffic map, calculate driving ETA with traffic, switch traffic states, and interact with animated safety-focused UI elements.

## Key Features

- Dark smart city dashboard UI with consistent traffic colors
- Real TomTom map view with live traffic flow when an API key is configured
- Real driving ETA and distance calculation using TomTom Routing API
- Animated fallback map when a TomTom API key is not available
- Interactive Low, Medium, and High traffic controls
- Animated route drawing, vehicle markers, signal lights, and camera labels in fallback mode
- High-traffic accident alert popup with urgent visual styling
- Real-time clock and last-updated timestamp
- Voice input simulation button for bonus UI interaction
- Dark/light mode toggle
- Traffic density bars and estimated delay display
- Responsive layout for mobile, tablet, and desktop screens
- Project-specific SVG favicon

## Tech Stack

- React.js
- Tailwind CSS
- Framer Motion
- Vite
- TomTom Maps SDK

## Code Structure

```text
src/
|-- components/
|   |-- TomTomTrafficMap.jsx
|   |-- TrafficControls.jsx
|   |-- TrafficLegend.jsx
|   |-- TrafficMap.jsx
|   |-- TrafficStatusBadge.jsx
|-- pages/
|   |-- LiveTrafficPage.jsx
|-- App.jsx
|-- index.css
|-- main.jsx
```

## Local Setup

Create an env file for the live TomTom map:

```bash
cp .env.example .env.local
```

Add your TomTom JavaScript API key in `.env.local`:

```bash
VITE_TOMTOM_API_KEY=your_tomtom_key_here
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Live Traffic Logic

When `VITE_TOMTOM_API_KEY` is configured, the map loads TomTom with real traffic flow. The route form uses live driving directions and returns traffic-aware ETA when TomTom provides it.

If no key is configured, the app keeps a polished animated fallback so the UI still works for demos and screenshots.

Traffic state is managed with React state:

- Low traffic: green UI state, smooth flow message, 2 minute estimated delay
- Medium traffic: yellow UI state, moderate delay message, 8 minute estimated delay
- High traffic: red UI state, urgent alert state, 18 minute estimated delay

The UI is split into reusable components:

- `TomTomTrafficMap` loads TomTom Maps SDK, traffic flow, search, and routing
- `TrafficMap` switches between live TomTom map and animated fallback simulation
- `TrafficControls` handles level selection buttons
- `TrafficStatusBadge` handles status and density animation
- `TrafficLegend` explains the traffic color system
- `LiveTrafficPage` combines layout, page state, clock, alert, route form, and theme logic

## Review Checklist

- Clean spacing and consistent dashboard theme
- Mobile responsive layout
- Readable component-based code
- Meaningful traffic colors and visible animations
- README includes intro, features, setup, and structure
- Environment variable documented without exposing a real API key

## Author

Muhammad Jamal  
GitHub: [muhammadjamal1155](https://github.com/muhammadjamal1155)



