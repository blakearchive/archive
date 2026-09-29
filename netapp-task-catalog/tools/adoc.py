"""Minimal AsciiDoc block parser tuned for the NetAppDocs repositories.

It is not a full AsciiDoc implementation. It understands the constructs the
NetApp docs use to write procedures: section headings, block titles
(".Steps"), block attributes ([role="tabbed-block"], [source,cli]), delimited
blocks (----, ...., ====, ****, --, |===), ordered/unordered lists with "+"
continuations, and include:: directives.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

import yaml

HEADING_RE = re.compile(r"^(={1,6})\s+(\S.*?)\s*=*\s*$")
ATTR_RE = re.compile(r"^\[(?!\[)[^\]]*\]\s*$")
TITLE_RE = re.compile(r"^\.([^\s.].*?)\s*$")
OLIST_RE = re.compile(r"^\s*(\.{1,5})\s+(\S.*)$")
NUMLIST_RE = re.compile(r"^\s*(\d{1,2})\.\s+(\S.*)$")
ULIST_RE = re.compile(r"^\s*(\*{1,5}|-)\s+(\S.*)$")
ADMON_RE = re.compile(r"^(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\s+(.*)$")
INCLUDE_RE = re.compile(r"^include::([^\[]+)\[([^\]]*)\]\s*$")
TAG_RE = re.compile(r"^//\s*(tag|end)::([\w-]+)\[\]\s*$")
VERBATIM_DELIMS = ("----", "....", "++++", "////")
COMPOUND_DELIMS = ("====", "****", "____")


@dataclass
class Block:
    kind: str  # heading, para, list, listing, literal, pass, example, sidebar, quote, open, table, admon
    title: str | None = None
    attrs: list[str] = field(default_factory=list)
    text: str = ""  # para/heading/verbatim content
    level: int = 0  # heading level
    children: list["Block"] = field(default_factory=list)  # compound blocks
    items: list["Item"] = field(default_factory=list)  # lists
    ordered: bool = False

    def has_role(self, role: str) -> bool:
        return any(role in a for a in self.attrs)

    @property
    def lang(self) -> str | None:
        for a in self.attrs:
            m = re.match(r"^\[(?:source|listing)\s*,\s*([^,\]]+)", a)
            if m:
                return m.group(1).strip().strip('"')
        return None


@dataclass
class Item:
    marker: str
    depth: int
    ordered: bool
    text: str
    blocks: list[Block] = field(default_factory=list)
    children: list["Item"] = field(default_factory=list)


def read_with_includes(path: str, depth: int = 0, seen: frozenset = frozenset()) -> str:
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            raw = fh.read()
    except OSError:
        return ""
    if depth > 4:
        return raw
    out = []
    base = os.path.dirname(path)
    for line in raw.split("\n"):
        m = INCLUDE_RE.match(line.strip())
        if m:
            target = m.group(1).strip()
            if "{" in target or target.startswith("http"):
                continue
            tpath = os.path.normpath(os.path.join(base, target))
            if tpath in seen:
                continue
            inc = strip_frontmatter(read_with_includes(tpath, depth + 1, seen | {path}))[1]
            tags = re.search(r"tags?=([\w;,-]+)", m.group(2))
            if tags:
                inc = select_tags(inc, set(re.split(r"[;,]", tags.group(1))))
            out.append(inc)
        else:
            out.append(line)
    return "\n".join(out)


def select_tags(text: str, wanted: set[str]) -> str:
    """Keep only the lines between // tag::x[] and // end::x[] for the wanted tags."""
    out, depth = [], 0
    for line in text.split("\n"):
        m = TAG_RE.match(line.strip())
        if m:
            if m.group(2) in wanted:
                depth += 1 if m.group(1) == "tag" else -1
            continue
        if depth > 0:
            out.append(line)
    return "\n".join(out)


def strip_frontmatter(text: str) -> tuple[dict, str]:
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            fm_raw = text[3:end]
            body = text[end + 4:]
            try:
                fm = yaml.safe_load(fm_raw) or {}
                if not isinstance(fm, dict):
                    fm = {}
            except yaml.YAMLError:
                fm = {}
                for line in fm_raw.split("\n"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        fm[k.strip()] = v.strip().strip('"')
            return fm, body
    return {}, text


def _delim(line: str) -> str | None:
    s = line.rstrip()
    if s == "--":
        return "--"
    if re.fullmatch(r"\|={3,}", s):
        return s
    if re.fullmatch(r"(-{4,}|\.{4,}|\+{4,}|/{4,}|={4,}|\*{4,}|_{4,})", s):
        return s
    return None


class Parser:
    def __init__(self, text: str):
        lines = text.split("\n")
        # drop single-line comments (but not //// comment blocks)
        self.lines = [l for l in lines if not (l.startswith("//") and not l.startswith("////"))]
        self.n = len(self.lines)

    def parse(self) -> list[Block]:
        blocks, _ = self.parse_blocks(0, None)
        return blocks

    # ------------------------------------------------------------------
    def parse_blocks(self, i: int, stop: str | None) -> tuple[list[Block], int]:
        blocks: list[Block] = []
        attrs: list[str] = []
        title: str | None = None
        while i < self.n:
            line = self.lines[i]
            s = line.rstrip()
            if stop is not None and s == stop:
                return blocks, i + 1
            if not s.strip():
                i += 1
                continue
            b, i, attrs, title = self.parse_one(i, attrs, title, stop)
            if b is not None:
                blocks.append(b)
        return blocks, i

    def parse_one(self, i, attrs, title, stop, parent_keys=frozenset()):
        """Parse one block starting at line i. Returns (block|None, next_i, attrs, title).

        parent_keys holds the (ordered, depth) item keys of an enclosing list when
        this block is attached to a list item with "+"; a nested list stops at
        an item that belongs to the enclosing list."""
        line = self.lines[i]
        s = line.rstrip()
        m = HEADING_RE.match(s)
        if m:
            return Block("heading", title=m.group(2).strip(), level=len(m.group(1)), attrs=attrs), i + 1, [], None
        if ATTR_RE.match(s) and not s.startswith("[["):
            return None, i + 1, attrs + [s.strip()], title
        if s.startswith("[[") and s.endswith("]]"):
            return None, i + 1, attrs, title
        tm = TITLE_RE.match(s)
        if tm and not OLIST_RE.match(s):
            return None, i + 1, attrs, tm.group(1).strip()
        d = _delim(s)
        if d is not None:
            if d.startswith("|="):
                j = i + 1
                buf = []
                while j < self.n and self.lines[j].rstrip() != d:
                    buf.append(self.lines[j])
                    j += 1
                return Block("table", title=title, attrs=attrs, text="\n".join(buf)), j + 1, [], None
            if d[:4] in VERBATIM_DELIMS:
                j = i + 1
                buf = []
                while j < self.n and self.lines[j].rstrip() != d:
                    buf.append(self.lines[j])
                    j += 1
                kind = {"-": "listing", ".": "literal", "+": "pass", "/": "comment"}[d[0]]
                if kind == "comment":
                    return None, j + 1, [], None
                return Block(kind, title=title, attrs=attrs, text="\n".join(buf)), j + 1, [], None
            kind = {"=": "example", "*": "sidebar", "_": "quote", "-": "open"}[d[0]]
            children, j = self.parse_blocks(i + 1, d)
            if kind == "example" and any(re.match(r"^\[(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]", a) for a in attrs):
                kind = "admon"
            return Block(kind, title=title, attrs=attrs, children=children), j, [], None
        if OLIST_RE.match(s) or NUMLIST_RE.match(s) or ULIST_RE.match(s):
            b, j = self.parse_list(i, stop, parent_keys)
            b.title, b.attrs = title, attrs
            return b, j, [], None
        am = ADMON_RE.match(s)
        # paragraph
        j = i
        buf = []
        while j < self.n:
            l = self.lines[j].rstrip()
            if not l.strip():
                break
            if stop is not None and l == stop:
                break
            if j > i and (_delim(l) or ATTR_RE.match(l) or HEADING_RE.match(l)
                          or OLIST_RE.match(l) or NUMLIST_RE.match(l) or ULIST_RE.match(l)
                          or (TITLE_RE.match(l) and not l.startswith(".."))):
                break
            if l.strip() == "+":
                break
            buf.append(l)
            j += 1
        if not buf:
            return None, i + 1, attrs, title
        kind = "admon" if am or any(re.match(r"^\[(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]", a) for a in attrs) else "para"
        if any(re.match(r"^\[(source|listing|literal)\b", a) for a in attrs):
            kind = "listing"  # "[source,curl]" applied to an undelimited paragraph
        return Block(kind, title=title, attrs=attrs, text="\n".join(buf)), j, [], None

    # ------------------------------------------------------------------
    def parse_list(self, i: int, stop: str | None, parent_keys=frozenset()) -> tuple[Block, int]:
        flat: list[Item] = []
        cur: Item | None = None
        while i < self.n:
            s = self.lines[i].rstrip()
            if stop is not None and s == stop:
                break
            mo = OLIST_RE.match(s)
            mn = NUMLIST_RE.match(s)
            mu = ULIST_RE.match(s)
            if mo or mn or mu:
                if mo:
                    marker, text, ordered, depth = mo.group(1), mo.group(2), True, len(mo.group(1))
                elif mn:
                    marker, text, ordered, depth = "1.", mn.group(2), True, 1
                else:
                    marker, text, ordered = mu.group(1), mu.group(2), False
                    depth = len(marker) if marker != "-" else 1
                if parent_keys and flat and ((ordered, depth) in parent_keys
                                             or (ordered and not flat[0].ordered)):
                    break  # the enclosing list resumes
                cur = Item(marker, depth, ordered, text)
                flat.append(cur)
                i += 1
                # continuation text lines
                while i < self.n:
                    l = self.lines[i].rstrip()
                    if not l.strip() or l.strip() == "+" or _is_structural(l) or (stop is not None and l == stop):
                        break
                    cur.text = re.sub(r"\s\+$", "", cur.text) + " " + l.strip()
                    i += 1
                continue
            if s.strip() == "+" and cur is not None:
                # attach following block to current item
                j = i + 1
                attrs: list[str] = []
                title = None
                while j < self.n:
                    l = self.lines[j].rstrip()
                    if not l.strip():
                        j += 1
                        continue
                    keys = frozenset((it.ordered, it.depth) for it in flat) | parent_keys
                    b, j, attrs, title = self.parse_one(j, attrs, title, stop, keys)
                    if b is not None:
                        cur.blocks.append(b)
                        break
                i = j
                continue
            if not s.strip():
                # a blank line; the list continues only if the next non-blank line is an item
                # (or an attribute/delimited block directly attached, which authors often do
                # without a "+")
                j = i
                while j < self.n and not self.lines[j].strip():
                    j += 1
                if j < self.n and (OLIST_RE.match(self.lines[j]) or NUMLIST_RE.match(self.lines[j])
                                   or ULIST_RE.match(self.lines[j]) or self.lines[j].strip() == "+"):
                    if stop is not None and self.lines[j].rstrip() == stop:
                        break
                    i = j
                    continue
                break
            # something structural (delimited block without "+", attribute, title) ends the list
            break
        return Block("list", items=_nest(flat), ordered=bool(flat and flat[0].ordered)), i


def _is_structural(l: str) -> bool:
    return bool(_delim(l) or ATTR_RE.match(l) or HEADING_RE.match(l) or OLIST_RE.match(l)
                or NUMLIST_RE.match(l) or ULIST_RE.match(l) or (TITLE_RE.match(l)))


def _nest(flat: list[Item]) -> list[Item]:
    """Turn a flat list of items into a tree, using (ordered, depth) as the level key."""
    roots: list[Item] = []
    stack: list[Item] = []
    level_keys: list[tuple[bool, int]] = []
    for it in flat:
        key = (it.ordered, it.depth)
        if not stack:
            roots.append(it)
            stack, level_keys = [it], [key]
            continue
        if key in level_keys:
            idx = level_keys.index(key)
            stack, level_keys = stack[:idx], level_keys[:idx]
            if stack:
                stack[-1].children.append(it)
            else:
                roots.append(it)
            stack.append(it)
            level_keys.append(key)
        else:
            stack[-1].children.append(it)
            stack.append(it)
            level_keys.append(key)
    return roots


def parse(text: str) -> list[Block]:
    return Parser(text).parse()
