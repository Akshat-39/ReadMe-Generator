import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Read repo files
const files = fs.readdirSync(".");
const context = `Repository files:\n${files.join("\n")}\n\nGenerate a README.md describing this project clearly.`;

// Generate README
async function main() {
  const result = await model.generateContent(context);
  const readme = result.response.text();
  fs.writeFileSync("README.md", readme);
  console.log("README.md generated successfully!");
}

main().catch(console.error);
