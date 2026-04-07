# Smart Traffic Dashboard

A modern Live Traffic UI simulation for a Smart Traffic & Road Safety web application. The dashboard lets users switch between low, medium, and high traffic states while the map overlay, status badge, route line, and animated traffic indicators update in real time.

## Features

- Dark mode smart city dashboard design
- Interactive traffic controls for Low, Medium, and High traffic
- Dynamic traffic map overlay with green, yellow, and red states
- Animated route drawing and moving vehicle indicators
- High traffic pulse alert animation
- Traffic status badge with smooth Framer Motion transitions
- Traffic legend for quick color reference
- Responsive layout for desktop, tablet, and mobile screens
- Project favicon related to the traffic dashboard theme

## Tech Stack

- React.js
- Tailwind CSS
- Framer Motion
- Vite

## Getting Started

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

## Project Structure

```text
src/
├── components/
│   ├── TrafficControls.jsx
│   ├── TrafficLegend.jsx
│   ├── TrafficMap.jsx
│   └── TrafficStatusBadge.jsx
├── pages/
│   └── LiveTrafficPage.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## Live Traffic Module

The Live Traffic page uses React state to manage the selected traffic level:

- Low traffic uses a green overlay and smooth traffic flow
- Medium traffic uses a yellow overlay and moderate delay messaging
- High traffic uses a red overlay, pulse animation, and rerouting alert messaging

## Author

Muhammad Jamal  
GitHub: [muhammadjamal1155](https://github.com/muhammadjamal1155)
