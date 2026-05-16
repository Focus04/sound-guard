# SoundGuard

SoundGuard is a Real-Time Geospatial Alert Dashboard built to monitor live emergencies and noise pollution events. It features a live dispatch system that aggregates sensor/user data, visualizes it on an interactive map, and routes critical SOS alerts to emergency contacts.

### Live Demo
You can view the live application here: https://soundguard.up.railway.app/

---

### Core Features

* **Interactive Live Map:** Real-time visualization of registered alerts (e.g., Shout Help, Fire Alarm, Car Horn) using the Google Maps API.
* **Smart Event Clustering:** A visual grouping algorithm for overlapping alerts. It dynamically sizes alert radiuses and assigns color codes based on the highest severity at a specific location.
* **Automated SOS Dispatch:** Server-side email integration that instantly routes critical SOS alerts to emergency contacts.
* **Modern Material UI:** A clean, Google-inspired interface (Material Design 3) that is 100% responsive, featuring rounded cards, pill-shaped badges, and centered mobile navigation.

---

### Tech Stack

* **Backend:** Node.js & Express.js (Robust REST API architecture)
* **Database:** MongoDB with 2dsphere indexing (enabling ultra-fast spatial queries)
* **Frontend:** Handlebars.js (Server-Side Rendering) & Materialize CSS
* **Security:** Environment variables (.env) securely managed on the server.
* **Hosting:** Deployed and live on Railway.