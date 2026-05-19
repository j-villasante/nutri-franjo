import Router from "koa-router";
import { requireAuth } from "../middleware/auth.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = new Router();

router.get("/", requireAuth, async (ctx) => {
  const htmlPath = join(__dirname, "../../public/index.html");
  const html = await readFile(htmlPath, "utf-8");

  ctx.type = "html";
  ctx.body = html;
});

export default router;
