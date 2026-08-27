// Firebase setup + all Firestore/Auth data-access functions.
// Fill in `firebaseConfig` below with the values from:
// Firebase Console → Project settings → General → "Your apps" → SDK setup and configuration.
// See README.md for the full step-by-step.

import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, onSnapshot, arrayUnion,
} from "firebase/firestore";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_kAz3qz8CyauzI_OGlIwtX4ASzDHd3wo",
  authDomain: "family-calendar-ebc9f.firebaseapp.com",
  projectId: "family-calendar-ebc9f",
  storageBucket: "family-calendar-ebc9f.firebasestorage.app",
  messagingSenderId: "356065875138",
  appId: "1:356065875138:web:d59186c10985364cc2175b",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ---------------------------------- auth ---------------------------------- */
export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, cb);
}
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
export function signOutUser() {
  return signOut(auth);
}

/* ---------------------------------- system admin ---------------------------------- */
export async function isSystemAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

/* ---------------------------------- families ---------------------------------- */
export async function listFamilies() {
  const snap = await getDocs(collection(db, "families"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFamily(familyId) {
  const snap = await getDoc(doc(db, "families", familyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Returns { family, isNew } — isNew tells the caller whether THEY are the
// one who just created this family (so they should become its first parent),
// without ever needing to query the members list (which a brand-new user
// isn't allowed to read yet).
export async function createFamilyIfMissing(familyId) {
  const ref = doc(db, "families", familyId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { family: { id: snap.id, ...snap.data() }, isNew: false };
  }
  const data = { name: familyId, createdAt: Date.now() };
  await setDoc(ref, data);
  return { family: { id: familyId, ...data }, isNew: true };
}

export async function deleteFamily(familyId) {
  const membersSnap = await getDocs(collection(db, "families", familyId, "members"));
  await Promise.all(membersSnap.docs.map((d) => deleteDoc(d.ref)));
  const tasksSnap = await getDocs(collection(db, "families", familyId, "tasks"));
  await Promise.all(tasksSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "families", familyId));
}

/* ---------------------------------- membership index (per user) ---------------------------------- */
export async function getUserFamilies(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().families || []) : [];
}
async function linkUserToFamily(uid, familyId) {
  await setDoc(doc(db, "users", uid), { families: arrayUnion(familyId) }, { merge: true });
}

/* ---------------------------------- members ---------------------------------- */
export async function getOrCreateMember(familyId, user, isNewFamily) {
  const ref = doc(db, "families", familyId, "members", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await linkUserToFamily(user.uid, familyId);
    return { id: snap.id, ...snap.data() };
  }
  const data = { name: user.displayName || user.email, email: user.email, role: isNewFamily ? "parent" : "child" };
  await setDoc(ref, data);
  await linkUserToFamily(user.uid, familyId);
  return { id: user.uid, ...data };
}

export function subscribeMembers(familyId, cb) {
  return onSnapshot(collection(db, "families", familyId, "members"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function updateMemberRole(familyId, memberId, role) {
  await setDoc(doc(db, "families", familyId, "members", memberId), { role }, { merge: true });
}
export async function removeMember(familyId, memberId) {
  await deleteDoc(doc(db, "families", familyId, "members", memberId));
}

/* ---------------------------------- tasks ---------------------------------- */
export function subscribeTasks(familyId, cb) {
  return onSnapshot(collection(db, "families", familyId, "tasks"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function saveTask(familyId, task) {
  const id = task.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  await setDoc(doc(db, "families", familyId, "tasks", id), { ...task, id });
  return id;
}
export async function deleteTask(familyId, taskId) {
  await deleteDoc(doc(db, "families", familyId, "tasks", taskId));
}
