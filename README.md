# weekly

A Claude Code mod that shows your weekly plan limit above the prompt:

```
Weekly 25% · 22% of week · on pace
```

- **Weekly %**: how much of your 7-day limit you've used.
- **% of week**: how far you are into the current limit window, from its real reset time.
- **Pace**: `ahead` if usage runs more than 5 points over time elapsed, `behind` if more than 5 under, else `on pace`.
- On desktop it adds a small bar: blue = used, light tick = time elapsed.

Type `/weekly` to hide or show the band for the current session.

## Install

At the prompt of a terminal session:

```
/plugin install weekly --marketplace yaroslavhaidash/claude-weekly
```

From a shell:

```
claude plugin install weekly --marketplace yaroslavhaidash/claude-weekly
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `yaroslavhaidash/claude-weekly`, then Add plugin.

Answer `y` to add the marketplace, then pick the user scope so it loads in every session.

## License

MIT
