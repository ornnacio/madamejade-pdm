import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Button, SafeAreaView } from 'react-native';
import firebase from 'firebase';
import "firebase/firestore";
import { cadastro } from "../firebase/firebaseMethods.js";

import logo from "./assets/logo.png";

export default function telaCadastro({ navigation }){
	
	const [nome, setNome] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [senha, setSenha] = React.useState('');
	const [confSenha, setConfSenha] = React.useState('');
	
	const emptyState = () => {
		setEmail('');
		setSenha('');
		setConfSenha('');
	};
	
	function press() {
	
		if(email === '' || senha === '' || confSenha === '' || nome === ''){
			alert("Email, senha ou nome inválidos");
		}else if(senha !== confSenha){
			alert("As senhas diferem");
		}else{
			cadastro(email, senha, nome);
			navigation.navigate("Login");
			emptyState();
		}
		
	}	
	
	return(
		<View style={styles.container}>
			<Image source={logo} style={styles.logo1}/>
			<TextInput style={styles.txtinput} placeholder='Nome' placeholderTextColor='#545454' onChangeText={setNome} value={nome}/>
			<TextInput style={styles.txtinput} placeholder='Email' placeholderTextColor='#545454' onChangeText={setEmail} value={email}/>
			<TextInput style={styles.txtinput} placeholder='Senha' placeholderTextColor='#545454' secureTextEntry = {true} onChangeText={setSenha} value={senha}/>
			<TextInput style={styles.txtinput} placeholder='Confirmar senha' placeholderTextColor='#545454' secureTextEntry = {true} onChangeText={setConfSenha} value={confSenha}/>
			<TouchableOpacity style={styles.butao} onPress={press}>
				<Text style={styles.txtbotao}>Cadastrar</Text>
			</TouchableOpacity>
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
		marginBottom: 20,
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
		padding: 5,
	},
 
});