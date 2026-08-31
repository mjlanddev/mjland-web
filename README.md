<h1 align="center">mjland</h1>
<p align="center"><i>A beautiful and feature-rich web application for discovering and watching movies and TV shows. Explore detailed media information, get personalized recommendations, and stream seamlessly!</i></p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB&style=flat-square">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=flat-square">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white&style=flat-square">
  </a>
  <a href="https://www.themoviedb.org/">
    <img src="https://img.shields.io/badge/TMDB_API-01b4e4?logo=themoviedb&logoColor=white&style=flat-square">
  </a>
  <a href="https://motion.dev/">
    <img src="https://img.shields.io/badge/Motion-000000?logo=framer&logoColor=white&style=flat-square">
  </a>
</p>

<p align="center">
  <a href="https://github.com/mjlanddev/mjland-web/"><img src="https://img.shields.io/github/stars/mjlanddev/mjland-web?style=flat-square&color=yellow"></a>
  <a href="https://github.com/mjlanddev/mjland-web/network/members"><img src="https://img.shields.io/github/forks/mjlanddev/mjland-web?style=flat-square&color=blue"></a>
</p>

<hr>

## ⚠️ Project Discontinued

**Due to legal reasons, all public instances and updates for this application have been stopped.** Thank you to everyone who supported this project.

<hr>

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Home</b></td>
      <td align="center"><b>Details</b></td>
      <td align="center"><b>Search</b></td>
    </tr>
    <tr>
      <td><img width="280" alt="Home" src="https://github.com/user-attachments/assets/c059bac4-cddc-461a-8850-5ced494b4ac3" /></td>
      <td><img width="280" alt="Details" src="https://github.com/user-attachments/assets/7f5da619-1ae1-4db5-896c-468ec2ba7b05" /></td>
      <td><img width="280" alt="Search" src="https://github.com/user-attachments/assets/a9143dfa-88a8-4f85-823b-2d81073c2a93" /></td>
    </tr>
  </table>
</div>

## 🚀 Features
* **TMDB Integration:** Powered by The Movie Database for rich, accurate metadata, cast info, and posters.
* **Cinematic UI/UX:** Built with TailwindCSS and Motion/React for buttery-smooth animations, glassmorphism overlays, and a premium Theater Mode.
* **Smart Streaming:** Multiple high-quality streaming servers integrated out-of-the-box.
* **Personalized Recommendations:** Discover new content based on trending algorithms and detailed genre filtering.
* **Advanced Search:** Deep search capabilities with granular filtering.
* **Offline Tracking:** Secure local storage synchronization for your Watchlist and Continue Watching history.

## 🛠️ Setup & Development

If you're a developer wanting to build the project locally, follow these steps.

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* A TMDB API Key

### Configuring API Keys
For security reasons, the TMDB API key is **not** hardcoded in this repository.

To build the app yourself:
1. Clone the repository:
   ```bash
   git clone https://github.com/mjlanddev/mjland-web.git
   cd mjland-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your TMDB credentials (you can copy `.env.example`):
   ```properties
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_APP_NAME="mjland"
   VITE_APP_SHORT_NAME="mj"
   ```
4. Run the development server!
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## ⚠️ Disclaimer

This project was an open-source streaming application created for **educational and personal use purposes only**.

### Content Disclaimer
* This application does **not host, store, upload, or distribute any copyrighted video content** on its own servers.
* Movie/TV metadata, titles, descriptions, ratings, and poster images are obtained from third-party sources such as TMDB and remain the property of their respective owners.
* Video content displayed through the application was provided by third-party services via external sources.
* The developers of this project did not control, own, or operate any external video sources linked through the application.

### Copyright
All trademarks, logos, titles, artwork, posters, and related intellectual property belong to their respective copyright holders. Their inclusion within this application was for informational and indexing purposes only.

### User Responsibility
Users are solely responsible for how they used this software and for complying with applicable copyright laws and regulations in their jurisdiction.

The developers, contributors, and maintainers of this project shall not be held liable for any misuse of the software, copyright infringement, or other unlawful activities carried out by users.

### DMCA / Content Removal
If you are a copyright owner and believe that any content previously accessible through this application infringed your rights, please contact the relevant content hosting provider directly. Since this application did not host the video content, removal requests should be directed to the source hosting the material.

### No Warranty
This software was provided "AS IS", without warranty of any kind, express or implied. The developers assume no responsibility for any damages, legal issues, or losses arising from the use of this project.
