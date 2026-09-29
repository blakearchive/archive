# NetApp task catalog (storage-agent eval, step 1)

A machine-readable catalog of the storage operations described in NetApp's
product documentation. Each record captures:

- **what** the task is,
- **how** to do it in each interface the docs describe (System Manager or
  another GUI, CLI, REST API, automation, or physical hardware work),
- the **ordered steps**, with the commands and API calls for each step.

The catalog is organized by product, and it is meant to be the raw material for
an eval of an agent that operates NetApp storage across products.

Current coverage is in [`data/SUMMARY.md`](data/SUMMARY.md). Browse the tasks in
[`data/task_index.csv`](data/task_index.csv), which has one row per task.

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
| `task_index.csv` | One row per task: id, family, product, nav path, title, interfaces, method labels, step count, CLI commands, REST operations, URL |
| `tasks/<product>.jsonl.gz` | Full task records, one JSON object per line (schema below) |
| `reference/ontap-rest-operations.jsonl.gz` | 1,087 ONTAP REST operations: method, path, parameters, request-body fields, related CLI commands, introduced-in version |
| `reference/ontap-rest-examples.jsonl.gz` | Worked REST examples with the calls they make |
| `reference/ontap-cli-commands.jsonl.gz` | ONTAP CLI commands used in the docs, with the tasks that use them and REST equivalents |
| `reference/e-series-cli-commands.jsonl.gz` | SANtricity CLI commands: syntax, parameters, roles, supported arrays, minimum firmware, category |
| `SUMMARY.md` | Coverage tables |

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

## Rebuilding

```bash
pip install pyyaml
python tools/fetch_repos.py  --dest /path/to/clones            # ~95 text-only clones, a few minutes
python tools/build_catalog.py --src /path/to/clones --out data # ~6 minutes
python tools/report.py --data data
gzip -f data/tasks/*.jsonl data/reference/*.jsonl
```

To refresh the repo list, list `github.com/orgs/NetAppDocs/repositories` and
keep the names that have no locale suffix (`.ja-jp`, `.zh-cn`, and so on).

## Known limitations

- **ONTAP CLI man pages and the Swagger JSON.** docs.netapp.com was not
  reachable from the environment this catalog was built in, and the ONTAP CLI
  reference is not a public NetAppDocs repo. So:
  - `ontap-cli-commands` contains only the commands the docs actually use; it is not the full CLI tree.
  - The REST reference comes from the `ontap-restapi` repo. It covers every operation, but its request-body field lists are flattened.

  Given access to `docs.netapp.com/us-en/ontap-cli/`, the ONTAP CLI catalog can be completed. NetApp also runs a docs MCP server (`https://docs.netapp.com/mcp`, key required; see `NetAppDocs/docs-mcp`).
- **Interface labels are heuristic when there is no tab.** Check `interface_source` (`tab`, `content`, `phases`, `reference-example`) and `signal_scores` for the evidence behind each label.
- **Tasks are recorded as documented, not canonicalized.**
  - The same operation can appear in several products, for example in `ontap`, `ontap-system-manager-classic` and `asa-r2`.
  - The same operation can also appear once per variant, for example once per hardware platform in `ontap-systems`.

  Merging these into one canonical task taxonomy is the next step.
- **`rest_equivalents` is inferred** from CLI commands through the REST docs' "Related ONTAP commands" lists. It points to the right endpoint family, but it is not a verified one-to-one translation of the procedure.
- **Hardware and physical tasks are included and labeled `hardware`.** An agent cannot perform them, but they matter for scoping the eval (for example, "agent should hand off").
