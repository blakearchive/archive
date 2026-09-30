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


def operations_section(data_dir: str) -> list[str]:
    path = os.path.join(data_dir, "operations.jsonl.gz")
    if not os.path.exists(path):
        return []
    import gzip
    with gzip.open(path, "rt") as fh:
        ops = [json.loads(l) for l in fh]
    tasks = sum(o["task_count"] for o in ops)
    out = ["", "## Distinct operations", "",
           f"- **{len(ops):,} distinct operations** merged from {tasks:,} documented tasks "
           f"({tasks / len(ops):.1f} tasks per operation on average)",
           f"- {sum(o['agent_performable'] for o in ops):,} are agent-performable (not physical hardware work or non-tasks)",
           f"- {sum(1 for o in ops if len(o['interfaces']) > 1):,} can be done through more than one interface",
           "", "### By domain", "",
           "| Domain | Operations | Tasks | Agent-performable | gui | cli | api | automation | hardware |",
           "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
    by_dom = defaultdict(list)
    for o in ops:
        by_dom[o["domain"]].append(o)
    for d, lst in sorted(by_dom.items(), key=lambda kv: -len(kv[1])):
        iface = Counter(i for o in lst for i in o["interfaces"])
        out.append(f"| {d} | {len(lst):,} | {sum(o['task_count'] for o in lst):,} | "
                   f"{sum(o['agent_performable'] for o in lst):,} | " +
                   " | ".join(f"{iface.get(i, 0):,}" for i in ["gui", "cli", "api", "automation", "hardware"]) + " |")
    out += ["", "### By category and kind", "", "| Category | Operations |", "|---|---:|"]
    for c, n in Counter(o["category"] for o in ops).most_common():
        out.append(f"| {c} | {n:,} |")
    out += ["", "| Kind | Operations |", "|---|---:|"]
    for k, n in Counter(o["kind"] for o in ops).most_common():
        out.append(f"| {k} | {n:,} |")
    out += ["", "### Most-duplicated operations", "", "| Operation | Domain | Tasks merged | Interfaces |", "|---|---|---:|---|"]
    for o in sorted(ops, key=lambda o: -o["task_count"])[:25]:
        out.append(f"| {o['name']} | {o['domain']} | {o['task_count']} | {', '.join(o['interfaces'])} |")
    return out


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
    lines += operations_section(args.data)
    with open(os.path.join(args.data, "SUMMARY.md"), "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines[:8]))


if __name__ == "__main__":
    main()
