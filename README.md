# README Generator GitHub Action

[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An automated GitHub Action designed to streamline the generation and updating of your repository's `README.md` file. Leveraging a Large Language Model (LLM) API (specifically Google Gemini), this action ensures your project documentation remains comprehensive, up-to-date, and standardized, facilitating quick reference and efficient onboarding.

This tool is built to save developers time by automating a crucial, yet often overlooked, aspect of repository maintenance.

## ✨ Features

*   **Automated Content Generation**: Scans your repository's structure and recent changes to generate or update `README.md` content.
*   **LLM Integration**: Integrates with the Google Gemini LLM API to intelligently understand your project and craft relevant documentation.
*   **Intelligent Updates**: Only updates the `README.md` if significant changes (e.g., new features, breaking changes) are detected, preventing unnecessary commits.
*   **Pull Request Automation**: Automatically creates a Pull Request (PR) with the proposed `README.md` updates, allowing for easy review and approval.
*   **Full Generation Mode**: If no `README.md` exists, it will generate a complete, well-structured file with essential sections like Installation, Usage, and more.
*   **Reusable**: Designed as a generic GitHub Action, it can be easily integrated into any repository.

## 🚀 Getting Started

Follow these steps to integrate the README Generator into your GitHub repository.

### Prerequisites

*   **Node.js**: Version 20 or higher.
*   **Google Gemini API Key**: An API key from [Google AI Studio](https://aistudio.google.com/apikey).

### Installation

1.  **Copy Action Files**:
    *   Copy the workflow definition file `.github/workflows/generate-readme.yml` into your repository's `.github/workflows/` directory.
    *   Copy the generation script `scripts/generate-readme.js` into your repository's `scripts/` directory (create this directory if it does not exist).

2.  **Install Dependencies**:
    Your project's `package.json` will need `@google/generative-ai`. If it's not already there, add it or run:
    ```bash
    npm install @google/generative-ai
    ```

### Configuration

1.  **Set up GitHub Secret**:
    *   In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
    *   Click "New repository secret".
    *   Name the secret `GEMINI_API_KEY`.
    *   Paste your Google Gemini API key as the value.

## 💡 Usage

By default, the workflow is configured to be triggered manually via `workflow_dispatch`.

1.  **Trigger the Workflow**:
    *   Go to the **Actions** tab in your GitHub repository.
    *   Locate the workflow named "Generate README".
    *   Click the "Run workflow" button, typically found in a dropdown on the right side of the workflow's detail page.

2.  **Review the Pull Request**:
    *   Once the workflow completes, it will automatically create a new Pull Request titled "Auto-generate/update README" (authored by `github-actions[bot]`).
    *   Review the changes proposed to your `README.md` file.
    *   Merge the Pull Request to integrate the updated documentation into your default branch.

## ⚙️ Customization

You can tailor the action's behavior to better suit your project's needs:

*   **Workflow Trigger**: Modify `.github/workflows/generate-readme.yml` to change when the action runs (e.g., `on: [push]` to your main branch, or on `pull_request` events).
*   **LLM Model & Prompt**: Edit `scripts/generate-readme.js` to:
    *   Change the LLM model used (currently `gemini-2.5-flash`).
    *   Adjust the system prompts given to the LLM for README generation or updating.
    *   Modify the file scanning or content selection logic.

## 🚀 Example Workflow Configuration

Here's the full `generate-readme.yml` workflow example:

```yaml
name: Generate README
on:
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
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
        run: npm install @google/generative-ai # Ensure this matches your script's dependency
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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.