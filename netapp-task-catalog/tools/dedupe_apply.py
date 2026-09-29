#!/usr/bin/env python3
"""Apply the results of the de-duplication workflows to the pre-groups.

Reads workflow journals (journal.jsonl: one entry per agent start/result) and
replays, per bucket:
  cluster:<b>  proposed operations over the bucket's pre-groups
  fix:<b>      assignments for pre-groups the cluster step missed
  verify:<b>   adversarial edits (split / move / merge / fix)
  judge:<b>    accept / reject per edit          -> only accepted edits are applied
Pre-groups still unassigned afterwards become single-pre-group operations
(flagged "auto"), so every task ends up in exactly one operation.

Later journals override earlier ones for the same label (re-runs).

Usage: dedupe_apply.py --work WORK_DIR --journal J1 [--journal J2 ...] --out ops_stage1.jsonl
"""
from __future__ import annotations

import argparse
import collections
import json

KINDS = {"configure", "query", "workflow", "lifecycle", "hardware", "recovery", "step", "not_a_task"}
CATEGORIES = {
    "Setup and deployment", "Upgrade and lifecycle", "Hardware maintenance", "Storage provisioning",
    "Capacity and efficiency", "Data protection and replication", "Business continuity and high availability",
    "File access protocols (NAS)", "Block access protocols (SAN)", "Object storage (S3)", "Networking",
    "Security and access control", "Encryption and key management", "Ransomware protection and compliance",
    "Cluster and system administration", "Monitoring, performance, and alerts", "Troubleshooting and support",
    "Cloud and hybrid services", "Automation and integration", "Host and application integration",
    "Licensing and subscriptions", "Other",
}


def read_journals(paths: list[str]) -> dict[str, dict]:
    by_label: dict[str, dict] = {}
    for path in paths:
        labels = {}
        with open(path) as fh:
            for line in fh:
                e = json.loads(line)
                if e.get("type") == "started":
                    labels[e["agentId"]] = e.get("label", "")
                elif e.get("type") == "result" and isinstance(e.get("result"), dict):
                    label = labels.get(e.get("agentId"), "")
                    if label:
                        by_label[label] = e["result"]
    return by_label


def apply_bucket(bucket: str, pg_ids: list[str], res: dict[str, dict], categories: set[str]) -> tuple[list[dict], dict]:
    stats = collections.Counter()
    valid = set(pg_ids)
    cluster = res.get(f"cluster:{bucket}")
    ops: list[dict] = []
    if cluster:
        ops = [dict(o) for o in cluster["operations"]]
    seen = set()
    for o in ops:
        keep = []
        for p in o["pregroups"]:
            if p in valid and p not in seen:
                keep.append(p)
                seen.add(p)
        o["pregroups"] = keep
    fix = res.get(f"fix:{bucket}")
    if fix:
        by_key = {o["key"]: o for o in ops}
        for n in fix.get("new_operations", []):
            if n["key"] not in by_key:
                n = dict(n, pregroups=[])
                ops.append(n)
                by_key[n["key"]] = n
        for a in fix.get("assignments", []):
            if a["pg"] in valid and a["pg"] not in seen and a["op"] in by_key:
                by_key[a["op"]]["pregroups"].append(a["pg"])
                seen.add(a["pg"])
                stats["fix_assigned"] += 1
    ops = [o for o in ops if o["pregroups"]]

    verify = res.get(f"verify:{bucket}")
    judge = res.get(f"judge:{bucket}")
    accepted = {d["id"] for d in (judge or {}).get("decisions", []) if d.get("accept")}
    edits = [e for e in (verify or {}).get("edits", []) if e["id"] in accepted]
    stats["edits_proposed"] = len((verify or {}).get("edits", []))
    stats["edits_accepted"] = len(edits)
    order = {"split": 0, "move": 1, "merge": 2, "fix": 3}
    for e in sorted(edits, key=lambda e: order.get(e["type"], 9)):
        by_key = {o["key"]: o for o in ops}
        target = [by_key[k] for k in e["ops"] if k in by_key]
        if not target:
            stats["edit_skipped"] += 1
            continue
        if e["type"] == "split":
            src = target[0]
            leaving = [p for p in e["pregroups"] if p in src["pregroups"]]
            if not leaving or len(leaving) == len(src["pregroups"]):
                stats["edit_skipped"] += 1
                continue
            src["pregroups"] = [p for p in src["pregroups"] if p not in leaving]
            ops.append(fields({"key": f"{src['key']}_{e['id']}", "pregroups": leaving, "variants": []}, e, src, categories))
        elif e["type"] == "move" and len(target) == 2:
            src, dst = target
            moving = [p for p in e["pregroups"] if p in src["pregroups"]]
            src["pregroups"] = [p for p in src["pregroups"] if p not in moving]
            dst["pregroups"].extend(moving)
        elif e["type"] == "merge" and len(target) >= 2:
            keep = target[0]
            for o in target[1:]:
                keep["pregroups"].extend(o["pregroups"])
                keep["variants"] = list(dict.fromkeys(keep.get("variants", []) + o.get("variants", [])))
                o["pregroups"] = []
            fields(keep, e, keep, categories)
        elif e["type"] == "fix":
            fields(target[0], e, target[0], categories)
        else:
            stats["edit_skipped"] += 1
            continue
        stats[f"applied_{e['type']}"] += 1
        ops = [o for o in ops if o["pregroups"]]

    assigned = {p for o in ops for p in o["pregroups"]}
    for p in pg_ids:
        if p not in assigned:
            ops.append({"key": f"auto_{p}", "pregroups": [p], "auto": True})
            stats["auto"] += 1
    for o in ops:
        o["bucket"] = bucket
    return ops, stats


def fields(dst: dict, edit: dict, base: dict, categories: set[str]) -> dict:
    for k in ("name", "action", "object", "description"):
        v = (edit.get(k) or "").strip()
        dst[k] = v or base.get(k, "")
    kind = (edit.get("kind") or "").strip()
    dst["kind"] = kind if kind in KINDS else base.get("kind", "")
    cat = (edit.get("category") or "").strip()
    dst["category"] = cat if cat in categories else base.get("category", "")
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--journal", action="append", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only-done", action="store_true", help="skip buckets without a cluster result")
    args = ap.parse_args()
    manifest = json.load(open(f"{args.work}/buckets.json"))
    pgs = {}
    with open(f"{args.work}/pregroups.jsonl") as fh:
        for line in fh:
            r = json.loads(line)
            pgs[r["pg"]] = r
    res = read_journals(args.journal)
    categories = CATEGORIES
    total = collections.Counter()
    out = []
    for m in manifest:
        b = m["bucket"]
        if args.only_done and f"cluster:{b}" not in res:
            continue
        pg_ids = [f"{b}.{i:03d}" for i in range(1, m["pregroups"] + 1)]
        ops, stats = apply_bucket(b, pg_ids, res, categories)
        total.update(stats)
        total["buckets"] += 1
        for o in ops:
            members = [t for p in o["pregroups"] for t in pgs[p]["members"]]
            rep = pgs[o["pregroups"][0]]
            out.append({
                "uid": f"{b}:{o['key']}",
                "bucket": b,
                "domain": rep["domain"],
                "name": o.get("name") or rep["title"],
                "action": o.get("action", ""),
                "object": o.get("object", ""),
                "kind": o.get("kind", ""),
                "category": o.get("category", ""),
                "description": o.get("description", ""),
                "variants": o.get("variants", []),
                "pregroups": o["pregroups"],
                "pregroup_titles": [pgs[p]["title"] for p in o["pregroups"]],
                "tasks": members,
                "auto": bool(o.get("auto")),
            })
    with open(args.out, "w") as fh:
        for o in out:
            fh.write(json.dumps(o, ensure_ascii=False) + "\n")
    print(f"operations={len(out)} from {sum(len(o['tasks']) for o in out)} tasks; " + ", ".join(f"{k}={v}" for k, v in sorted(total.items())))


if __name__ == "__main__":
    main()
