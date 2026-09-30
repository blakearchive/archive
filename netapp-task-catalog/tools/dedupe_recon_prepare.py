#!/usr/bin/env python3
"""Prepare cross-bucket reconciliation of operations.

Bucket-level clustering only sees one bucket, so copies of an operation that
landed in different buckets (e.g. an ONTAP task filed under "volume" and its
Cloud Volumes ONTAP copy filed under "deploy-cloud") are still separate. This
script proposes candidate duplicates deterministically, so that recall does not
depend on an agent searching thousands of rows:

  * same domain (or, for solution guides, any core domain),
  * compatible action (view/list/retrieve/show..., delete/remove, create/add...),
  * overlapping object words after synonym normalisation (storage VM = SVM,
    local tier = aggregate, CIFS = SMB, ...).

Operations linked by candidate edges are packed into windows (connected
components kept together where possible). Each window is written as a TSV for a
reconciliation agent; solution-guide windows ask for a mapping onto core ops.

Usage: dedupe_recon_prepare.py --work WORK_DIR --ops ops_stage1.jsonl --out RECON_DIR
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import re

WINDOW = 150
ACTION_GROUPS = [
    {"view", "list", "get", "show", "display", "retrieve", "check", "find", "monitor", "review", "see", "identify", "determine"},
    {"modify", "edit", "change", "update", "set", "adjust", "rename", "customize", "configure", "specify", "manage"},
    {"delete", "remove", "destroy", "unregister", "decommission", "retire", "clean"},
    {"create", "add", "provision", "define", "register", "new", "set up", "setup", "establish"},
    {"enable", "activate", "turn on", "start", "resume"},
    {"disable", "deactivate", "turn off", "stop", "pause", "suspend", "quiesce"},
    {"restore", "recover", "revert", "roll back", "rollback"},
    {"replace", "swap", "hot-swap"},
    {"install", "deploy"},
    {"upgrade", "update software", "update firmware"},
    {"verify", "validate", "test", "confirm"},
]
SYNONYMS = [
    (r"\bstorage vms?\b|\bstorage virtual machines?\b|\bvservers?\b", "svm"),
    (r"\blocal tiers?\b", "aggregate"),
    (r"\bnetwork interfaces?\b|\blogical interfaces?\b|\blifs?\b", "lif"),
    (r"\bcifs\b", "smb"),
    (r"\bsnapshot copies\b|\bsnapshot copy\b|\bsnapshots\b", "snapshot"),
    (r"\bcloud volumes ontap\b|\bcvo\b", "cvo"),
    (r"\bworking environments?\b|\bsystems? in (the )?console\b", "system"),
    (r"\bconnectors?\b|\bconsole agents?\b", "agent"),
    (r"\bstorage efficiency\b", "efficiency"),
    (r"\bexport rules?\b", "export rule"),
    (r"\bigroups?\b|\binitiator groups?\b", "igroup"),
    (r"\bnamespaces?\b", "namespace"),
    (r"\bdisks?\b|\bdrives?\b", "drive"),
]
STOP = {"a", "an", "the", "of", "for", "to", "in", "on", "with", "and", "or", "by", "from", "at", "as", "its", "their",
        "your", "using", "via", "into", "new", "existing", "specific", "all", "one", "multiple", "single", "ontap",
        "netapp", "storage", "system", "systems", "configuration", "settings", "setting", "information", "details"}


def action_group(action: str) -> int:
    a = (action or "").lower().strip()
    for i, g in enumerate(ACTION_GROUPS):
        if a in g:
            return i
    return 1000 + hash(a) % 100000


def tokens(text: str) -> set[str]:
    t = text.lower()
    for rx, rep in SYNONYMS:
        t = re.sub(rx, rep, t)
    words = re.findall(r"[a-z0-9][a-z0-9-]*", t)
    out = set()
    for w in words:
        if w in STOP:
            continue
        out.add(stem(w))
    return out


def stem(w: str) -> str:
    """Light suffix stripping: auditing -> audit, statistics -> statistic, policies -> policy."""
    if len(w) <= 4:
        return w
    for suf, rep in (("ies", "y"), ("ing", ""), ("ations", ""), ("ation", ""), ("ed", ""), ("es", ""), ("s", "")):
        if w.endswith(suf) and len(w) - len(suf) >= 3 and not w.endswith("ss"):
            return w[: len(w) - len(suf)] + rep
    return w


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--ops", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--exact", action="store_true",
                    help="candidates = same domain + action family + object words (second pass)")
    ap.add_argument("--pairwise", action="store_true",
                    help="candidates = every pair in one domain + action family with overlapping object words (third pass)")
    ap.add_argument("--prefix", default="w", help="window id prefix")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    pgs = {}
    with open(os.path.join(args.work, "pregroups.jsonl")) as fh:
        for line in fh:
            r = json.loads(line)
            pgs[r["pg"]] = r
    ops = [json.loads(l) for l in open(args.ops)]
    for o in ops:
        o["_obj"] = tokens(o["object"]) or tokens(o["name"])
        o["_name"] = tokens(o["name"])
        o["_ag"] = action_group(o["action"])
        o["_products"] = sorted({p for pg in o["pregroups"] for p in pgs[pg]["products"]})
        o["_solution"] = o["domain"].startswith("Solutions:")

    by_domain = collections.defaultdict(list)
    for o in ops:
        by_domain["Solutions" if o["_solution"] else o["domain"]].append(o)
    core = [o for o in ops if not o["_solution"]]

    # inverted index over object tokens
    index = collections.defaultdict(list)
    for i, o in enumerate(ops):
        for tkn in o["_obj"] | o["_name"]:
            index[tkn].append(i)

    def candidates(i: int) -> list[tuple[float, int]]:
        o = ops[i]
        scores = collections.Counter()
        for tkn in o["_obj"] | o["_name"]:
            if len(index[tkn]) > 400:  # too common to be informative
                continue
            for j in index[tkn]:
                if j != i:
                    scores[j] += 1
        out = []
        for j, _ in scores.most_common(60):
            p = ops[j]
            if o["_solution"]:
                if p["_solution"] and p["domain"] != o["domain"]:
                    continue
            elif p["domain"] != o["domain"]:
                continue
            if p["_ag"] != o["_ag"] or o["kind"] == "not_a_task" or p["kind"] == "not_a_task":
                continue
            a, b = o["_obj"], p["_obj"]
            obj_cont = len(a & b) / max(1, min(len(a), len(b)))
            n1, n2 = o["_name"], p["_name"]
            name_j = len(n1 & n2) / max(1, len(n1 | n2))
            sim = max(obj_cont * (0.6 + 0.4 * name_j), name_j)
            # pairs inside one bucket were already reviewed by that bucket's
            # cluster/verify/judge agents; only near-identical names come back
            if p["bucket"] == o["bucket"] and sim < 0.95:
                continue
            if sim >= 0.6:
                out.append((round(sim, 2), j))
        out.sort(reverse=True)
        return out[:6]

    def exact_candidates(i: int) -> list[tuple[float, int]]:
        """Second pass: operations of one domain with the same action family and
        the same object words (or the same normalised name). Catches twins that
        fuzzy scoring drops when their words are very common."""
        o = ops[i]
        if o["kind"] == "not_a_task":
            return []
        out = []
        for j in exact_key_members[(o["domain"], o["_ag"], frozenset(o["_obj"]))] | \
                exact_name_members[(o["domain"], frozenset(o["_name"]))]:
            if j != i and ops[j]["kind"] != "not_a_task":
                out.append((1.0, j))
        return sorted(out)[:8]

    def pairwise_candidates() -> dict[int, list[tuple[float, int]]]:
        """Third pass: compare every pair of operations in one domain and action
        family (no common-word skipping), so generic objects such as "volume"
        still meet "FlexVol volume", "NFS volume", ..."""
        groups = collections.defaultdict(list)
        for i, o in enumerate(ops):
            if o["kind"] != "not_a_task":
                key = ("Solutions" if o["_solution"] else o["domain"], o["_ag"])
                groups[key].append(i)
        out = {i: [] for i in range(len(ops))}
        for key, members in groups.items():
            for x in range(len(members)):
                i = members[x]
                a, n1 = ops[i]["_obj"], ops[i]["_name"]
                for y in range(x + 1, len(members)):
                    j = members[y]
                    if ops[i]["_solution"] and ops[j]["_solution"] and ops[i]["domain"] != ops[j]["domain"]:
                        continue
                    if ops[i]["_solution"] != ops[j]["_solution"] and not (ops[i]["_solution"] or ops[j]["_solution"]):
                        continue
                    b, n2 = ops[j]["_obj"], ops[j]["_name"]
                    if not a or not b:
                        continue
                    inter = len(a & b)
                    jac = inter / len(a | b)
                    cont = inter / min(len(a), len(b))
                    extra = len(a | b) - min(len(a), len(b))
                    name_j = len(n1 & n2) / max(1, len(n1 | n2))
                    if jac >= 0.5 or (cont == 1 and extra <= 2) or name_j >= 0.6:
                        score = round(max(jac, name_j, 0.7 if cont == 1 else 0), 2)
                        out[i].append((score, j))
                        out[j].append((score, i))
        return {i: sorted(v, reverse=True)[:6] for i, v in out.items()}

    if args.pairwise:
        cand = pairwise_candidates()
    elif args.exact:
        exact_key_members = collections.defaultdict(set)
        exact_name_members = collections.defaultdict(set)
        for i, o in enumerate(ops):
            if o["_obj"]:
                exact_key_members[(o["domain"], o["_ag"], frozenset(o["_obj"]))].add(i)
            if o["_name"]:
                exact_name_members[(o["domain"], frozenset(o["_name"]))].add(i)
        cand = {i: exact_candidates(i) for i in range(len(ops))}
    else:
        cand = {i: candidates(i) for i in range(len(ops))}
    # union candidate graph for packing
    parent = list(range(len(ops)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i, cs in cand.items():
        for _, j in cs:
            parent[find(i)] = find(j)
    comps = collections.defaultdict(list)
    for i in range(len(ops)):
        if cand[i]:
            comps[find(i)].append(i)

    windows = []
    for scope in ("core", "solutions"):
        comp_list = [c for c in comps.values()
                     if (scope == "solutions") == any(ops[i]["_solution"] for i in c)]
        comp_list.sort(key=lambda c: (ops[c[0]]["domain"], sorted(ops[i]["object"].lower() for i in c)[0]))
        cur: list[int] = []
        for c in comp_list:
            c = sorted(c, key=lambda i: (ops[i]["domain"], ops[i]["object"].lower(), ops[i]["action"]))
            while len(c) > WINDOW:
                windows.append((scope, c[:WINDOW]))
                c = c[WINDOW:]
            if len(cur) + len(c) > WINDOW:
                windows.append((scope, cur))
                cur = []
            cur.extend(c)
        if cur:
            windows.append((scope, cur))

    manifest = []
    for wi, (scope, members) in enumerate(windows, 1):
        wid = f"{args.prefix}{wi:03d}"
        path = os.path.join(args.out, f"{wid}.tsv")
        member_set = set(members)
        extra = []  # candidate targets that are not themselves in this window
        with open(path, "w") as fh:
            fh.write("uid\tdomain\tname\taction\tobject\tkind\tcategory\ttasks\tproducts\texample titles\tcandidate duplicates (uid ~ name [similarity])\n")
            for i in members:
                o = ops[i]
                cs = "; ".join(f"{ops[j]['uid']} ~ {ops[j]['name']} [{s}]" for s, j in cand[i])
                for _, j in cand[i]:
                    if j not in member_set:
                        extra.append(j)
                fh.write("\t".join([o["uid"], o["domain"], o["name"], o["action"], o["object"], o["kind"], o["category"],
                                    str(len(o["tasks"])), ",".join(o["_products"])[:80],
                                    " | ".join(o["pregroup_titles"][:3])[:220], cs]).replace("\n", " ") + "\n")
            extra = [j for j in dict.fromkeys(extra)]
            if extra:
                fh.write("\n# Candidate targets outside this window (context only; do not propose groups made only of these)\n")
                for j in extra:
                    o = ops[j]
                    fh.write("\t".join([o["uid"], o["domain"], o["name"], o["action"], o["object"], o["kind"], o["category"],
                                        str(len(o["tasks"])), ",".join(o["_products"])[:80],
                                        " | ".join(o["pregroup_titles"][:3])[:220], ""]).replace("\n", " ") + "\n")
        manifest.append({"window": wid, "scope": scope, "ops": len(members),
                         "domains": sorted({ops[i]["domain"] for i in members})[:6], "file": path})
    with open(os.path.join(args.out, "windows.json"), "w") as fh:
        json.dump(manifest, fh, indent=1)
    n_edges = sum(len(c) for c in cand.values())
    print(f"ops={len(ops)} with_candidates={sum(1 for c in cand.values() if c)} edges={n_edges} windows={len(manifest)} "
          f"(core={sum(1 for m in manifest if m['scope'] == 'core')}, solutions={sum(1 for m in manifest if m['scope'] == 'solutions')})")


if __name__ == "__main__":
    main()
