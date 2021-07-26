import 'react-native-gesture-handler';
import React, { useState, state, Component, useEffect } from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-native-paper';
import firebase from 'firebase';
import "firebase/firestore";
import { firebaseConfig } from "./firebase/firebase.js";

import telaLogin from "./telas/telaLogin.js";
import telaCadastro from "./telas/telaCadastro.js";
import telaLoading from "./telas/telaLoading.js";
import home from "./telas/home.js";

const Stack = createStackNavigator();
LogBox.ignoreLogs(['Setting a timer']);

export default function App({ navigation }){
	
	if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig);
	}
	
	return (
		<Provider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Loading">
					<Stack.Screen name="Login" component={telaLogin} options={{headerTintColor: "#545454", headerStyle: {backgroundColor: '#aef490', borderBottomWidth: 0, shadowColor: "transparent", elevation: 0,}}}/>
					<Stack.Screen name="Cadastro" component={telaCadastro} options={{headerTintColor: "#545454", headerStyle: {backgroundColor: '#aef490', borderBottomWidth: 0, shadowColor: "transparent", elevation: 0,}}}/>
					<Stack.Screen name="Loading" component={telaLoading} options={{headerShown: false}}/>
					<Stack.Screen name="Home" component={home} options={{headerShown: false}}/>
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	);

}
