import https from "https";
import fs from "fs";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

if (env.TLS_CERT_PATH && env.TLS_KEY_PATH) {
  const options = {
    cert: fs.readFileSync(env.TLS_CERT_PATH),
    key: fs.readFileSync(env.TLS_KEY_PATH),
  };
  https.createServer(options, app).listen(env.PORT, () => {
    console.log(`Server listening on https://localhost:${env.PORT}`);
  });
} else {
  // Fallback for test/CI environments without TLS certs
  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT} (no TLS)`);
  });
}
