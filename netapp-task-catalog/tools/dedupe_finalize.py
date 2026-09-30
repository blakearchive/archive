#!/usr/bin/env python3
"""Write the final list of distinct operations and link every task to one.

Inputs: the reconciled operations (ops_stage*.jsonl) and the task catalog.
Outputs (in DATA_DIR):
  operations.jsonl.gz   one record per distinct operation (schema in README)
  operations.csv        flat view for browsing
  tasks/*.jsonl.gz      every task gains "operation_id"
  task_index.csv        gains an "operation_id" column

Usage: dedupe_finalize.py --ops OPS.jsonl --data DATA_DIR
"""
from __future__ import annotations

import argparse
import collections
import csv
import glob
import gzip
import json
import os
import re

PREFERRED_API_PRODUCTS = ["ontap-automation", "ontap-restapi"]


def slug(text: str, n: int = 60) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:n].strip("-")


def gz_writer(path: str):
    """gzip text writer with a fixed header timestamp, so unchanged data gives identical files."""
    import io
    return io.TextIOWrapper(gzip.GzipFile(path, "wb", compresslevel=9, mtime=0), encoding="utf-8")


GENERIC_REST_RE = re.compile(r"^(inline post body|post body included|post response|retrieve specific fields|"
                             r"request|response|example)", re.I)


def rehome_generic_rest_examples(ops: list[dict], tasks: dict, home: dict, rest_ref: dict) -> int:
    """REST reference examples with generic headings ("Inline POST body", "POST
    Response", "Retrieve specific fields and limiting the output using
    filters") were pre-grouped across endpoint pages by their identical titles.
    Re-home each by the REST operation it calls:
      * a fragment without a call (e.g. "POST Response") takes the call of a
        generic sibling on the same endpoint page;
      * it moves to the operation most other tasks calling that REST operation
        belong to;
      * if no other task calls it, it gets its own operation named from the
        REST reference ("Create a new DR group")."""
    def rest_ops(t):
        return [r for m in t["methods"] for r in m.get("rest_operations", [])]

    generic = sorted(tid for tid, t in tasks.items()
                     if tid in home and t["product"] == "ontap-restapi" and GENERIC_REST_RE.match(t["title"]))
    page_call = {}
    for tid in generic:
        calls = rest_ops(tasks[tid])
        if calls:
            page_call.setdefault(tasks[tid]["page_title"], calls[0])
    votes = collections.defaultdict(collections.Counter)
    gen_set = set(generic)
    for tid, i in home.items():
        if tid in gen_set or tid not in tasks:
            continue
        for r in rest_ops(tasks[tid]):
            votes[r][i] += 1
        for r in tasks[tid].get("rest_equivalents", []):  # CLI tasks: REST ops inferred from their commands
            votes[r][i] += 0.5
    created: dict[str, int] = {}
    moved = 0
    for tid in generic:
        t = tasks[tid]
        calls = rest_ops(t) or ([page_call[t["page_title"]]] if t["page_title"] in page_call else [])
        cur = home[tid]
        if not calls:
            # no call at all: join the operation holding most other examples of its endpoint page
            same_page = collections.Counter(i for x, i in home.items() if x in tasks and x not in gen_set
                                            and tasks[x]["product"] == "ontap-restapi"
                                            and tasks[x]["page_title"] == t["page_title"])
            if same_page:
                best = same_page.most_common(1)[0][0]
                if best != cur:
                    ops[cur]["tasks"].remove(tid)
                    ops[best]["tasks"].append(tid)
                    home[tid] = best
                    moved += 1
            continue
        tally = collections.Counter()
        for r in calls:
            tally.update(votes.get(r, {}))
        if tally:
            best = tally.most_common(1)[0][0]
        else:
            call = calls[0]
            # stay if the current operation is about this call already
            cur_calls = collections.Counter(r for x in ops[cur]["tasks"] if x in tasks for r in rest_ops(tasks[x]))
            if cur_calls and cur_calls.most_common(1)[0][0] == call:
                continue
            if call not in created:
                ref = rest_ref.get(call, {})
                method = call.split(" ")[0]
                action = {"GET": "view", "POST": "create", "PATCH": "modify", "DELETE": "delete"}.get(method, "configure")
                ops.append({"uid": f"rest:{call}", "domain": ops[cur]["domain"],
                            "name": (ref.get("summary") or call).rstrip("."), "action": action,
                            "object": call.split(" ", 1)[1], "kind": "query" if method == "GET" else "configure",
                            "category": ops[cur].get("category", "Other"),
                            "description": (ref.get("description") or "")[:200], "variants": [],
                            "pregroups": [], "pregroup_titles": [], "tasks": [], "auto": True})
                created[call] = len(ops) - 1
            best = created[call]
        if best != cur and ops[best]["domain"] == ops[cur]["domain"]:
            ops[cur]["tasks"].remove(tid)
            ops[best]["tasks"].append(tid)
            home[tid] = best
            moved += 1
    ops[:] = [o for o in ops if o["tasks"]]
    home.clear()
    home.update({t: i for i, o in enumerate(ops) for t in o["tasks"]})
    return moved


def load_tasks(data_dir: str) -> dict[str, dict]:
    tasks = {}
    for f in sorted(glob.glob(os.path.join(data_dir, "tasks", "*.jsonl.gz"))):
        with gzip.open(f, "rt") as fh:
            for line in fh:
                t = json.loads(line)
                tasks[t["id"]] = t
    return tasks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ops", required=True)
    ap.add_argument("--data", required=True)
    args = ap.parse_args()
    tasks = load_tasks(args.data)
    ops = [json.loads(l) for l in open(args.ops)]
    # each task id once; tasks renamed "<id>-2" by extract_tasks.unique_ids
    # after de-duplication ran join the operation of "<id>"
    seen = set()
    for o in ops:
        o["tasks"] = [t for t in o["tasks"] if not (t in seen or seen.add(t))]
    home = {t: i for i, o in enumerate(ops) for t in o["tasks"]}
    for tid in tasks:
        if tid not in home:
            base = re.sub(r"-\d+$", "", tid)
            if base in home:
                ops[home[base]]["tasks"].append(tid)
                home[tid] = home[base]
    rest_ref = {}
    ref_path = os.path.join(args.data, "reference", "ontap-rest-operations.jsonl.gz")
    if os.path.exists(ref_path):
        with gzip.open(ref_path, "rt") as fh:
            rest_ref = {r["id"]: r for r in (json.loads(l) for l in fh)}
    moved = rehome_generic_rest_examples(ops, tasks, home, rest_ref)

    domain_primary = {}
    per_domain = collections.defaultdict(collections.Counter)
    for o in ops:
        for tid in o["tasks"]:
            per_domain[o["domain"]][tasks[tid]["product"]] += 1
    for d, c in per_domain.items():
        domain_primary[d] = c.most_common(1)[0][0]

    used = collections.Counter()
    records = []
    op_of_task = {}
    for o in sorted(ops, key=lambda o: (o["domain"], o.get("category", ""), o["name"].lower())):
        members = [tasks[t] for t in o["tasks"] if t in tasks]
        if not members:
            continue
        base = f"{slug(o['domain'], 40)}/{slug(o.get('action') or 'do', 20)}-{slug(o.get('object') or o['name'], 50)}"
        used[base] += 1
        op_id = base if used[base] == 1 else f"{base}-{used[base]}"
        ifaces = sorted({i for t in members for i in t["interfaces"]} - {"unknown"}) or ["unknown"]
        labels = sorted({m.get("interface_label") for t in members for m in t["methods"] if m.get("interface_label")})
        products = collections.Counter(t["product"] for t in members)
        reps = {}
        for iface in ifaces:
            cands = [t for t in members if iface in t["interfaces"]]
            if not cands:
                continue

            def score(t):
                pref = t["product"] == domain_primary.get(o["domain"])
                if iface == "api" and t["product"] in PREFERRED_API_PRODUCTS:
                    pref = 2 - PREFERRED_API_PRODUCTS.index(t["product"])
                return (t["in_nav"], pref, min(t["step_count"], 30))
            best = max(cands, key=score)
            reps[iface] = {"task_id": best["id"], "title": best["title"], "product": best["product"], "url": best["url"]}
        cli = collections.Counter(c for t in members for m in t["methods"] for c in m.get("cli_commands", []))
        rest = collections.Counter(r for t in members for m in t["methods"] for r in m.get("rest_operations", []))
        rest_eq = collections.Counter(r for t in members for r in t.get("rest_equivalents", []))
        kind = o.get("kind") or ""
        rec = {
            "op_id": op_id,
            "name": o["name"],
            "domain": o["domain"],
            "category": o.get("category") or "Other",
            "kind": kind,
            "action": o.get("action", ""),
            "object": o.get("object", ""),
            "description": o.get("description", ""),
            "agent_performable": kind not in ("hardware", "not_a_task") and ifaces != ["hardware"],
            "interfaces": ifaces,
            "interface_labels": labels,
            "task_count": len(members),
            "products": [p for p, _ in products.most_common()],
            "variants": o.get("variants", []),
            "representatives": reps,
            "cli_commands": [c for c, _ in cli.most_common(15)],
            "rest_operations": [r for r, _ in rest.most_common(20)],
            "rest_equivalents": [r for r, _ in rest_eq.most_common(20)],
            "version_notes": list(dict.fromkeys(v for t in members for v in t.get("version_notes", [])))[:10],
            "tasks": [t["id"] for t in members],
            "provenance": {"pregroups": o.get("pregroups", []), "merged_from": o.get("merged_from", [o.get("uid")]),
                           "auto": bool(o.get("auto"))},
        }
        records.append(rec)
        for t in members:
            op_of_task[t["id"]] = op_id

    missing = [t for t in tasks if t not in op_of_task]
    dup = sum(len(r["tasks"]) for r in records) - len(op_of_task)
    with gz_writer(os.path.join(args.data, "operations.jsonl.gz")) as fh:
        for r in records:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    with open(os.path.join(args.data, "operations.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["op_id", "domain", "category", "kind", "name", "interfaces", "task_count", "agent_performable",
                    "products", "description", "gui_example", "cli_example", "api_example"])
        for r in records:
            w.writerow([r["op_id"], r["domain"], r["category"], r["kind"], r["name"], ";".join(r["interfaces"]),
                        r["task_count"], r["agent_performable"], ";".join(r["products"]), r["description"],
                        r["representatives"].get("gui", {}).get("url", ""),
                        r["representatives"].get("cli", {}).get("url", ""),
                        r["representatives"].get("api", {}).get("url", "")])

    # link tasks
    for f in sorted(glob.glob(os.path.join(args.data, "tasks", "*.jsonl.gz"))):
        with gzip.open(f, "rt") as fh:
            rows = [json.loads(l) for l in fh]
        for t in rows:
            t["operation_id"] = op_of_task.get(t["id"])
        with gz_writer(f) as fh:
            for t in rows:
                fh.write(json.dumps(t, ensure_ascii=False) + "\n")
    idx = os.path.join(args.data, "task_index.csv")
    with open(idx, newline="") as fh:
        rows = list(csv.DictReader(fh))
    fields = ["id", "operation_id"] + [k for k in rows[0].keys() if k not in ("id", "operation_id")]
    with open(idx, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        for r in rows:
            r["operation_id"] = op_of_task.get(r["id"], "")
            w.writerow(r)
    print(f"operations={len(records)} tasks_linked={len(op_of_task)} missing={len(missing)} duplicate_links={dup} "
          f"generic_rest_examples_rehomed={moved}")


if __name__ == "__main__":
    main()
