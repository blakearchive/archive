#!/usr/bin/env python3
"""Write data/SUMMARY.md: task coverage by product family, product and interface.

Usage: report.py --data DATA_DIR
"""
from __future__ import annotations

import argparse
import json
import os
from collections import Counter, defaultdict

IFACES = ["gui", "cli", "api", "automation", "hardware", "unknown"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    args = ap.parse_args()
    prods = json.load(open(os.path.join(args.data, "products.json")))
    built = [p for p in prods if p.get("tasks")]
    skipped = [p for p in prods if not p.get("tasks")]

    lines = ["# NetApp task catalog: coverage summary", ""]
    total = sum(p["tasks"] for p in built)
    methods = sum(p.get("methods", 0) for p in built)
    multi = sum(p.get("multi_interface_tasks", 0) for p in built)
    lines += [f"- **{total:,} tasks** ({methods:,} interface-specific methods) from **{len(built)} documentation sites**",
              f"- {multi:,} tasks are documented for more than one interface (e.g. System Manager *and* CLI)",
              f"- {sum(p.get('tasks_with_rest_equivalent', 0) for p in built):,} ONTAP tasks are linked to equivalent REST API operations "
              "(inferred from the CLI commands they use)", ""]

    fam = defaultdict(Counter)
    fam_tasks = Counter()
    for p in built:
        fam_tasks[p["family"]] += p["tasks"]
        fam[p["family"]].update(p.get("tasks_by_interface", {}))
    lines += ["## By product family", "",
              "Interface columns count tasks that have at least one method for that interface.", "",
              "| Family | Tasks | " + " | ".join(IFACES) + " |",
              "|---|---:|" + "---:|" * len(IFACES)]
    for f, n in fam_tasks.most_common():
        lines.append(f"| {f} | {n:,} | " + " | ".join(f"{fam[f].get(i, 0):,}" for i in IFACES) + " |")

    lines += ["", "## By documentation site", "",
              "| Family | Site (repo) | Title | Pages | Tasks | Multi-interface | " + " | ".join(IFACES) + " |",
              "|---|---|---|---:|---:|---:|" + "---:|" * len(IFACES)]
    for p in sorted(built, key=lambda p: (p["family"], -p["tasks"])):
        ti = p.get("tasks_by_interface", {})
        lines.append(f"| {p['family']} | `{p['slug']}` | {p.get('title', '')} | {p.get('pages') or ''} | {p['tasks']:,} | "
                     f"{p.get('multi_interface_tasks', 0):,} | " + " | ".join(f"{ti.get(i, 0):,}" for i in IFACES) + " |")

    by_status = defaultdict(list)
    for p in skipped:
        by_status[p.get("status", "?")].append(p["slug"])
    lines += ["", "## Repositories not turned into tasks", ""]
    for st, slugs in sorted(by_status.items()):
        lines.append(f"- **{st}** ({len(slugs)}): " + ", ".join(f"`{s}`" for s in sorted(slugs)))
    ref = os.path.join(args.data, "reference")
    if os.path.isdir(ref):
        lines += ["", "## Reference catalogs", ""]
        for f in sorted(os.listdir(ref)):
            path = os.path.join(ref, f)
            opener = __import__("gzip").open if f.endswith(".gz") else open
            with opener(path, "rt") as fh:
                n = sum(1 for _ in fh)
            lines.append(f"- `reference/{f}`: {n:,} records")
    with open(os.path.join(args.data, "SUMMARY.md"), "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines[:8]))


if __name__ == "__main__":
    main()
