import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { seedDemoStore } from "./data/memory.js";

const port = Number(process.env.PORT) || 5000;

async function start() {
  const mode = await connectDatabase();
  if (mode === "memory") await seedDemoStore();
  app.listen(port, () => console.info(`[finora] API ready at http://localhost:${port}/api`));
}

start().catch((error) => {
  console.error("[finora] Failed to start:", error.message);
  process.exitCode = 1;
});

