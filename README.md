# Earth's Angel

**Design, launch and run a complete space mission, right in the browser.**

**▶ Play now: [earths-angel.vercel.app](https://earths-angel.vercel.app)** — free, no install, no account, English and Spanish.

On a phone or tablet, choose **Mobile/Tablet** at the top right of the title screen: touch controls, landscape and full screen. [How it works](docs/componentes/plataforma-movil.md).

Earth's Angel is the entry of team **Los Bersercker** (Santa Cruz de la Sierra, Bolivia) for the **2026 NASA International Space Apps Challenge**, challenge **Space Mission Design Game**. It won **3rd place** at the Santa Cruz de la Sierra local event and goes on to global judging.

## The idea

Kids learn best by playing, and exploring space is also a way to learn how to take care of our own planet. Earth's Angel is made for kids aged 8 to 12, and it is fun for families, classrooms and anyone curious about space. A Moon mission takes about 15 minutes, so it fits in one class.

The game covers a whole mission, from concept to operation:

1. **Design (on Earth).** Pick an objective (self-sufficient base, ice science or space weather watch), a rocket (light, medium or heavy: mass capacity vs. cost), a trajectory (cheap and slow vs. fast and expensive, with a launch window), a spacecraft cabin, an antenna and a payload of supplies, science instruments and crew equipment. Budget and mass bars block the launch until the design is valid.
2. **Launch and operation (Moon, then Mars).** The astronaut explores the map on foot, builds solar panels, batteries, ice extractors, water recyclers, oxygen generators, greenhouses and radiation shelters, and ends each day. A daily report explains cause and effect with a chart of what was made and used.
3. **Evaluation.** The result screen puts the design next to the outcome: objective achieved or not, cost vs. budget, mass vs. capacity, plus learning badges.

Every design choice changes the mission: supplies arrive at landing, the spectrometer maps more ground, the radiation sensor warns of storms earlier, the drill yields more minerals, shielded suits reduce exposure and the trajectory changes the time left on Earth's countdown. A failed design becomes the lesson for the next one.

## Real NASA data

The key decision is a real solar storm: an archived **NASA DONKI** record of the solar energetic particle event of **10 September 2017**, linked to an **X8.2** flare. The decision screen shows the record, the flare class and the instrument, with a link to DONKI: shelter the crew and lose power and a day of work, or keep working and take the radiation. Science cards cite NASA sources on ISS life support and water recovery, the Mars solar day, InSight and Curiosity.

Costs, masses, resource amounts and thresholds are game balance values, and the game labels them so. The story is fiction. Full traceability: [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md).

## Try these

- **X** on the title screen: presentation mode. A full mission plays by itself (design, Moon, Mars). Turn the mouse wheel to change speed.
- **Z** on the title screen: defeat demo. See what happens when life support is ignored.
- **V** on the title screen: lunar secret demo. The astronaut walks to a hidden corner of the Moon and types the secret combo, which unlocks a bonus cinematic.
- **Options → Random map**: resources move around for replay value.

## Accessibility and honesty

Full keyboard play, a reduced-motion option, colour plus text for every status, English and Spanish, and every number labeled as NASA data, simplification, game balance or fiction. No backend, no accounts, no data collection, and no images or voices of minors.

## Tools

TypeScript, Vite, HTML5 Canvas pixel art drawn by code, plain HTML and CSS for the interface, the Web Audio API for synthesized music, Vitest for automated tests and Vercel for hosting.

## Art and cinematic preview

```bash
node tests/ui/serve.mjs
```

Open [the local preview](http://127.0.0.1:4173/tests/ui/preview.html). Start a new game to see the introduction, then use **Skip (Enter)** or wait for the Moon interface. The map samples show the artwork and effects at game scale. [Development and preview commands](docs/DESPLIEGUE.md).

## Run the game

```bash
npm ci
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

Details and verification status: [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

## Documentation

The team works in Spanish, so the internal planning documents are written in Spanish. Start with the reading map:

- **[docs/INDEX.md](docs/INDEX.md)** — reading order for team members, AI agents and reviewers.
- [docs/PROYECTO.md](docs/PROYECTO.md) — game design.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — architecture and shared contracts.
- [docs/NASA-SPACE-APPS-2026.md](docs/NASA-SPACE-APPS-2026.md) — challenge requirements and evidence.
- [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md) — AI use disclosure, credits and licenses.

Team work packages: [INTEGRANTE_A_SIMULACION.md](INTEGRANTE_A_SIMULACION.md), [INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md](INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md), [INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md](INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md).

## Use of AI

The team defined the concept, the story and every design decision. Claude Code assisted with planning documents, Cursor Grok 4.7 assisted with the first interface, art and audio, and OpenAI Codex assisted with the visual redraw and interface and cinematic fixes. The local presentation omits visible artwork labels. NASA Space Apps requires visible watermarks on generated images and video for the submission. [AI use, credits and human review status](docs/IA-Y-CREDITOS.md).

## Team Los Bersercker

- **Oscar Fernando Calustro Tellez** — simulation and architecture
- **Ruben Dario Quispe Andrade** — gameplay and science
- **Angel Mauricio Viveros Cortez** — interface, art and delivery

## License

[MIT](LICENSE) for the project. The bundled Pixelify Sans font is distributed under the SIL Open Font License 1.1.

Earth's Angel is a student hackathon project. It is not affiliated with, sponsored by, or endorsed by NASA.

## Campaign verification

The test suite replays the lunar vectors, wins Mars in all three difficulties and checks the Earth missions and ending conditions. A local production build was also played in Edge through both endings and through failure on Earth. [Test evidence](docs/PRUEBAS.md#verificación-de-campaña).
