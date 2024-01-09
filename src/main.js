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
  const octokit = github.getOctokit(core.getInput('token'))
  const {
    GITHUB_REF_NAME: refName
  } = process.env
  const headRef = core.getInput('head-ref', { required: true }).replace('HEAD', refName)
  const baseRef = core.getInput('base-ref', { required: true }).replace('HEAD', refName)
  const filenamePatterns = core.getMultilineInput('filename-pattern')
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

  const changedFilenames = compare.files
    .filter(({ filename }) => filenamePatterns.length === 0 || filenamePatterns.some(pattern => minimatch(filename, pattern)))
    .filter(({ status }) => includeStatuses.length === 0 || includeStatuses.includes(status))
    .filter(({ status }) => excludeStatuses.length === 0 || !excludeStatuses.includes(status))
    .map(({ filename }) => filename)

  core.setOutput('changed-filenames', changedFilenames)
  core.setOutput('json', compare)

  core.group('Output - changed-filenames', () => core.info(util.inspect(changedFilenames)))
  core.group('Output - json', () => core.info(util.inspect(compare)))
}

module.exports = {
  run
}