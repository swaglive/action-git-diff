# action-git-diff

## Usage

## Inputs 📥

| Input | Required? | Default | Description |
| ----- | --------- | ------- | ----------- |
| `head-ref` | no | `HEAD` | head ref to use for the git diff |
| `base-ref` | no | `HEAD~1` | base ref to use for the git diff |
| `default-branch` | no | `${{ github.ref_name }}` | Branch to use when `HEAD` is referenced |
| `status` | no | `d` | Change status of the files to filter by. See https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203  |
| `filename-pattern` | no | `**/*` | Filename globs to filter by |
| `token` | no | `${{ github.token }}` | Github token to use |

## Outputs 📤

| Output | Description |
| ------ | ----------- |
| `filenames` | List of changed filenames in JSON format |
| `json` | Raw data of the comparison in JSON |

### Example

#### Using the action for Pushes / PRs
```
    steps:
    - name: Generate Changed Filenames
      uses: swaglive/action-git-diff@main
      with:
        head-ref: ${{ github.event.pull_request.head.sha || github.event.after || 'HEAD' }}
        base-ref: ${{ github.event.pull_request.base.sha || github.event.before || 'HEAD~1' }}
        filename-pattern: |-
          **/*.js
```
