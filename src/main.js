const util = require('util')
const core = require('@actions/core')
const github = require('@actions/github')
const { minimatch } = require('minimatch')

const STATUS = {
  A: 'added',
  D: 'removed',
  M: 'modified',
  R: 'renamed',
  C: 'copied',
  T: 'changed',
  U: 'unchanged',
}

async function run () {
  core.group('github', () => core.info(util.inspect(github.context.payload, { depth: null })))

  const octokit = github.getOctokit(core.getInput('token'))
  const headRef = core.getInput('head-ref', { required: true }).replace('HEAD', github.ref_name)
  const baseRef = core.getInput('base-ref', { required: true }).replace('HEAD', github.ref_name)
  const filenamePatterns = core.getMultilineInput('filename-patterns')
  const statuses = core.getInput('status')
    .split('')
  const includeStatuses = statuses
    .filter(status => status === status.toUpperCase())
    .map(status => STATUS[status.toUpperCase()])
  const excludeStatuses = statuses
    .filter(status => status === status.toLowerCase())
    .map(status => STATUS[status.toUpperCase()])

  const { data: compare } = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
    ...github.context.repo,
    basehead: `${baseRef}...${headRef}`,
  })
  const files = compare.files
    .filter(({ filename }) => filenamePatterns.some(pattern => minimatch(filename, pattern)))
    .filter(({ status }) => includeStatuses.length === 0 || includeStatuses.includes(status))
    .filter(({ status }) => excludeStatuses.length === 0 || !excludeStatuses.includes(status))

  core.setOutput('changed-filenames', files.map(({ filename }) => filename))
  core.setOutput('json', compare)

  core.group('Output', () => core.info(util.inspect(compare)))
}

module.exports = {
  run
}