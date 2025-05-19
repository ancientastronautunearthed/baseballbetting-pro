import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <title>MLB Edge | Professional Baseball Wagering Analytics</title>
      <meta name="description" content="Get the edge in MLB wagering with advanced analytics, real-time data, and deep research to maximize your probability of winning." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      <meta property="og:title" content="MLB Edge | Professional Baseball Wagering Analytics" />
      <meta property="og:description" content="Advanced analytics, real-time data, and deep research to maximize your probability of winning MLB wagers." />
      <meta property="og:type" content="website" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </Helmet>
    <App />
  </HelmetProvider>
);
