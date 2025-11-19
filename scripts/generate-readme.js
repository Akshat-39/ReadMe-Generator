import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper: Recursively list all files in a directory
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

// Helper: Read file content (limit bytes)
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

// Helper: Get Git diff summary
function getGitDiff() {
  try {
    return execSync("git fetch origin main && git diff origin/main...HEAD --name-status", { encoding: "utf-8" });
  } catch {
    return "Could not get git diff.";
  }
}

function extractJson(text) {
  // Remove code fences like ```json ... ```
  return text
    .replace(/```json/i, '')
    .replace(/```/g, '')
    .trim();
}


// Main function
async function main() {
  const readmePath = path.join(process.cwd(), "README.md");
  const readmeExists = fs.existsSync(readmePath);
  let context = "";

  if (!readmeExists) {
    // --- FULL GENERATION MODE ---
    const allFiles = listFilesRecursively(".");
    
    // Ask Gemini which files it wants
    const fileSelectionPrompt = `
You are an AI that helps generate a README.md.
Given the following repository file list, pick up to 50 files you want to see the content of to best understand the project.
Respond ONLY with a JSON array of file paths from the list.

File list:
${allFiles.join("\n")}
    `;

    const selectionResult = await model.generateContent(fileSelectionPrompt);
    let selectedFiles = [];
    try {
      const cleaned = extractJson(selectionResult.response.text());
      selectedFiles = JSON.parse(cleaned);
      console.log(selectedFiles);
    } catch (err) {
      console.error("⛔ Gemini returned invalid JSON. Aborting.");
      console.error("Raw output:\n", selectionResult.response.text());
      process.exit(1);
    }

    // Read selected files
    const selectedFilesContent = selectedFiles.map(f => readFileContent(f)).join("\n");

    context = `
You are an expert technical writer creating a README.md for a software repository.
Repository key files (up to 50 chosen by AI):
${selectedFilesContent}

Output a clear, informative README.md describing the project, its purpose, setup, dependencies, and usage.
Output ONLY the README content.
`;
  } else {
    // --- UPDATE MODE ---
    const existingReadme = fs.readFileSync(readmePath, "utf-8");
    const gitDiff = getGitDiff();

    // Get changed files
    const changedFiles = gitDiff
      .split("\n")
      .map(line => line.trim().split(/\s+/)[1])
      .filter(Boolean)
      .slice(0, 50); // safety cap

    const changedFilesContent = changedFiles.map(f => readFileContent(f)).join("\n");

    context = `
You are an expert technical writer updating an existing README.md.
Existing README.md:
${existingReadme}

Recent code changes in this pull request:
${gitDiff}

Content of changed files:
${changedFilesContent}

Update the README.md to reflect the changes accurately.
Only modify relevant sections; do not rewrite unrelated sections.
Output ONLY the updated README content.
`;
  }

  // Generate README from Gemini
  const result = await model.generateContent(context);
  const readme = result.response.text();
  fs.writeFileSync(readmePath, readme);
  console.log("✅ README.md generated/updated successfully!");
}

main().catch(err => {
  console.error("❌ Failed to generate README:", err);
});
