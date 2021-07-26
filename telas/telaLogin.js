import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button } from 'react-native';
import firebase from 'firebase';
import "firebase/firestore";
import { login } from "../firebase/firebaseMethods.js";

import logo from "./assets/logo.png";

export default function telaLogin({ navigation }){
	
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	
	function press(){
		if (email === '' || senha === '') {
			Alert.alert('Email ou senha inválidos.');
		}
		
		login(email, senha);
		setEmail('');
		setSenha('');
		navigation.navigate("Loading");
	}
	
	return(
		<View style={styles.container}>
			<Image source={logo} style={styles.logo1}/>
			<TextInput style={styles.txtinput} placeholder='Email' placeholderTextColor='#545454' onChangeText={setEmail} value={email}/>
			<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#545454' secureTextEntry = {true} onChangeText={setSenha} value={senha}/>
			<TouchableOpacity style={styles.butao} onPress={press}>
				<Text style={styles.txtbotao}> Entrar </Text>
			</TouchableOpacity>
			
			<View style={styles.rodape}>
				<TouchableOpacity style={styles.txtclicavel} onPress={() => navigation.navigate("Cadastro")}>
					<Text style={styles.txtbotaoTransparente}> Não tem uma conta? </Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

export const styles = StyleSheet.create({
	
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#aef490',
		alignItems: 'center',
		justifyContent: 'center',
	},
 
	rodape: {
		flex: 0.15,
		backgroundColor: '#aef490',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	logo1: {
		width: 221,
		height: 179,
		marginBottom: 50,
	},
  
	txtbotao: {
		fontSize: 18,
		color: '#aef490',
	},
  
	txtbotaoTransparente: {
		fontSize: 18,
		color: '#545454',
	},
	
	txtinput: {
		width: 200,
		height: 40,
		color: '#545454',
		borderColor: '#545454',
		borderBottomWidth: 2,
		marginBottom: 20,
	},	
  
	butao: {
		backgroundColor: '#545454',
		borderRadius: 5,
		padding: 5,
		marginTop: 30,
		marginBottom: 50,
	},
  
	txtclicavel: {
		backgroundColor: '#aef490',
		padding: 10,
	},
 
});