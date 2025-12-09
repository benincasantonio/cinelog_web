import { signInWithEmailAndPassword, type UserCredential } from "firebase/auth";
import { auth } from "../firebase";

export const login = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential;
};
