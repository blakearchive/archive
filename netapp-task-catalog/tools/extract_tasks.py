#!/usr/bin/env python3
"""Extract procedural tasks from NetAppDocs AsciiDoc repositories.

For every documentation page, every procedure (a ".Steps"/".Step" block, a
"== Steps" section, or the ordered list inside an interface tab) becomes a task
record. Procedures in the same section that sit in sibling tabs of a
[role="tabbed-block"] (for example "System Manager" / "CLI") are grouped into
one task with one *method* per tab, so each task lists every interface the
docs describe for it.

Usage:
    extract_tasks.py --src DIR_WITH_CLONES --out OUT_DIR [--repos a,b,c]
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import adoc  # noqa: E402

DOCS_BASE = "https://docs.netapp.com/us-en"

PHASE_RE = re.compile(r"^(?:step|phase|stage|part)\s*\d+[a-z]?\b\s*(?:[:.)\-\u2013\u2014]|of\s+\d+:?)?\s*", re.I)
API_CALL_TITLE_RE = re.compile(r"^HTTP method and endpoint", re.I)
STEPS_TITLE_RE = re.compile(r"^(steps?|procedure|steps to .*|steps for .*)$", re.I)
ROLE_PATTERNS = [
    ("prereq", re.compile(r"^(before you (begin|start)|prerequisites?|requirements?|what you'?ll need|you will need)\b", re.I)),
    ("about", re.compile(r"^(about this (task|procedure)|about this)\b", re.I)),
    ("after", re.compile(r"^(after you finish|what'?s next|next steps?|results?|what to do next)\b", re.I)),
    ("example", re.compile(r"^(examples?|sample|command example|curl example|.*example output)\b", re.I)),
    ("related", re.compile(r"^(related (information|links?)|more information|for more information)\b", re.I)),
]

IFACE_LABEL_RULES = [
    ("api", re.compile(r"\bREST\b|\bAPI\b|curl|swagger|postman", re.I)),
    ("automation", re.compile(r"ansible|terraform|python|\bSDK\b|powershell toolkit|playbook|helm|yaml|manifest|operator", re.I)),
    ("cli", re.compile(r"\bCLI\b|command[- ]line|\bcommands?\b|SMcli|powershell|\bshell\b|kubectl|tridentctl|\bssh\b|bash|terminal|script|console \(cli\)", re.I)),
    ("gui", re.compile(r"system manager|grid manager|tenant manager|unified manager|\bconsole\b|bluexp|\bUI\b|\bGUI\b|user interface|web (ui|client|interface|browser)|vsphere client|portal|dashboard|wizard|hybrid cloud control|\bmanager\b|cloud manager|snapcenter server|workload factory|element ui|santricity", re.I)),
]

CLI_LANGS = {"cli", "console", "shell", "sh", "bash", "powershell", "ps", "cmd", "text", "none", "plaintext", "screen"}
PROMPT_RE = re.compile(r"^\s*(?:[\w.-]+::[\w*]*>|[\w.-]*::\*?>|PS [^>]*>|\$|#|>|[\w.@-]+[#$>]|LOADER(?:-[AB])?>|\w+\[\w+\]\s*[#>])\s+")
REST_LINE_RE = re.compile(r"\b(GET|POST|PATCH|PUT|DELETE)\s+(/[\w/{}.\-]*(?:\?[^\s`]*)?|https?://\S+)")
API_PATH_RE = re.compile(r"(/api/[A-Za-z0-9_/{}.\-]+)")
CLI_LINK_RE = re.compile(r"docs\.netapp\.com/us-en/(ontap-cli(?:-\d+)?)/([a-z0-9_.-]+)\.html")
UI_PATH_RE = re.compile(r"\*\*[^*\n]{1,60}\*\*\s*(?:>|&gt;|→)\s*\*\*[^*\n]{1,60}\*\*|\*\*[^*\n]{1,40}\s(?:>|→)\s[^*\n]{1,60}\*\*")
GUI_VERB_RE = re.compile(r"\b(select|click|navigate|go to|choose|check|uncheck|enter|type|in the [\w\s]+ (page|window|dialog|pane|tab|section)|drop-?down|wizard|menu|icon)\b", re.I)
VERSION_RE = re.compile(r"(?:beginning with|starting with|starting in|in|from)\s+((?:ONTAP|StorageGRID|SANtricity|Element|Trident|SnapCenter|ONTAP tools)\s+(?:\d+(?:\.\d+){0,2}))", re.I)
VERSIONED_REPO_RE = re.compile(r"-(\d{2,4}|\d+\.\d+)$|^(hci|element-software|trident|astra-control-center|storagegrid|e-series-santricity|ontap-cli|ontap-ems|ontap-restapi|ontap-tools-vmware-vsphere|sc-plugin-vmware-vsphere|snapcenter)-?\d+$")


# ---------------------------------------------------------------------------
# inline markup -> markdown-ish text
# ---------------------------------------------------------------------------

def make_inline(product: str, page_dir: str):
    def absolute(url: str) -> str:
        url = url.strip()
        if re.match(r"^[a-z]+://", url) or url.startswith("mailto:"):
            return url
        if url.startswith("{") or url.startswith("#"):
            return url
        if url.startswith("/"):
            path = url.lstrip("/")
        else:
            path = os.path.normpath(os.path.join(page_dir, url)).lstrip("./")
        path = re.sub(r"\.adoc(#|$)", r".html\1", path)
        return f"{DOCS_BASE}/{product}/{path}"

    def inline(text: str) -> str:
        if not text:
            return ""
        t = text
        t = re.sub(r"pass:\[(.*?)\]", r"\1", t)
        t = re.sub(r"\+\+\+(.*?)\+\+\+", r"\1", t)
        t = re.sub(r"footnote:\[[^\]]*\]", "", t)
        t = re.sub(r"image:+([^\[\s]+)\[([^\]]*)\]", lambda m: f"[{(m.group(2).split(',')[0] or os.path.basename(m.group(1))).strip()}]", t)
        t = re.sub(r"kbd:\[([^\]]*)\]", r"`\1`", t)
        t = re.sub(r"btn:\[([^\]]*)\]", r"**\1**", t)
        t = re.sub(r"menu:([^\[]+)\[([^\]]*)\]", lambda m: " > ".join(x.strip() for x in [m.group(1)] + m.group(2).split(">") if x.strip()), t)
        t = re.sub(r"(?:link|xref):([^\[\s]+)\[([^\]]*)\]", lambda m: f"[{m.group(2).rstrip('^').strip() or m.group(1)}]({absolute(m.group(1))})", t)
        t = re.sub(r"(?<![(\[])(https?://[^\s\[\]]+)\[([^\]]*)\]", lambda m: f"[{m.group(2).rstrip('^').strip() or m.group(1)}]({m.group(1)})", t)
        t = t.replace("\\<<", "\x00LT\x00")
        t = re.sub(r"\[\[[^\]]+\]\]", "", t)
        t = re.sub(r"<<([^,>]+),([^>]+)>>", r"\2", t)
        t = re.sub(r"<<([^>]+)>>", r"\1", t)
        t = t.replace("\x00LT\x00", "<<")
        t = re.sub(r"`\+(.*?)\+`", r"`\1`", t)
        t = re.sub(r"(?<![\w*`])\*(?=\S)([^*\n`]+?)(?<=\S)\*(?![\w*])", r"**\1**", t)
        t = t.replace("{nbsp}", " ").replace("{blank}", "").replace("{empty}", "")
        t = re.sub(r"\s\+$", "", t, flags=re.M)
        t = html.unescape(t)
        return re.sub(r"[ \t]+", " ", t).strip()

    return inline, absolute


# ---------------------------------------------------------------------------
# navigation (sidebar.yml) and product metadata
# ---------------------------------------------------------------------------

def load_yaml(path: str):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return yaml.safe_load(fh)
    except Exception:
        return None


def build_nav(repo_dir: str) -> tuple[dict, list]:
    """Return ({'/dir/page.html': [breadcrumb titles]}, ordered section titles)."""
    nav: dict[str, list[str]] = {}
    sections: dict[str, dict] = {}
    for root, _dirs, files in os.walk(repo_dir):
        if "/.git" in root:
            continue
        for f in files:
            if f == "sidebar.yml":
                data = load_yaml(os.path.join(root, f))
                if isinstance(data, dict):
                    key = data.get("section") or os.path.relpath(root, repo_dir)
                    sections[str(key)] = data

    def walk(entries, trail):
        for e in entries or []:
            if not isinstance(e, dict):
                continue
            title = str(e.get("title", "")).strip()
            url = e.get("url")
            if url and isinstance(url, str) and not url.startswith("http"):
                u = "/" + url.lstrip("/").split("#")[0]
                nav.setdefault(u, trail + [title])
            if e.get("entries"):
                walk(e["entries"], trail + [title] if title else trail)
            if e.get("section") and str(e["section"]) in sections and not e.get("entries"):
                sec = sections[str(e["section"])]
                walk(sec.get("entries"), trail + ([str(sec.get("title")).strip()] if sec.get("title") else []))

    project = load_yaml(os.path.join(repo_dir, "project.yml")) or {}
    order = []
    top = (project.get("sidebar") or {}).get("entries") if isinstance(project, dict) else None
    if top:
        walk(top, [])
        order = [str(sections[str(e["section"])].get("title", e["section"])) for e in top
                 if isinstance(e, dict) and e.get("section") and str(e["section"]) in sections]
    for key, sec in sections.items():  # sections not referenced by project.yml, or a root sidebar.yml
        title = str(sec.get("title")).strip() if sec.get("title") else None
        walk(sec.get("entries"), [title] if title else [])
    return nav, order


def product_meta(repo_dir: str, slug: str) -> dict:
    project = load_yaml(os.path.join(repo_dir, "project.yml")) or {}
    name = None
    if isinstance(project, dict):
        name = (project.get("settings") or {}).get("name")
    idx = load_yaml(os.path.join(repo_dir, "_index.yml")) or {}
    if not name and isinstance(idx, dict):
        name = (idx.get("indexpage") or {}).get("title")
    lead = (idx.get("indexpage") or {}).get("summary") if isinstance(idx, dict) else None
    return {"slug": slug, "title": str(name or slug), "summary": lead,
            "versioned_copy": bool(VERSIONED_REPO_RE.search(slug))}


# ---------------------------------------------------------------------------
# segmenting a page into titled chunks
# ---------------------------------------------------------------------------

def role_of(title: str | None) -> str:
    if not title:
        return "body"
    t = title.strip().rstrip(":")
    if STEPS_TITLE_RE.match(t):
        return "steps"
    for role, rx in ROLE_PATTERNS:
        if rx.match(t):
            return role
    return "other"


class Seg:
    __slots__ = ("role", "title", "heads", "tabs", "blocks", "implicit")

    def __init__(self, role, title, heads, tabs):
        self.role, self.title, self.heads, self.tabs, self.blocks = role, title, list(heads), list(tabs), []
        self.implicit = False


def promote_implicit_steps(segs, rel, loose: bool = False) -> bool:
    """Mark ordered lists as procedures where the docs omit a ".Steps" title:
    inside interface tabs, under "Step N: ..." headings, and on task pages that
    have no titled procedure at all."""
    base = os.path.basename(rel)
    is_task_page = base.endswith("-task.adoc") or base.startswith("task_")
    has_steps = {(tuple(s.heads), tuple(s.tabs)) for s in segs if s.role == "steps"}
    any_steps = bool(has_steps)
    promoted = False
    for s in segs:
        if s.role not in ("body", "other"):
            continue
        key = (tuple(s.heads), tuple(s.tabs))
        if key in has_steps or not any(b.kind == "list" and b.ordered for b in s.blocks):
            continue
        in_phase = bool(s.heads and PHASE_RE.match(s.heads[-1][1]))
        long_list = any(b.kind == "list" and b.ordered and len(b.items) >= 2 for b in s.blocks)
        if s.tabs or in_phase or (is_task_page and not any_steps) or (loose and long_list):
            s.role, s.implicit = "steps", True
            has_steps.add(key)
            promoted = True
    # "== Step 2: Define a message filter" sections without a list (REST
    # workflows, short procedures): the whole section is one step. Pages that
    # document a single API call (".HTTP method and endpoint") are one step too.
    api_page = any(s.title and API_CALL_TITLE_RE.match(s.title) for s in segs) \
        and not any(s.heads and PHASE_RE.match(s.heads[-1][1]) for s in segs)
    for key in dict.fromkeys((tuple(s.heads), tuple(s.tabs)) for s in segs):
        heads, tabs = key
        if key in has_steps:
            continue
        in_phase = bool(heads and PHASE_RE.match(heads[-1][1]))
        if not (in_phase or (api_page and not heads and not any_steps)):
            continue
        members = [s for s in segs if (tuple(s.heads), tuple(s.tabs)) == key and s.role in ("body", "other", "example")]
        if not members:
            continue
        first = members[0]
        for m in members[1:]:
            first.blocks.extend(m.blocks)
            m.blocks, m.role = [], "merged"
        first.role, first.implicit, first.title = "steps", True, None
        has_steps.add(key)
        promoted = True
    return promoted


def segment(blocks, heads, tabs, out, counter):
    seg = None
    for b in blocks:
        if b.kind == "heading" and seg is not None and seg.role == "steps" \
                and any(x.kind == "list" for x in seg.blocks) \
                and (any("discrete" in a for a in b.attrs) or b.level >= 5):
            seg.blocks.append(adoc.Block("para", text=f"*{b.title}*"))
            continue
        if b.kind == "heading":
            if b.level <= 1:
                continue
            heads = [h for h in heads if h[0] < b.level] + [(b.level, b.title)]
            seg = None
            hrole = role_of(b.title)
            if hrole in ("steps", "prereq", "about", "after", "related"):
                heads = heads[:-1]
                seg = Seg(hrole, b.title, heads, tabs)
                out.append(seg)
            continue
        if b.kind in ("example", "open", "sidebar") and b.has_role("tabbed-block") \
                and seg is not None and seg.role == "steps" and any(x.kind == "list" for x in seg.blocks):
            seg.blocks.append(b)  # tabs inside a running procedure are per-step variants
            continue
        if b.kind in ("example", "open", "sidebar") and b.has_role("tabbed-block"):
            counter[0] += 1
            gid = counter[0]
            for tab in b.children:
                if tab.kind in ("open", "example", "sidebar") and tab.title:
                    segment(tab.children, heads, tabs + [(gid, tab.title)], out, counter)
            seg = None
            continue
        if b.kind == "open" and not b.title and any(c.title and role_of(c.title) != "body" for c in b.children):
            # untitled open block used as a wrapper around titled content
            segment(b.children, heads, tabs, out, counter)
            seg = None
            continue
        if b.title and not (seg is not None and seg.role == "steps" and b.kind in ("listing", "literal", "table")
                            and role_of(b.title) == "other"):
            seg = Seg(role_of(b.title), b.title, heads, tabs)
            out.append(seg)
        if seg is None:
            seg = Seg("body", None, heads, tabs)
            out.append(seg)
        seg.blocks.append(b)


# ---------------------------------------------------------------------------
# steps
# ---------------------------------------------------------------------------

def blocks_text(blocks, inline) -> str:
    parts = []
    for b in blocks:
        if b.kind in ("para", "admon") and b.text:
            parts.append(inline(b.text))
        elif b.kind == "list":
            for it in b.items:
                parts.append(("1. " if it.ordered else "- ") + inline(it.text))
                if it.children:
                    parts.extend("  - " + inline(c.text) for c in it.children)
        elif b.kind in ("listing", "literal"):
            parts.append("```\n" + b.text.strip("\n") + "\n```")
        elif b.kind in ("admon", "example", "sidebar", "open", "quote"):
            inner = blocks_text(b.children, inline)
            if inner:
                parts.append(inner)
        elif b.kind == "table":
            parts.append(table_text(b.text, inline, table_cols(b)))
    return "\n".join(p for p in parts if p)


def split_cells(raw: str) -> list[str]:
    """Split AsciiDoc table source into cells, keeping empty cells so rows stay
    aligned; a cell spec such as "a|" or "2+|" is dropped from the cell text."""
    parts = re.split(r"(?<!\\)\|", raw)
    cells = []
    for i, part in enumerate(parts):
        if i < len(parts) - 1:
            part = re.sub(r"(^|\s)(?:\d+\+|\d*\*|\.\d+\+|\d+\.\d+\+)?[adehlmsv]?$", r"\1", part)
        cells.append(part)
    return [c.strip() for c in cells[1:]]


def table_text(raw: str, inline, cols: int | None = None) -> str:
    cells = split_cells(raw)
    if not cols:
        first = next((l for l in raw.split("\n") if l.strip()), "")
        cols = len(split_cells(first)) or None
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)] if cols else [cells]
    return "\n".join(" | ".join(inline(re.sub(r"^\.+\s+", "", c)) for c in r) for r in rows[:80])


def table_cols(b) -> int | None:
    for a in b.attrs:
        m = re.search(r'cols="?(\d+)\*', a)
        if m:
            return int(m.group(1))
        m = re.search(r'cols="([^"]+)"', a)
        if m:
            return len(m.group(1).split(","))
    return None


def item_to_step(item, n, inline, ctx) -> dict:
    step = {"n": n, "text": inline(item.text)}
    code, details, notes = [], [], []
    attach(item.blocks, inline, code, details, notes, step, ctx)
    subs = [item_to_step(c, k, inline, ctx) for k, c in enumerate(item.children, 1)]
    if subs:
        step["substeps"] = subs
    if details:
        step["details"] = details
    if notes:
        step["notes"] = notes
    if code:
        step["code"] = code
    return step


def attach(blocks, inline, code, details, notes, step, ctx):
    for b in blocks:
        if b.kind in ("listing", "literal"):
            entry = {"lang": b.lang, "content": b.text.strip("\n")}
            if b.title:
                entry["title"] = inline(b.title)
            code.append(entry)
            ctx["code"].append(entry)
        elif b.kind == "admon":
            txt = inline(b.text) if b.text else blocks_text(b.children, inline)
            if txt:
                notes.append(txt)
        elif b.kind == "para":
            m = CODE_ONLY_RE.match(b.text.strip())
            if m:
                entry = {"lang": None, "content": m.group(1).strip("+")}
                code.append(entry)
                ctx["code"].append(entry)
            else:
                details.append(inline(b.text))
        elif b.kind == "list":
            key = "substeps" if b.ordered else "options"
            conv = [item_to_step(it, k, inline, ctx) for k, it in enumerate(b.items, 1)]
            step.setdefault(key, []).extend(conv)
        elif b.kind == "table":
            details.append(table_text(b.text, inline, table_cols(b)))
        elif b.kind in ("open", "example", "sidebar", "quote"):
            if b.has_role("tabbed-block"):
                for tab in b.children:
                    if tab.title:
                        sub = {"variant": inline(tab.title)}
                        sc, sd, sn = [], [], []
                        attach(tab.children, inline, sc, sd, sn, sub, ctx)
                        if sd:
                            sub["details"] = sd
                        if sn:
                            sub["notes"] = sn
                        if sc:
                            sub["code"] = sc
                        step.setdefault("variants", []).append(sub)
            else:
                attach(b.children, inline, code, details, notes, step, ctx)


def steps_from_segment(seg: Seg, inline, ctx) -> tuple[list, list, list]:
    """Return (intro_text, steps, trailing_text) for a steps segment."""
    intro, trailing, steps = [], [], []
    lst = next((b for b in seg.blocks if b.kind == "list"), None)
    if lst is None:
        # ".Step" + paragraph(s), or a "Steps" heading with a single instruction
        body = [b for b in seg.blocks]
        if not body:
            return [], [], []
        first = body[0]
        step = {"n": 1, "text": inline(first.text) if first.text else blocks_text([first], inline)}
        code, details, notes = [], [], []
        attach(body[1:], inline, code, details, notes, step, ctx)
        if first.kind in ("listing", "literal"):
            code.insert(0, {"lang": first.lang, "content": first.text.strip("\n")})
            ctx["code"].append(code[0])
            step["text"] = ""
        if details:
            step["details"] = details
        if notes:
            step["notes"] = notes
        if code:
            step["code"] = code
        return [], [step], []
    idx = seg.blocks.index(lst)
    intro = [blocks_text([b], inline) for b in seg.blocks[:idx]]
    steps = [item_to_step(it, k, inline, ctx) for k, it in enumerate(lst.items, 1)]
    rest = seg.blocks[idx + 1:]
    # Authors often break a procedure with a NOTE, a code block or tabs that is
    # not attached with "+", or restart numbering with [start=N]. Everything up
    # to the last ordered list in the segment is still part of the procedure:
    # the blocks in between belong to the step before them.
    last_list = max((k for k, b in enumerate(rest) if b.kind == "list" and b.ordered), default=-1)
    pending = []
    for k, b in enumerate(rest):
        if k <= last_list:
            if b.kind == "list" and b.ordered:
                if pending:
                    attach_to_step(steps[-1], pending, inline, ctx)
                    pending = []
                base = len(steps)
                steps.extend([item_to_step(it, base + j, inline, ctx) for j, it in enumerate(b.items, 1)])
            else:
                pending.append(b)
    # after the last list: code blocks still belong to the last step; prose is the result
    trailing = []
    for b in rest[last_list + 1:]:
        if b.kind in ("listing", "literal"):
            attach_to_step(steps[-1], [b], inline, ctx)
        else:
            trailing.append(blocks_text([b], inline))
    if pending:
        attach_to_step(steps[-1], pending, inline, ctx)
    return [x for x in intro if x], steps, [x for x in trailing if x]


def attach_to_step(step, blocks, inline, ctx):
    code, details, notes = step.get("code", []), step.get("details", []), step.get("notes", [])
    attach(blocks, inline, code, details, notes, step, ctx)
    for key, val in (("code", code), ("details", details), ("notes", notes)):
        if val:
            step[key] = val


# ---------------------------------------------------------------------------
# interface classification and reference extraction
# ---------------------------------------------------------------------------

def classify_label(label: str) -> str | None:
    for cls, rx in IFACE_LABEL_RULES:
        if rx.search(label):
            return cls
    return None


def all_text(steps) -> str:
    out = []
    for s in steps:
        out.append(s.get("text", ""))
        out.extend(s.get("details", []))
        out.extend(all_text(s.get("substeps", [])))
        out.extend(all_text(s.get("options", [])))
    return "\n".join(out)


HW_STRONG_RE = re.compile(
    r"\b(cables?|cabling|recable|shelf|shelves|canister|bezel|rack|rails?|screws?|thumbscrews?|latch(es)?|"
    r"power (supply|supplies|cords?|switch)|PSUs?|fan modules?|DIMMs?|drive carrier|SFPs?|QSFPs?|transceivers?|chassis|"
    r"LEDs?|unplug|reseat|cam handle|ESD|grounding strap|wrist strap|packing (list|slip)|carton|riser|boot media|caddy|"
    r"faceplate|blank(ing)? panel|serial console|console cable|midplane|backplane|PCIe card|mezzanine|NVRAM module|"
    r"failed part|RMA|replacement part|return the failed)\b", re.I)
HW_WEAK_RE = re.compile(r"\b(insert|slide|pull|push|lift|lower|tighten|loosen|seat|lever|slot|battery|mount)\b", re.I)
CMD_MENTION_RE = re.compile(r"`([a-z][a-z0-9_-]*(?: [a-z][a-z0-9_-]*){1,6})(?: [^`]*)?`\s+command")
CODE_ONLY_RE = re.compile(r"^`([^`]+)`\s*$")


def classify_content(steps, code, extra_text="") -> tuple[str, dict]:
    text = all_text(steps)
    scores = Counter()
    for c in code:
        body = c["content"]
        lang = (c.get("lang") or "").lower()
        api_curl = re.search(r"\bcurl\b", body) and re.search(r"/api/|\s(-X|--request)\s|application/json|\s(-d|--data)\b", body)
        if api_curl or re.search(r"(?m)^\s*(GET|POST|PATCH|DELETE|PUT)\s+/", body) or lang in ("json", "http"):
            scores["api"] += 2
        elif lang in ("yaml", "yml", "python", "hcl", "terraform", "ansible"):
            scores["automation"] += 2
        elif lang in CLI_LANGS or PROMPT_RE.search(body) or lang == "":
            scores["cli"] += 2
    scores["api"] += 2 * len(REST_LINE_RE.findall(text)) + text.count("/api/")
    scores["cli"] += 2 * len(CMD_MENTION_RE.findall(text)) + 0.5 * len(re.findall(r"\b(CLI|command|clustershell|nodeshell|SMcli|kubectl|tridentctl)\b", text))
    scores["cli"] += 0.5 * len(re.findall(r"`[a-z][a-z-]*(?: [a-z][a-z-]*){1,5}(?: -[^`]*)?`", text))
    scores["cli"] += 0.5 * len(PROMPT_RE.findall(extra_text))
    scores["gui"] += 2 * len(UI_PATH_RE.findall(text)) + 0.5 * len(GUI_VERB_RE.findall(text))
    scores["gui"] += 1.0 * len(re.findall(r"System Manager|Grid Manager|Tenant Manager|Unified Manager|NetApp Console|BlueXP|\bG?UI\b|web browser|\bpage\b|\bdialog\b|\bwizard\b|\btab\b", text))
    scores["gui"] += 1.0 * len(re.findall(r"(?m)^(?:Select|Click|Choose|Navigate to|Go to|From the|In the|On the)\b[^\n]*\*\*", text))
    scores["cli"] += 1.0 * len(re.findall(r"PowerShell|\bcmdlet\b|command prompt|terminal|\bSSH\b|text editor|\bvi\b", text))
    strong = len(HW_STRONG_RE.findall(text))
    if strong >= 2 and scores["cli"] < 2 and scores["api"] < 2:
        scores["hardware"] += strong + 0.3 * len(HW_WEAK_RE.findall(text))
    if not scores or max(scores.values()) < 1:
        return "unknown", {k: round(v, 1) for k, v in scores.items() if v}
    return scores.most_common(1)[0][0], {k: round(v, 1) for k, v in scores.items() if v}


def cli_commands(code_entries) -> list[str]:
    cmds = []
    for c in code_entries:
        lang = (c.get("lang") or "").lower()
        if lang in ("json", "yaml", "yml", "xml", "python", "hcl", "http"):
            continue
        lines = [l for l in c["content"].split("\n") if l.strip()]
        prompted = [PROMPT_RE.sub("", l, count=1) for l in lines if PROMPT_RE.match(l)]
        candidates = prompted if prompted else lines[:1]
        for l in candidates:
            l = l.strip()
            if not l or l.startswith(("<", "{", "[", "/", "\"", "'")):
                continue
            words = []
            for tok in l.split():
                if tok.startswith("-") or re.search(r"[<>{}\[\]=/\"'|;:$()]", tok) or not re.match(r"^[a-zA-Z][\w.-]*$", tok):
                    break
                words.append(tok)
                if len(words) >= 6:
                    break
            if words and words[0][0].islower() or (words and words[0] in ("SMcli",)):
                cmds.append(" ".join(words))
    return list(dict.fromkeys(cmds))


def rest_refs(text: str, code_entries) -> list[str]:
    blob = text + "\n" + "\n".join(c["content"] for c in code_entries)
    refs = []
    for m in REST_LINE_RE.finditer(blob):
        path = m.group(2)
        path = re.sub(r"^https?://[^/]+", "", path).split("?")[0]
        refs.append(f"{m.group(1)} {path}")
    flat = re.sub(r"\\\n", " ", blob)
    for m in re.finditer(r"curl\b[^\n]*?(?:-X|--request)\s*(GET|POST|PATCH|PUT|DELETE)[^\n]*?https?://[^/\s\"']+(/[^\s\"'?]*)", flat):
        refs.append(f"{m.group(1)} {m.group(2)}")
    for m in re.finditer(r"\b(GET|POST|PATCH|PUT|DELETE)\s*\|\s*(/api/[\w/{}.\-]+)", blob):
        refs.append(f"{m.group(1)} {m.group(2)}")
    for m in API_PATH_RE.finditer(blob):
        refs.append(m.group(1).rstrip("."))
    return list(dict.fromkeys(refs))


# ---------------------------------------------------------------------------
# page -> tasks
# ---------------------------------------------------------------------------

def extract_page(path: str, repo_dir: str, product: str, nav: dict, loose: bool = False) -> tuple[list[dict], dict]:
    rel = os.path.relpath(path, repo_dir)
    raw = adoc.read_with_includes(path)
    fm, body = adoc.strip_frontmatter(raw)
    body = "\n".join(l for l in body.split("\n")
                     if not re.match(r"^(ifdef|ifndef|endif|ifeval)::", l) and not re.match(r"^:[\w-]+!?:", l))
    blocks = adoc.parse(body)
    page_title = next((b.title for b in blocks if b.kind == "heading" and b.level == 1), None)
    permalink = str(fm.get("permalink") or re.sub(r"\.adoc$", ".html", rel))
    page_dir = os.path.dirname(permalink)
    inline, absolute = make_inline(product, page_dir)
    page_url = f"{DOCS_BASE}/{product}/{permalink.lstrip('/')}"
    breadcrumb = nav.get("/" + permalink.lstrip("/"))
    page_info = {"product": product, "source": f"NetAppDocs/{product}/{rel}", "url": page_url,
                 "title": inline(page_title or ""), "in_nav": breadcrumb is not None, "tasks": 0}

    segs: list[Seg] = []
    segment(blocks, [], [], segs, [0])

    promote_implicit_steps(segs, rel, loose)
    # A ".Steps" title over a lone sentence ("You can use System Manager or the
    # CLI...") followed by interface tabs is an intro, not a procedure.
    tabbed_heads = {tuple(s.heads) for s in segs if s.role == "steps" and s.tabs}
    for s in segs:
        if s.role == "steps" and not s.tabs and tuple(s.heads) in tabbed_heads \
                and not any(b.kind == "list" for b in s.blocks):
            s.role = "intro"
    steps_segs = [s for s in segs if s.role == "steps"]
    if not steps_segs:
        return [], page_info

    # group steps segments into tasks: same heading path + same outermost tab group
    groups: dict[tuple, list[Seg]] = defaultdict(list)
    for s in steps_segs:
        gkey = (tuple(h[1] for h in s.heads), s.tabs[0][0] if s.tabs else None,
                None if s.tabs else id(s) if len([x for x in steps_segs if x.heads == s.heads and not x.tabs]) > 1
                and not STEPS_TITLE_RE.match((s.title or "steps").strip()) else None)
        groups[gkey].append(s)

    related = []
    for s in segs:
        if s.role == "related":
            related.extend(re.findall(r"\((https?://[^)\s]+)\)", blocks_text(s.blocks, inline)))

    tasks = []
    seen_ids = Counter()
    summary = inline(str(fm.get("summary") or ""))
    keywords = [k.strip() for k in str(fm.get("keywords") or "").split(",") if k.strip()]
    lead = next((inline(b.text) for b in blocks if b.kind == "para" and b.has_role(".lead")), "")

    for (head_path, _gid, _x), members in groups.items():
        heads = list(head_path)
        task_title = heads[-1] if heads else (page_title or "")
        if len(members) == 1 and not members[0].tabs and members[0].title and not STEPS_TITLE_RE.match(members[0].title.strip()) \
                and members[0].role == "steps" and not heads:
            task_title = page_title or members[0].title
        scope_ok = lambda s: tuple(h[1] for h in s.heads) == tuple(head_path[: len(s.heads)])  # noqa: E731

        def ctx_text(role, tabs):
            parts = [blocks_text(s.blocks, inline) for s in segs
                     if s.role == role and scope_ok(s) and s.tabs == tabs[: len(s.tabs)]
                     and (not tabs or s.tabs)]
            return [p for p in parts if p]

        methods = []
        all_code = []
        for s in members:
            ctx = {"code": []}
            intro, steps, trailing = steps_from_segment(s, inline, ctx)
            if not steps:
                continue
            labels = [inline(t[1]) for t in s.tabs]
            if s.title:
                tm = re.match(r"^steps? (?:for|to) (.+)$", s.title.strip(), re.I)
                if tm:
                    labels.append(inline(tm.group(1)))
                elif role_of(s.title) == "other":
                    labels.append(inline(s.title))
            label_cls = None
            iface_label = None
            for lab in labels:
                c = classify_label(lab)
                if c:
                    label_cls, iface_label = c, lab
            extra = "\n".join(ctx_text("example", s.tabs) + trailing)
            content_cls, scores = classify_content(steps, ctx["code"], extra)
            interface = label_cls or content_cls
            variant = " / ".join(l for l in labels if l != iface_label) or None
            text_blob = all_text(steps) + "\n" + "\n".join(intro + trailing)
            m = {
                "interface": interface,
                "interface_label": iface_label,
                "interface_source": "tab" if label_cls else "content",
                "variant": variant,
                "signal_scores": scores,
                "prerequisites": ctx_text("prereq", s.tabs) if s.tabs else [],
                "intro": intro,
                "steps": steps,
                "result": trailing,
                "cli_commands": list(dict.fromkeys(cli_commands(ctx["code"]) + CMD_MENTION_RE.findall(text_blob)))
                if interface in ("cli", "unknown") else [],
                "rest_calls": rest_refs(text_blob, ctx["code"]),
            }
            if not m["prerequisites"]:
                del m["prerequisites"]
            methods.append(m)
            all_code.extend(ctx["code"])
        if not methods:
            continue
        # context outside the tabs applies to every method
        prereq = ctx_text("prereq", [])
        about = ctx_text("about", [])
        about += [blocks_text(s.blocks, inline) for s in segs
                  if s.role in ("body", "intro") and not s.tabs and s.heads and tuple(h[1] for h in s.heads) == head_path
                  and not any(b.kind == "list" and b.ordered for b in s.blocks)]
        about = [a for a in dict.fromkeys(about) if a]
        after = ctx_text("after", [])
        examples = ctx_text("example", [])
        section_body = [blocks_text(s.blocks, inline) for s in segs
                        if s.role == "body" and not s.tabs and tuple(h[1] for h in s.heads) == head_path]
        page_text = "\n".join([summary, lead] + about + prereq + section_body)
        versions = list(dict.fromkeys(v for v in VERSION_RE.findall(page_text)))
        cli_links = sorted({f"{a}/{b}" for a, b in CLI_LINK_RE.findall("\n".join(
            about + prereq + after + [all_text(m["steps"]) for m in methods] + related))})
        base_id = product + "/" + re.sub(r"\.adoc$", "", rel)
        slug = re.sub(r"[^a-z0-9]+", "-", task_title.lower()).strip("-")[:80]
        tid = base_id if not heads else f"{base_id}#{slug}"
        seen_ids[tid] += 1
        if seen_ids[tid] > 1:
            tid += f"-{seen_ids[tid]}"
        task = {
            "id": tid,
            "product": product,
            "title": inline(task_title),
            "page_title": inline(page_title or ""),
            "section_path": [inline(h) for h in heads],
            "nav_path": breadcrumb or [],
            "in_nav": breadcrumb is not None,
            "url": page_url,
            "source": page_info["source"],
            "summary": summary or lead,
            "keywords": keywords,
            "version_notes": versions,
            "interfaces": sorted({m["interface"] for m in methods} - {"unknown"}) or ["unknown"],
            "prerequisites": prereq,
            "about": about,
            "methods": methods,
            "after": after,
            "examples": examples,
            "cli_reference_links": cli_links,
            "related_links": list(dict.fromkeys(related)),
            "detection": "implicit-ordered-list" if any(x.implicit for x in members) else "steps-block",
            "step_count": sum(len(m["steps"]) for m in methods),
        }
        tasks.append(task)
    tasks = merge_phases(tasks)
    page_info["tasks"] = len(tasks)
    return tasks, page_info


def _union(lists):
    return list(dict.fromkeys(x for l in lists for x in l))


def merge_phases(tasks: list[dict]) -> list[dict]:
    """Pages written as "== Step 1: Prepare", "== Step 2: Replace ..." describe
    one task in phases. Merge the per-phase records into a single task whose
    top-level steps are the phases."""
    order: list = []
    groups: dict[tuple, list[dict]] = {}
    for t in tasks:
        sp = t["section_path"]
        if sp and PHASE_RE.match(sp[-1]):
            key = tuple(sp[:-1])
            if key not in groups:
                groups[key] = []
                order.append(key)
            groups[key].append(t)
        else:
            order.append(t)
    out = []
    for item in order:
        if isinstance(item, dict):
            out.append(item)
            continue
        phases = groups[item]
        base = phases[0]
        common_prereq = [p for p in base["prerequisites"] if all(p in ph["prerequisites"] for ph in phases)]
        common_about = [a for a in base["about"] if all(a in ph["about"] for ph in phases)]
        steps, weight, all_ifaces = [], Counter(), set()
        for k, ph in enumerate(phases, 1):
            head = ph["section_path"][-1]
            step = {"n": k, "text": PHASE_RE.sub("", head).strip() or head}
            own_prereq = [p for p in ph["prerequisites"] if p not in common_prereq]
            if own_prereq:
                step["prerequisites"] = own_prereq
            own_about = [a for a in ph["about"] if a not in common_about]
            if own_about:
                step["about"] = own_about
            if len(ph["methods"]) == 1:
                m = ph["methods"][0]
                step["interface"] = m["interface"]
                if m["intro"]:
                    step["details"] = m["intro"]
                step["substeps"] = m["steps"]
            else:
                step["variants"] = [{"variant": m["interface_label"] or m["variant"] or m["interface"],
                                     "interface": m["interface"], "substeps": m["steps"]} for m in ph["methods"]]
            for m in ph["methods"]:
                weight[m["interface"]] += max(1, len(m["steps"]))
                all_ifaces.add(m["interface"])
            steps.append(step)
        methods = [m for ph in phases for m in ph["methods"]]
        title = item[-1] if item else base["page_title"]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:80]
        merged = dict(base)
        merged.update({
            "id": base["id"].split("#")[0] + (f"#{slug}" if item else ""),
            "title": title,
            "section_path": list(item),
            "interfaces": sorted(all_ifaces - {"unknown"}) or ["unknown"],
            "prerequisites": common_prereq,
            "about": common_about,
            "after": _union(ph["after"] for ph in phases),
            "examples": _union(ph["examples"] for ph in phases),
            "cli_reference_links": sorted(set(_union(ph["cli_reference_links"] for ph in phases))),
            "methods": [{
                "interface": weight.most_common(1)[0][0],
                "interface_label": None,
                "interface_source": "phases",
                "variant": None,
                "signal_scores": dict(weight),
                "intro": [],
                "steps": steps,
                "result": [],
                "cli_commands": _union(m["cli_commands"] for m in methods),
                "rest_calls": _union(m["rest_calls"] for m in methods),
            }],
            "phased": True,
            "step_count": len(steps),
        })
        out.append(merged)
    return out


def iter_pages(repo_dir: str):
    for root, dirs, files in os.walk(repo_dir):
        dirs[:] = sorted(d for d in dirs if not d.startswith((".", "_")) and d not in ("media", "images", "node_modules"))
        for f in sorted(files):
            if f.endswith(".adoc") and not f.startswith("_"):
                yield os.path.join(root, f)


def extract_repo(repo_dir: str, slug: str, loose: bool = False):
    """loose=True also treats any ordered list of 2+ items as a procedure; used for
    solution guides, which rarely mark procedures with ".Steps"."""
    nav, order = build_nav(repo_dir)
    meta = product_meta(repo_dir, slug)
    meta["nav_sections"] = order
    tasks, pages = [], []
    for p in iter_pages(repo_dir):
        try:
            t, info = extract_page(p, repo_dir, slug, nav, loose)
        except RecursionError:
            continue
        tasks.extend(t)
        pages.append(info)
    return meta, tasks, pages


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--repos", default="")
    args = ap.parse_args()
    repos = [r for r in args.repos.split(",") if r] or sorted(
        d for d in os.listdir(args.src) if os.path.isdir(os.path.join(args.src, d, ".git")))
    os.makedirs(os.path.join(args.out, "tasks"), exist_ok=True)
    products = []
    for slug in repos:
        repo_dir = os.path.join(args.src, slug)
        meta, tasks, pages = extract_repo(repo_dir, slug)
        with open(os.path.join(args.out, "tasks", f"{slug}.jsonl"), "w") as fh:
            for t in tasks:
                t["product_title"] = meta["title"]
                fh.write(json.dumps(t, ensure_ascii=False) + "\n")
        iface = Counter(i for t in tasks for i in t["interfaces"])
        meta.update({"pages": len(pages), "pages_with_tasks": sum(1 for p in pages if p["tasks"]),
                     "tasks": len(tasks), "methods": sum(len(t["methods"]) for t in tasks),
                     "tasks_by_interface": dict(iface),
                     "multi_interface_tasks": sum(1 for t in tasks if len(t["interfaces"]) > 1)})
        products.append(meta)
        print(f"{slug:45s} pages={meta['pages']:5d} tasks={meta['tasks']:5d} {dict(iface)}", flush=True)
    with open(os.path.join(args.out, "products.json"), "w") as fh:
        json.dump(products, fh, indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
