export async function requireAuth(ctx, next) {
  if (ctx.session && ctx.session.userId) {
    return next();
  }
  if (ctx.accepts("html")) {
    ctx.redirect("/login");
  } else {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
  }
}

export async function requireMasterAdmin(ctx, next) {
  if (ctx.session && ctx.session.isMasterAdmin) {
    return next();
  }
  if (ctx.accepts("html")) {
    ctx.redirect("/admin/login");
  } else {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
  }
}
