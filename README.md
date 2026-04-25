# Pizza Geek

[![Live Demo](https://img.shields.io/badge/GitHub%20Pages-Try%20Pizza%20Geek-c45a2b?style=for-the-badge&logo=githubpages&logoColor=white)](https://koosoli.github.io/PizzaGeek/)
[![Sponsor on GitHub](https://img.shields.io/badge/GitHub%20Sponsors-Sponsor-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/koosoli)
[![Buy Me a Slice](https://img.shields.io/badge/Buy%20Me%20a%20Slice-Support-ffdd00?style=for-the-badge&logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/koosoli)

Pizza Geek is an open-source spin on the famous Pizza Nerd calculator: no paywall, no locked lab tier, and no pretending it should stay a clone forever. It started as an experiment in how well AI can reverse-engineer a polished product, and it kept going because good tools deserve an open community around them.

From here on out, Pizza Geek heads in its own direction.

This is an independent community project and is not affiliated with Pizza Nerd.

## What It Includes

- Style-aware dough math for Neapolitan, Contemporary Neapolitan, New York, New Haven, pan styles, and more
- Preferments including poolish, biga, tiga, and bassinage
- Flour blending with per-flour gram breakdowns
- Fermentation planning across room temp, cellar, cold bulk, cold ball, and temper stages
- Sauce recipes, bake logging, saved recipes, costing, and clean print sheets
- English and German UI
- Shared TypeScript core that can later power a mobile app

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Checks

```bash
npm test
npm run typecheck
npm run build
```

## Project Layout

- `apps/web` - React + Vite frontend
- `packages/core` - reusable dough engine and domain logic

That split is intentional: a future `apps/mobile` client can reuse the same calculation core.

## Release Notes

Current release: `v0.2.0`

See [CHANGELOG.md](./CHANGELOG.md) for the first public open-source release notes.

## Support The Project

- Try the live app: [koosoli.github.io/PizzaGeek](https://koosoli.github.io/PizzaGeek/)
- Sponsor on GitHub: [github.com/sponsors/koosoli](https://github.com/sponsors/koosoli)
- Buy me a coffee, or better, a slice: [buymeacoffee.com/koosoli](https://buymeacoffee.com/koosoli)

## License

GPL-3.0-only. See [LICENSE](./LICENSE).
