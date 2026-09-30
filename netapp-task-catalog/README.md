# NetApp task catalog (storage-agent eval, step 1)

A machine-readable catalog of the storage operations described in NetApp's
product documentation. Each record captures:

- **what** the task is,
- **how** to do it in each interface the docs describe (System Manager or
  another GUI, CLI, REST API, automation, or physical hardware work),
- the **ordered steps**, with the commands and API calls for each step.

The catalog is organized by product, and it is meant to be the raw material for
an eval of an agent that operates NetApp storage across products.

**Current build:** 12,504 tasks (13,166 interface-specific methods) from 92
current documentation sites, merged into **5,532 distinct operations**.

- 831 tasks are documented for more than one interface.
- 1,917 ONTAP tasks are linked to the equivalent ONTAP REST operations.
- Full coverage tables are in [`data/SUMMARY.md`](data/SUMMARY.md).
- Browse the operations in [`data/operations.csv`](data/operations.csv), one row per operation.
- Browse the tasks in [`data/task_index.csv`](data/task_index.csv), one row per task, each linked to its operation.

## Distinct operations

`data/operations.jsonl.gz` and `data/operations.csv` merge the tasks into one
list of distinct operations. Every task is linked to exactly one operation
through `operation_id`, both in `task_index.csv` and in the task records.

An **operation** is one intended outcome on one kind of object in one product
domain.

- **Merged:** tasks that differ only in documentation site, hardware model,
  software or host OS version, interface (GUI, CLI, REST API, automation),
  wording, or REST query filters. For example:
  - "Shut down the impaired controller" merges 149 per-platform procedures.
  - "Replace a fan module" merges 31.
  - "Change a user account password" merges the CLI, System Manager and REST versions.
- **Kept separate:**
  - a different resulting state or object type (FlexVol, FlexGroup or
    FlexCache; asynchronous SnapMirror or SnapMirror active sync; an admin
    group or a tenant group),
  - a different action (create, modify, delete, view; enable, disable),
  - an end-to-end workflow and the step it contains.
- **Fragments:** parts of one documented procedure (wizard pages, "Option N"
  sections, the "remove" and "reinstall" halves of a relocate page) belong to
  that procedure's operation. Reusable sub-procedures that many procedures share
  (shut down the impaired controller, give back the controller, boot the recovery
  image) are operations of their own, with `kind: step`.

| | Count |
|---|---:|
| Distinct operations | 5,532 |
| Documented tasks behind them | 12,504 (2.3 per operation) |
| Agent-performable (not hardware or non-tasks) | 5,338 |
| Doable through more than one interface | 797 |
| Product domains | 51 (ONTAP 2,144, StorageGRID 399, E-Series 324, Element 257, …) |

By kind:

| Kind | Operations |
|---|---:|
| configure | 3,255 |
| query | 940 |
| lifecycle | 322 |
| step (reusable sub-procedure) | 317 |
| recovery | 315 |
| workflow | 201 |
| hardware | 115 |
| not a task | 67 |

### How the list was built

Every model-driven step is proposed by one agent and ruled on by another. The
results are replayed from the workflow journals by deterministic scripts.

1. **Pre-grouping (deterministic):** `tools/normalize.py` and
   `tools/dedupe_prepare.py`.
   - Tasks are grouped by domain and normalized title. Normalizing strips
     hardware models, versions, product and interface names, and turns
     "Creating" into "Create".
   - This turns 12,504 tasks into 9,926 pre-groups
     (`data/dedupe/pregroups.jsonl.gz`).
   - A domain is one product system. ONTAP covers ASA r2, AFX, Cloud Volumes
     ONTAP, FSx for ONTAP and the REST examples. SnapCenter, StorageGRID and
     each Console data service are separate domains.
2. **Clustering** (`tools/workflows/dedupe_cluster.js`, `tools/dedupe_apply.py`).
   - 106 topic buckets of up to 180 pre-groups each.
   - Per bucket, one agent groups the pre-groups into operations. An adversarial
     reviewer proposes splits, merges and fixes, and a judge accepts or rejects
     each one (161 of 168 accepted).
   - Result: 6,668 operations.
3. **Cross-bucket reconciliation**, in three passes: fuzzy word overlap, exact
   object match, and pairwise with stemming. Tools:
   `tools/dedupe_recon_prepare.py`, `tools/workflows/dedupe_reconcile.js`,
   `tools/dedupe_recon_apply.py`.
   - Code proposes candidate duplicates; an agent groups them and a judge
     accepts, trims or rejects each group.
   - Solution-guide operations are mapped onto the core operation they duplicate.
   - Result: 5,863 operations.
4. **Semantic sweep** (`tools/dedupe_sweep_prepare.py`,
   `tools/workflows/dedupe_sweep.js`).
   - Each agent checks a shard of 70 operations against its domain's full list,
     for duplicates worded differently (e.g. "Install an object-store CA
     certificate" = "Install a trusted CA").
   - A judge rules on each proposal: 394 of 418 accepted.
   - Result: 5,532 operations.
5. **Finalize** (`tools/dedupe_finalize.py`).
   - Writes the records.
   - Re-homes 8 REST examples with generic headings ("POST Response", "Inline
     POST body") that had been pre-grouped across endpoint pages. Each goes to
     the operation of the REST call it makes.

### Accuracy of the merge

An independent auditor checked each operation in a fixed-seed sample of 90:
half drawn from multi-group merges, half uniformly at random. For each one it
answered three questions:

- **Precision:** is every member task really this operation?
- **Recall:** grep the domain's full list. Is there a duplicate elsewhere?
- **Labels:** are the name, kind and category right?

The same audit ran after reconciliation pass 2 and again on the final list,
with a new sample:

| Audit | OK | MINOR | MAJOR | Ops with a missed duplicate | Ops with a wrong member |
|---|---:|---:|---:|---:|---:|
| After reconciliation pass 2 (5,939 ops) | 56 | 16 | 18 (20%) | 15 | 11 |
| Final list (5,532 ops), new sample | 72 | 13 | 5 (5.6%) | 4 | 7 (5 rated minor) |

Per-operation verdicts are in `data/dedupe/operations_audit.jsonl`.

- **Remaining majors:** four are missed duplicates of the "same thing, different
  words" kind, for example "View UNIX users" and "View local UNIX users", or
  configure vs enable MACsec. The fifth was a cross-endpoint REST example, since
  fixed.
- **Using the list:** expect roughly one operation in twenty to have a leftover
  duplicate or a stray member. Review the operations you pick for an eval task
  set before relying on them.

## Sources

| Source | Where it comes from | Used for |
|---|---|---|
| Product docs (docs.netapp.com/us-en/*) | The [NetAppDocs](https://github.com/NetAppDocs) GitHub org, one AsciiDoc repo per docs site. The org has 230 English repos; the other ~1,840 are translations. | Tasks |
| ONTAP REST API reference | `NetAppDocs/ontap-restapi`: one page per operation, plus endpoint overview pages with worked examples. This is the same content as the Swagger UI. | `reference/ontap-rest-operations.jsonl`, REST example tasks, CLI↔REST links |
| E-Series (SANtricity) CLI reference | `NetAppDocs/e-series-cli` | `reference/e-series-cli-commands.jsonl` |
| ONTAP CLI reference (docs.netapp.com/us-en/ontap-cli) | **Not in a public repo.** Rebuilt from every ONTAP CLI command the docs use, plus the "Related ONTAP commands" on each REST page. | `reference/ontap-cli-commands.jsonl` |

`repos.txt` lists all English repos. `tools/products.py` sorts each one into a
product family and gives it a status:

- `current`: extracted.
- `versioned-copy`: for example `storagegrid-118` or `ontap-restapi-9161`. Skipped by default; `--include-versioned` adds them.
- `release-notes`, `landing`, `reference`, or `redirect`: not treated as task sources.

## How extraction works

NetApp writes procedures in a consistent AsciiDoc style. `tools/adoc.py` is a
small block parser for that style: headings, block titles, delimited blocks,
nested lists with `+` continuations, and `include::`. `tools/extract_tasks.py`
turns each page into task records:

1. **Procedures:** each `.Steps` / `.Step` block or `== Steps` section is a procedure. Ordered lists also count in these cases:
   - inside interface tabs,
   - under `== Step N: ...` headings,
   - on `*-task.adoc` pages that have no `.Steps` block.

   Solution guides (`netapp-solutions-*`, `flexpod`) use a looser rule, because they rarely mark procedures.
2. **Tasks and methods:** procedures in the same section that sit in sibling tabs of a `[role="tabbed-block"]` (for example **System Manager** / **CLI**) become one task with one *method* per tab. Each method records its interface, the tab label, and any version variant, such as "ONTAP 9.7 and earlier".
3. **Phased procedures:** pages written as `== Step 1: Prepare`, `== Step 2: Replace ...` become one task whose top-level steps are the phases. This covers hardware replacement pages and ONTAP REST workflows.
4. **Interface detection:** the tab label is used first. Without a tab, the content decides:
   - CLI: code blocks, `cluster::>` prompts, `` `x y` command`` mentions.
   - API: curl, `GET /api/...`, JSON bodies.
   - GUI: `**Storage** > **Volumes**` navigation, select/click verbs, UI names.
   - Hardware: cables, shelves, latches, canisters.
   - Automation: YAML, Python, Ansible.

   `unknown` means the steps name no interface, for example "Bring up node2".
5. **Context:** these are attached to the task or method at the right scope: "Before you begin" (prerequisites), "About this task", "After you finish", examples, related links, version notes ("Beginning with ONTAP 9.13.1"), and the sidebar breadcrumb (`nav_path`).
6. **Cross-links** (`tools/build_catalog.py`):
   - ONTAP CLI commands in a task link to the REST operations whose docs list them under "Related ONTAP commands". These appear as `rest_equivalents`, inferred.
   - REST calls in a task link to operations in the REST reference (`rest_operations`).
   - E-Series script commands link to the SANtricity CLI reference.
   - Each ONTAP REST worked example ("Creating a volume") becomes an `api` task under the product `ontap-restapi`.

## Output files (`data/`)

| File | Contents |
|---|---|
| `products.json` | One entry per repo: family, status, title, pages, tasks, tasks by interface |
| `task_index.csv` | One row per task: id, operation_id, family, product, nav path, title, interfaces, method labels, step count, CLI commands, REST operations, URL |
| `tasks/<product>.jsonl.gz` | Full task records, one JSON object per line (schema below) |
| `reference/ontap-rest-operations.jsonl.gz` | 1,087 ONTAP REST operations: method, path, parameters, request-body fields, related CLI commands, introduced-in version |
| `reference/ontap-rest-examples.jsonl.gz` | Worked REST examples with the calls they make |
| `reference/ontap-cli-commands.jsonl.gz` | ONTAP CLI commands used in the docs, with the tasks that use them and REST equivalents |
| `reference/e-series-cli-commands.jsonl.gz` | SANtricity CLI commands: syntax, parameters, roles, supported arrays, minimum firmware, category |
| `operations.jsonl.gz` | The 5,532 distinct operations (schema below) |
| `operations.csv` | One row per operation: op_id, domain, category, kind, name, interfaces, task count, agent-performable, doc sites, description, example URL per interface |
| `dedupe/pregroups.jsonl.gz` | The deterministic pre-groups the merge started from (member task ids, titles) |
| `dedupe/operations_audit.jsonl` | Final merge audit: one verdict per sampled operation |
| `SUMMARY.md` | Coverage tables for tasks and operations |

### Task record

```jsonc
{
  "id": "ontap/volumes/manage-svm-capacity#set-a-capacity-limit-on-a-new-svm",
  "family": "ONTAP", "product": "ontap", "product_title": "ONTAP 9",
  "title": "Set a capacity limit on a new SVM",
  "page_title": "Manage ONTAP SVM capacity limits",
  "section_path": ["Set a capacity limit on a new SVM"],
  "nav_path": ["Volume administration", "Logical storage management with the CLI", "..."],
  "url": "https://docs.netapp.com/us-en/ontap/volumes/manage-svm-capacity.html",
  "source": "NetAppDocs/ontap/volumes/manage-svm-capacity.adoc",
  "summary": "...", "keywords": ["..."], "version_notes": ["ONTAP 9.13.1"],
  "interfaces": ["cli", "gui"],
  "prerequisites": ["..."], "about": ["..."], "after": [], "examples": [],
  "methods": [
    {
      "interface": "gui", "interface_label": "System Manager", "interface_source": "tab",
      "variant": null,
      "steps": [
        {"n": 1, "text": "Select **Storage** > **Storage VMs**."},
        {"n": 4, "text": "Under **Storage VM settings**, select ...", "details": ["..."]}
      ],
      "cli_commands": [], "rest_calls": []
    },
    {
      "interface": "cli", "interface_label": "CLI",
      "steps": [
        {"n": 1, "text": "Create the SVM ...",
         "code": [{"lang": "cli", "content": "vserver create -vserver <vserver_name> ..."}]}
      ],
      "cli_commands": ["vserver create", "vserver show", "vserver modify"]
    }
  ],
  "rest_equivalents": ["POST /svm/svms", "GET /svm/svms", "PATCH /svm/svms/{uuid}"],
  "cli_reference_links": ["ontap-cli/vserver-create"],
  "detection": "steps-block",
  "step_count": 8
}
```

A step can also carry:

- `substeps`: nested steps.
- `options`: bullet choices.
- `variants`: tabs inside a step, each with its own steps and code.
- `notes`: admonitions.
- `interface`: on phased tasks, the interface of that phase.

### Operation record

| Field | Meaning |
|---|---|
| `op_id` | ID of the form `<domain>/<action>-<object>`, e.g. `ontap/create-flexgroup-volume` |
| `name`, `action`, `object`, `description` | What the operation does |
| `domain` | The product system whose tasks can merge into this operation |
| `category` | One of 22 fixed areas, for example Storage provisioning, Data protection and replication, Hardware maintenance |
| `kind` | `configure`, `query`, `workflow`, `lifecycle`, `hardware`, `recovery`, `step`, or `not_a_task` |
| `agent_performable` | False for physical hardware work and non-tasks |
| `interfaces`, `interface_labels` | Every way the docs show to do it, for example `gui` via System Manager or NetApp Console, `cli`, `api` |
| `representatives` | The best example task per interface: id, title, doc site, URL |
| `task_count`, `products`, `variants`, `tasks` | The documented tasks merged here, and what varies between them |
| `cli_commands`, `rest_operations`, `rest_equivalents` | Commands and REST operations used by the member tasks |
| `provenance` | Pre-groups and intermediate operations it was built from |

`op_id` is derived from the action and object, so the IDs are readable but can
change when the list is rebuilt. Store the `tasks` list alongside any ID you
depend on.

## Rebuilding

```bash
pip install pyyaml
python tools/fetch_repos.py  --dest /path/to/clones            # ~95 text-only clones, a few minutes
python tools/build_catalog.py --src /path/to/clones --out data # ~6 minutes
gzip -n -f data/tasks/*.jsonl data/reference/*.jsonl
python tools/report.py --data data
python tests/test_extract.py                                   # parser regression tests
```

Rebuilding the operations list requires running the agent workflows in
`tools/workflows/` with the Claude Code Workflow tool. The order is:

1. `dedupe_prepare.py`
2. `dedupe_cluster.js`, then `dedupe_apply.py`
3. `dedupe_recon_prepare.py` (plain, then `--exact`, then `--pairwise`), each
   followed by `dedupe_reconcile.js` and `dedupe_recon_apply.py`
4. `dedupe_sweep_prepare.py`, then `dedupe_sweep.js` and `dedupe_recon_apply.py`
5. `dedupe_finalize.py` and `report.py`

Each `*_apply.py` step reads the workflow journals, so it can be re-run without
agents.

To refresh the repo list, list `github.com/orgs/NetAppDocs/repositories` and
keep the names that have no locale suffix (`.ja-jp`, `.zh-cn`, and so on).

## Accuracy

Each audit sampled task records and had an independent reviewer check them
against the source `.adoc` (and any included files). The reviewer looked at:

- whether every step is present, in order,
- whether there is unrelated content,
- whether methods are split correctly and each has the right interface,
- whether the title makes sense.

The verdicts mean:

- **OK:** fully correct.
- **MINOR:** a small issue, such as a lost note or an awkward title.
- **MAJOR:** an agent would do the wrong thing: missing or extra steps, the wrong interface, or not actually a task.

| Audit | Sample | OK | MINOR | MAJOR |
|---|---|---:|---:|---:|
| 1. First parser | 51 tasks, stratified by family | 14 | 24 | 13 |
| 2. After fixes | same 51 tasks | 26 | 20 | 5 |
| 3. Held out | 40 new tasks, uniform random, not used for tuning | 22 | 15 | 3 (7.5%) |

In the held-out audit, all three MAJOR defects were in solution or automation
guides. The fix for two of them ("Step N" sections made of `===` subsections)
is included in this build. The 33 tasks sampled from core product docs had no
MAJOR defects.

`tests/test_extract.py` covers each failure pattern the audits found. Run it
with `python tests/test_extract.py`.

## Known limitations

- **ONTAP CLI man pages and the Swagger JSON.** docs.netapp.com was not
  reachable from the environment this catalog was built in, and the ONTAP CLI
  reference is not a public NetAppDocs repo. So:
  - `ontap-cli-commands` contains only the commands the docs actually use; it is not the full CLI tree.
  - The REST reference comes from the `ontap-restapi` repo. It covers every operation, but its request-body field lists are flattened.

  Given access to `docs.netapp.com/us-en/ontap-cli/`, the ONTAP CLI catalog can be completed. NetApp also runs a docs MCP server (`https://docs.netapp.com/mcp`, key required; see `NetAppDocs/docs-mcp`).
- **Interface labels are heuristic when there is no tab.** Check `interface_source` (`tab`, `content`, `phases`, `reference-example`) and `signal_scores` for the evidence behind each label.
- **Task records are kept as documented.** The same operation can appear as
  several task records, across doc sites or once per hardware platform. Use
  `operations.jsonl.gz` for the merged view (see "Distinct operations"), and
  read its accuracy section before relying on individual merges.
- **`rest_equivalents` is inferred** from CLI commands through the REST docs' "Related ONTAP commands" lists. It points to the right endpoint family, but it is not a verified one-to-one translation of the procedure.
- **Some source pages have malformed markup,** for example an unbalanced `--` tab
  delimiter in `ontap/update/firmware-task`. Content in those pages can be
  dropped. The audits found these to be rare.
- **Known cosmetic issues:**
  - Images appear as their alt text in brackets, for example `[Menu options icon]`.
  - Some task titles are just the section heading, for example "Option 3: ...".
  - A note that follows the last step without a `+` goes into `result` and is not attached to that step.
- **Solution guides are least reliable.** `netapp-solutions-*` and `flexpod` pages
  are narrative, so they are extracted with a looser rule (see `detection:
  implicit-ordered-list`). Filter them out, or review them, before using them as
  eval tasks.
- **Hardware and physical tasks are included and labeled `hardware`.** An agent cannot perform them, but they matter for scoping the eval (for example, "agent should hand off").
