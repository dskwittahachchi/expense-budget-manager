import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { categoryTemplates } from "../data/memory.js";
import {
  createCategories,
  createUser,
  findUserByEmail,
  updateUser,
} from "../services/repository.js";

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    process.env.JWT_SECRET || "finora-local-development-secret",
    { expiresIn: "7d" },
  );
}

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, currency: user.currency || "LKR" };
}

export async function register(req, res) {
  const existing = await findUserByEmail(req.body.email);
  if (existing) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }
  const user = await createUser({
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    passwordHash: await bcrypt.hash(req.body.password, 12),
    currency: req.body.currency || "LKR",
  });
  await createCategories(
    categoryTemplates.map(([name, type, icon, color]) => ({
      userId: user._id,
      name,
      type,
      icon,
      color,
      isDefault: true,
    })),
  );
  res.status(201).json({
    success: true,
    message: "Account created.",
    data: { token: signToken(user), user: publicUser(user) },
  });
}

export async function login(req, res) {
  const user = await findUserByEmail(req.body.email);
  const valid = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!valid) {
    const error = new Error("Email or password is incorrect.");
    error.statusCode = 401;
    throw error;
  }
  res.json({
    success: true,
    message: "Welcome back.",
    data: { token: signToken(user), user: publicUser(user) },
  });
}

export async function me(req, res) {
  res.json({ success: true, message: "Profile loaded.", data: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const user = await updateUser(req.user._id, req.body);
  res.json({ success: true, message: "Preferences saved.", data: publicUser(user) });
}

