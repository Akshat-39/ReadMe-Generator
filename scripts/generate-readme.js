import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "child_process";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Read repo files
const files = fs.readdirSync(".");

// Read existing README.md if it exists
let existingReadme = "";
const readmePath = path.join(process.cwd(), "README.md");
if (fs.existsSync(readmePath)) {
  existingReadme = fs.readFileSync(readmePath, "utf-8");
}

// Get git diff summary between current branch and main
let diffSummary = "";
try {
  diffSummary = execSync("git diff origin/main...HEAD --name-status", { encoding: "utf-8" });
} catch (e) {
  diffSummary = "Could not get git diff.";
}

// Get full diff details between current branch and main
let diffDetails = "";
try {
  diffDetails = execSync("git diff origin/main...HEAD", { encoding: "utf-8" });
} catch (e) {
  diffDetails = "Could not get git diff details.";
}

const context = `Repository files:\n${files.join("\n")}\n\nCurrent README.md (if any):\n${existingReadme}\n\nRecent changes on this branch (vs main):\n${diffSummary}\n\nDetailed diff:\n${diffDetails}\n\nUpdate the README.md ONLY IF the changes are relevant (e.g., new features, breaking changes, or documentation updates). If not, leave the README.md unchanged. Ensure the README is accurate and up-to-date.`;

console.log(context);

// Generate README
async function main() {
  const result = await model.generateContent(context);
  const readme = result.response.text();
  fs.writeFileSync("README.md", readme);
  console.log("README.md generated successfully!");
}

main().catch(console.error);
