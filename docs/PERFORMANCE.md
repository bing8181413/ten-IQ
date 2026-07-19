# Performance

Budgets are starting constraints, not excuses:

- Initial compressed JS target: under 150 KB excluding optional Mock tooling.
- Route chunks: under 80 KB compressed where practical.
- Avoid layout shifts in cards and charts.
- Cache market lists for short periods and cancel stale requests.
- Virtualize only after measuring long-list cost.
- Keep third-party charting libraries out until the SVG primitives are insufficient.

Measure before optimizing and record meaningful bundle changes in the task release report.
