export const meta = {
  name: 'netapp-ops-cluster',
  description: 'Cluster pre-grouped NetApp doc tasks into distinct operations per bucket, adversarially verify, and judge edits',
  whenToUse: 'De-duplicating the NetApp task catalog into distinct operations',
  phases: [
    { title: 'Cluster', detail: 'one agent per bucket groups pre-groups into operations' },
    { title: 'Verify', detail: 'adversarial check for over-merges, missed merges, bad names' },
    { title: 'Judge', detail: 'accept or reject each proposed edit' },
  ],
}

const RUBRIC = `You are building a catalog of DISTINCT OPERATIONS from NetApp product documentation, for an evaluation of an AI agent that operates NetApp storage products. Every documented task has already been extracted; near-certain copies are pre-grouped.

THE INPUT FILE is a TSV with one row per pre-group ("pg"). A pg is one or more documented tasks that already share a normalised title in the same product domain (e.g. the same hardware procedure for several models, or the same task on several doc sites). Columns: pg id | domain | n (number of documented tasks in it) | title (other titles) | products (doc sites) | interfaces | nav (doc breadcrumb) | page (page title) | cli/rest (CLI commands / REST operations used) | steps excerpt.
For any pg you need to understand better, the file PREGROUPS_FILE has one JSON line per pg (grep for "pg": "pgNNNNN") with all member task ids, titles and step excerpts.

DEFINITION. An operation is one intended outcome on one kind of object in one product domain.
MERGE pgs into one operation when they differ only in:
 - documentation site (e.g. ONTAP docs vs System Manager classic vs ASA r2 vs AFX vs REST API examples vs NetApp Console / Cloud Volumes ONTAP / FSx for ONTAP docs),
 - hardware model or platform, software version, host OS version,
 - interface (System Manager / Console / other GUI vs CLI vs REST API vs automation): interfaces are alternative methods of the same operation,
 - wording ("Create a volume" / "Add a volume" / "Create a FlexVol volume" when the default volume type is meant),
 - REST examples that only vary query filters, returned fields or which identifier is used ("Retrieve all volumes", "Retrieve volumes with specific fields", "Retrieve a volume by name" are one operation: View volumes).
KEEP SEPARATE when:
 - the resulting state or object type differs (FlexVol vs FlexGroup vs FlexCache; SnapMirror asynchronous vs SnapMirror active sync; NFS export policy vs SMB share; encrypted vs unencrypted when encryption is the point of the task),
 - the action differs (create, modify, delete, view are separate operations; enable vs disable are separate),
 - the domain column differs (NEVER merge across domains).
FRAGMENTS. Some pgs are only one part of a larger documented procedure (phases such as "Shut down the impaired controller", section labels like "Option 1: most systems", wizard pages like "Review your selections").
 - If the fragment is a meaningful stand-alone sub-procedure that several larger procedures reuse (e.g. shut down the impaired controller, give back the controller, verify cluster health, return the failed part), keep it as its own operation with kind=step.
 - If it only makes sense inside its parent procedure (wizard pages, "Option 2: ...", "Method 1 ..."), put it in the operation of its parent (the page column names the parent). If no pg in this file is the parent, create an operation named after the parent procedure.
NON-TASKS. A pg that is not a user procedure (concept list, automatic behaviour description, list of links, sizing narrative) still belongs to an operation, but that operation gets kind=not_a_task.

OPERATION FIELDS
 - key: local key "op1", "op2", ... unique in your answer
 - name: imperative, specific, product-neutral within the domain, no hardware models, versions or interface names ("Create a FlexGroup volume", "Replace a fan module", "View SnapMirror relationships", "Configure an SVM for NFS")
 - action: one lower-case verb (create, modify, delete, view, enable, disable, configure, add, remove, replace, install, upgrade, revert, restore, move, clone, migrate, verify, troubleshoot, deploy, assign, ...)
 - object: the thing acted on, singular ("FlexGroup volume", "fan module", "SnapMirror relationship")
 - kind: configure | query | workflow (an end-to-end procedure made of several operations) | lifecycle (install, deploy, upgrade, revert, migrate, expand, decommission) | hardware (physical work) | recovery (troubleshoot, repair, disaster recovery) | step (reusable sub-procedure) | not_a_task
 - category: exactly one of: Setup and deployment | Upgrade and lifecycle | Hardware maintenance | Storage provisioning | Capacity and efficiency | Data protection and replication | Business continuity and high availability | File access protocols (NAS) | Block access protocols (SAN) | Object storage (S3) | Networking | Security and access control | Encryption and key management | Ransomware protection and compliance | Cluster and system administration | Monitoring, performance, and alerts | Troubleshooting and support | Cloud and hybrid services | Automation and integration | Host and application integration | Licensing and subscriptions | Other
 - description: one sentence stating the outcome
 - pregroups: the pg ids in it
 - variants: what differs among its pgs/tasks (e.g. "hardware platform", "interface", "ONTAP version", "host OS"); [] if nothing`

const CATEGORIES = ['Setup and deployment', 'Upgrade and lifecycle', 'Hardware maintenance', 'Storage provisioning', 'Capacity and efficiency', 'Data protection and replication', 'Business continuity and high availability', 'File access protocols (NAS)', 'Block access protocols (SAN)', 'Object storage (S3)', 'Networking', 'Security and access control', 'Encryption and key management', 'Ransomware protection and compliance', 'Cluster and system administration', 'Monitoring, performance, and alerts', 'Troubleshooting and support', 'Cloud and hybrid services', 'Automation and integration', 'Host and application integration', 'Licensing and subscriptions', 'Other']
const KINDS = ['configure', 'query', 'workflow', 'lifecycle', 'hardware', 'recovery', 'step', 'not_a_task']

const OP = {
  type: 'object',
  properties: {
    key: { type: 'string' }, name: { type: 'string' }, action: { type: 'string' }, object: { type: 'string' },
    kind: { type: 'string', enum: KINDS }, category: { type: 'string', enum: CATEGORIES },
    description: { type: 'string' },
    pregroups: { type: 'array', items: { type: 'string' } },
    variants: { type: 'array', items: { type: 'string' } },
  },
  required: ['key', 'name', 'action', 'object', 'kind', 'category', 'description', 'pregroups', 'variants'],
}
const CLUSTER_SCHEMA = {
  type: 'object',
  properties: { bucket: { type: 'string' }, operations: { type: 'array', items: OP } },
  required: ['bucket', 'operations'],
}
const FIX_SCHEMA = {
  type: 'object',
  properties: {
    bucket: { type: 'string' },
    assignments: { type: 'array', items: { type: 'object', properties: { pg: { type: 'string' }, op: { type: 'string' } }, required: ['pg', 'op'] } },
    new_operations: { type: 'array', items: OP },
  },
  required: ['bucket', 'assignments', 'new_operations'],
}
const EDIT = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string', enum: ['split', 'merge', 'move', 'fix'] },
    ops: { type: 'array', items: { type: 'string' }, description: 'op keys involved (merge: all ops to merge; split/fix: the op; move: [from_op, to_op])' },
    pregroups: { type: 'array', items: { type: 'string' }, description: 'split: pgs that leave the op to form a NEW op; move: pgs to move' },
    name: { type: 'string', description: 'new/merged/renamed operation name (empty if unchanged)' },
    action: { type: 'string' }, object: { type: 'string' },
    kind: { type: 'string' }, category: { type: 'string' }, description: { type: 'string' },
    reason: { type: 'string', description: 'evidence from the file' },
  },
  required: ['id', 'type', 'ops', 'pregroups', 'name', 'action', 'object', 'kind', 'category', 'description', 'reason'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: { bucket: { type: 'string' }, edits: { type: 'array', items: EDIT } },
  required: ['bucket', 'edits'],
}
const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    bucket: { type: 'string' },
    decisions: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, accept: { type: 'boolean' }, reason: { type: 'string' } }, required: ['id', 'accept', 'reason'] } },
  },
  required: ['bucket', 'decisions'],
}

const PG_FILE = args.pregroupsFile

function compact(ops) {
  return ops.map(o => `${o.key} | ${o.name} | ${o.action} | ${o.object} | ${o.kind} | ${o.category} | ${o.pregroups.join(',')}`).join('\n')
}

function coverage(ops, pgIds) {
  const seen = new Map()
  const dups = []
  for (const o of ops) {
    o.pregroups = o.pregroups.filter(p => {
      if (!pgIds.has(p)) return false
      if (seen.has(p)) { dups.push(p); return false }
      seen.set(p, o.key)
      return true
    })
  }
  const missing = [...pgIds].filter(p => !seen.has(p))
  return { missing, dups }
}

function fileOf(b) {
  return b.file || `${args.bucketDir}/${b.bucket}.tsv`
}

function pgIdsOf(b) {
  return Array.from({ length: b.n }, (_, i) => `${b.bucket}.${String(i + 1).padStart(3, '0')}`)
}

async function clusterBucket(b) {
  const pgIds = new Set(pgIdsOf(b))
  const res = await agent(`${RUBRIC.replace('PREGROUPS_FILE', PG_FILE)}

YOUR BUCKET: ${b.bucket} — domain "${b.domain}", topic "${b.topic}", ${b.n} pre-groups (${b.bucket}.001 to ${b.bucket}.${String(b.n).padStart(3, '0')}).
Read the whole file ${fileOf(b)} (use the Read tool; it is ${b.n + 1} lines). Rows are sorted so that related objects are near each other, but duplicates can be anywhere in the file: compare every row with every other row that could be the same operation.
Assign EVERY pg in the file to exactly one operation. Return bucket="${b.bucket}" and the operations.`,
    { label: `cluster:${b.bucket}`, phase: 'Cluster', schema: CLUSTER_SCHEMA })
  if (!res) return null
  let ops = res.operations
  let cov = coverage(ops, pgIds)
  if (cov.missing.length) {
    const fix = await agent(`${RUBRIC.replace('PREGROUPS_FILE', PG_FILE)}

Bucket ${b.bucket} (file ${fileOf(b)}) was grouped into the operations below, but these pre-groups were not assigned: ${cov.missing.join(', ')}.
Look them up in ${fileOf(b)} and assign each one either to an existing operation key below (only if it is truly the same operation) or to a new operation (give new operations keys "new1", "new2", ... and list their pregroups there; in assignments use the new key).

EXISTING OPERATIONS (key | name | action | object | kind | category | pregroups):
${compact(ops)}

Return bucket="${b.bucket}".`, { label: `fix:${b.bucket}`, phase: 'Cluster', schema: FIX_SCHEMA })
    if (fix) {
      const byKey = new Map(ops.map(o => [o.key, o]))
      for (const n of fix.new_operations) { n.pregroups = []; if (!byKey.has(n.key)) { ops.push(n); byKey.set(n.key, n) } }
      for (const a of fix.assignments) { const o = byKey.get(a.op); if (o && cov.missing.includes(a.pg)) o.pregroups.push(a.pg) }
      ops = ops.filter(o => o.pregroups.length)
      cov = coverage(ops, pgIds)
    }
  }
  return { bucket: b.bucket, ops, missing: cov.missing, dups: cov.dups }
}

async function verifyBucket(c, b) {
  if (!c) return null
  const res = await agent(`${RUBRIC.replace('PREGROUPS_FILE', PG_FILE)}

You are the ADVERSARIAL REVIEWER for bucket ${b.bucket} (domain "${b.domain}", topic "${b.topic}"). Another agent grouped the pre-groups in ${fileOf(b)} into the operations listed below. Read the file (Read tool) and hunt for mistakes against the definition above:
 1. OVER-MERGE: an operation whose pgs are really different operations (different outcome/object type/action) → edit type "split" (list the pgs that should LEAVE to form a new op, with its name/action/object/kind/category/description) or "move" (ops=[from, to], pgs that belong in another existing op).
 2. MISSED MERGE: two or more operations that are really the same operation → edit type "merge" (ops = all keys to merge; give the merged name/action/object/kind/category/description).
 3. BAD FIELDS: a name that includes a hardware model, version or interface, is vague ("Manage X" when the pgs do one specific thing), or a wrong kind/category/action/object → edit type "fix" (ops=[key]; set only the fields to change, leave others as empty strings).
Give every edit an id ("E1", "E2", ...) and a concrete reason quoting the file. Propose only edits you are confident about; an empty list is a valid answer if the grouping is right. For unused fields use "" or [].

PROPOSED OPERATIONS (key | name | action | object | kind | category | pregroups):
${compact(c.ops)}

Return bucket="${b.bucket}".`, { label: `verify:${b.bucket}`, phase: 'Verify', schema: VERIFY_SCHEMA })
  return { ...c, edits: res ? res.edits : [] }
}

async function judgeBucket(v, b) {
  if (!v) return null
  if (!v.edits.length) return { bucket: b.bucket, ops: v.ops.length, edits: 0, accepted: 0 }
  const edits = v.edits.map(e => `${e.id} [${e.type}] ops=${e.ops.join(',')} pgs=${e.pregroups.join(',')} name="${e.name}" action="${e.action}" object="${e.object}" kind="${e.kind}" category="${e.category}" — ${e.reason}`).join('\n')
  const res = await agent(`${RUBRIC.replace('PREGROUPS_FILE', PG_FILE)}

You are the JUDGE for bucket ${b.bucket} (file ${fileOf(b)}). A grouping of its pre-groups into operations was reviewed and the reviewer proposed the edits below. Read the file and decide each edit on the evidence, applying the definition strictly. Accept an edit only if the result is clearly more correct than the current grouping; reject edits that merge different outcomes/object types/actions, split true copies (different model/version/interface/doc site/wording), or rename to something less accurate.

CURRENT OPERATIONS (key | name | action | object | kind | category | pregroups):
${compact(v.ops)}

PROPOSED EDITS:
${edits}

Return one decision per edit id, with bucket="${b.bucket}".`, { label: `judge:${b.bucket}`, phase: 'Judge', schema: JUDGE_SCHEMA })
  const accepted = res ? res.decisions.filter(d => d.accept).length : 0
  return { bucket: b.bucket, ops: v.ops.length, edits: v.edits.length, accepted }
}

const results = await pipeline(args.buckets, clusterBucket, verifyBucket, judgeBucket)
const ok = results.filter(Boolean)
log(`${ok.length}/${args.buckets.length} buckets finished`)
return {
  buckets: ok.length,
  failed: args.buckets.filter((b, i) => !results[i]).map(b => b.bucket),
  operations: ok.reduce((s, r) => s + r.ops, 0),
  edits: ok.reduce((s, r) => s + r.edits, 0),
  accepted: ok.reduce((s, r) => s + r.accepted, 0),
  perBucket: ok.map(r => `${r.bucket}:${r.ops}ops/${r.edits}e/${r.accepted}a`).join(' '),
}
