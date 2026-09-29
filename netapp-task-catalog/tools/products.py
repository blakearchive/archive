"""Product registry for the NetAppDocs English repositories.

Each repo is one docs.netapp.com/us-en/<slug> site. This module assigns every
repo a product family and a status so the catalog can default to the current
documentation of each product and skip versioned copies, release-notes-only
sites, landing pages and reference-only sites (handled by build_reference.py).
"""
from __future__ import annotations

import re

FAMILIES = [
    ("ONTAP", r"^(ontap(?!-tools|-ems|-restapi)(-.*)?|asa-r2|upgrade-health-checker)$"),
    ("ONTAP reference (CLI/REST/EMS)", r"^(ontap-restapi|ontap-ems|ontap-cli)(-\d+)?$"),
    ("Cloud Volumes ONTAP", r"^(cloud-volumes-ontap.*|storage-management-cloud-volumes-ontap)$"),
    ("E-Series / SANtricity", r"^(e-series.*|storage-management-e-series|beegfs)$"),
    ("StorageGRID", r"^(storagegrid.*|storage-management-storagegrid)$"),
    ("Element / SolidFire / HCI", r"^(element-software.*|hci\d*|solidfire-active-iq|vcp)$"),
    ("NetApp Console (BlueXP) platform", r"^(console-.*|storage-management-family|about)$"),
    ("NetApp Console storage services", r"^storage-management-(azure-netapp-files|blob-storage|fsx-ontap|google-cloud-.*|s3-storage|ontap-onprem)$"),
    ("NetApp Console data services", r"^(data-services-.*|saasbackupO365)$"),
    ("Workload Factory", r"^workload-.*$"),
    ("Kubernetes (Trident / Astra)", r"^(trident.*|astra-.*)$"),
    ("Monitoring and analytics", r"^(active-iq.*|digital-advisor-automation|data-infrastructure-insights|oncommand-.*|ai-data-engine)$"),
    ("Data protection and host integration", r"^(snapcenter.*|sc-plugin-vmware-vsphere.*|ontap-tools-vmware-vsphere.*|nfs-plugin-vmware-vaai|snap-creator-framework|smis-provider|workflow-automation)$"),
    ("Data migration", r"^(xcp|data-migrator)$"),
    ("Keystone", r"^keystone-.*$"),
    ("Solutions and reference architectures", r"^(netapp-solutions.*|flexpod)$"),
    ("Automation", r"^netapp-automation$"),
    ("Tools and meta", r"^(interoperability-matrix-tool|common|docs-mcp)$"),
]

# repos GitHub still resolves but that redirect to a renamed repo
REDIRECTS = {"cloudinsights": "data-infrastructure-insights", "workload-builders": "workload-family"}
REFERENCE_REPOS = {"ontap-restapi", "e-series-cli", "ontap-ems"}
# Versioned-looking slugs that are the current docs of a product line: ONTAP
# tools 10.x lives in "-10" (the unversioned repo is ONTAP tools 9.13), and
# Keystone STaaS 2 is a separate service generation.
CURRENT_OVERRIDES = {"ontap-tools-vmware-vsphere-10", "keystone-staas-2"}
LANDING_RE = re.compile(r"-family$|^about$|^common$|^docs-mcp$")
RELNOTES_RE = re.compile(r"-relnotes$")
VERSIONED_RE = re.compile(r"-(\d{2,4})$|^hci\d+$")


def family(slug: str) -> str:
    for name, rx in FAMILIES:
        if re.match(rx, slug):
            return name
    return "Other"


def status(slug: str) -> str:
    if slug in REDIRECTS:
        return "redirect"
    if slug in REFERENCE_REPOS:
        return "reference"
    if RELNOTES_RE.search(slug):
        return "release-notes"
    if LANDING_RE.search(slug):
        return "landing"
    if VERSIONED_RE.search(slug) and slug not in CURRENT_OVERRIDES:
        return "versioned-copy"
    return "current"
