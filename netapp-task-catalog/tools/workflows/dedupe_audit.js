export const meta = {
  name: 'netapp-ops-audit',
  description: 'Independently audit a sample of the final NetApp operations list for wrong merges, missed duplicates and bad labels',
  whenToUse: 'After de-duplicating the NetApp task catalog into operations',
  phases: [{ title: 'Audit', detail: 'one auditor per batch of sampled operations' }],
}

const VERDICT = {
  type: 'object',
  properties: {
    op_id: { type: 'string' },
    members_correct: { type: 'boolean', description: 'every member task is the same operation' },
    wrong_members: { type: 'array', items: { type: 'string' }, description: 'task ids that do not belong' },
    duplicates_elsewhere: { type: 'array', items: { type: 'string' }, description: 'other op_ids in the domain list that are the same operation' },
    name_ok: { type: 'boolean' }, kind_ok: { type: 'boolean' }, category_ok: { type: 'boolean' },
    verdict: { type: 'string', enum: ['OK', 'MINOR', 'MAJOR'] },
    reason: { type: 'string' },
  },
  required: ['op_id', 'members_correct', 'wrong_members', 'duplicates_elsewhere', 'name_ok', 'kind_ok', 'category_ok', 'verdict', 'reason'],
}
const SCHEMA = {
  type: 'object',
  properties: { batch: { type: 'string' }, verdicts: { type: 'array', items: VERDICT } },
  required: ['batch', 'verdicts'],
}

const RULES = `An OPERATION is one intended outcome on one kind of object in one product domain. Documented tasks belong to the same operation when they differ only in documentation site, hardware model/platform, software or host OS version, interface (GUI vs CLI vs REST API vs automation), wording, or REST query filters. They are DIFFERENT operations when the resulting state or object type differs (FlexVol vs FlexGroup; SnapMirror async vs active sync), when the action differs (create vs modify vs delete vs view; enable vs disable), or when one is a sub-step or a broader end-to-end workflow of the other.
kind is one of: configure, query, workflow (end-to-end procedure of several operations), lifecycle (install, deploy, upgrade, revert, migrate, expand, decommission), hardware (physical work), recovery (troubleshoot, repair, DR), step (reusable sub-procedure), not_a_task.`

const results = await parallel(args.batches.map(b => () => agent(`You are an independent AUDITOR of a catalog of distinct operations built from NetApp product documentation (for an evaluation of an AI agent that operates NetApp storage). Be skeptical: the goal is an honest error rate.
${RULES}

Read ${b.file} (Read tool). It lists ${b.n} sampled operations; for each: op_id, name, action, object, kind, category, and its member tasks (id, title, page, doc site, interfaces, step excerpt). For each operation:
 1. PRECISION: is every member task the same operation? List task ids that do not belong in wrong_members.
 2. RECALL: search the domain's full operation list (file named in the batch header; use Grep with the key words of the object and synonyms, e.g. storage VM/SVM/vserver, local tier/aggregate, CIFS/SMB, LIF/network interface) for OTHER operations that are the same operation. List their op_ids in duplicates_elsewhere.
 3. LABELS: is the name accurate and product-neutral (no hardware models, versions or interface names)? Are kind and category right?
Verdict: OK (all correct), MINOR (label issue only, or a borderline membership call), MAJOR (a wrong member that is clearly a different operation, or a clear duplicate elsewhere). Quote evidence in reason.
Return batch="${b.batch}" and one verdict per operation.`, { label: `audit:${b.batch}`, phase: 'Audit', schema: SCHEMA })))

const ok = results.filter(Boolean)
const all = ok.flatMap(r => r.verdicts)
const count = v => all.filter(x => x.verdict === v).length
return {
  batches: ok.length, audited: all.length, OK: count('OK'), MINOR: count('MINOR'), MAJOR: count('MAJOR'),
  wrong_member_ops: all.filter(x => !x.members_correct).length,
  missed_duplicate_ops: all.filter(x => x.duplicates_elsewhere.length).length,
}
