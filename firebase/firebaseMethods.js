import firebase from 'firebase';
import 'firebase/firestore';
import { Alert } from 'react-native';

export async function cadastro(email, senha, nome) {
	
	try {
		await firebase.auth().createUserWithEmailAndPassword(email, senha);
		const currentUser = firebase.auth().currentUser;

		const db = firebase.firestore(); 
		db.collection("users")
		.doc(currentUser.uid)
		.set({
			email: currentUser.email,
			nome: nome,
		});
		
	} catch (err) {
		Alert.alert(err.message);
	}	
}

export async function login(email, senha) {
	try {
		await firebase.auth().signInWithEmailAndPassword(email, senha);
	} catch (err) {
		Alert.alert(err.message);
	}
}

export async function logout() {
	try {
		await firebase.auth().signOut();
	} catch (err) {
		Alert.alert(err.message);
	}
}