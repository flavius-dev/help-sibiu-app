import admin from "firebase-admin";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const projectId = requiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
  let privateKey = requiredEnv("FIREBASE_PRIVATE_KEY");
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return admin;
}

export async function verifyIdToken(idToken) {
  const a = initFirebaseAdmin();
  return a.auth().verifyIdToken(idToken);
}

export async function getUserByEmail(email) {
  const a = initFirebaseAdmin();
  return a.auth().getUserByEmail(email);
}
