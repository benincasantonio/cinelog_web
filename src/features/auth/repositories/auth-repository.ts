import {
	signInWithEmailAndPassword,
	signOut,
	type UserCredential,
} from 'firebase/auth';
import { apiClient } from '@/lib/api/client';
import { auth } from '../../../lib/firebase';
import type { RegisterRequest } from '../models/register-request';

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

export const logout = async (): Promise<void> => {
	await signOut(auth);
};

export const register = async (request: RegisterRequest): Promise<void> => {
	return await apiClient.post('v1/auth/register', { json: request }).json();
};
