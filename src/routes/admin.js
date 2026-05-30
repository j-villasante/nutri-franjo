import Router from "koa-router";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireMasterAdmin } from "../middleware/auth.js";

const router = new Router();

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function adminLayout(title, bodyContent, user) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} · Admin Nutri-Franjo</title>
  <style>
    :root {
      --bg: #141414;
      --surface: #1E1E1C;
      --cream: #F0EFE0;
      --accent: #6AAF82;
      --error: #D4605A;
      --warning: #E8A838;
      --border: #2E2E2B;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--cream);
      min-height: 100vh;
    }
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
    }
    .navbar .brand {
      font-weight: 700;
      font-size: 16px;
      color: var(--accent);
    }
    .navbar .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .navbar a {
      color: #C8C7B4;
      text-decoration: none;
      font-size: 14px;
    }
    .navbar a:hover { color: var(--cream); }
    .navbar .user {
      font-size: 13px;
      color: #8A8978;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--accent);
      color: #141414;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-danger {
      background: rgba(212, 96, 90, 0.15);
      color: var(--error);
      border: 1px solid rgba(212, 96, 90, 0.3);
    }
    .btn-danger:hover { background: rgba(212, 96, 90, 0.25); }
    .btn-secondary {
      background: #2E2E2B;
      color: var(--cream);
    }
    .btn-secondary:hover { background: #3E3E3A; }
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead th {
      text-align: left;
      padding: 12px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      color: #8A8978;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody td {
      padding: 14px 12px;
      border-bottom: 1px solid var(--border);
    }
    tbody tr:hover td {
      background: rgba(110, 175, 130, 0.05);
    }
    .tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .tag-master {
      background: rgba(106, 175, 130, 0.15);
      color: var(--accent);
    }
    .tag-user {
      background: rgba(240, 239, 224, 0.08);
      color: #8A8978;
    }
    .row-actions {
      display: flex;
      gap: 8px;
    }
    .row-actions a, .row-actions button {
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    .row-actions a.edit {
      background: #2E2E2B;
      color: var(--cream);
    }
    .row-actions a.edit:hover { background: #3E3E3A; }
    .row-actions button.delete {
      background: rgba(212, 96, 90, 0.1);
      color: var(--error);
    }
    .row-actions button.delete:hover { background: rgba(212, 96, 90, 0.2); }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      margin: 0 auto;
    }
    .card h1 {
      text-align: center;
      margin-bottom: 8px;
    }
    .card p.subtitle {
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
    input[type="text"], input[type="password"] {
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
    .error {
      background: rgba(212, 96, 90, 0.1);
      border: 1px solid var(--error);
      color: var(--error);
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .success {
      background: rgba(106, 175, 130, 0.1);
      border: 1px solid var(--accent);
      color: var(--accent);
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
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #8A8978;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 20px;
      color: #8A8978;
      text-decoration: none;
      font-size: 14px;
    }
    .back-link:hover { color: var(--cream); }
  </style>
</head>
<body>
  ${user ? `
  <nav class="navbar">
    <div class="brand">Nutri-Franjo Admin</div>
    <div class="nav-links">
      <a href="/admin">Usuarios</a>
      <span class="user">Master Admin</span>
      <a href="/admin/logout">Cerrar sesión</a>
    </div>
  </nav>` : ""}
  ${bodyContent}
</body>
</html>`;
}

/* ---------- LOGIN ---------- */
router.get("/admin/login", async (ctx) => {
  if (ctx.session.isMasterAdmin) {
    ctx.redirect("/admin");
    return;
  }
  ctx.type = "html";
  ctx.body = adminLayout(
    "Admin Login",
    `<div class="container" style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 0px);">
      <div class="card">
        <h1>Panel de Administración</h1>
        <p class="subtitle">Inicia sesión como master admin</p>
        ${ctx.query.error ? `<div class="error">${escapeHtml(ctx.query.error)}</div>` : ""}
        <form method="POST" action="/admin/login">
          <div class="form-group">
            <label for="password">Contraseña maestra</label>
            <input type="password" id="password" name="password" required autofocus>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Ingresar</button>
        </form>
        <p class="hint">La contraseña se configura en la variable MASTER_ADMIN_PASSWORD del .env</p>
      </div>
    </div>`,
    null
  );
});

router.post("/admin/login", async (ctx) => {
  const { password } = ctx.request.body || {};
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

  if (!masterPassword) {
    ctx.redirect("/admin/login?error=Master+password+not+configured");
    return;
  }

  if (!password) {
    ctx.redirect("/admin/login?error=Falta+la+contraseña");
    return;
  }

  if (password !== masterPassword) {
    ctx.redirect("/admin/login?error=Credenciales+inválidas");
    return;
  }

  ctx.session.isMasterAdmin = true;
  ctx.redirect("/admin");
});

router.get("/admin/logout", async (ctx) => {
  ctx.session.isMasterAdmin = null;
  ctx.redirect("/admin/login");
});

/* ---------- LIST USERS ---------- */
router.get("/admin", requireMasterAdmin, async (ctx) => {
  const allUsers = await db.select().from(users).orderBy(users.id);
  const msg = ctx.query.success ? `<div class="success">${escapeHtml(ctx.query.success)}</div>` : "";

  const rows = allUsers
    .map(
      (u) => `
    <tr>
      <td>${u.id}</td>
      <td>${escapeHtml(u.username)}</td>
      <td><span class="tag tag-user">Usuario</span></td>
      <td>${u.createdAt ? new Date(u.createdAt).toLocaleString("es-PE") : "—"}</td>
      <td>
        <div class="row-actions">
          <a class="edit" href="/admin/users/${u.id}/edit">Editar</a>
          <form method="POST" action="/admin/users/${u.id}/delete" onsubmit="return confirm('¿Eliminar a ${escapeHtml(u.username)}?')" style="display:inline;">
            <button type="submit" class="delete">Eliminar</button>
          </form>
        </div>
      </td>
    </tr>`
    )
    .join("");

  ctx.type = "html";
  ctx.body = adminLayout(
    "Usuarios",
    `<div class="container">
      ${msg}
      <div class="actions-bar">
        <h1>Usuarios</h1>
        <a href="/admin/users/create" class="btn btn-primary">+ Nuevo usuario</a>
      </div>
      ${allUsers.length === 0
        ? `<div class="empty-state">No hay usuarios registrados.</div>`
        : `<table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>`}
    </div>`,
    { name: "master" }
  );
});

/* ---------- CREATE USER ---------- */
router.get("/admin/users/create", requireMasterAdmin, async (ctx) => {
  ctx.type = "html";
  ctx.body = adminLayout(
    "Nuevo usuario",
    `<div class="container">
      <a href="/admin" class="back-link">← Volver a usuarios</a>
      <div class="card">
        <h1>Nuevo usuario</h1>
        ${ctx.query.error ? `<div class="error">${escapeHtml(ctx.query.error)}</div>` : ""}
        <form method="POST" action="/admin/users">
          <div class="form-group">
            <label for="username">Nombre de usuario</label>
            <input type="text" id="username" name="username" required autofocus>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required>
          </div>
          <div class="form-actions">
            <a href="/admin" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary">Crear usuario</button>
          </div>
        </form>
      </div>
    </div>`,
    { name: "master" }
  );
});

router.post("/admin/users", requireMasterAdmin, async (ctx) => {
  const { username, password } = ctx.request.body || {};

  if (!username || !password) {
    ctx.redirect("/admin/users/create?error=Faltan+campos");
    return;
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    ctx.redirect("/admin/users/create?error=Ese+usuario+ya+existe");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, passwordHash: hash });

  ctx.redirect("/admin?success=Usuario+creado");
});

/* ---------- EDIT USER ---------- */
router.get("/admin/users/:id/edit", requireMasterAdmin, async (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.redirect("/admin?error=ID+inválido");
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    ctx.redirect("/admin?error=Usuario+no+encontrado");
    return;
  }

  ctx.type = "html";
  ctx.body = adminLayout(
    "Editar usuario",
    `<div class="container">
      <a href="/admin" class="back-link">← Volver a usuarios</a>
      <div class="card">
        <h1>Editar usuario</h1>
        ${ctx.query.error ? `<div class="error">${escapeHtml(ctx.query.error)}</div>` : ""}
        <form method="POST" action="/admin/users/${user.id}/edit">
          <div class="form-group">
            <label for="username">Nombre de usuario</label>
            <input type="text" id="username" name="username" value="${escapeHtml(user.username)}" required autofocus>
          </div>
          <div class="form-group">
            <label for="password">Nueva contraseña <small style="color:#8A8978;font-weight:400;">(dejar en blanco para mantener la actual)</small></label>
            <input type="password" id="password" name="password">
          </div>
          <div class="form-actions">
            <a href="/admin" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>`,
    { name: "master" }
  );
});

router.post("/admin/users/:id/edit", requireMasterAdmin, async (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.redirect("/admin?error=ID+inválido");
    return;
  }

  const { username, password } = ctx.request.body || {};
  if (!username) {
    ctx.redirect(`/admin/users/${id}/edit?error=Falta+el+nombre+de+usuario`);
    return;
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing && existing.id !== id) {
    ctx.redirect(`/admin/users/${id}/edit?error=Ese+usuario+ya+existe`);
    return;
  }

  const updateData = { username };
  if (password && password.trim().length > 0) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  await db.update(users).set(updateData).where(eq(users.id, id));
  ctx.redirect("/admin?success=Usuario+actualizado");
});

/* ---------- DELETE USER ---------- */
router.post("/admin/users/:id/delete", requireMasterAdmin, async (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  if (isNaN(id)) {
    ctx.redirect("/admin?error=ID+inválido");
    return;
  }

  await db.delete(users).where(eq(users.id, id));
  ctx.redirect("/admin?success=Usuario+eliminado");
});

export default router;
