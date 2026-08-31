# Repo-specific agent instructions

## Git workflow

- **Never commit directly to `main` or `prerelease`.** Always create a feature
  branch and open a pull request, even for small changes, even when the user
  approved the change itself — the _branch/PR requirement_ is a separate,
  standing rule that doesn't need to be re-confirmed per commit.
- Base new branches off `prerelease` (the repo's working main branch) unless
  told otherwise.
