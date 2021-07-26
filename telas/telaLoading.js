import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import firebase from 'firebase';

export default function LoadingScreen({ navigation }) {
	
	useEffect(
		() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				navigation.replace('Home');
			} else {
				navigation.replace('Login');
			}
		});
	});

	return (
		<View style={styles.container}>
			<ActivityIndicator size='large' color="#545454"/>
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
	
});