# readme-generator

![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini-blueviolet?logo=google-gemini)
[![Generate README](https://github.com/your-username/readme-generator/actions/workflows/generate-readme.yml/badge.svg)](https://github.com/your-username/readme-generator/actions/workflows/generate-readme.yml)

An automated `README.md` generator powered by Google's Gemini AI, designed to keep your project documentation up-to-date with minimal effort. This project analyzes the repository's files and context to create a comprehensive and accurate `README.md` that covers purpose, setup, dependencies, and usage.

## ✨ Features

- **AI-Powered Content Generation:** Leverages the Gemini API to intelligently understand your project and craft relevant documentation.
- **Automated Updates:** Integrates seamlessly with GitHub Actions to automatically generate and update your `README.md`.
- **Contextual Analysis:** Scans key project files (e.g., `package.json`, workflow files, scripts) to gather essential information.
- **Pull Request Integration:** Automatically creates a pull request with the updated `README.md`, allowing for review before merging.
- **Node.js Based:** Built with Node.js, making it easy to run and extend.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** Version 20 or higher is recommended.  
  [Download Node.js](https://nodejs.org/en/download/)
- **Google Gemini API Key:** You'll need an API key to interact with the Gemini generative AI model.  
  [Get an API key for Google Gemini](https://ai.google.dev/gemini-api/docs/get-started/node)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/readme-generator.git
   cd readme-generator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Configuration

Set your Gemini API key as an environment variable.

For **local development and testing**:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
# On Windows (Command Prompt): set GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
# On Windows (PowerShell): $env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

For **GitHub Actions automation**:

You must add your `GEMINI_API_KEY` as a repository secret in your GitHub repository.
1. Go to your repository on GitHub.
2. Navigate to `Settings` > `Secrets and variables` > `Actions`.
3. Click `New repository secret`.
4. Name the secret `GEMINI_API_KEY` and paste your Gemini API key as the value.

## 💡 Usage

### Manually Generating `README.md` Locally

You can run the generation script directly on your machine to update the `README.md`:

```bash
node scripts/generate-readme.js
```

**Note:** Ensure `GEMINI_API_KEY` is set as an environment variable before running. This command will overwrite the `README.md` file in your project root.

### Automated Generation via GitHub Actions

This repository includes a GitHub Actions workflow (`.github/workflows/generate-readme.yml`) that automates the README generation process.

1. **Trigger the Workflow:**
   - Navigate to the "Actions" tab in your GitHub repository.
   - Find the workflow named "Generate README" in the left sidebar.
   - Click "Run workflow" and then confirm by clicking "Run workflow" again.

2. **Review the Pull Request:**
   - The workflow will execute the `generate-readme.js` script.
   - If changes are detected, it will automatically create a new pull request titled "Auto-generate/update README".
   - Review the proposed changes in the pull request and merge it to update your `README.md`.

## 📂 Project Structure

- `package.json`: Defines project metadata, scripts, and dependencies.
- `testAPIKey.js`: A simple script for testing the Gemini API key (specified as the `main` entry point).
- `scripts/generate-readme.js`: The core Node.js script responsible for calling the Gemini API and generating the `README.md` content.
- `.github/workflows/generate-readme.yml`: The GitHub Actions workflow that automates the `README.md` generation and pull request creation.

## 📦 Dependencies

This project relies on the following key dependencies:

- `@google/genai`: Google's official client library for interacting with the Gemini API.
- `@google/generative-ai`: Another official client library for Google Generative AI (likely used for specific model versions or features).
- `node-fetch`: A lightweight module that brings the `window.fetch` API to Node.js.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improving this README generator or want to add new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if available, otherwise assume standard open-source licensing).