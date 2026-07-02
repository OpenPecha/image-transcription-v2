/**
 * Probe group + per-user contribution endpoints and print response shapes.
 * Usage: node scripts/check-contributions-api.mjs [baseUrl] [groupId] [start] [end]
 */

const baseUrl = process.argv[2] ?? 'http://localhost:8000'
const groupId = process.argv[3] ?? 'SFbLBDcZlx0TFVOpCAED4'
const startDate = process.argv[4] ?? '2026-06-01'
const endDate = process.argv[5] ?? '2026-06-24'
const app = 'imagetranscriptionv2'

function collectKeys(value, prefix = '', out = new Set()) {
  if (value == null || typeof value !== 'object') return out
  if (Array.isArray(value)) {
    if (value.length > 0) collectKeys(value[0], prefix ? `${prefix}[]` : '[]', out)
    return out
  }
  for (const [k, v] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${k}` : k
    out.add(path)
    if (v != null && typeof v === 'object') collectKeys(v, path, out)
  }
  return out
}

async function fetchJson(url) {
  const res = await fetch(url)
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    throw new Error(`${res.status} ${url}\n${text.slice(0, 200)}`)
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url}\n${JSON.stringify(body, null, 2)}`)
  }
  return body
}

function pickActiveUser(rows, role) {
  return rows.find((row) => {
    if (role === 'annotator') return (row.tasks_annotated ?? row.total_count ?? 0) > 0
    if (role === 'reviewer') return (row.tasks_reviewed ?? row.total_count ?? 0) > 0
    if (role === 'final_reviewer') return (row.tasks_finalised ?? row.total_count ?? 0) > 0
    return false
  })
}

async function main() {
  const groupUrl = `${baseUrl}/contributions/${app}/${groupId}/summary?start_date=${startDate}&end_date=${endDate}`
  console.log('GET', groupUrl)

  const group = await fetchJson(groupUrl)
  console.log('\n=== Group summary top-level keys ===')
  console.log([...collectKeys(group)].sort().join('\n'))

  for (const role of ['annotator', 'reviewer', 'final_reviewer']) {
    const rows = group[role] ?? []
    console.log(`\n=== ${role} (${rows.length} rows) ===`)
    if (rows.length === 0) {
      console.log('(empty)')
      continue
    }
    console.log('Row keys:', [...collectKeys(rows[0])].sort().join(', '))
    console.log(
      'Users:',
      rows.map((r) => `${r.username} (${r.user_id})`).join(', ')
    )

    const sample = pickActiveUser(rows, role)
    if (!sample) {
      console.log('No active user to sample for user contributions')
      continue
    }

    const userUrl = `${baseUrl}/tasks/${app}/${sample.user_id}/contributions?start_date=${startDate}&end_date=${endDate}`
    console.log('\nGET', userUrl)
    try {
      const userReport = await fetchJson(userUrl)
      console.log('User report top-level keys:', [...collectKeys(userReport)].sort().join(', '))
      if (userReport.tasks?.[0]) {
        console.log('Task row keys:', [...collectKeys(userReport.tasks[0])].sort().join(', '))
      }
      if (userReport.contribution_summary) {
        const summaryRole =
          role === 'final_reviewer' ? 'final_reviewer' : role
        const summary = userReport.contribution_summary[summaryRole]
        if (summary) {
          console.log(`${summaryRole} summary keys:`, Object.keys(summary).sort().join(', '))
        }
      }
    } catch (err) {
      console.error('User contributions failed:', err.message)
    }
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
