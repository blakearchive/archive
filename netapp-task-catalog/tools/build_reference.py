#!/usr/bin/env python3
"""Build interface reference catalogs from the NetAppDocs reference repos.

* ONTAP REST API  (NetAppDocs/ontap-restapi): one record per operation
  (method + path) with parameters, request-body fields and the
  "Related ONTAP commands" the docs map it to, plus the worked examples
  ("Creating a volume", ...) from the endpoint overview pages.
* E-Series SANtricity CLI (NetAppDocs/e-series-cli): one record per command
  with syntax, parameters, roles, supported arrays, minimum firmware and
  category.

The ONTAP CLI man pages (docs.netapp.com/us-en/ontap-cli) are not published in
a public NetAppDocs repo, so the ONTAP CLI catalog is assembled later by
link_reference.py from the commands the docs themselves use.

Usage: build_reference.py --src DIR_WITH_CLONES --out OUT_DIR
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import adoc  # noqa: E402

OP_RE = re.compile(r"api-doc-operation-(\w+)\]#(\w+)#\s*\[\.api-doc-code-block\]#`([^`]+)`#")
INTRO_RE = re.compile(r"^\*Introduced In:\*\s*(\S+)", re.M)


def section(body: str, title_re: str) -> str:
    m = re.search(rf"^==+\s+{title_re}\s*$(.*?)(?=^==?\s|\Z)", body, re.M | re.S | re.I)
    return m.group(1) if m else ""


def clean(text: str) -> str:
    t = re.sub(r"link:([^\[]+)\[([^\]]*)\]", r"\2", text)
    t = re.sub(r"<<[^,>]+,([^>]+)>>", r"\1", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def parse_param_table(tbl: str) -> list[dict]:
    rows = []
    cells = [c.strip() for c in re.split(r"(?m)^a?\|", tbl)]
    cells = [c for c in cells if c != ""]
    if len(cells) < 5:
        return rows
    header = [c.lower() for c in cells[:5]]
    if header[0] != "name":
        return rows
    for i in range(5, len(cells) - 4, 5):
        name, typ, where, req, desc = cells[i:i + 5]
        rows.append({"name": name, "type": typ, "in": where, "required": req.lower() == "true",
                     "description": clean(desc)[:400]})
    return rows


def ontap_rest(src: str, product: str = "ontap-restapi"):
    ops, examples = [], []
    base = os.path.join(src, product)
    for path in sorted(glob.glob(os.path.join(base, "*.adoc"))):
        name = os.path.basename(path)
        raw = open(path, encoding="utf-8", errors="replace").read()
        fm, body = adoc.strip_frontmatter(raw)
        m = OP_RE.search(body)
        if m:
            method, route = m.group(2).upper(), m.group(3)
            title = re.search(r"^= (.+)$", body, re.M)
            intro = INTRO_RE.search(body)
            desc = body[m.end():]
            desc = re.split(r"^== ", desc, flags=re.M)[0]
            desc = INTRO_RE.sub("", desc)
            related = re.findall(r"^\*\s+`([^`]+)`", section(body, r"Related ONTAP commands"), re.M)
            params_tbl = re.search(r"^== Parameters\s*$.*?\|===\n(.*?)\n\|===", body, re.M | re.S)
            params = parse_param_table(params_tbl.group(1)) if params_tbl else []
            req_body = section(body, r"Request Body")
            body_fields = [f for f in re.findall(r"^\|([a-z_][\w.]*)\s*$", req_body, re.M)
                           if f not in ("string", "boolean", "integer", "number", "object", "array")]
            ops.append({
                "id": f"{method} {route}",
                "method": method,
                "path": route,
                "api_path": "/api" + route,
                "summary": str(fm.get("summary") or (title.group(1) if title else "")),
                "introduced_in": intro.group(1) if intro else None,
                "description": clean(desc)[:2000],
                "related_ontap_cli": related,
                "parameters": params,
                "request_body_fields": list(dict.fromkeys(body_fields))[:200],
                "url": f"https://docs.netapp.com/us-en/{product}/{fm.get('permalink', name.replace('.adoc', '.html'))}",
                "source": f"NetAppDocs/{product}/{name}",
            })
        elif name.endswith("_endpoint_overview.adoc"):
            title = re.search(r"^= (.+)$", body, re.M)
            ex_blocks = re.split(r"(?m)^== Examples\s*$", body)[1:]
            for ex in ex_blocks:
                ex = re.split(r"(?m)^== ", ex)[0]
                for sub in re.finditer(r"(?ms)^=== (.+?)$(.*?)(?=^=== |\Z)", ex):
                    ex_title, content = sub.group(1).strip(), sub.group(2)
                    code = re.findall(r"(?ms)^----\n(.*?)\n----", content)
                    calls = []
                    for c in code:
                        for cm in re.finditer(r"curl[^\n]*?-X\s*(GET|POST|PATCH|PUT|DELETE)[^\n]*?[\"']?https?://[^/\s\"']+(?:/api)?(/[^\s\"'?]*)", c):
                            calls.append(f"{cm.group(1)} {cm.group(2)}")
                        for cm in re.finditer(r"^\s*(GET|POST|PATCH|PUT|DELETE)\s+[\"']?(?:/api)?(/[^\s\"'?]*)", c, re.M):
                            calls.append(f"{cm.group(1)} {cm.group(2)}")
                    examples.append({
                        "endpoint_page": title.group(1).strip() if title else name,
                        "title": ex_title,
                        "calls": list(dict.fromkeys(calls)),
                        "text": clean(re.sub(r"(?ms)^----\n.*?\n----", "", content).replace("\'\'\'", ""))[:1000],
                        "code": [c[:4000] for c in code],
                        "url": f"https://docs.netapp.com/us-en/{product}/{fm.get('permalink', name.replace('.adoc', '.html'))}",
                        "source": f"NetAppDocs/{product}/{name}",
                    })
    return ops, examples


def eseries_cli(src: str, product: str = "e-series-cli"):
    base = os.path.join(src, product)
    category = {}
    for path in glob.glob(os.path.join(base, "commands-category", "*.adoc")):
        body = adoc.strip_frontmatter(open(path, encoding="utf-8", errors="replace").read())[1]
        cat_title = re.search(r"^= (.+)$", body, re.M)
        cur = None
        for line in body.split("\n"):
            h = re.match(r"^==+\s+(.+)$", line)
            if h:
                cur = h.group(1).strip()
            for target in re.findall(r"commands-a-z/([\w.-]+)\.html", line):
                if cat_title and "Alphabetical" in cat_title.group(1):
                    continue
                category.setdefault(target, []).append(
                    " / ".join(x for x in [(cat_title.group(1).strip() if cat_title else ""), cur or ""] if x))
    cmds = []
    for path in sorted(glob.glob(os.path.join(base, "commands-a-z", "*.adoc"))):
        name = os.path.basename(path)[:-5]
        raw = open(path, encoding="utf-8", errors="replace").read()
        fm, body = adoc.strip_frontmatter(raw)
        title = re.search(r"^= (.+)$", body, re.M)
        lead = re.search(r"\[\.lead\]\n(.+?)(?:\n\n|\Z)", body, re.S)
        cmd = re.search(r"`([^`]+)`", lead.group(1)) if lead else None
        syntax = re.findall(r"(?ms)^----\n(.*?)\n----", section(body, r"Syntax"))
        params_sec = section(body, r"Parameters?")
        params = re.findall(r"(?m)^a?\|\s*\n?`([^`]+)`", params_sec) or re.findall(r"(?m)^\|\s*`([^`]+)`", params_sec)
        minfw = section(body, r"Minimum firmware level")
        cmds.append({
            "id": name,
            "title": re.sub(r"\s*-\s*SANtricity CLI\s*$", "", title.group(1)).strip() if title else name,
            "command": cmd.group(1) if cmd else None,
            "summary": str(fm.get("summary") or ""),
            "categories": sorted(set(category.get(name, []))),
            "supported_arrays": clean(section(body, r"Supported Arrays"))[:600],
            "roles": clean(section(body, r"Roles"))[:400],
            "context": clean(section(body, r"Context"))[:1500],
            "syntax": syntax,
            "parameters": list(dict.fromkeys(params)),
            "minimum_firmware": re.findall(r"\b\d+\.\d+(?:\.\d+)?\b", minfw)[:5],
            "url": f"https://docs.netapp.com/us-en/{product}/commands-a-z/{name}.html",
            "source": f"NetAppDocs/{product}/commands-a-z/{name}.adoc",
        })
    return cmds


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    out = os.path.join(args.out, "reference")
    os.makedirs(out, exist_ok=True)
    ops, examples = ontap_rest(args.src)
    es = eseries_cli(args.src)
    for fname, rows in [("ontap-rest-operations.jsonl", ops), ("ontap-rest-examples.jsonl", examples),
                        ("e-series-cli-commands.jsonl", es)]:
        with open(os.path.join(out, fname), "w") as fh:
            for r in rows:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"ONTAP REST operations: {len(ops)} ({sum(1 for o in ops if o['related_ontap_cli'])} with CLI mapping)")
    print(f"ONTAP REST worked examples: {len(examples)}")
    print(f"E-Series CLI commands: {len(es)} ({sum(1 for c in es if c['categories'])} categorised)")


if __name__ == "__main__":
    main()
