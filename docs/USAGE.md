# Automated README Generator GitHub Action

This action automates the generation and updating of a repository's `README.md` file using a Large Language Model (LLM) API (e.g., Gemini). It ensures your repository always has a comprehensive, up-to-date, and standardized README for quick reference and onboarding.

## Features
- Scans repository structure and recent changes
- Integrates with Gemini LLM via API key
- Updates or generates a well-structured `README.md` (with Installation, Usage, etc.)
- Only updates README if changes are relevant (e.g., new features, breaking changes)
- Automatically creates a Pull Request with the updated README
- Reusable across any repository

## Usage

### 1. Copy Files
- Copy `.github/workflows/generate-readme.yml` to your repo
- Copy `scripts/generate-readme.js` to your repo (create the `scripts/` folder if needed)

### 2. Install Dependencies
Add `@google/generative-ai` to your `package.json` or run:

```bash
npm install @google/generative-ai
```

### 3. Set Up Secrets
- Go to your repo's **Settings > Secrets and variables > Actions**
- Add a secret named `GEMINI_API_KEY` with your Gemini API key

### 4. Trigger the Workflow
- Go to the **Actions** tab and run the workflow manually (or modify the trigger to run on push/PR)

### 5. Customization
- Edit the workflow YAML or `generate-readme.js` to change the LLM model, prompt, or behavior

## Example Workflow
```yaml
name: Generate README
on:
  workflow_dispatch:
permissions:
  contents: write
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install @google/generative-ai
      - name: Generate README
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: node scripts/generate-readme.js
      - name: Commit README changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md
          git commit -m "Auto-generate/update README" || echo "No changes to commit"
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "Auto-generate/update README"
          title: "Auto-generate/update README"
          body: "This PR updates the README.md file using the automated action."
          branch: auto/readme-update-${{ github.run_id }}
          base: ${{ github.event.repository.default_branch }}
          delete-branch: true
```

## Tagging a Stable Version
- Once reviewed and approved, create a release/tag in GitHub (e.g., `v1.0.0`)

## License
MIT
