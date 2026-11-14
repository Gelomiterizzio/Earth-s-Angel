# Earth's Angel

**A browser game where kids run a Moon outpost and learn why every decision in space has a cost.**

Earth's Angel is our entry for the **2026 NASA International Space Apps Challenge** (Santa Cruz de la Sierra, Bolivia), answering the challenge **Build a Junior Astronaut Mission Trainer**.

> Campaign status (14 Nov 2026). The Moon and Mars missions lead to the Mars ending or unlock an Earth recovery mission. Campaign progress saves in the browser.

## The idea

You lead the crew of Project Last Hope. Power, oxygen, water, food and radiation shielding all compete for the same limited resources. A solar storm is coming, and its warning comes from a real NASA space weather record. Do you send the crew to the shelter and lose a day of work and some power, or keep building and take the radiation?

- **Audience:** kids ages 7–12 (the age range stated in the challenge), with harder difficulty levels for older players.
- **Format:** turn-based 2D grid game. Plays in the browser. No download, no account, no payment.
- **Campaign:** Moon outpost, Mars colony and the optional Second Chance mission on Earth.

## NASA data

The storm decision is driven by archived records from the **Space Weather Database Of Notifications, Knowledge, Information (DONKI)**, listed in the challenge resources. The data is bundled with the game as a small curated extract. It is archived data, not a live feed. Radiation doses and thresholds inside the game are game units, not real measurements. Full traceability: [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md).

## Play

- Vercel production URL pending. [Production setup](docs/DESPLIEGUE.md#producción-en-vercel).
- 30-second demo: `[POR COMPLETAR: public link]`

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

The team defined the concept and story. Claude Code assisted with planning documents, Cursor Grok 4.7 assisted with the first interface, art and audio, and OpenAI Codex assisted with the visual redraw and interface and cinematic fixes. The local presentation omits visible artwork labels. NASA Space Apps requires visible watermarks on generated images and video for the submission. [AI use, credits and human review status](docs/IA-Y-CREDITOS.md).

## Team

`[POR COMPLETAR: team name]` — `[POR COMPLETAR: member A]`, `[POR COMPLETAR: member B]`, `[POR COMPLETAR: member C]`.

## License

[MIT](LICENSE) for the project. The bundled Pixelify Sans font is distributed under the SIL Open Font License 1.1.

Earth's Angel is a student hackathon project. It is not affiliated with, sponsored by, or endorsed by NASA.

## Campaign verification

The test suite replays the lunar vectors, wins Mars in all three difficulties and checks the Earth missions and ending conditions. A local production build was also played in Edge through both endings and through failure on Earth. [Test evidence](docs/PRUEBAS.md#verificación-de-campaña).
