"""Deterministic title normalisation used to pre-group duplicate tasks.

Strips what varies between copies of the same operation: hardware model
names, software versions, product and interface names, articles, and
gerund phrasing ("Creating a volume" -> "create volume"). Tasks with the same
(domain, normalised title) are near-certain duplicates; the model-driven
merge in dedupe works on these pre-groups instead of raw tasks.
"""
from __future__ import annotations

import re

# Scope for de-duplication: a task can only merge with tasks in the same domain.
DOMAIN_OF_PRODUCT = {
    "storage-management-cloud-volumes-ontap": "ONTAP",
    "storage-management-ontap-onprem": "ONTAP",
    "storage-management-fsx-ontap": "ONTAP",
    "workload-fsx-ontap": "ONTAP",
    "ontap-tools-vmware-vsphere": "ONTAP tools for VMware",
    "ontap-tools-vmware-vsphere-10": "ONTAP tools for VMware",
    "nfs-plugin-vmware-vaai": "ONTAP tools for VMware",
    "storage-management-e-series": "E-Series / SANtricity",
    "storage-management-storagegrid": "StorageGRID",
}
DOMAIN_OF_FAMILY = {
    "ONTAP reference (CLI/REST/EMS)": "ONTAP",
    "Cloud Volumes ONTAP": "ONTAP",
}


def domain(task: dict) -> str:
    return DOMAIN_OF_PRODUCT.get(task["product"]) or DOMAIN_OF_FAMILY.get(task["family"]) or task["family"]


GENERIC_TITLE_RE = re.compile(
    r"^(option \d+|step \d+|method \d+|choice \d+|procedure|steps?|overview|access the wizard|start the wizard|"
    r"review (your )?(selections|summary)|summary|results?|before you begin|what'?s next|next steps|"
    r"(initial|final)?\s*\w* administrator tasks|verification|verify|examples?|scenario \d+|"
    r"inline post body|post body included|post response|retrieve specific fields|request|response)\b", re.I)

MODEL_PATTERNS = [
    r"\b(?:AFF|FAS|ASA|AFX|AFF\s+and\s+FAS)\s*-?\s*(?:[A-Z]{1,2})?\d{2,5}[A-Z]{0,3}(?:\s*/\s*[A-Z]?\d{2,5}[A-Z]*)*\b",
    r"\bASA\s*r2\b", r"\b[A-Z]{1,2}\d{2,4}[A-Z]?\s*/\s*[A-Z]{1,2}\d{2,4}\b",
    r"\bE[F]?\d{3,4}[A-Z]?\b", r"\bDE\d{3}C\b", r"\bSG[F]?\d{2,5}[A-Z]*\b",
    r"\bH\d{3,4}[A-Z]\b", r"\b(?:Cisco\s+)?Nexus\s+\d{4,5}[A-Z0-9-]*\b", r"\b\d{4,5}[A-Z]{1,3}(?:-[A-Z0-9]+)?\b",
    r"\bBES-\d+\b", r"\bSN\d{4}[A-Z]?\b", r"\bCN\d{4}\b", r"\bA\d{2,4}\b", r"\bC\d{2,4}\b",
]
MODEL_RE = re.compile("|".join(MODEL_PATTERNS))
PRODUCT_WORDS_RE = re.compile(
    r"\b(using|with|in|from|through|via|for)\s+(the\s+)?(ontap\s+)?(rest\s+api|system manager( classic)?|cli|"
    r"netapp console|bluexp|console|grid manager|tenant manager|santricity( system manager| unified manager| cli)?|"
    r"unified manager|snapcenter( server)?|element (ui|software)|ontap tools|vsphere client|powershell|"
    r"ansible|terraform|workload factory|digital advisor|active iq)\b", re.I)
STRIP_WORDS_RE = re.compile(
    r"\b(netapp|ontap|ontap 9|storagegrid|santricity|e-series|element|bluexp|system manager|asa r2 systems?|"
    r"afx systems?|systems?|storage systems?|controllers? shelf|the|a|an|your|all|existing|new)\b", re.I)
GERUND = {"creating": "create", "retrieving": "retrieve", "updating": "update", "deleting": "delete",
          "modifying": "modify", "configuring": "configure", "enabling": "enable", "disabling": "disable",
          "removing": "remove", "adding": "add", "moving": "move", "changing": "change", "renaming": "rename",
          "resizing": "resize", "restoring": "restore", "listing": "list", "viewing": "view", "setting": "set",
          "getting": "get", "starting": "start", "stopping": "stop", "managing": "manage", "using": "use",
          "running": "run", "replacing": "replace", "installing": "install", "upgrading": "upgrade",
          "verifying": "verify", "monitoring": "monitor", "cloning": "clone", "mounting": "mount",
          "unmounting": "unmount", "mapping": "map", "unmapping": "unmap", "assigning": "assign",
          "downloading": "download", "uploading": "upload", "generating": "generate", "revoking": "revoke",
          "validating": "validate", "initializing": "initialize", "breaking": "break", "resyncing": "resync",
          "reversing": "reverse", "releasing": "release", "promoting": "promote", "demoting": "demote",
          "splitting": "split", "expanding": "expand", "shrinking": "shrink", "importing": "import",
          "exporting": "export", "backing": "back", "applying": "apply", "querying": "query",
          "triggering": "trigger", "scheduling": "schedule", "patching": "patch", "posting": "post",
          "specifying": "specify", "increasing": "increase", "decreasing": "decrease", "reverting": "revert"}
SYNONYM = {"retrieve": "get", "view": "get", "display": "get", "show": "get", "list": "get",
           "delete": "remove", "edit": "modify", "change": "modify", "update": "modify",
           "set up": "configure", "setup": "configure", "turn on": "enable", "turn off": "disable",
           "hot-swap": "replace", "swap out": "replace"}


def effective_title(task: dict) -> str:
    """The title to identify a task by: generic section titles ("Option 1: ...")
    get the page title prefixed."""
    t = task["title"].strip()
    if GENERIC_TITLE_RE.match(t) and task["page_title"] and task["page_title"] != t:
        return f"{task['page_title']} :: {t}"
    return t


def normalize(title: str) -> str:
    t = title
    t = re.sub(r"\([^)]*\)", " ", t)  # parentheticals are usually model lists or qualifiers
    t = MODEL_RE.sub(" <m> ", t)
    t = re.sub(r"(<m>\s*,?\s*(or|and|,)?\s*)+", "<m> ", t)
    t = PRODUCT_WORDS_RE.sub(" ", t)
    t = t.lower()
    t = re.sub(r"\b\d+(\.\d+)*(\.x)?\b|\bx\b", "#", t)  # versions
    t = re.sub(r"\b(in|on|for|of|from)\s+(an?\s+|the\s+)?<m>(\s+(system|controller|storage system|appliance|switch))?", " ", t)
    t = re.sub(r"<m>", " ", t)
    words = t.split()
    if words and words[0] in GERUND:
        words[0] = GERUND[words[0]]
    t = " ".join(words)
    for a, b in SYNONYM.items():
        t = re.sub(rf"^{re.escape(a)}\b", b, t)
    t = STRIP_WORDS_RE.sub(" ", t)
    t = re.sub(r"[^a-z0-9#:/ -]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip(" -:")
    return t
