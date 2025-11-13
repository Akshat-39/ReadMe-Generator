```markdown
# readme-generator

## 🚀 Overview

The `readme-generator` is an innovative tool designed to **automatically generate or update your repository's `README.md` file using Artificial Intelligence**. This project leverages the Google Gemini API to intelligently analyze your repository's key files, existing `README` content, and recent code changes to produce a clear, comprehensive, and up-to-date documentation.

Implemented as a GitHub Action, `readme-generator` allows for seamless integration into your CI/CD pipeline, enabling automated README maintenance with every significant update to your codebase. It ensures your documentation always reflects the current state and purpose of your project without manual effort.

## ✨ Features

*   **AI-Powered Documentation**: Utilizes the Google Gemini API (specifically `gemini-2.5-flash`) to generate high-quality README content.
*   **Contextual Analysis**: Analyzes `package.json`, workflow files, scripts, and other crucial project files to understand the repository's purpose and structure.
*   **Existing README Integration**: Incorporates the content of an existing `README.md` to ensure updates are additive and relevant, not just replacements.
*   **Change-Aware Generation**: Considers recent Git changes (via `git diff`) to provide the AI with context about what might have been updated or added, leading to more accurate documentation.
*   **GitHub Action Integration**: Designed to run as a GitHub Action, simplifying deployment and automation.
*   **Automated Pull Requests**: Automatically creates a pull request with the generated README updates, allowing for review before merging.
*   **Manual Triggering**: Can be triggered manually via `workflow_dispatch` for on-demand README generation.

## 🛠️ How It Works

The core logic resides in `scripts/generate-readme.js` and is orchestrated by the `.github/workflows/generate-readme.yml` GitHub Action.

1.  **Trigger**: The action is currently configured to be triggered manually via `workflow_dispatch`.
2.  **File Analysis**: The `generate-readme.js` script identifies and reads content from important repository files (e.g., `package.json`, `.github/workflows/`, `scripts/`). It can also take an explicit list of files via an environment variable.
3.  **Context Building**: It compiles this file content, the existing `README.md` (if any), and a summary of recent Git changes into a comprehensive prompt for the AI.
4.  **AI Generation**: The prompt is sent to the Google Gemini API, which then generates the new or updated `README.md` content.
5.  **Update & Commit**: The generated content overwrites `README.md`. If changes occurred, a commit is made by the `github-actions[bot]`.
6.  **Pull Request**: A new branch is created, and a pull request is opened to propose the README updates, attributed to `github-actions[bot]`.

## 🚀 Getting Started

This project is primarily intended to be used as a GitHub Action within *your* repository.

### Prerequisites

*   A GitHub repository.
*   A Google Cloud project with the Gemini API enabled and an API Key.
*   Node.js (version 20 or higher) for local development or testing.

### Setup as a GitHub Action

1.  **Add `generate-readme.js` to your repository**:
    Place the `scripts/generate-readme.js` file into a `scripts/` directory in your repository's root.
    ```bash
    mkdir -p scripts
    # Copy generate-readme.js into scripts/
    ```

2.  **Create a GitHub Workflow**:
    Create a new file `.github/workflows/generate-readme.yml` with the following content:

    ```yaml
    name: Generate README

    on:
      workflow_dispatch: # allows manual triggering

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
            run: npm install @google/generative-ai # Installs necessary AI SDK

          - name: Generate README
            env:
              GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }} # Inject API key from secrets
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

3.  **Add your Gemini API Key as a GitHub Secret**:
    *   Go to your repository settings on GitHub.
    *   Navigate to "Secrets and variables" -> "Actions".
    *   Click "New repository secret".
    *   Name it `GEMINI_API_KEY` and paste your Google Gemini API key as the value.

### Usage

#### Manually Triggering the Action

1.  Navigate to the "Actions" tab in your GitHub repository.
2.  Find the "Generate README" workflow in the left sidebar.
3.  Click on "Run workflow" and then "Run workflow" again to trigger it.

The workflow will run, and if changes are detected, it will create a new pull request titled "Auto-generate/update README" with the proposed updates to your `README.md`.

#### Development / Local Testing

To run the generator script locally (e.g., for development or debugging):

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/readme-generator.git
    cd readme-generator
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set your API Key**:
    Export your Gemini API key as an environment variable:
    ```bash
    export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *(Replace `YOUR_GEMINI_API_KEY` with your actual key.)*
4.  **Run the script**:
    ```bash
    node scripts/generate-readme.js
    ```
    This will generate/update a `README.md` file in your current directory.

## ⚙️ Configuration (for `generate-readme.js`)

The `generate-readme.js` script can be customized using environment variables passed to the action step:

*   **`INPUT_IMPORTANT_FILES`**: (Optional) A comma-separated list of files or directories to specifically include in the context provided to the AI. If not provided, the script will automatically detect common project files like `package.json`, `.github/workflows/`, and `scripts/`.
    *   *Example in workflow `env` block*:
        ```yaml
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          INPUT_IMPORTANT_FILES: "src/,package.json,docs/"
        ```

## 📦 Dependencies

The project relies on the following Node.js packages, as specified in `package.json`:

*   `@google/genai`: A Google Generative AI client library.
*   `@google/generative-ai`: Google's official client library for the Gemini API.
*   `node-fetch`: A light-weight module that brings the `window.fetch` API to Node.js.

The workflow explicitly installs `@google/generative-ai`.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improving the README generation logic, adding new features, or fixing bugs, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
```