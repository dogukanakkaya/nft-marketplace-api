import { Application, Router } from "oak";
import nfts from "./nfts.json" assert { type: "json" };

const router = new Router();

router.get("/nfts", (ctx) => {
  ctx.response.body = nfts.map(nft => ({ ...nft, image: `${ctx.request.url.origin}/${nft.image}` }));
});

const app = new Application();
app.use(async (context, next) => {
  try {
    await context.send({ root: `${Deno.cwd()}/static` });
  } catch {
    await next();
  }
});
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });