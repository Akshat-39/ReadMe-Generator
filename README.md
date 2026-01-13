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

### Configuration

1.  **Set up GitHub Secrets**:
    *   In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
    *   Click "New repository secret".
    *   Name the secret `GEMINI_API_KEY`.
    *   Paste your Google Gemini API key as the value.
    *   Create another repository secret called `PAT_FOR_ACTIONS`
    *   Paste your personal access token key as the value to allow for the action to create pull requests

## 💡 Usage

By default, the workflow is configured to be triggered manually via `workflow_dispatch`.

1.  **Trigger the Workflow**:
    *   Go to the **Actions** tab in your GitHub repository.
    *   Locate the workflow named "Generate README".
    *   Click the "Run workflow" button, typically found in a dropdown on the right side of the workflow's detail page.
    *   Change the drop down to match the name of the branch you are comparing main with.
    *   Specify the name of the branch you want to compare with main to update the readme in the text box.
    *   Click the "Run workflow" button.

2.  **Review the Pull Request**:
    *   Once the workflow completes, it will automatically create a new Pull Request titled "Auto-generate/update README" (authored by `github-actions[bot]`).
    *   Review the changes proposed to your `README.md` file.
    *   Merge the Pull Request to integrate the updated documentation into your default branch.

## ⚙️ Customization

You can tailor the action's behavior to better suit your project's needs:

*   **Workflow Trigger**: Modify `.github/workflows/generate-readme.yml` to change when the action runs (e.g., `on: [push]` to your main branch, or on `pull_request` events).
*   **LLM Model & Prompt**: View `scripts/generate-readme.js` to see:
    *   The LLM model used (currently `gemini-2.5-flash`).
    *   The system prompts given to the LLM for README generation or updating.
    *   The file scanning or content selection logic.

## 🚀 Example Workflow Configuration

Here's the full `generate-readme.yml` workflow example:

```yaml
name: Generate README
on:
  workflow_dispatch:
    inputs:
      branch:
        description: "Branch to compare with main"
        required: false
        default: ""

permissions:
  contents: write
  pull-requests: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      # 1️⃣ Checkout the current branch
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # full history is needed for git diff

      # 2️⃣ Run README Generator (Reusable Action)
      - name: Run README Generator
        uses: Akshat-39/ReadMe-Generator/.github/actions/generate-readme@v1.2.0 # update tag as needed
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          branch: ${{ github.ref_name }} # automatically pass the current branch

      # 3️⃣ Commit README changes if any
      - name: Commit README changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md
          git diff --cached --quiet || git commit -m "Auto-generate/update README"

      # 4️⃣ Create Pull Request targeting main
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.PAT_FOR_ACTIONS }}
          commit-message: "Auto-generate/update README"
          title: "Auto-generate/update README"
          body: "This PR updates the README.md file using the automated action."
          branch: auto/readme-update-${{ github.run_id }}
          base: ${{ github.event.inputs.branch || github.ref_name }}
          delete-branch: true
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.