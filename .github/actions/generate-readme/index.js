import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as core from "@actions/core";

// --- Get inputs ---
const apiKey = core.getInput("gemini_api_key");
if (!apiKey) {
  core.setFailed("❌ gemini_api_key input is required");
  process.exit(1);
}

// Optional input: branch name
const inputBranch = core.getInput("branch");
const currentBranch = inputBranch || process.env.GITHUB_REF_NAME || "HEAD";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- Helpers ---
function listFilesRecursively(dir, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const relPath = path.join(prefix, entry);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...listFilesRecursively(fullPath, relPath));
    } else if (stats.isFile()) {
      files.push(relPath);
    }
  }
  return files;
}

function readFileContent(filePath, maxBytes = 5000) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return "";
    const content = fs.readFileSync(filePath, "utf-8");
    return `FILE: ${filePath}\n${content.slice(0, maxBytes)}\n---\n`;
  } catch {
    return `FILE: ${filePath} (unreadable)\n`;
  }
}

function extractJson(text) {
  return text.replace(/```json/i, "").replace(/```/g, "").trim();
}

// --- Git diff against main ---
function getGitDiff(branch) {
  try {
    execSync("git fetch origin main", { stdio: "ignore" });
    const mergeBase = execSync(`git merge-base origin/main ${branch}`, { encoding: "utf-8" }).trim();
    console.log("Merge base:", mergeBase);
    if (!mergeBase) return "";
    return execSync(`git diff ${mergeBase}...${branch} --name-status`, { encoding: "utf-8" });
  } catch {
    return "";
  }
}

// --- Main ---
async function main() {
  const readmePath = path.join(process.cwd(), "README.md");
  const readmeExists = fs.existsSync(readmePath);
  let context = "";

  if (!readmeExists) {
    // FULL GENERATION MODE
    const allFiles = listFilesRecursively(".");
    const fileSelectionPrompt = `
You are an AI that generates README.md.
Given the repository file list below, select up to 50 files you want to see to understand the project.
Respond ONLY with a JSON array of file paths from the list.

File list:
${allFiles.join("\n")}
`;

    const selectionResult = await model.generateContent(fileSelectionPrompt);

    let selectedFiles;
    try {
      selectedFiles = JSON.parse(extractJson(selectionResult.response.text()));
      if (!Array.isArray(selectedFiles)) throw new Error("Not an array");
    } catch (err) {
      core.setFailed("⛔ Gemini returned invalid JSON during file selection. Aborting.");
      console.error("Raw output:\n", selectionResult.response.text());
      process.exit(1);
    }

    const selectedFilesContent = selectedFiles.map(f => readFileContent(f)).join("\n");

    context = `
You are an expert technical writer creating a README.md for a software repository.
Repository key files (up to 50 chosen by AI):
${selectedFilesContent}

Output a clear, informative README.md describing the project, its purpose, setup, dependencies, and usage.
Output ONLY the README content.
Do not wrap the output in code fences.
`;
  } else {
    // UPDATE MODE
    const existingReadme = fs.readFileSync(readmePath, "utf-8");
    console.log("Current branch for diff:", currentBranch);
    const gitDiff = getGitDiff(currentBranch);

    if (!gitDiff.trim()) {
      console.log("No code changes detected. README.md remains unchanged.");
      return;
    }

    const changedFiles = gitDiff
      .split("\n")
      .map(line => line.trim().split(/\s+/)[1])
      .filter(Boolean)
      .slice(0, 50);

    const changedFilesContent = changedFiles.map(f => readFileContent(f)).join("\n");

    context = `
You are an expert technical writer updating an existing README.md.
Existing README.md:
${existingReadme}

Recent code changes (branch: ${currentBranch} vs main):
${gitDiff}

Content of changed files:
${changedFilesContent}

Update the README.md to reflect the changes accurately.
Only modify relevant sections; do not rewrite unrelated sections.
Output ONLY the updated README content.
Do not wrap the output in code fences.
If there are no relevant changes, return the existing README unchanged.
`;
  }

  const result = await model.generateContent(context);
  const readme = result.response.text().trim();

  fs.writeFileSync(readmePath, readme);
  console.log("prompt submitted to Gemini:", context);
  console.log("✅ README.md generated/updated successfully!");
}

main().catch(err => {
  core.setFailed(`❌ Failed to generate README: ${err.message}`);
});
