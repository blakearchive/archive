#!/usr/bin/env python3
"""Apply cross-bucket reconciliation results (dedupe_reconcile workflow).

Accepted merge groups (optionally trimmed by the judge to keep_uids) are
unioned; accepted solution-guide mappings fold a solution operation into the
core operation it duplicates. Chains (A=B in one window, B=C in another) are
resolved with union-find. The merged operation takes its fields from the
largest accepted group that produced it (ties: the operation with most tasks).

Usage: dedupe_recon_apply.py --ops ops_stage1.jsonl --journal J [--journal J2] --out ops_stage2.jsonl
"""
from __future__ import annotations

import argparse
import collections
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dedupe_apply import CATEGORIES, KINDS, read_journals  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ops", required=True)
    ap.add_argument("--journal", action="append", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    ops = {o["uid"]: o for o in (json.loads(l) for l in open(args.ops))}
    res = read_journals(args.journal)
    parent = {u: u for u in ops}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    fields_for: dict[str, list[tuple[int, dict]]] = collections.defaultdict(list)
    stats = collections.Counter()
    windows = sorted({lab.split(":", 1)[1] for lab in res if lab.startswith(("reconcile:", "map:"))})
    for w in windows:
        prop = res.get(f"reconcile:{w}") or res.get(f"map:{w}") or {}
        judge = res.get(f"judge:{w}") or {}
        decisions = {d["id"]: d for d in judge.get("decisions", [])}
        for g in prop.get("groups", []):
            stats["groups_proposed"] += 1
            d = decisions.get(g["id"])
            if not d or not d.get("accept"):
                continue
            uids = [u for u in (d.get("keep_uids") or g["uids"]) if u in ops]
            uids = list(dict.fromkeys(uids))
            doms = {ops[u]["domain"] for u in uids}
            if len(uids) < 2 or len(doms) > 1:
                stats["groups_invalid"] += 1
                continue
            stats["groups_accepted"] += 1
            for u in uids[1:]:
                parent[find(u)] = find(uids[0])
            fields_for[uids[0]].append((sum(len(ops[u]["tasks"]) for u in uids), g))
        for m in prop.get("mappings", []):
            stats["maps_proposed"] += 1
            d = decisions.get(m["id"])
            if not d or not d.get("accept") or m["uid"] not in ops or m["target"] not in ops:
                continue
            if not ops[m["uid"]]["domain"].startswith("Solutions:") or ops[m["target"]]["domain"].startswith("Solutions:"):
                stats["maps_invalid"] += 1
                continue
            stats["maps_accepted"] += 1
            ops[m["uid"]]["mapped_from_solution"] = True
            parent[find(m["uid"])] = find(m["target"])

    comps = collections.defaultdict(list)
    for u in ops:
        comps[find(u)].append(u)
    out = []
    for root, members in comps.items():
        # the core (non-solution) operation with most tasks anchors identity and domain
        members.sort(key=lambda u: (ops[u]["domain"].startswith("Solutions:"), -len(ops[u]["tasks"])))
        anchor = dict(ops[members[0]])
        best = None
        for u in members:
            for weight, g in fields_for.get(u, []):
                if best is None or weight > best[0]:
                    best = (weight, g)
        if best and len(members) > 1:
            g = best[1]
            for k in ("name", "action", "object", "description"):
                if (g.get(k) or "").strip():
                    anchor[k] = g[k].strip()
            if g.get("kind") in KINDS:
                anchor["kind"] = g["kind"]
            if g.get("category") in CATEGORIES:
                anchor["category"] = g["category"]
        if len(members) > 1:
            anchor["merged_from"] = members
            anchor["pregroups"] = [p for u in members for p in ops[u]["pregroups"]]
            anchor["pregroup_titles"] = [t for u in members for t in ops[u]["pregroup_titles"]]
            anchor["tasks"] = [t for u in members for t in ops[u]["tasks"]]
            anchor["variants"] = list(dict.fromkeys(v for u in members for v in ops[u].get("variants", [])))
            anchor["auto"] = all(ops[u].get("auto") for u in members)
        out.append(anchor)
    with open(args.out, "w") as fh:
        for o in out:
            fh.write(json.dumps(o, ensure_ascii=False) + "\n")
    print(f"operations {len(ops)} -> {len(out)}; " + ", ".join(f"{k}={v}" for k, v in sorted(stats.items())))


if __name__ == "__main__":
    main()
