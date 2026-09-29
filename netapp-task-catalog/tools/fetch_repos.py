#!/usr/bin/env python3
"""Shallow, text-only clones of NetAppDocs repositories.

Uses a blobless partial clone plus a sparse checkout of *.adoc / *.yml, so
images and PDFs are never downloaded (ONTAP drops from ~1 GB to ~20 MB).

Usage: fetch_repos.py --dest DIR [--repos-file repos.txt] [--all-versions] [--update] [--jobs 8]
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import products  # noqa: E402


def clone(slug: str, dest: str, update: bool = False) -> str:
    d = os.path.join(dest, slug)
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    try:
        if os.path.isdir(os.path.join(d, ".git")):
            if not update:
                return f"exists {slug}"
            subprocess.run(["git", "-C", d, "pull", "-q", "--depth", "1"], check=True, env=env, timeout=900)
            return f"updated {slug}"
        subprocess.run(["git", "clone", "-q", "--depth", "1", "--filter=blob:none", "--sparse",
                        f"https://github.com/NetAppDocs/{slug}.git", d], check=True, env=env, timeout=900)
        subprocess.run(["git", "-C", d, "sparse-checkout", "set", "--no-cone", "*.adoc", "*.yml", "*.yaml"],
                       check=True, env=env, timeout=1800)
        return f"cloned {slug}"
    except subprocess.SubprocessError as e:
        return f"FAILED {slug}: {e}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", required=True)
    ap.add_argument("--repos-file", default=os.path.join(os.path.dirname(__file__), "..", "repos.txt"))
    ap.add_argument("--all-versions", action="store_true", help="also clone versioned copies and release-notes sites")
    ap.add_argument("--jobs", type=int, default=8)
    ap.add_argument("--update", action="store_true", help="git pull repos that are already cloned")
    args = ap.parse_args()
    slugs = [l.strip() for l in open(args.repos_file) if l.strip() and not l.startswith("#")]
    keep = {"current", "reference"} if not args.all_versions else {"current", "reference", "versioned-copy", "release-notes"}
    slugs = [s for s in slugs if products.status(s) in keep]
    os.makedirs(args.dest, exist_ok=True)
    with ThreadPoolExecutor(args.jobs) as ex:
        for msg in ex.map(lambda s: clone(s, args.dest, args.update), slugs):
            print(msg, flush=True)


if __name__ == "__main__":
    main()
