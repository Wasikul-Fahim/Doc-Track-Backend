import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import apiRoutes from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser clients (curl, health checks) with no Origin header.
        if (!origin) return callback(null, true);

        if (env.isProduction) {
          return callback(null, origin === env.CLIENT_ORIGIN);
        }

        // In development accept localhost, loopback and LAN IPs on any port so
        // the app works whether opened via localhost, 127.0.0.1 or the LAN IP.
        const devOrigin =
          /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))(?:\.\d{1,3}){2,3})(:\d+)?$/;
        return callback(
          null,
          origin === env.CLIENT_ORIGIN || devOrigin.test(origin)
        );
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/api/v1", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
