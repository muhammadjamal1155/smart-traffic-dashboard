# Smart Traffic Dashboard

A modern Live Traffic UI simulation for a Smart Traffic & Road Safety web application. The module presents a smart city control room where users can switch traffic levels and watch the map overlay, status badge, route line, vehicle markers, and alert states update with smooth animations.

## Key Features

- Dark smart city dashboard UI with traffic color consistency
- Interactive Low, Medium, and High traffic controls
- Dynamic map overlay using green, yellow, and red traffic states
- Animated route drawing, moving vehicle markers, signal lights, and camera labels
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

## Code Structure

```text
src/
|-- components/
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

The Live Traffic page uses React state to manage the selected traffic level:

- Low traffic: green overlay, smooth flow message, 2 minute estimated delay
- Medium traffic: yellow overlay, moderate delay message, 8 minute estimated delay
- High traffic: red overlay, urgent alert state, 18 minute estimated delay

The UI is split into reusable components for cleaner integration:

- `TrafficMap` handles the animated map simulation
- `TrafficControls` handles level selection buttons
- `TrafficStatusBadge` handles status and density animation
- `TrafficLegend` explains the traffic color system
- `LiveTrafficPage` combines layout, page state, clock, alert, and theme logic

## Review Checklist

- Clean spacing and consistent dashboard theme
- Mobile responsive layout
- Readable component-based code
- Meaningful traffic colors and visible animations
- README includes intro, features, setup, and structure

## Author

Muhammad Jamal  
GitHub: [muhammadjamal1155](https://github.com/muhammadjamal1155)
