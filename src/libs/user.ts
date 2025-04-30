// src/libs/user.ts
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { setCookie } from "cookies-next";

export async function upsertUserAndSetRoleCookie(user: any) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      provider: user.providerData?.[0]?.providerId ?? "custom",
      role: "user", // 預設為 user，可由 admin 調整為 admin
      createdAt: new Date(),
    });
    setCookie("user-role", "user");
  } else {
    const role = snapshot.data().role ?? "user";
    setCookie("user-role", role);
  }
}
