"use server";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sendEmail } from "../email";
import { contactEmails } from "@/data/contact";
import { validateContact } from "./validate";

const MESSAGES_FILE = path.join(process.cwd(), ".data", "messages.json");

// ⚠️ DEVELOPMENT STORE: messages are saved to .data/messages.json on this machine so none are
// lost while no email service is connected. Before launch, send them to a real inbox / help desk
// (see sendEmail in src/lib/email.js) and replace saveMessage with your database.
async function saveMessage(message) {
  let all = [];
  try {
    all = JSON.parse(await readFile(MESSAGES_FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
  all.push({ id: randomUUID(), createdAt: new Date().toISOString(), ...message });
  await mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
  await writeFile(MESSAGES_FILE, JSON.stringify(all, null, 2));
}

const field = (formData, name) => String(formData.get(name) ?? "");

export async function sendContactMessage(_prev, formData) {
  // Hidden "website" field: real visitors never fill it in, bots usually do.
  if (field(formData, "website")) return { sent: true };

  const values = { name: field(formData, "name").trim(), email: field(formData, "email").trim(), message: field(formData, "message").trim() };
  const errors = validateContact(values);
  if (Object.keys(errors).length) return { errors, values };

  await saveMessage(values);
  await sendEmail({
    to: contactEmails.manager,
    subject: `New contact message from ${values.name}`,
    text: `From: ${values.name} <${values.email}>\n\n${values.message}`,
  });
  return { sent: true };
}
