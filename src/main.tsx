import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add meta tag to prevent opening new tabs for same origin
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
document.head.appendChild(metaTag);

// Render immediately without delay
createRoot(document.getElementById("root")!).render(<App />);
