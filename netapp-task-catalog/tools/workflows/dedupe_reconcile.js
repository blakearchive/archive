export const meta = {
  name: 'netapp-ops-reconcile',
  description: 'Merge duplicate NetApp operations across buckets and map solution-guide operations onto core operations, with a judge per window',
  whenToUse: 'Second pass of de-duplicating the NetApp task catalog, after dedupe_cluster',
  phases: [
    { title: 'Reconcile', detail: 'one agent per window proposes merges among candidate duplicates' },
    { title: 'Judge', detail: 'accept, trim or reject each proposed merge' },
  ],
}

const RULES = `DEFINITION. An operation is one intended outcome on one kind of object in one product domain.
The SAME operation (merge) when two operations differ only in: documentation site (ONTAP docs vs System Manager classic vs ASA r2 vs AFX vs REST API examples vs NetApp Console / Cloud Volumes ONTAP / FSx for ONTAP docs), hardware model or platform, software version, host OS version, interface (GUI vs CLI vs REST API vs automation), wording ("Add" vs "Create", "View" vs "List" vs "Retrieve"), or REST query filters/fields.
DIFFERENT operations (keep apart) when the resulting state or object type differs (FlexVol vs FlexGroup vs FlexCache; SnapMirror asynchronous vs active sync; export policy vs share), when the action differs (create vs modify vs delete vs view; enable vs disable), or when one is a narrower sub-step or a broader end-to-end workflow of the other (e.g. "Create an SVM" vs "Configure an SVM for NFS" are different; "Replace a controller module" vs "Shut down the impaired controller" are different).
Do not merge on shared words alone: "View alerts" and "View alert monitors" are different; "Configure an HTTP proxy for the collector" and "Configure the collector" are different.`

const GROUP = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    uids: { type: 'array', items: { type: 'string' } },
    name: { type: 'string' }, action: { type: 'string' }, object: { type: 'string' },
    kind: { type: 'string' }, category: { type: 'string' }, description: { type: 'string' },
    reason: { type: 'string' },
  },
  required: ['id', 'uids', 'name', 'action', 'object', 'kind', 'category', 'description', 'reason'],
}
const RECON_SCHEMA = {
  type: 'object',
  properties: { window: { type: 'string' }, groups: { type: 'array', items: GROUP } },
  required: ['window', 'groups'],
}
const MAPPING = {
  type: 'object',
  properties: { id: { type: 'string' }, uid: { type: 'string' }, target: { type: 'string' }, reason: { type: 'string' } },
  required: ['id', 'uid', 'target', 'reason'],
}
const MAP_SCHEMA = {
  type: 'object',
  properties: {
    window: { type: 'string' },
    mappings: { type: 'array', items: MAPPING },
    groups: { type: 'array', items: GROUP, description: 'merges among operations of one domain' },
  },
  required: ['window', 'mappings', 'groups'],
}
const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    window: { type: 'string' },
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' }, accept: { type: 'boolean' },
          keep_uids: { type: 'array', items: { type: 'string' }, description: 'if only part of a merge group is right, the uids that really are one operation (>= 2); [] means the whole group as proposed' },
          reason: { type: 'string' },
        },
        required: ['id', 'accept', 'keep_uids', 'reason'],
      },
    },
  },
  required: ['window', 'decisions'],
}

function fileOf(w) { return `${args.reconDir}/${w.window}.tsv` }

async function propose(w) {
  if (w.scope === 'solutions') {
    return agent(`You are de-duplicating a catalog of operations extracted from NetApp documentation (for an evaluation of an AI agent that operates NetApp storage).
${RULES}

Read ${fileOf(w)} (Read tool). Rows whose domain starts with "Solutions:" are operations from SOLUTION GUIDES (reference architectures such as FlexPod, Oracle/SAP/VMware on NetApp); the other rows are core product operations (ONTAP, StorageGRID, E-Series, ...). Each row lists candidate duplicates found by word overlap. Rows after the "# Candidate targets" line are context only (they may be a mapping target or part of a group, but never form a group on their own).
1. MAPPINGS: for each solution-guide operation that is the SAME operation as one of its candidate core-product operations (e.g. a FlexPod section "Create an SVM" = ONTAP "Create an SVM"), return a mapping {id: "M1"..., uid: solution op uid, target: core op uid}. Solution-specific parameters (names, sizes) do not make it different; a solution procedure that is an end-to-end workflow (deploy Oracle, set up a VMware datastore with SnapCenter) is NOT the same as a single core operation. Only map to a uid that appears as a candidate in the file.
2. GROUPS: merges among operations of ONE domain (a solution domain, or a core domain such as ONTAP) that are the same operation (ids "G1"...; fill name/action/object/kind/category/description for the merged operation, kind and category using the same vocabulary as the file).
Return window="${w.window}". Empty lists are valid.`, { label: `map:${w.window}`, phase: 'Reconcile', schema: MAP_SCHEMA })
  }
  return agent(`You are de-duplicating a catalog of operations extracted from NetApp documentation (for an evaluation of an AI agent that operates NetApp storage). Operations were first grouped within topic buckets; you now catch copies of the same operation that ended up in different buckets.
${RULES}

Read ${fileOf(w)} (Read tool). Each row is an operation (uid, domain, name, action, object, kind, category, number of documented tasks, doc sites, example task titles) followed by candidate duplicates found by word overlap. Candidates are only suggestions: most pairs share words but are different operations. Rows after the "# Candidate targets" line are context only (they may be included in a group together with operations from the main list, but never form a group on their own).
Return merge GROUPS (ids "G1", "G2", ...), each with 2+ uids that are the SAME operation per the definition, plus the name/action/object/kind/category/description the merged operation should have (keep kind and category in the file's vocabulary; name imperative and product-neutral, no hardware models, versions or interface names). Only merge within one domain. Quote the evidence in reason.
Return window="${w.window}". An empty list is a valid answer.`, { label: `reconcile:${w.window}`, phase: 'Reconcile', schema: RECON_SCHEMA })
}

async function judge(p, w) {
  if (!p) return null
  const groups = p.groups || []
  const mappings = p.mappings || []
  if (!groups.length && !mappings.length) return { window: w.window, proposed: 0, accepted: 0 }
  const lines = [
    ...mappings.map(m => `${m.id} [map] ${m.uid} -> ${m.target} — ${m.reason}`),
    ...groups.map(g => `${g.id} [merge] ${g.uids.join(', ')} as "${g.name}" (${g.action} / ${g.object} / ${g.kind} / ${g.category}) — ${g.reason}`),
  ].join('\n')
  const res = await agent(`You are the JUDGE for a de-duplication step over operations extracted from NetApp documentation.
${RULES}

Read ${fileOf(w)} (Read tool) for the operations and their example task titles. Then decide each proposal below strictly on the definition. Accept only if the operations are clearly the same operation. For a merge group where only some members belong together, accept with keep_uids listing those members (at least 2). Reject merges of different outcomes, object types, actions, or of a sub-step with its larger workflow. For [map] proposals, keep_uids is [].

PROPOSALS:
${lines}

Return one decision per proposal id, with window="${w.window}".`, { label: `judge:${w.window}`, phase: 'Judge', schema: JUDGE_SCHEMA })
  const accepted = res ? res.decisions.filter(d => d.accept).length : 0
  return { window: w.window, proposed: groups.length + mappings.length, accepted }
}

const results = await pipeline(args.windows, propose, judge)
const ok = results.filter(Boolean)
return {
  windows: ok.length,
  failed: args.windows.filter((w, i) => !results[i]).map(w => w.window),
  proposed: ok.reduce((s, r) => s + r.proposed, 0),
  accepted: ok.reduce((s, r) => s + r.accepted, 0),
}
