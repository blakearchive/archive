#!/usr/bin/env python3
"""Prepare the task catalog for de-duplication into distinct operations.

1. Assign each task a de-duplication scope ("domain": one product system).
2. Pre-group near-certain duplicates: same domain + same normalised title
   (hardware-model, version, product and interface names stripped).
3. Assign pre-groups to topic buckets of <= MAX_BUCKET so that copies of the
   same operation from different doc sites land in the same bucket.
4. Write, for the model-driven merge:
     buckets/<bucket>.tsv      one line per pre-group (what the merge agent reads)
     pregroups.jsonl           pre-group -> member tasks, with step excerpts (for lookups)
     buckets.json              bucket manifest

Usage: dedupe_prepare.py --data DATA_DIR(with tasks/*.jsonl[.gz]) --out WORK_DIR
"""
from __future__ import annotations

import argparse
import collections
import glob
import gzip
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from normalize import effective_title, normalize  # noqa: E402

MAX_BUCKET = 180
MIN_BUCKET = 40

# de-duplication scope: one product system per domain
DOMAIN_OF_PRODUCT = {
    # ONTAP-based systems, whatever the doc site or management plane
    **{p: "ONTAP" for p in ["ontap", "asa-r2", "ontap-afx", "ontap-7mode-transition", "ontap-apps-dbs", "ontap-automation",
                            "ontap-fli", "ontap-metrocluster", "ontap-sanhost", "ontap-select", "ontap-system-manager-classic",
                            "ontap-systems", "ontap-systems-switches", "ontap-systems-upgrade", "ontap-technical-reports",
                            "upgrade-health-checker", "ontap-restapi", "storage-management-cloud-volumes-ontap",
                            "storage-management-ontap-onprem", "storage-management-fsx-ontap", "workload-fsx-ontap"]},
    "ontap-tools-vmware-vsphere": "ONTAP tools for VMware vSphere",
    "ontap-tools-vmware-vsphere-10": "ONTAP tools for VMware vSphere",
    "nfs-plugin-vmware-vaai": "ONTAP tools for VMware vSphere",
    "snapcenter": "SnapCenter",
    "sc-plugin-vmware-vsphere": "SnapCenter Plug-in for VMware vSphere",
    "snap-creator-framework": "Snap Creator Framework",
    "smis-provider": "SMI-S Provider",
    "workflow-automation": "OnCommand Workflow Automation",
    "active-iq": "Digital Advisor", "digital-advisor-automation": "Digital Advisor",
    "active-iq-unified-manager": "Active IQ Unified Manager",
    "data-infrastructure-insights": "Data Infrastructure Insights",
    "oncommand-insight": "OnCommand Insight",
    "ai-data-engine": "AI Data Engine",
    **{p: "StorageGRID" for p in ["storagegrid", "storagegrid-appliances", "storagegrid-enable", "storage-management-storagegrid"]},
    **{p: "E-Series / SANtricity" for p in ["e-series", "e-series-santricity", "storage-management-e-series"]},
    "beegfs": "BeeGFS on E-Series",
    **{p: "Element / SolidFire / HCI" for p in ["element-software", "hci", "vcp"]},
    "solidfire-active-iq": "SolidFire Active IQ",
    **{p: "NetApp Console platform" for p in ["console-alerts", "console-automation", "console-licenses-subscriptions",
                                             "console-lifecycle-planning", "console-local", "console-local-automation",
                                             "console-setup-admin", "console-software-updates", "console-well-architected"]},
    "console-volume-caching": "Console: volume caching",
    "data-services-backup-recovery": "Console: backup and recovery",
    "data-services-cloud-tiering": "Console: cloud tiering",
    "data-services-copy-sync": "Console: copy and sync",
    "data-services-data-classification": "Console: data classification",
    "data-services-disaster-recovery": "Console: disaster recovery",
    "data-services-ransomware-resilience": "Console: ransomware resilience",
    "data-services-replication": "Console: replication",
    "saasbackupO365": "SaaS Backup for Microsoft 365",
    "storage-management-azure-netapp-files": "Azure NetApp Files (Console)",
    "storage-management-blob-storage": "Azure Blob storage (Console)",
    "storage-management-google-cloud-netapp-volumes": "Google Cloud NetApp Volumes (Console)",
    "storage-management-google-cloud-storage": "Google Cloud Storage (Console)",
    "storage-management-s3-storage": "Amazon S3 (Console)",
    **{p: "Workload Factory" for p in ["workload-setup-admin", "workload-infosec"]},
    "workload-databases": "Workload Factory: databases",
    "workload-eda": "Workload Factory: EDA",
    "workload-vmware": "Workload Factory: VMware",
    "trident": "Trident",
    "astra-control-center": "Astra Control Center", "astra-automation": "Astra Control Center",
    "keystone-staas": "Keystone", "keystone-staas-2": "Keystone",
    "xcp": "XCP", "data-migrator": "Data Migrator",
    "interoperability-matrix-tool": "Interoperability Matrix Tool",
}


def domain_of(task: dict) -> str:
    p = task["product"]
    if p in DOMAIN_OF_PRODUCT:
        return DOMAIN_OF_PRODUCT[p]
    if p.startswith("netapp-solutions") or p in ("flexpod", "netapp-automation"):
        return "Solutions: " + p
    return task.get("family") or p


# ONTAP is the only multi-site domain; topics keep CLI / System Manager / REST /
# Console copies of one operation together. First match wins.
ONTAP_TOPICS = [
    ("hw-switch", r"\b(cluster switch|storage switch|switch|nexus|bes-|cn1610|sn2100|isl)\b"),
    ("hw-shelf-cabling", r"\b(shelf|shelves|cable|cabling|recable|ns224|ds\d+|iom\d*)\b"),
    ("hw-boot-media", r"\bboot (media|recovery|image)\b"),
    ("hw-controller-chassis", r"\b(controller|chassis|give back|giveback|impaired|takeover|halt|shut ?down|power (on|off|down))\b"),
    ("hw-components", r"\b(dimm|fan|power supply|psu|nvram|nvdimm|nvmem|battery|rtc|i/o module|pcie|mezzanine|"
                      r"caching module|flash cache|drive|disk|sfp|qsfp|riser|bezel|rail|rack|install hardware)\b"),
    ("upgrade", r"\b(upgrade|revert|downgrade|firmware|update software|software update|arl|aggregate relocation|"
                r"headswap|head swap|transition|7-mode|image|patch)\b"),
    ("metrocluster", r"\b(metrocluster|mcc|switchover|switchback|heal|mediator|tiebreaker)\b"),
    ("protection-snapmirror", r"\b(snapmirror|mirror|vault|svm dr|disaster recovery|relationship|replicat|active sync|"
                              r"cascade|fan-out|business continuity|smbc|smas)\b"),
    ("protection-snapshot-cg", r"\b(snapshot|consistency group|restore|backup|back up|cloud backup|snaplock|ransomware|"
                               r"tamperproof|arp|anti-ransomware)\b"),
    ("san", r"\b(lun|igroup|iscsi|fcp|fc|fibre channel|nvme|namespace|subsystem|san|host utilities|multipath|"
            r"foreign lun|fli|sanlun|alua|mpio|dm-multipath|asm|vvol)\b"),
    ("nas-nfs", r"\b(nfs|export|export polic|netgroup|kerberos|krb|unix user|unix group|name mapping|showmount)\b"),
    ("nas-smb", r"\b(smb|cifs|share|ntfs|acl|home director|widelinks|symlink|offline file|bran?chcache|domain controller|"
                r"active directory|vscan|antivirus|fpolicy|audit|file access|file security|security descriptor|dfs)\b"),
    ("name-services", r"\b(dns|ldap|nis|name service|hosts file|name-service|local user|local group)\b"),
    ("network", r"\b(lif|network interface|port|broadcast domain|ipspace|subnet|vlan|ifgrp|interface group|bgp|"
                r"route|failover group|service polic|ip address|mtu|dhcp|firewall|vip|network)\b"),
    ("security", r"\b(certificate|ssl|tls|saml|oauth|ssh|login|password|user account|role|rbac|authentication|"
                 r"multi-admin|mav|key manager|kmip|onboard key|encrypt|nve|nae|fips|security|audit log|banner|"
                 r"2fa|mfa|ipsec|tpm|secure purge)\b"),
    ("volume-qtree-quota", r"\b(volume|flexvol|flexgroup|qtree|quota|flexclone|clone|flexcache|rebalanc|move|"
                           r"efficiency|dedup|compression|compaction|thin provision|autosize|autogrow|space|capacity|"
                           r"file|directory|inode|junction|mount|namespace)\b"),
    ("tier-aggregate-disk", r"\b(aggregate|local tier|raid|spare|disk|drive|partition|ownership|fabricpool|"
                            r"cloud tier|tiering|object store|bucket|s3)\b"),
    ("svm-cluster-node", r"\b(svm|vserver|storage vm|cluster|node|ha pair|ha |storage failover|license|time|ntp|"
                         r"timezone|date|autosupport|asup|ems|event|job|schedule|snmp|syslog|log|core dump|"
                         r"service processor|bmc|sp |console|dashboard|health|system manager|setup|peer)\b"),
    ("performance-monitoring", r"\b(qos|performance|statistic|monitor|workload|throughput|latency|alert|report|insight)\b"),
    ("deploy-cloud", r"\b(cloud volumes ontap|cvo|working environment|system|deploy|fsx|console agent|connector|"
                     r"select|marketplace|azure|aws|google|gcp|hyperscaler)\b"),
]
ONTAP_TOPIC_RE = [(n, re.compile(r, re.I)) for n, r in ONTAP_TOPICS]


def ontap_topic(task: dict, norm: str) -> str:
    if "hardware" in task["interfaces"] or task["product"] in ("ontap-systems",):
        text = norm
        for name, rx in ONTAP_TOPIC_RE[:5]:
            if rx.search(text):
                return name
        return "hw-other"
    if task["product"] == "ontap-systems-switches":
        return "hw-switch"
    text = " ".join([norm, task["page_title"].lower()])
    for name, rx in ONTAP_TOPIC_RE[5:]:
        if rx.search(text):
            return name
    text = " ".join(task["nav_path"]).lower()
    for name, rx in ONTAP_TOPIC_RE[5:]:
        if rx.search(text):
            return name
    return "other"


def object_key(norm: str) -> str:
    words = norm.split()
    return " ".join(words[1:]) if len(words) > 1 else norm


def load_tasks(data_dir: str) -> list[dict]:
    tasks = []
    for f in sorted(glob.glob(os.path.join(data_dir, "tasks", "*.jsonl*"))):
        opener = gzip.open if f.endswith(".gz") else open
        with opener(f, "rt") as fh:
            tasks.extend(json.loads(l) for l in fh)
    return tasks


def step_excerpt(task: dict, limit: int = 4) -> list[str]:
    out = []
    for m in task["methods"][:3]:
        label = m.get("interface_label") or m["interface"]
        steps = "; ".join(s["text"][:90] for s in m["steps"][:limit])
        out.append(f"[{label}] {steps}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    os.makedirs(os.path.join(args.out, "buckets"), exist_ok=True)
    tasks = load_tasks(args.data)

    pregroups: dict[tuple, list[dict]] = collections.defaultdict(list)
    for t in tasks:
        et = effective_title(t)
        pregroups[(domain_of(t), normalize(et) or et.lower())].append(t)

    pg_rows = []
    for (dom, norm), members in sorted(pregroups.items()):
        members.sort(key=lambda t: (not t["in_nav"], t["product"] != "ontap", -t["step_count"]))
        rep = members[0]
        topic = ontap_topic(rep, norm) if dom == "ONTAP" else None
        if topic is None:
            topic = (rep["nav_path"][0] if rep["nav_path"] else "(not in navigation)")
        pg_rows.append({
            "pg": None, "domain": dom, "topic": topic, "norm": norm, "object_key": object_key(norm),
            "title": effective_title(rep), "n": len(members),
            "titles": list(dict.fromkeys(effective_title(t) for t in members))[:6],
            "products": sorted({t["product"] for t in members}),
            "interfaces": sorted({i for t in members for i in t["interfaces"]}),
            "nav": " > ".join(rep["nav_path"][-3:]) if rep["nav_path"] else "",
            "page": rep["page_title"],
            "summary": (rep.get("summary") or "")[:160],
            "cli": sorted({c for t in members for m in t["methods"] for c in m.get("cli_commands", [])})[:6],
            "rest": sorted({o for t in members for m in t["methods"] for o in m.get("rest_operations", [])})[:4],
            "members": [t["id"] for t in members],
            "excerpt": step_excerpt(rep),
        })

    # buckets: per domain, ONTAP by topic, other domains by nav section, chunked by object key
    by_domain = collections.defaultdict(list)
    for r in pg_rows:
        by_domain[r["domain"]].append(r)
    buckets = []
    for dom, rows in sorted(by_domain.items()):
        if len(rows) <= MAX_BUCKET:
            buckets.append((dom, "all", sorted(rows, key=lambda r: r["object_key"])))
            continue
        by_topic = collections.defaultdict(list)
        for r in rows:
            by_topic[r["topic"]].append(r)
        # fold small topics together so buckets are not tiny
        small = [t for t, rs in by_topic.items() if len(rs) < MIN_BUCKET]
        if len(small) > 1:
            merged = []
            for t in small:
                merged.extend(by_topic.pop(t))
            by_topic["misc: " + ", ".join(sorted(small))[:120]] = merged
        for topic, rs in sorted(by_topic.items()):
            rs.sort(key=lambda r: (r["object_key"], r["norm"]))
            k = max(1, -(-len(rs) // MAX_BUCKET))
            size = -(-len(rs) // k)
            for i in range(k):
                buckets.append((dom, topic, rs[i * size:(i + 1) * size]))

    # domains with only a handful of pre-groups share one bucket (the merge
    # agent never merges across domains; the domain is a column in the file)
    tiny = [b for b in buckets if len(b[2]) < 10]
    if len(tiny) > 1:
        buckets = [b for b in buckets if len(b[2]) >= 10]
        buckets.append(("(several small domains)", "all", [r for b in tiny for r in b[2]]))
    manifest = []
    for bi, (dom, topic, rows) in enumerate(buckets, 1):
        bid = f"b{bi:03d}"
        for i, r in enumerate(rows, 1):  # ids are "<bucket>.<n>" so a bucket's ids are implied by its size
            r["pg"] = f"{bid}.{i:03d}"
        path = os.path.join(args.out, "buckets", f"{bid}.tsv")
        with open(path, "w") as fh:
            fh.write("pg\tdomain\tn\ttitle (other titles)\tproducts\tinterfaces\tnav\tpage\tcli/rest\tsteps excerpt\n")
            for r in rows:
                r["bucket"] = bid
                other = [t for t in r["titles"] if t != r["title"]][:3]
                sig = "; ".join(r["cli"][:4] + r["rest"][:3])
                fh.write("\t".join([
                    r["pg"], r["domain"], str(r["n"]), r["title"] + (f"  (also: {' | '.join(other)})" if other else ""),
                    ",".join(r["products"])[:80], ",".join(r["interfaces"]), r["nav"][:100], r["page"][:100],
                    sig[:160], " || ".join(r["excerpt"])[:300]]).replace("\n", " ") + "\n")
        manifest.append({"bucket": bid, "domain": dom, "topic": topic, "pregroups": len(rows),
                         "tasks": sum(r["n"] for r in rows), "file": path,
                         "pg_ids": [r["pg"] for r in rows]})
    with open(os.path.join(args.out, "pregroups.jsonl"), "w") as fh:
        for r in pg_rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    with open(os.path.join(args.out, "buckets.json"), "w") as fh:
        json.dump(manifest, fh, indent=1)
    print(f"tasks={len(tasks)} pregroups={len(pg_rows)} buckets={len(manifest)} domains={len(by_domain)}")
    for m in manifest:
        print(f"  {m['bucket']} {m['domain'][:34]:34s} {m['topic'][:40]:40s} pg={m['pregroups']:4d} tasks={m['tasks']}", flush=True)


if __name__ == "__main__":
    main()
