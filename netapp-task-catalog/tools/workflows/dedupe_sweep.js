export const meta = {
  name: 'netapp-ops-sweep',
  description: 'Semantic duplicate sweep: each agent checks a shard of operations against its whole domain list, then a judge rules on every proposed merge',
  whenToUse: 'Final recall pass of de-duplicating the NetApp task catalog',
  phases: [
    { title: 'Sweep', detail: 'search the domain list for duplicates of each operation in the shard' },
    { title: 'Judge', detail: 'accept, trim or reject each proposed merge' },
  ],
}

const RULES = `An OPERATION is one intended outcome on one kind of object in one product domain.
SAME operation (merge) when two operations differ only in: documentation site, hardware model/platform, software or host OS version, interface (GUI vs CLI vs REST API vs automation), wording or synonyms ("Add" vs "Create"; "View" vs "List" vs "Retrieve"; storage VM = SVM = vserver; local tier = aggregate; CIFS = SMB; LIF = network interface), REST query filters/returned fields, or the purpose/context the docs mention (e.g. installing a server-ca certificate "for the object store" is still installing a trusted CA certificate).
DIFFERENT operations (keep apart) when the resulting state or object type differs (FlexVol vs FlexGroup vs FlexCache; SnapMirror asynchronous vs active sync; admin group vs tenant group; an inactive vs an enabled key manager), when the action differs (create vs modify vs delete vs view; enable vs disable), or when one is an end-to-end workflow that contains the other as a step. A generic "Create a volume" and "Create a FlexVol volume" are the same when FlexVol is the default volume being created.`

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
const SWEEP_SCHEMA = {
  type: 'object',
  properties: { window: { type: 'string' }, groups: { type: 'array', items: GROUP } },
  required: ['window', 'groups'],
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
          keep_uids: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
        },
        required: ['id', 'accept', 'keep_uids', 'reason'],
      },
    },
  },
  required: ['window', 'decisions'],
}

async function sweep(s) {
  return agent(`You are finding DUPLICATE operations in a catalog built from NetApp product documentation (for an evaluation of an AI agent that operates NetApp storage). Earlier passes merged duplicates found by word overlap; you are looking for the ones they missed, including ones worded differently.
${RULES}

Your shard: ${s.file} (${s.n} operations of domain "${s.domain}"; columns uid, name, action, object, kind, number of documented tasks, example task titles). The whole domain (${s.domain_ops} operations) is in ${s.domain_file}.
For EACH operation in your shard, search the domain file with Grep for other operations that are the same operation: try the object's key words, their synonyms and stems, and the command or REST resource names in the example titles. Look at candidates' example titles before deciding.
Return merge GROUPS (ids "G1", ...): each lists 2+ uids that are the same operation (at least one from your shard), with the name/action/object/kind/category/description the merged operation should have (kind: configure|query|workflow|lifecycle|hardware|recovery|step|not_a_task; category: keep the vocabulary of the catalog; name imperative and product-neutral). Quote the evidence in reason. Be precise: shared words are not enough. An empty list is a valid answer.
Return window="${s.window}".`, { label: `reconcile:${s.window}`, phase: 'Sweep', schema: SWEEP_SCHEMA })
}

async function judge(p, s) {
  if (!p) return null
  if (!p.groups.length) return { window: s.window, proposed: 0, accepted: 0 }
  const lines = p.groups.map(g => `${g.id} ${g.uids.join(', ')} as "${g.name}" (${g.action} / ${g.object} / ${g.kind}) — ${g.reason}`).join('\n')
  const res = await agent(`You are the JUDGE for proposed merges of duplicate operations in a catalog built from NetApp product documentation.
${RULES}

The operations are listed in ${s.domain_file} (Grep it by uid to see their names and example task titles). Decide each proposal strictly: accept only if the operations are clearly the same operation; for a group where only some members belong together, accept with keep_uids listing those (at least 2); otherwise keep_uids = []. Reject merges of different outcomes, object types, actions, or of a step with the workflow that contains it.

PROPOSALS:
${lines}

Return one decision per proposal id, with window="${s.window}".`, { label: `judge:${s.window}`, phase: 'Judge', schema: JUDGE_SCHEMA })
  return { window: s.window, proposed: p.groups.length, accepted: res ? res.decisions.filter(d => d.accept).length : 0 }
}

const results = await pipeline(args.shards, sweep, judge)
const ok = results.filter(Boolean)
return {
  shards: ok.length,
  failed: args.shards.filter((s, i) => !results[i]).map(s => s.window),
  proposed: ok.reduce((a, r) => a + r.proposed, 0),
  accepted: ok.reduce((a, r) => a + r.accepted, 0),
}
