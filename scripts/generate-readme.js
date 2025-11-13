import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function detectImportantFiles() {
  const candidates = [
    "package.json", "requirements.txt", "pyproject.toml", "setup.py",
    "Cargo.toml", "go.mod", "composer.json",
    "Makefile", "Dockerfile", "README.md",
    ".github/workflows/", "scripts/"
  ];
  return candidates.filter(f => fs.existsSync(f));
}

function readFileContent(filePath, maxBytes = 3000) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath).slice(0, 5);
      return files.map(f => readFileContent(`${filePath}/${f}`, maxBytes)).join("\n");
    } else if (stats.isFile()) {
      const content = fs.readFileSync(filePath, "utf-8");
      return `File: ${filePath}\n${content.slice(0, maxBytes)}\n---\n`;
    }
  } catch {
    return `File: ${filePath} (unreadable)\n`;
  }
  return "";
}

// Inputs
const inputFiles = process.env.INPUT_IMPORTANT_FILES
  ? process.env.INPUT_IMPORTANT_FILES.split(",").map(f => f.trim()).filter(Boolean)
  : [];
const importantFiles = inputFiles.length > 0 ? inputFiles : detectImportantFiles();
const importantFilesContent = importantFiles.map(f => readFileContent(f)).join("\n");

// Existing README
const readmePath = path.join(process.cwd(), "README.md");
const existingReadme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";

// Git diff summary
let diffSummary = "";
try {
  diffSummary = execSync("git diff origin/main...HEAD --name-status", { encoding: "utf-8" });
} catch {
  diffSummary = "Could not get git diff.";
}

const context = `
You are an expert technical writer creating or updating a README.md for a software repository.

Repository key files:
${importantFilesContent}

Existing README.md (if any):
${existingReadme}

Recent code changes:
${diffSummary}

Output a clear, informative README.md that accurately describes the project.
Focus on its purpose, setup, dependencies, and usage. Output only the README content.
`;

async function main() {
  const result = await model.generateContent(context);
  const readme = result.response.text();
  fs.writeFileSync("README.md", readme);
  console.log("✅ README.md generated successfully!");
}

main().catch(console.error);
