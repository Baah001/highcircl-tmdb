# Cinefy

Cinefy is a small Angular application that integrates with the TMDB API to browse popular movies, search by title, and explore detailed movie information.

The goal of this project was to build a clean, maintainable, and production-ready Angular application with clear architecture, test coverage, and thoughtful UI handling for edge cases.

---

## Features

- Browse popular movies
- Search movies by title
- Detailed movie view (poster, backdrop, runtime, language, genres, overview)
- Graceful handling of missing data
- Loading and error states
- Responsive layout
- Unit tests using Vitest

---

## Tech Stack

- Angular (standalone APIs, signals, functional interceptors)
- RxJS
- Vitest for unit testing
- TMDB REST API
- SCSS for styling

---

## Architecture Notes

The project follows a clear separation of concerns:

- `core/` → API services, DTOs, mappers, config tokens, interceptors
- `features/` → Feature-level pages (home, movie details)
- `shared/` → Reusable UI components
- Explicit DTO → Model mapping layer
- Union-based view state modeling for predictable UI states

The UI remains stable even when optional data (poster, backdrop, runtime, overview) is missing.

---

## Getting Started

Install dependencies:

```bash
npm install
```

Start development server:
```bash
ng serve
```
Open: http://localhost:4200

## Testing
Run unit tests:

```bash
ng test
```
The project uses Vitest for fast and isolated unit testing of services, mappers, interceptors, and components.

## Environment Configuration

TMDB configuration is provided via an Angular injection token.

Set your API key inside:

```src/environments/environment.local.ts```

Example:
```
tmdb: {
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: 'YOUR_API_KEY',
  language: 'en-US'
}
```
