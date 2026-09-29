# NetApp task catalog: coverage summary

- **12,504 tasks** (13,166 interface-specific methods) from **92 documentation sites**
- 831 tasks are documented for more than one interface (e.g. System Manager *and* CLI)
- 1,917 ONTAP tasks are linked to equivalent REST API operations (inferred from the CLI commands they use)

## By product family

Interface columns count tasks that have at least one method for that interface.

| Family | Tasks | gui | cli | api | automation | hardware | unknown |
|---|---:|---:|---:|---:|---:|---:|---:|
| ONTAP | 6,050 | 1,344 | 3,063 | 1,199 | 0 | 782 | 325 |
| Data protection and host integration | 943 | 628 | 241 | 3 | 0 | 0 | 96 |
| Monitoring and analytics | 835 | 746 | 54 | 3 | 1 | 0 | 31 |
| StorageGRID | 824 | 537 | 122 | 0 | 0 | 126 | 54 |
| Solutions and reference architectures | 784 | 373 | 257 | 0 | 8 | 7 | 148 |
| E-Series / SANtricity | 668 | 488 | 92 | 0 | 9 | 104 | 43 |
| Element / SolidFire / HCI | 587 | 461 | 67 | 11 | 0 | 24 | 30 |
| NetApp Console data services | 564 | 514 | 26 | 4 | 5 | 0 | 18 |
| NetApp Console (BlueXP) platform | 441 | 325 | 31 | 95 | 2 | 0 | 26 |
| Kubernetes (Trident / Astra) | 274 | 104 | 120 | 23 | 32 | 0 | 21 |
| Workload Factory | 210 | 199 | 2 | 0 | 0 | 0 | 10 |
| Cloud Volumes ONTAP | 133 | 93 | 21 | 13 | 0 | 0 | 9 |
| Keystone | 58 | 50 | 10 | 0 | 0 | 0 | 0 |
| Data migration | 56 | 37 | 16 | 0 | 0 | 0 | 5 |
| NetApp Console storage services | 36 | 33 | 0 | 1 | 0 | 0 | 3 |
| Tools and meta | 33 | 32 | 0 | 0 | 0 | 0 | 1 |
| Automation | 8 | 3 | 8 | 0 | 0 | 0 | 0 |

## By documentation site

| Family | Site (repo) | Title | Pages | Tasks | Multi-interface | gui | cli | api | automation | hardware | unknown |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Automation | `netapp-automation` | NetApp Automation | 20 | 8 | 3 | 3 | 8 | 0 | 0 | 0 | 0 |
| Cloud Volumes ONTAP | `storage-management-cloud-volumes-ontap` | Cloud Volumes ONTAP | 134 | 133 | 2 | 93 | 21 | 13 | 0 | 0 | 9 |
| Data migration | `data-migrator` | NetApp Data Migrator | 32 | 42 | 2 | 34 | 8 | 0 | 0 | 0 | 2 |
| Data migration | `xcp` | XCP | 78 | 14 | 0 | 3 | 8 | 0 | 0 | 0 | 3 |
| Data protection and host integration | `snapcenter` | SnapCenter software | 664 | 446 | 25 | 285 | 130 | 1 | 0 | 0 | 55 |
| Data protection and host integration | `workflow-automation` | OnCommand Workflow Automation | 379 | 151 | 0 | 98 | 36 | 0 | 0 | 0 | 17 |
| Data protection and host integration | `snap-creator-framework` | Snap Creator Framework | 280 | 114 | 0 | 61 | 46 | 0 | 0 | 0 | 7 |
| Data protection and host integration | `ontap-tools-vmware-vsphere-10` | ONTAP tools for VMware vSphere 10 | 106 | 78 | 0 | 68 | 5 | 1 | 0 | 0 | 4 |
| Data protection and host integration | `ontap-tools-vmware-vsphere` | ONTAP tools for VMware vSphere 9.13 | 124 | 67 | 0 | 57 | 5 | 0 | 0 | 0 | 5 |
| Data protection and host integration | `sc-plugin-vmware-vsphere` | SnapCenter Plug-in for VMware vSphere 6.2 | 106 | 63 | 0 | 57 | 2 | 1 | 0 | 0 | 3 |
| Data protection and host integration | `smis-provider` | NetApp SMI-S Provider | 107 | 22 | 0 | 2 | 15 | 0 | 0 | 0 | 5 |
| Data protection and host integration | `nfs-plugin-vmware-vaai` | NetApp NFS Plug-in for VMware VAAI | 5 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| E-Series / SANtricity | `e-series` | E-Series storage systems | 477 | 358 | 63 | 205 | 79 | 0 | 0 | 101 | 39 |
| E-Series / SANtricity | `e-series-santricity` | SANtricity software | 644 | 285 | 1 | 280 | 1 | 0 | 0 | 3 | 2 |
| E-Series / SANtricity | `beegfs` | BeeGFS on NetApp with E-Series Storage | 68 | 22 | 1 | 0 | 12 | 0 | 9 | 0 | 2 |
| E-Series / SANtricity | `storage-management-e-series` | E-Series | 7 | 3 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| Element / SolidFire / HCI | `element-software` | Element Software | 800 | 278 | 2 | 212 | 38 | 6 | 0 | 9 | 15 |
| Element / SolidFire / HCI | `hci` | NetApp HCI | 183 | 179 | 4 | 125 | 27 | 5 | 0 | 15 | 11 |
| Element / SolidFire / HCI | `vcp` | VCP | 47 | 113 | 0 | 108 | 2 | 0 | 0 | 0 | 3 |
| Element / SolidFire / HCI | `solidfire-active-iq` | SolidFire Active IQ | 37 | 17 | 0 | 16 | 0 | 0 | 0 | 0 | 1 |
| Keystone | `keystone-staas` | Keystone | 85 | 29 | 1 | 25 | 5 | 0 | 0 | 0 | 0 |
| Keystone | `keystone-staas-2` | Keystone | 84 | 29 | 1 | 25 | 5 | 0 | 0 | 0 | 0 |
| Kubernetes (Trident / Astra) | `astra-control-center` | Astra Control Center | 74 | 122 | 9 | 89 | 31 | 0 | 7 | 0 | 4 |
| Kubernetes (Trident / Astra) | `trident` | Trident | 129 | 114 | 15 | 11 | 85 | 1 | 25 | 0 | 8 |
| Kubernetes (Trident / Astra) | `astra-automation` | Astra Automation | 344 | 38 | 1 | 4 | 4 | 22 | 0 | 0 | 9 |
| Monitoring and analytics | `active-iq-unified-manager` | Active IQ Unified Manager | 818 | 381 | 0 | 355 | 21 | 0 | 0 | 0 | 5 |
| Monitoring and analytics | `oncommand-insight` | OnCommand Insight | 575 | 269 | 0 | 231 | 22 | 0 | 0 | 0 | 16 |
| Monitoring and analytics | `data-infrastructure-insights` | Data Infrastructure Insights | 252 | 94 | 0 | 84 | 5 | 0 | 1 | 0 | 4 |
| Monitoring and analytics | `active-iq` | Digital Advisor | 69 | 47 | 0 | 40 | 6 | 0 | 0 | 0 | 1 |
| Monitoring and analytics | `ai-data-engine` | AI Data Engine | 25 | 37 | 0 | 32 | 0 | 0 | 0 | 0 | 5 |
| Monitoring and analytics | `digital-advisor-automation` | Digital Advisor API | 15 | 7 | 0 | 4 | 0 | 3 | 0 | 0 | 0 |
| NetApp Console (BlueXP) platform | `console-setup-admin` | NetApp Console setup and administration | 182 | 156 | 11 | 140 | 18 | 6 | 2 | 0 | 5 |
| NetApp Console (BlueXP) platform | `console-automation` | API | 1562 | 123 | 22 | 28 | 13 | 88 | 0 | 0 | 16 |
| NetApp Console (BlueXP) platform | `console-local` | NetApp Console local deployment | 152 | 83 | 0 | 81 | 0 | 0 | 0 | 0 | 2 |
| NetApp Console (BlueXP) platform | `console-licenses-subscriptions` | Licenses and subscriptions | 18 | 36 | 0 | 35 | 0 | 0 | 0 | 0 | 1 |
| NetApp Console (BlueXP) platform | `console-well-architected` | Well-architected dashboard | 14 | 19 | 0 | 17 | 0 | 0 | 0 | 0 | 2 |
| NetApp Console (BlueXP) platform | `console-lifecycle-planning` | Lifecycle planning | 17 | 9 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console (BlueXP) platform | `console-volume-caching` | Volume caching | 15 | 7 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console (BlueXP) platform | `console-software-updates` | Software updates | 13 | 5 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console (BlueXP) platform | `console-alerts` | ONTAP alerts | 11 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console (BlueXP) platform | `console-local-automation` | API | 285 | 1 | 1 | 1 | 0 | 1 | 0 | 0 | 0 |
| NetApp Console data services | `data-services-backup-recovery` | NetApp Backup and Recovery | 154 | 258 | 1 | 230 | 18 | 1 | 4 | 0 | 6 |
| NetApp Console data services | `data-services-ransomware-resilience` | NetApp Ransomware Resilience | 47 | 64 | 1 | 61 | 2 | 0 | 1 | 0 | 1 |
| NetApp Console data services | `saasbackupO365` | SaaS Backup for Microsoft 365 | 69 | 64 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console data services | `data-services-data-classification` | NetApp Data Classification | 66 | 56 | 0 | 53 | 2 | 0 | 0 | 0 | 1 |
| NetApp Console data services | `data-services-disaster-recovery` | NetApp Disaster Recovery | 50 | 54 | 1 | 53 | 2 | 0 | 0 | 0 | 0 |
| NetApp Console data services | `data-services-copy-sync` | NetApp Copy and Sync | 29 | 40 | 0 | 32 | 2 | 2 | 0 | 0 | 4 |
| NetApp Console data services | `data-services-cloud-tiering` | NetApp Cloud Tiering | 20 | 25 | 0 | 18 | 0 | 1 | 0 | 0 | 6 |
| NetApp Console data services | `data-services-replication` | NetApp Replication | 11 | 3 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console storage services | `storage-management-fsx-ontap` | Amazon FSx for NetApp ONTAP | 15 | 12 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console storage services | `storage-management-azure-netapp-files` | Azure NetApp Files | 13 | 9 | 1 | 7 | 0 | 1 | 0 | 0 | 2 |
| NetApp Console storage services | `storage-management-ontap-onprem` | On-premises ONTAP clusters | 12 | 5 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console storage services | `storage-management-google-cloud-netapp-volumes` | Google Cloud NetApp Volumes | 13 | 4 | 0 | 3 | 0 | 0 | 0 | 0 | 1 |
| NetApp Console storage services | `storage-management-blob-storage` | Azure Blob storage | 8 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console storage services | `storage-management-google-cloud-storage` | Google Cloud Storage | 8 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| NetApp Console storage services | `storage-management-s3-storage` | Amazon S3 storage | 8 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| ONTAP | `ontap` | ONTAP 9 | 2879 | 1,449 | 192 | 404 | 1,174 | 2 | 0 | 1 | 61 |
| ONTAP | `ontap-systems` | Install and maintain | 1797 | 1,212 | 404 | 171 | 759 | 0 | 0 | 692 | 13 |
| ONTAP | `ontap-restapi` | ONTAP REST API | 234 | 1,172 | 0 | 0 | 0 | 1,172 | 0 | 0 | 0 |
| ONTAP | `ontap-metrocluster` | ONTAP MetroCluster | 513 | 560 | 2 | 22 | 441 | 0 | 0 | 35 | 64 |
| ONTAP | `ontap-system-manager-classic` | System Manager Classic | 872 | 546 | 4 | 456 | 48 | 0 | 0 | 0 | 46 |
| ONTAP | `ontap-systems-upgrade` | Upgrade controllers | 395 | 342 | 8 | 10 | 224 | 0 | 0 | 15 | 101 |
| ONTAP | `ontap-systems-switches` | Install and maintain | 356 | 188 | 10 | 20 | 151 | 0 | 0 | 16 | 11 |
| ONTAP | `ontap-7mode-transition` | ONTAP 7-Mode Transition | 376 | 170 | 0 | 53 | 105 | 0 | 0 | 0 | 12 |
| ONTAP | `asa-r2` | ASA r2 | 99 | 115 | 2 | 97 | 9 | 0 | 0 | 8 | 3 |
| ONTAP | `ontap-sanhost` | ONTAP SAN Host Utilities | 307 | 94 | 6 | 12 | 80 | 0 | 0 | 3 | 8 |
| ONTAP | `ontap-afx` | AFX | 86 | 75 | 5 | 60 | 7 | 1 | 0 | 12 | 0 |
| ONTAP | `ontap-select` | ONTAP Select | 140 | 57 | 7 | 38 | 25 | 1 | 0 | 0 | 0 |
| ONTAP | `ontap-fli` | ONTAP Foreign LUN Import | 191 | 31 | 0 | 0 | 26 | 0 | 0 | 0 | 5 |
| ONTAP | `ontap-automation` | ONTAP automation | 100 | 25 | 0 | 0 | 2 | 23 | 0 | 0 | 0 |
| ONTAP | `ontap-technical-reports` | ONTAP Technical Reports | 100 | 10 | 0 | 1 | 8 | 0 | 0 | 0 | 1 |
| ONTAP | `upgrade-health-checker` | Upgrade Health Checker | 12 | 3 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| ONTAP | `ontap-apps-dbs` | Enterprise applications | 290 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| Solutions and reference architectures | `flexpod` | FlexPod | 249 | 217 | 0 | 143 | 58 | 0 | 0 | 0 | 16 |
| Solutions and reference architectures | `netapp-solutions-virtualization` | NetApp virtualization solutions | 195 | 169 | 5 | 86 | 44 | 0 | 5 | 0 | 41 |
| Solutions and reference architectures | `netapp-solutions-databases` | NetApp database solutions | 96 | 105 | 1 | 57 | 35 | 0 | 0 | 0 | 14 |
| Solutions and reference architectures | `netapp-solutions-sap` | NetApp solutions for SAP | 381 | 99 | 0 | 37 | 35 | 0 | 0 | 5 | 22 |
| Solutions and reference architectures | `netapp-solutions-ai` | NetApp artificial intelligence solutions | 215 | 76 | 0 | 12 | 41 | 0 | 1 | 2 | 20 |
| Solutions and reference architectures | `netapp-solutions-cloud` | NetApp public and hybrid cloud solutions | 112 | 52 | 1 | 28 | 6 | 0 | 1 | 0 | 18 |
| Solutions and reference architectures | `netapp-solutions-containers` | NetApp container solutions | 73 | 47 | 0 | 9 | 25 | 0 | 1 | 0 | 12 |
| Solutions and reference architectures | `netapp-solutions-dataops` | NetApp data management solutions | 44 | 19 | 0 | 1 | 13 | 0 | 0 | 0 | 5 |
| StorageGRID | `storagegrid` | StorageGRID software | 886 | 541 | 1 | 426 | 86 | 0 | 0 | 0 | 30 |
| StorageGRID | `storagegrid-appliances` | StorageGRID appliances | 298 | 245 | 14 | 87 | 28 | 0 | 0 | 126 | 18 |
| StorageGRID | `storagegrid-enable` | StorageGRID solutions and resources | 101 | 32 | 0 | 18 | 8 | 0 | 0 | 0 | 6 |
| StorageGRID | `storage-management-storagegrid` | StorageGRID | 11 | 6 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |
| Tools and meta | `interoperability-matrix-tool` | Interoperability Matrix Tool | 66 | 33 | 0 | 32 | 0 | 0 | 0 | 0 | 1 |
| Workload Factory | `workload-fsx-ontap` | Amazon FSx for NetApp ONTAP | 96 | 98 | 0 | 98 | 0 | 0 | 0 | 0 | 0 |
| Workload Factory | `workload-setup-admin` | Setup and administration | 30 | 38 | 0 | 33 | 0 | 0 | 0 | 0 | 5 |
| Workload Factory | `workload-eda` | EDA workloads | 30 | 27 | 0 | 26 | 0 | 0 | 0 | 0 | 1 |
| Workload Factory | `workload-databases` | Database workloads | 31 | 25 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |
| Workload Factory | `workload-vmware` | VMware workloads | 26 | 18 | 1 | 17 | 2 | 0 | 0 | 0 | 0 |
| Workload Factory | `workload-infosec` | Information Security for Workload Factory | 34 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |

## Repositories not turned into tasks

- **landing** (15): `about`, `astra-family`, `common`, `console-all-family`, `console-family`, `console-local-family`, `data-services-family`, `docs-mcp`, `e-series-family`, `netapp-solutions-family`, `ontap-family`, `ontap-systems-family`, `storage-management-family`, `storagegrid-family`, `workload-family`
- **reference** (3): `e-series-cli`, `ontap-ems`, `ontap-restapi`
- **release-notes** (27): `cloud-volumes-ontap-9100-relnotes`, `cloud-volumes-ontap-9101-relnotes`, `cloud-volumes-ontap-9110-relnotes`, `cloud-volumes-ontap-9111-relnotes`, `cloud-volumes-ontap-9120-relnotes`, `cloud-volumes-ontap-9121-relnotes`, `cloud-volumes-ontap-9130-relnotes`, `cloud-volumes-ontap-9131-relnotes`, `cloud-volumes-ontap-9140-relnotes`, `cloud-volumes-ontap-9141-relnotes`, `cloud-volumes-ontap-9150-relnotes`, `cloud-volumes-ontap-9151-relnotes`, `cloud-volumes-ontap-9161-relnotes`, `cloud-volumes-ontap-9171-relnotes`, `cloud-volumes-ontap-9181-relnotes`, `cloud-volumes-ontap-93-relnotes`, `cloud-volumes-ontap-94-relnotes`, `cloud-volumes-ontap-95-relnotes`, `cloud-volumes-ontap-96-relnotes`, `cloud-volumes-ontap-97-relnotes`, `cloud-volumes-ontap-98-relnotes`, `cloud-volumes-ontap-990-relnotes`, `cloud-volumes-ontap-991-relnotes`, `cloud-volumes-ontap-relnotes`, `console-local-relnotes`, `console-relnotes`, `workload-relnotes`
- **versioned-copy** (94): `active-iq-unified-manager-910`, `active-iq-unified-manager-911`, `active-iq-unified-manager-912`, `active-iq-unified-manager-913`, `active-iq-unified-manager-914`, `active-iq-unified-manager-916`, `active-iq-unified-manager-97`, `active-iq-unified-manager-98`, `active-iq-unified-manager-99`, `astra-automation-2304`, `astra-automation-2307`, `astra-automation-2310`, `astra-control-center-2304`, `astra-control-center-2307`, `astra-control-center-2310`, `e-series-santricity-117`, `e-series-santricity-118`, `e-series-santricity-119`, `element-software-123`, `element-software-125`, `element-software-127`, `element-software-128`, `hci18`, `hci19`, `oncommand-unified-manager-95`, `ontap-ems-9101`, `ontap-ems-9111`, `ontap-ems-9121`, `ontap-ems-9131`, `ontap-ems-9141`, `ontap-ems-9151`, `ontap-ems-9161`, `ontap-ems-9171`, `ontap-ems-9181`, `ontap-restapi-9101`, `ontap-restapi-9111`, `ontap-restapi-9121`, `ontap-restapi-9131`, `ontap-restapi-9141`, `ontap-restapi-9151`, `ontap-restapi-9161`, `ontap-restapi-9171`, `ontap-restapi-9181`, `ontap-restapi-991`, `ontap-select-9111`, `ontap-select-9121`, `ontap-select-9131`, `ontap-select-9141`, `ontap-select-9151`, `ontap-select-9161`, `ontap-select-9171`, `ontap-select-9181`, `ontap-tools-vmware-vsphere-100`, `ontap-tools-vmware-vsphere-101`, `ontap-tools-vmware-vsphere-102`, `ontap-tools-vmware-vsphere-103`, `ontap-tools-vmware-vsphere-104`, `ontap-tools-vmware-vsphere-105`, `ontap-tools-vmware-vsphere-910`, `ontap-tools-vmware-vsphere-911`, `ontap-tools-vmware-vsphere-912`, `ontap-tools-vmware-vsphere-98`, `sc-plugin-vmware-vsphere-45`, `sc-plugin-vmware-vsphere-46`, `sc-plugin-vmware-vsphere-47`, `sc-plugin-vmware-vsphere-48`, `sc-plugin-vmware-vsphere-49`, `sc-plugin-vmware-vsphere-50`, `sc-plugin-vmware-vsphere-60`, `sc-plugin-vmware-vsphere-61`, `snapcenter-45`, `snapcenter-46`, `snapcenter-47`, `snapcenter-48`, `snapcenter-49`, `snapcenter-50`, `snapcenter-60`, `snapcenter-61`, `storagegrid-115`, `storagegrid-116`, `storagegrid-117`, `storagegrid-118`, `storagegrid-119`, `storagegrid-120`, `trident-2304`, `trident-2307`, `trident-2310`, `trident-2402`, `trident-2406`, `trident-2410`, `trident-2502`, `trident-2506`, `trident-2510`, `trident-2602`

## Reference catalogs

- `reference/e-series-cli-commands.jsonl.gz`: 441 records
- `reference/ontap-cli-commands.jsonl.gz`: 1,589 records
- `reference/ontap-rest-examples.jsonl.gz`: 1,185 records
- `reference/ontap-rest-operations.jsonl.gz`: 1,087 records
