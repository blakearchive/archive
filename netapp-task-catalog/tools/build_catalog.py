#!/usr/bin/env python3
"""Build the full NetApp task catalog.

1. Extract tasks from every current product repo (extract_tasks.py).
2. Build the interface reference catalogs (build_reference.py).
3. Cross-link: ONTAP CLI commands used in tasks -> ONTAP REST operations
   (via the "Related ONTAP commands" the REST docs list), REST calls in tasks
   -> REST operations, E-Series script commands -> SANtricity CLI reference.
4. Turn the ONTAP REST API worked examples into API tasks.
5. Write per-product JSONL, products.json, a flat task index CSV and a
   coverage summary.

Usage: build_catalog.py --src DIR_WITH_CLONES --out DATA_DIR [--include-versioned]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_reference  # noqa: E402
import extract_tasks  # noqa: E402
import products  # noqa: E402

ONTAP_FAMILY = "ONTAP"
PRIV_RE = re.compile(r"^(set(\s+-priv(ilege)?\s+\w+|\s+(advanced|diag|admin))?|exit|y|n)$")


# ---------------------------------------------------------------------------
# REST path matching
# ---------------------------------------------------------------------------

def path_regex(template: str) -> re.Pattern:
    parts = re.split(r"(\{[^}]+\})", template.rstrip("/"))
    rx = "".join("[^/]+" if p.startswith("{") else re.escape(p) for p in parts)
    return re.compile("^" + rx + "/?$")


class RestIndex:
    def __init__(self, ops):
        self.ops = ops
        self.by_method = defaultdict(list)
        for o in ops:
            self.by_method[o["method"]].append((path_regex(o["path"]), o))
        self.by_cli = defaultdict(list)
        for o in ops:
            for c in o["related_ontap_cli"]:
                self.by_cli[norm_cli(c)].append(o["id"])

    def match(self, call: str) -> str | None:
        m = re.match(r"^(GET|POST|PATCH|PUT|DELETE)\s+(\S+)$", call)
        if m:
            method, path = m.group(1), m.group(2)
        else:
            method, path = None, call
        path = re.sub(r"^/api", "", path.split("?")[0]).rstrip("/.,;:)") or "/"
        path = re.sub(r"<[^>]+>|\{\{[^}]+\}\}|\$\{?\w+\}?", "X", path)
        methods = [method] if method else ["GET", "POST", "PATCH", "DELETE"]
        for meth in methods:
            # prefer the most specific (longest) template that matches
            cands = [o for rx, o in self.by_method.get(meth, []) if rx.match(path)]
            if cands:
                cands.sort(key=lambda o: (o["path"].count("{"), -len(o["path"])))
                return cands[0]["id"]
        return None


def norm_cli(cmd: str) -> str:
    return re.sub(r"\s+", " ", cmd.strip().lower())


# ---------------------------------------------------------------------------

def rest_example_tasks(examples, rest: RestIndex) -> list[dict]:
    tasks = []
    seen = Counter()
    for ex in examples:
        title = ex["title"].strip().rstrip(".:")
        # "Creating a volume" -> "Create a volume"
        m = re.match(r"^(\w+?)ing\b(.*)$", title)
        if m:
            verb = m.group(1)
            fixes = {"Creat": "Create", "Retriev": "Retrieve", "Updat": "Update", "Delet": "Delete", "Modify": "Modify",
                     "Configur": "Configure", "Enabl": "Enable", "Disabl": "Disable", "Remov": "Remove", "Mov": "Move",
                     "Chang": "Change", "Renam": "Rename", "Resiz": "Resize", "Initializ": "Initialize", "Restor": "Restore",
                     "Revers": "Reverse", "Clos": "Close", "Us": "Use", "Manag": "Manage", "Stor": "Store", "Rais": "Raise",
                     "Generat": "Generate", "Replac": "Replace", "Releas": "Release", "Sav": "Save", "Relocat": "Relocate",
                     "Promot": "Promote", "Demot": "Demote", "Validat": "Validate", "Schedul": "Schedule",
                     "Increas": "Increase", "Decreas": "Decrease", "Execut": "Execute", "Provid": "Provide",
                     "Merg": "Merge", "Exclud": "Exclude", "Includ": "Include", "Revok": "Revoke", "Analyz": "Analyze"}
            verb = fixes.get(verb, verb[:-1] if re.search(r"(tt|pp|nn|gg|mm|dd|ll)$", verb) and not verb.endswith("ll") else verb)
            title = verb + m.group(2)
        op_ids = [x for x in (rest.match(c) for c in ex["calls"]) if x]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:80]
        base = "ontap-restapi/" + os.path.basename(ex["source"])[:-5]
        tid = f"{base}#{slug}"
        seen[tid] += 1
        if seen[tid] > 1:
            tid += f"-{seen[tid]}"
        steps = []
        for n, code in enumerate(ex["code"], 1):
            steps.append({"n": n, "text": "Send the request" if "curl" in code or re.search(r"^(GET|POST|PATCH|DELETE)\s", code, re.M)
                          else "Review the response" if n > 1 else "Run", "code": [{"lang": "rest", "content": code}]})
        if not steps:
            continue
        tasks.append({
            "id": tid,
            "product": "ontap-restapi",
            "product_title": "ONTAP REST API",
            "family": ONTAP_FAMILY,
            "title": title,
            "page_title": ex["endpoint_page"],
            "section_path": ["Examples", ex["title"]],
            "nav_path": ["ONTAP REST API reference", ex["endpoint_page"]],
            "in_nav": True,
            "url": ex["url"],
            "source": ex["source"],
            "summary": ex["text"][:400],
            "keywords": [],
            "version_notes": [],
            "interfaces": ["api"],
            "prerequisites": [],
            "about": [ex["text"]] if ex["text"] else [],
            "methods": [{
                "interface": "api", "interface_label": "ONTAP REST API", "interface_source": "reference-example",
                "variant": None, "signal_scores": {}, "intro": [], "steps": steps, "result": [],
                "cli_commands": [], "rest_calls": ex["calls"], "rest_operations": op_ids,
            }],
            "after": [], "examples": [], "cli_reference_links": [], "related_links": [],
            "detection": "rest-reference-example",
            "step_count": len(steps),
        })
    return tasks


def link_task(task, rest: RestIndex, es_index, ontap_cli: dict):
    fam = task.get("family")
    rest_eq = []
    for m in task["methods"]:
        ops = list(m.get("rest_operations", []))
        for call in m.get("rest_calls", []):
            op = rest.match(call) if fam == ONTAP_FAMILY else None
            if op and op not in ops:
                ops.append(op)
        if ops:
            m["rest_operations"] = ops
        if fam == ONTAP_FAMILY:
            for c in m.get("cli_commands", []):
                n = norm_cli(c)
                if PRIV_RE.match(n):
                    continue
                if n in rest.by_cli:
                    for op in rest.by_cli[n]:
                        if op not in rest_eq:
                            rest_eq.append(op)
                if n.split(" ")[0] in ontap_cli["roots"] and len(n.split(" ")) > 1:
                    rec = ontap_cli["commands"].setdefault(n, {"command": n, "tasks": [], "rest_operations": rest.by_cli.get(n, [])})
                    if len(rec["tasks"]) < 50:
                        rec["tasks"].append(task["id"])
        if fam == "E-Series / SANtricity":
            refs = []
            for code in iter_code(m["steps"]):
                for line in re.split(r"[;\n]", code):
                    line = line.strip().strip('"').lstrip("-c ").strip('"')
                    key = eseries_key(line)
                    if key and key in es_index and es_index[key] not in refs:
                        refs.append(es_index[key])
            if refs:
                m["eseries_cli_commands"] = refs
    if rest_eq:
        task["rest_equivalents"] = rest_eq  # inferred: REST ops that map to the CLI commands used


def iter_code(steps):
    for s in steps:
        for c in s.get("code", []):
            yield c["content"]
        yield from iter_code(s.get("substeps", []))
        for v in s.get("variants", []):
            for c in v.get("code", []):
                yield c["content"]
            yield from iter_code(v.get("substeps", []))


def eseries_key(text: str) -> str | None:
    words = re.findall(r"[A-Za-z][A-Za-z0-9]*", text)[:3]
    if len(words) < 2:
        return None
    return " ".join(w.lower() for w in words[:2])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--repos-file", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "repos.txt"))
    ap.add_argument("--include-versioned", action="store_true")
    args = ap.parse_args()

    slugs = [l.strip() for l in open(args.repos_file) if l.strip() and not l.startswith("#")]
    wanted = {"current"} | ({"versioned-copy"} if args.include_versioned else set())
    os.makedirs(os.path.join(args.out, "tasks"), exist_ok=True)
    os.makedirs(os.path.join(args.out, "reference"), exist_ok=True)

    # reference catalogs
    ops, examples = build_reference.ontap_rest(args.src)
    es_cmds = build_reference.eseries_cli(args.src)
    rest = RestIndex(ops)
    es_index = {}
    for c in es_cmds:
        for syn in (c["syntax"] or []) + ([c["command"]] if c["command"] else []):
            k = eseries_key(syn)
            if k:
                es_index.setdefault(k, c["id"])
    roots = {norm_cli(c).split(" ")[0] for o in ops for c in o["related_ontap_cli"]}
    ontap_cli = {"roots": roots, "commands": {}}

    all_products, index_rows = [], []
    by_product: dict[str, list] = {}
    for slug in slugs:
        st = products.status(slug)
        if st not in wanted:
            all_products.append({"slug": slug, "family": products.family(slug), "status": st, "tasks": 0})
            continue
        repo_dir = os.path.join(args.src, slug)
        if not os.path.isdir(repo_dir):
            print(f"missing clone: {slug}", file=sys.stderr)
            all_products.append({"slug": slug, "family": products.family(slug), "status": st, "tasks": 0, "missing": True})
            continue
        loose = products.family(slug) == "Solutions and reference architectures"
        meta, tasks, pages = extract_tasks.extract_repo(repo_dir, slug, loose)
        meta.update({"family": products.family(slug), "status": st, "pages": len(pages),
                     "pages_with_tasks": sum(1 for p in pages if p["tasks"])})
        for t in tasks:
            t["product_title"] = meta["title"]
            t["family"] = meta["family"]
        by_product[slug] = (meta, tasks)

    by_product["ontap-restapi"] = ({"slug": "ontap-restapi", "title": "ONTAP REST API", "family": ONTAP_FAMILY,
                                    "status": "reference", "summary": "Worked examples from the ONTAP REST API reference",
                                    "pages": len({e["source"] for e in examples}), "pages_with_tasks": None},
                                   rest_example_tasks(examples, rest))

    for slug, (meta, tasks) in by_product.items():
        for t in tasks:
            link_task(t, rest, es_index, ontap_cli)
        with open(os.path.join(args.out, "tasks", f"{slug}.jsonl"), "w") as fh:
            for t in tasks:
                fh.write(json.dumps(t, ensure_ascii=False) + "\n")
        iface = Counter(i for t in tasks for i in t["interfaces"])
        meta.update({"tasks": len(tasks), "methods": sum(len(t["methods"]) for t in tasks),
                     "tasks_by_interface": dict(iface),
                     "multi_interface_tasks": sum(1 for t in tasks if len(t["interfaces"]) > 1),
                     "tasks_with_rest_equivalent": sum(1 for t in tasks if t.get("rest_equivalents")),
                     "tasks_in_nav": sum(1 for t in tasks if t["in_nav"])})
        all_products.append(meta)
        for t in tasks:
            index_rows.append({
                "id": t["id"], "family": t["family"], "product": slug, "product_title": meta["title"],
                "nav_path": " > ".join(t["nav_path"]), "title": t["title"], "page_title": t["page_title"],
                "interfaces": ";".join(t["interfaces"]),
                "method_labels": ";".join(sorted({m.get("interface_label") or m["interface"] for m in t["methods"]})),
                "methods": len(t["methods"]), "steps": t["step_count"],
                "cli_commands": ";".join(sorted({c for m in t["methods"] for c in m.get("cli_commands", [])}))[:500],
                "rest_operations": ";".join(sorted({o for m in t["methods"] for o in m.get("rest_operations", [])}))[:500],
                "rest_equivalents_inferred": len(t.get("rest_equivalents", [])),
                "version_notes": ";".join(t["version_notes"]), "in_nav": t["in_nav"], "detection": t["detection"],
                "url": t["url"],
            })
        print(f"{slug:48s} tasks={len(tasks):5d} {dict(iface)}", flush=True)

    # reference outputs
    for c in ontap_cli["commands"].values():
        c["reference_url"] = "https://docs.netapp.com/us-en/ontap-cli/" + c["command"].replace(" ", "-") + ".html"
        c["task_count"] = len(c["tasks"])
    for o in ops:
        for c in o["related_ontap_cli"]:
            n = norm_cli(c)
            ontap_cli["commands"].setdefault(n, {"command": n, "tasks": [], "task_count": 0, "rest_operations": rest.by_cli.get(n, []),
                                                  "reference_url": "https://docs.netapp.com/us-en/ontap-cli/" + n.replace(" ", "-") + ".html"})
    for fname, rows in [("ontap-rest-operations.jsonl", ops), ("ontap-rest-examples.jsonl", examples),
                        ("e-series-cli-commands.jsonl", es_cmds),
                        ("ontap-cli-commands.jsonl", sorted(ontap_cli["commands"].values(), key=lambda c: c["command"]))]:
        with open(os.path.join(args.out, "reference", fname), "w") as fh:
            for r in rows:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    all_products.sort(key=lambda p: (p["family"], p["slug"]))
    with open(os.path.join(args.out, "products.json"), "w") as fh:
        json.dump(all_products, fh, indent=1, ensure_ascii=False)
    with open(os.path.join(args.out, "task_index.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(index_rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(index_rows, key=lambda r: (r["family"], r["product"], r["nav_path"], r["id"])))
    print(f"TOTAL tasks={len(index_rows)} products={len(by_product)} ontap_cli_commands={len(ontap_cli['commands'])}")


if __name__ == "__main__":
    main()
