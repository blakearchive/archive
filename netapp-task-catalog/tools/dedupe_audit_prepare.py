#!/usr/bin/env python3
"""Draw an audit sample of final operations and write batch files for auditors.

Sample (fixed seed): half from operations that merged several pre-groups
(where wrong merges can hide), half uniformly from all operations (where
missed duplicates show up). Each batch file lists its operations with member
tasks and points to the full operation list of each domain for recall checks.

Usage: dedupe_audit_prepare.py --data DATA_DIR --out AUDIT_DIR [--n 90] [--batch 9] [--seed 7]
"""
from __future__ import annotations

import argparse
import collections
import glob
import gzip
import json
import os
import random
import re


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--n", type=int, default=90)
    ap.add_argument("--batch", type=int, default=9)
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    with gzip.open(os.path.join(args.data, "operations.jsonl.gz"), "rt") as fh:
        ops = [json.loads(l) for l in fh]
    tasks = {}
    for f in glob.glob(os.path.join(args.data, "tasks", "*.jsonl.gz")):
        with gzip.open(f, "rt") as fh:
            for line in fh:
                t = json.loads(line)
                tasks[t["id"]] = t

    by_domain = collections.defaultdict(list)
    for o in ops:
        by_domain[o["domain"]].append(o)
    dom_file = {}
    for d, lst in by_domain.items():
        path = os.path.join(args.out, "domain_" + re.sub(r"[^a-z0-9]+", "-", d.lower()).strip("-") + ".tsv")
        with open(path, "w") as fh:
            fh.write("op_id\tname\taction\tobject\tkind\ttasks\texample task titles\n")
            for o in sorted(lst, key=lambda o: o["op_id"]):
                titles = " | ".join(dict.fromkeys(tasks[t]["title"] for t in o["tasks"][:4]))
                fh.write("\t".join([o["op_id"], o["name"], o["action"], o["object"], o["kind"], str(o["task_count"]),
                                    titles[:200]]).replace("\n", " ") + "\n")
        dom_file[d] = path

    rng = random.Random(args.seed)
    merged = [o for o in ops if len(o["provenance"]["pregroups"]) > 1]
    half = args.n // 2
    sample = rng.sample(merged, min(half, len(merged)))
    chosen = {o["op_id"] for o in sample}
    rest = [o for o in ops if o["op_id"] not in chosen]
    sample += rng.sample(rest, args.n - len(sample))
    for o in sample:
        o["_stratum"] = "merged" if o["op_id"] in chosen else "uniform"
    rng.shuffle(sample)

    batches = []
    for bi in range(0, len(sample), args.batch):
        chunk = sample[bi:bi + args.batch]
        bid = f"a{bi // args.batch + 1:02d}"
        path = os.path.join(args.out, f"{bid}.txt")
        with open(path, "w") as fh:
            fh.write(f"AUDIT BATCH {bid}: {len(chunk)} operations\n")
            for o in chunk:
                fh.write("\n" + "=" * 80 + "\n")
                fh.write(f"op_id: {o['op_id']}\nname: {o['name']}\naction: {o['action']}\nobject: {o['object']}\n"
                         f"kind: {o['kind']}\ncategory: {o['category']}\ndomain: {o['domain']}\n"
                         f"domain operation list (for recall search): {dom_file[o['domain']]}\n"
                         f"member tasks ({o['task_count']}):\n")
                members = o["tasks"]
                shown = members if len(members) <= 25 else members[:25]
                for tid in shown:
                    t = tasks[tid]
                    ex = " || ".join(f"[{m.get('interface_label') or m['interface']}] " +
                                     "; ".join(s["text"][:80] for s in m["steps"][:3]) for m in t["methods"][:2])
                    fh.write(f"  - {tid}\n    title: {t['title']}\n    page: {t['page_title']}\n    site: {t['product']}"
                             f"  interfaces: {','.join(t['interfaces'])}\n    steps: {ex[:300]}\n")
                if len(members) > len(shown):
                    others = sorted({tasks[t]['title'] for t in members[25:]})
                    fh.write(f"  ... and {len(members) - 25} more tasks with titles: {' | '.join(others)[:1500]}\n")
        batches.append({"batch": bid, "file": path, "n": len(chunk),
                        "ops": [{"op_id": o["op_id"], "stratum": o["_stratum"]} for o in chunk]})
    with open(os.path.join(args.out, "batches.json"), "w") as fh:
        json.dump(batches, fh, indent=1)
    print(f"sampled {len(sample)} ops ({len(chosen)} merged, {len(sample) - len(chosen)} uniform) in {len(batches)} batches; "
          f"{len(dom_file)} domain lists")


if __name__ == "__main__":
    main()
