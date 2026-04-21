import "dotenv/config";
import * as readline from "node:readline";

export function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

export async function confirmDatabase(context: string): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || "unknown";
  const masked = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");

  console.log(`🔌 Database: ${masked}`);
  console.log(`📋 Action:   ${context}\n`);

  const confirmed = await confirm("Continue? (y/N) ");
  if (!confirmed) {
    console.log("Aborted.");
    process.exit(0);
  }
  console.log();
}