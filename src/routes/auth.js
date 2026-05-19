import Router from "koa-router";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = new Router();

router.get("/login", async (ctx) => {
  if (ctx.session.userId) {
    ctx.redirect("/");
    return;
  }
  ctx.type = "html";
  ctx.body = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión · Nutri-Franjo</title>
  <style>
    :root {
      --bg: #141414;
      --surface: #1E1E1C;
      --cream: #F0EFE0;
      --accent: #6AAF82;
      --error: #D4605A;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: var(--surface);
      border: 1px solid #2E2E2B;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      text-align: center;
    }
    p.subtitle {
      color: #8A8978;
      text-align: center;
      margin-bottom: 28px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 13px;
      margin-bottom: 6px;
      color: #C8C7B4;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #3E3E3A;
      border-radius: 10px;
      background: #141414;
      color: var(--cream);
      font-size: 15px;
      outline: none;
    }
    input:focus {
      border-color: var(--accent);
    }
    button {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 10px;
      background: var(--accent);
      color: #141414;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
    }
    button:hover {
      opacity: 0.9;
    }
    .error {
      background: rgba(212, 96, 90, 0.1);
      border: 1px solid var(--error);
      color: var(--error);
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .hint {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #4A4A40;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Nutri-Franjo</h1>
    <p class="subtitle">Inicia sesión para ver la guía</p>
    ${ctx.query.error ? `<div class="error">${escapeHtml(ctx.query.error)}</div>` : ""}
    <form method="POST" action="/login">
      <div class="form-group">
        <label for="username">Usuario</label>
        <input type="text" id="username" name="username" required autofocus>
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit">Ingresar</button>
    </form>
    <p class="hint">Usuario por defecto: admin / admin123</p>
  </div>
</body>
</html>`;
});

router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body || {};
  if (!username || !password) {
    ctx.redirect("/login?error=Faltan+campos");
    return;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    ctx.redirect("/login?error=Credenciales+inválidas");
    return;
  }

  ctx.session.userId = user.id;
  ctx.session.username = user.username;
  ctx.redirect("/");
});

router.get("/logout", async (ctx) => {
  ctx.session = null;
  ctx.redirect("/login");
});

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default router;
