import { DecodedToken } from "../middlewares/auth.middleware";

declare module "express" {
  interface Request {
    user?: DecodedToken;
  }
}
