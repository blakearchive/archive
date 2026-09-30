#!/usr/bin/env python3
"""Prepare a semantic duplicate sweep over every operation.

Word-overlap candidates cannot see duplicates worded differently ("Install an
object-store CA certificate" vs "Install a trusted certificate authority").
The sweep gives each agent a shard of one domain's operations plus that
domain's full operation list, and has it search the list for each operation
the way an auditor would. Proposals are judged like reconciliation proposals,
so dedupe_recon_apply.py applies the results (labels reconcile:sNNN / judge:sNNN).

Usage: dedupe_sweep_prepare.py --work WORK_DIR --ops ops_stageN.jsonl --out SWEEP_DIR [--shard 70]
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import re


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--ops", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--shard", type=int, default=70)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    ops = [json.loads(l) for l in open(args.ops)]
    by_domain = collections.defaultdict(list)
    for o in ops:
        by_domain[o["domain"]].append(o)

    def row(o):
        titles = " | ".join(dict.fromkeys(o["pregroup_titles"]))[:260]
        return "\t".join([o["uid"], o["name"], o["action"], o["object"], o["kind"], str(len(o["tasks"])),
                          titles]).replace("\n", " ")

    shards = []
    for dom, lst in sorted(by_domain.items()):
        if len(lst) < 2:
            continue
        lst.sort(key=lambda o: (o["object"].lower(), o["action"]))
        dom_file = os.path.join(args.out, "domain_" + re.sub(r"[^a-z0-9]+", "-", dom.lower()).strip("-") + ".tsv")
        with open(dom_file, "w") as fh:
            fh.write("uid\tname\taction\tobject\tkind\ttasks\texample task titles\n")
            for o in lst:
                fh.write(row(o) + "\n")
        for i in range(0, len(lst), args.shard):
            sid = f"s{len(shards) + 1:03d}"
            path = os.path.join(args.out, f"{sid}.tsv")
            chunk = lst[i:i + args.shard]
            with open(path, "w") as fh:
                fh.write("uid\tname\taction\tobject\tkind\ttasks\texample task titles\n")
                for o in chunk:
                    fh.write(row(o) + "\n")
            shards.append({"window": sid, "domain": dom, "n": len(chunk), "file": path, "domain_file": dom_file,
                           "domain_ops": len(lst)})
    with open(os.path.join(args.out, "shards.json"), "w") as fh:
        json.dump(shards, fh, indent=1)
    print(f"ops={len(ops)} shards={len(shards)} domains={len(by_domain)}")


if __name__ == "__main__":
    main()
