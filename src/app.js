import "dotenv/config";
import Koa from "koa";
import serve from "koa-static";
import bodyParser from "koa-bodyparser";
import session from "koa-session";
import router from "./routes/index.js";
import authRouter from "./routes/auth.js";

const app = new Koa();

app.keys = [process.env.SESSION_SECRET || "fallback-secret"];

const sessionConfig = {
  key: "nutri.sess",
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
};

app.use(session(sessionConfig, app));
app.use(bodyParser());
app.use(serve("public", { index: false }));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = err.status || 500;
    ctx.body = { error: err.message || "Internal Server Error" };
  }
});

app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
