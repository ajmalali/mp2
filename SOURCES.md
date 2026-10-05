# Sources

Declared per Rule 2 of the MP2 README.

## APIs

| API                                                    | Used for                                                                         | Terms                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [The Rick and Morty API](https://rickandmortyapi.com/) | All characters, episodes and portraits (list, gallery and detail views)          | Free, no key                                             |
| [TVmaze API](https://www.tvmaze.com/api)               | Episode summaries, stills, runtimes, ratings and the IMDb id on the episode page | Data licensed CC BY-SA 4.0; credited on the episode page |

The episode page links out to the show's IMDb page; no IMDb data is fetched.

## Images

| File                                 | Source                                                                                                   | Used in             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------- |
| `src/assets/rick-and-morty-logo.svg` | Wikimedia Commons, [File:Rick_and_Morty.svg](https://commons.wikimedia.org/wiki/File:Rick_and_Morty.svg) | Header logo         |
| `src/assets/slime-drip.svg`          | Drawn for this project                                                                                   | Header slime border |
| `public/favicon.svg`                 | Drawn for this project                                                                                   | Browser tab icon    |

Character portraits and episode stills are loaded at runtime from the two APIs
above and are not stored in the repo. Rick and Morty and its logo are
trademarks of Adult Swim / Cartoon Network; this is a non-commercial class
project.

## Third-party CSS, fonts and libraries

- [Normalize.css](https://necolas.github.io/normalize.css/) 8.0.1 (MIT), recommended in the MP2 README
- Creepster, Fredoka and Nunito from [Google Fonts](https://fonts.google.com) (SIL Open Font License 1.1), loaded in `index.html`
- [React](https://react.dev/), [React Router](https://reactrouter.com/), [Axios](https://axios-http.com/), [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vite.dev/), as required by the assignment

## Reading material

- React Router docs, for declarative mode (`BrowserRouter` with `basename`,
  `useSearchParams`, `useNavigate`, and passing `state` to `<Link>`).
- TVmaze API docs, for the show endpoint with embedded episodes, rate limits
  and attribution requirements.
- [publicapis.dev](https://publicapis.dev), to compare candidate APIs.

## Large language model use

This app was written with Claude Code (Opus 5.5). The session transcript is
committed at `llm_logs/claude-code-session-2026-10-05-build.txt` and indexed
in `llm_logs.csv`.
