import jwt from "jsonwebtoken";
import { findUserById } from "../services/repository.js";

export async function authMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || "finora-local-development-secret");
    const user = await findUserById(payload.sub);
    if (!user) {
      const error = new Error("Your session is no longer valid.");
      error.statusCode = 401;
      throw error;
    }
    req.user = user;
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    next(error);
  }
}

