import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ScrollView, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Card, Title, Paragraph, Button, Snackbar, Portal, Dialog, Menu, FAB, IconButton, Divider, TextInput } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import firebase from 'firebase';
import "firebase/firestore";
import "firebase/storage";
import { logout } from "../firebase/firebaseMethods.js";

import logo from "./assets/logo.png";
import placeholder from "./assets/placeholder.png"

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
var count = 0;

function telaLoja({ navigation }){

	const [produtos, setProdutos] = React.useState([]);
	const [plantas, setPlantas] = React.useState([]);
	const [vasos, setVasos] = React.useState([]);
	const [ids, setIds] = React.useState([]);
	const [loading1, setLoading1] = React.useState(true);
	const [visible, setVisible] = React.useState(false);
	const [visibleDialog, setVisibleDialog] = useState(false);
	const [visibleMenu, setVisibleMenu] = React.useState(false);
	const [filtroPlantas, setFiltroPlantas] = React.useState(false);
	const [filtroVasos, setFiltroVasos] = React.useState(false);

	const onDismissSnackBar = () => setVisible(false);
	const openMenu = () => setVisibleMenu(true);
	const closeMenu = () => setVisibleMenu(false);

	function checkPlanta(item){
		return item.data.categoria === 'Planta';
	}

	function checkVaso(item){
		return item.data.categoria === 'Vaso';
	}

	useEffect(() => {

		async function getProdutos(){

			let doc = await firebase
			.firestore()
			.collection('produtos')
			.onSnapshot((query) => {

				const list = [];

				query.forEach((doc) => {
					let obj = {
						data: doc.data(),
						id: doc.id
					}
					list.push(obj);
				})

				setProdutos(list);
				setIds(ids);

				let apenasPlantas = list.filter(checkPlanta);
				setPlantas(apenasPlantas);

				let apenasVasos = list.filter(checkVaso);
				setVasos(apenasVasos);

				setLoading1(false);
			})
		}

		getProdutos();

	}, []);

	function deleteProduto(id, path){

		setVisibleDialog(true);

		firebase.storage().ref()
			.child(path)
			.delete()
			.then(() => {
				firebase.firestore()
					.collection('produtos')
					.doc(id)
					.delete()
			})

		setVisibleDialog(false);
	}

	return(
		<View style={styles.container}>
			<StatusBar barStyle='light-content' hidden={false} backgroundColor="#577a48"/>
			<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>
				{loading1 && <>
					<ActivityIndicator size='large' color="#545454"/>
					<Text>Carregando...</Text>
				</>}
				{!loading1 && produtos.length == 0 &&
					<View style={{
						height: 0.4 * Dimensions.get('window').height,
						width: 0.8 * Dimensions.get('window').width,
						borderWidth: 1,
						borderRadius: 5,
						borderColor: '#d4161d',
						justifyContent: 'center',
						alignItems: 'center',
						alignSelf: 'center'
					}}>
						<Paragraph style={{textAlign: 'center'}}>Nenhum produto encontrado.</Paragraph>
					</View>
				}
				{!loading1 && produtos.length > 0 && <>
					<Menu
						visible={visibleMenu}
						onDismiss={() => setVisibleMenu(false)}
						anchor={<Button mode='contained' icon='chevron-down' color='#d4161d' style={{marginBottom: 20}} onPress={() => setVisibleMenu(true)}>Filtrar</Button>}
					>
					<Menu.Item onPress={() => {
						setFiltroPlantas(false);
						setFiltroVasos(false);
						closeMenu();
					}} title="Todos os Itens" />
					<Menu.Item onPress={() => {
						setFiltroPlantas(true);
						setFiltroVasos(false);
						closeMenu();
					}} title="Plantas" />
					<Menu.Item onPress={() => {
						setFiltroPlantas(false);
						setFiltroVasos(true);
						closeMenu();
					}} title="Vasos" />
					</Menu>
				</>}
				{!loading1 && !filtroPlantas && !filtroVasos && produtos.map((p, index) => {

					var pre??oDouble = parseFloat(p.data.pre??o)

					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{p.data.nome}</Title>
								<Paragraph>{'R$' + pre??oDouble.toFixed(2)}</Paragraph>
								<Paragraph><Paragraph style={{fontWeight: 'bold'}}>Categoria:</Paragraph> {p.data.categoria}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: p.data.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<View style={{ flex: 0.7, alignItems: 'flex-start' }}>
									<Button color='#d4161d' onPress={() => navigation.navigate('Detalhes', {id: p.id, urlImg: p.data.urlImg})}>Detalhes</Button>
								</View>
								<View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
									<IconButton icon="pencil" color="#4592a0" size={25} onPress={() => navigation.navigate("AtualizarProduto", { update: true, id: p.id, obj: p.data })}></IconButton>
									<IconButton icon="delete" color="#d4161d" size={25} onPress={() => deleteProduto(p.id, p.data.path)}></IconButton>
								</View>
							</Card.Actions>
						</Card>
					);
				})}
				{!loading1 && !filtroPlantas && filtroVasos && vasos.map((p, index) => {

					var pre??oDouble = parseFloat(p.data.pre??o)

					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{p.data.nome}</Title>
								<Paragraph>{'R$' + pre??oDouble.toFixed(2)}</Paragraph>
								<Paragraph><Paragraph style={{fontWeight: 'bold'}}>Categoria:</Paragraph> {p.data.categoria}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: p.data.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<View style={{ flex: 0.7, alignItems: 'flex-start' }}>
									<Button color='#d4161d' onPress={() => navigation.navigate('Detalhes', {id: p.id, urlImg: p.data.urlImg})}>Detalhes</Button>
								</View>
								<View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
									<IconButton icon="pencil" color="#4592a0" size={25} onPress={() => navigation.navigate("AtualizarProduto", { update: true, id: p.id, obj: p.data })}></IconButton>
									<IconButton icon="delete" color="#d4161d" size={25} onPress={() => deleteProduto(p.id, p.data.path)}></IconButton>
								</View>
							</Card.Actions>
						</Card>
					);
				})}
				{!loading1 && filtroPlantas && !filtroVasos && plantas.map((p, index) => {

					var pre??oDouble = parseFloat(p.data.pre??o)

					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{p.data.nome}</Title>
								<Paragraph>{'R$' + pre??oDouble.toFixed(2)}</Paragraph>
								<Paragraph><Paragraph style={{fontWeight: 'bold'}}>Categoria:</Paragraph> {p.data.categoria}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: p.data.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<View style={{ flex: 0.7, alignItems: 'flex-start' }}>
									<Button color='#d4161d' onPress={() => navigation.navigate('Detalhes', {id: p.id, urlImg: p.data.urlImg})}>Detalhes</Button>
								</View>
								<View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
									<IconButton icon="pencil" color="#4592a0" size={25} onPress={() => navigation.navigate("AtualizarProduto", { update: true, id: p.id, obj: p.data })}></IconButton>
									<IconButton icon="delete" color="#d4161d" size={25} onPress={() => deleteProduto(p.id, p.data.path)}></IconButton>
								</View>
							</Card.Actions>
						</Card>
					);
				})}
			</ScrollView>
			<FAB
				style={styles.fab}
				onPress={() => navigation.navigate("AddProduto")}
				icon="plus"
			/>
			<Snackbar
				visible={visible}
				onDismiss={onDismissSnackBar}>
				Produto adicionado com sucesso!
			</Snackbar>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#545454"/>
						<Paragraph>Removendo produto...</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaDetalhes({ route, navigation }){

	let id = route.params.id, url = route.params.urlImg;

	const [loading, setLoading] = React.useState(true);
	const [info, setInfo] = React.useState([]);

	useEffect(() => {

		async function getInfo(){

			let doc = await firebase
			.firestore()
			.collection('produtos')
			.doc(id)
			.get();

			if(doc.exists){
				setLoading(false);
				setInfo(doc.data());
			}
		}

		getInfo();

	}, []);

	return(
		<View style={styles.containerDetalhes}>
			{loading && <>
				<ActivityIndicator size='large' color='#545454'/>
				<Text>Carregando...</Text>
			</>}
			{!loading && <>
				<View style={{
					flex: 0.5,
					alignItems: 'center',
					justifyContent: 'center',
					borderWidth: 3,
					borderColor: '#d4161d',
					borderRadius: 5,
					marginVertical: 15,
					width: 0.8 * Dimensions.get('window').width,
				}}>
					<Title style={{color: '#d4161d'}}>{info.nome}</Title>
				</View>
				<Image source={{uri: url}} style={{width: '100%', height: '50%'}} />
				<View style={{
					flex: 0.5,
					borderWidth: 1,
					borderColor: '#d4161d',
					borderRadius: 5,
					padding: 15,
					margin: 10,
					width: 0.9 * Dimensions.get('window').width
				}}>
					<ScrollView contentContainerStyle={styles.containerScrollDetalhes}>
						<Paragraph>{info.descri????o}</Paragraph>
					</ScrollView>
				</View>
			</>}
		</View>
	);
}

function telaAddProduto({ navigation }){

	const [image, setImage] = useState(null);
	const [nome, setNome] = useState('');
	const [desc, setDesc] = useState('');
	const [pre??o, setPre??o] = useState('');
	const [visibleDialog, setVisibleDialog] = useState(false);
	const [visibleMenu, setVisibleMenu] = useState(false);
	const [categoria, setCategoria] = useState('Planta');

	useEffect(() => {

		async function getPermissions(){
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				navigation.goBack();
			}
		}

		getPermissions();
	});

	const pickImage = async () => {

		let result = await ImagePicker.launchImageLibraryAsync({
		  	mediaTypes: ImagePicker.MediaTypeOptions.All,
		 	quality: 1,
		});

		if (!result.cancelled) {
		  	setImage(result.uri);
		}
	};

	function verificarEntradas(){
		return(image !== null && nome !== '' && desc !== '' && pre??o !== '');
	}

	async function salvar(){
		setVisibleDialog(true);

		let i = await fetch(image);
		let file = await i.blob();
		let n = new Date();
        let dateTime = n.getFullYear() + '_' + (n.getMonth() + 1) + '_' + n.getDate() + '_' +
            n.getHours() + '_' + n.getMinutes() + '_' + n.getSeconds();
		let path = 'images/' + dateTime;

		firebase.storage().ref()
			.child(path)
			.put(file)
			.then((snapshot) => {
				snapshot.ref.getDownloadURL().then((u) => {

					firebase.firestore()
						.collection('produtos')
						.doc(dateTime)
						.set({
							nome: nome,
							descri????o: desc,
							pre??o: pre??o,
							categoria: categoria,
							urlImg: u,
							path: path
						})
				})
			})

		setVisibleDialog(false);
		navigation.goBack();
	}

	return(
		<View style={styles.container}>
			<TouchableOpacity onPress={() => pickImage()}>
				<Image source={image ? { uri: image } : placeholder} resizeMode="contain" style={{ width: 100, height: 100 }} />
			</TouchableOpacity>
			<TextInput
				style={styles.txtInput}
				placeholder='Nome do produto'
				onChangeText={setNome}
				value={nome}
				underlineColor='#d4161d'
			/>
			<TextInput
				style={styles.inputBox}
				underlineColor='#d4161d'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setDesc(text)}
				value={desc}
				placeholder="Descri????o do produto"
			/>
			<TextInput
				style={styles.txtInput}
				placeholder='Pre??o do produto'
				onChangeText={setPre??o}
				value={pre??o}
				underlineColor='#d4161d'
				keyboardType={'numeric'}
			/>
			<Menu
				visible={visibleMenu}
				onDismiss={() => setVisibleMenu(false)}
				anchor={<Button mode='contained' icon='chevron-down' color='#d4161d' style={{width: 0.35 * Dimensions.get('window').width}} onPress={() => setVisibleMenu(true)}>{categoria}</Button>}
			>
				<Menu.Item onPress={() => {setCategoria('Planta'); setVisibleMenu(false)}} title="Planta" />
				<Menu.Item onPress={() => {setCategoria('Vaso'); setVisibleMenu(false)}} title="Vaso" />
			</Menu>
			<Button
				mode='contained'
				onPress={() => salvar()}
				disabled={!verificarEntradas()}
				style={{
					backgroundColor: verificarEntradas() ? 'blue' : 'gray',
					marginTop: 15,
					width: 0.35 * Dimensions.get('window').width
				}}
			>
				Salvar
			</Button>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#545454"/>
						<Paragraph>Salvando produto...</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaAtualizarProduto({ route, navigation }){

	const [image, setImage] = useState(route.params.obj.urlImg);
	const [nome, setNome] = useState(route.params.obj.nome);
	const [desc, setDesc] = useState(route.params.obj.descri????o);
	const [pre??o, setPre??o] = useState(route.params.obj.pre??o);
	const [visibleDialog, setVisibleDialog] = useState(false);
	const [visibleMenu, setVisibleMenu] = useState(false);
	const [categoria, setCategoria] = useState(route.params.obj.categoria);
	const [changedImage, setChangedImage] = useState(false);

	useEffect(() => {

		async function getPermissions(){
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				navigation.goBack();
			}
		}

		getPermissions();
	});

	const pickImage = async () => {

		let result = await ImagePicker.launchImageLibraryAsync({
		  	mediaTypes: ImagePicker.MediaTypeOptions.All,
		 	quality: 1,
		});

		if (!result.cancelled) {
		  	setImage(result.uri);
			setChangedImage(true);
		}
	};

	function verificarEntradas(){
		return(image !== null && nome !== '' && desc !== '' && pre??o !== '');
	}

	async function salvar(){

		setVisibleDialog(true);

		if(changedImage){

			let i = await fetch(image);
			let file = await i.blob();
			let n = new Date();
			let dateTime = n.getFullYear() + '_' + (n.getMonth() + 1) + '_' + n.getDate() + '_' +
				n.getHours() + '_' + n.getMinutes() + '_' + n.getSeconds();
			let path = 'images/' + dateTime;

			firebase.storage().ref()
				.child(path)
				.put(file)
				.then((snapshot) => {
					snapshot.ref.getDownloadURL().then((u) => {

						firebase.firestore()
							.collection('produtos')
							.doc(route.params.id)
							.set({
								nome: nome,
								descri????o: desc,
								pre??o: pre??o,
								categoria: categoria,
								urlImg: u,
								path: path
							})

						firebase.storage().ref()
							.child(route.params.obj.path)
							.delete()
					})
				})
		}else{
			firebase.firestore()
				.collection('produtos')
				.doc(route.params.id)
				.update({
					nome: nome,
					descri????o: desc,
					pre??o: pre??o,
					categoria: categoria
				})
		}

		setVisibleDialog(false);
		navigation.goBack();
	}

	return(
		<View style={styles.container}>
			<TouchableOpacity onPress={() => pickImage()}>
				<Image source={image ? { uri: image } : placeholder} resizeMode="contain" style={{ width: 100, height: 100 }} />
			</TouchableOpacity>
			<TextInput
				style={styles.txtInput}
				placeholder='Nome do produto'
				onChangeText={setNome}
				value={nome}
				underlineColor='#d4161d'
			/>
			<TextInput
				style={styles.inputBox}
				underlineColor='#d4161d'
				multiline={true}
				numberOfLines={6}
				onChangeText={(text) => setDesc(text)}
				value={desc}
				placeholder="Descri????o do produto"
			/>
			<TextInput
				style={styles.txtInput}
				placeholder='Pre??o do produto'
				onChangeText={setPre??o}
				value={pre??o}
				underlineColor='#d4161d'
				keyboardType={'numeric'}
			/>
			<Menu
				visible={visibleMenu}
				onDismiss={() => setVisibleMenu(false)}
				anchor={<Button mode='contained' icon='chevron-down' color='#d4161d' style={{width: 0.35 * Dimensions.get('window').width}} onPress={() => setVisibleMenu(true)}>{categoria}</Button>}
			>
				<Menu.Item onPress={() => {setCategoria('Planta'); setVisibleMenu(false)}} title="Planta" />
				<Menu.Item onPress={() => {setCategoria('Vaso'); setVisibleMenu(false)}} title="Vaso" />
			</Menu>
			<Button
				mode='contained'
				onPress={() => salvar()}
				disabled={!verificarEntradas()}
				style={{
					backgroundColor: verificarEntradas() ? 'blue' : 'gray',
					marginTop: 15,
					width: 0.35 * Dimensions.get('window').width
				}}
			>
				Salvar
			</Button>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={false}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#545454"/>
						<Paragraph>Salvando produto...</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function stackLoja({ navigation }){

	return(
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#577a48' }, headerTintColor: 'white' }}>
			<Stack.Screen name="Loja" component={telaLoja} options={{title: 'Loja virtual'}}/>
			<Stack.Screen name="Detalhes" component={telaDetalhes} options={{title: 'Ver detalhes'}}/>
			<Stack.Screen name="AddProduto" component={telaAddProduto} options={{title: 'Adicionar produto'}}/>
			<Stack.Screen name="AtualizarProduto" component={telaAtualizarProduto} options={{title: 'Editar produto'}}/>
		</Stack.Navigator>
	);
}

function telaCole????o({ navigation }){

	const [cole????o, setCole????o] = React.useState([]);
	const [ids, setIds] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const [refreshDummy, setRefreshDummy] = React.useState(0);
	const userId = firebase.auth().currentUser.uid;

	useEffect(() => {

		async function getCole????o(){

			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(userId)
			.collection('cole????o')
			.onSnapshot((query) => {

				const list = [], ids = [];

				query.forEach((doc) => {
					list.push(doc.data());
					ids.push(doc.id);
				})

				setCole????o(list);
				setIds(ids);
				setLoading(false);
			});

		}

		getCole????o();

	}, [refreshDummy]);

	function deletePlanta(id, path){

		setVisibleDialog(true);

		firebase.storage().ref()
			.child(path)
			.delete()
			.then(() => {
				firebase
					.firestore()
					.collection('users')
					.doc(userId)
					.collection('cole????o')
					.doc(id)
					.delete()
					.then(() => {
						setVisibleDialog(false);
						setRefreshDummy(refreshDummy + 1);
					})
		})

	}

	return(
		<View style={styles.container}>
			<StatusBar barStyle="light-content" hidden={false} backgroundColor="#577a48"/>
			{!loading && cole????o.length == 0 &&
				<View style={{
					height: 0.4 * Dimensions.get('window').height,
					width: 0.8 * Dimensions.get('window').width,
					borderWidth: 1,
					borderRadius: 5,
					borderColor: '#d4161d',
					justifyContent: 'center',
					alignItems: 'center',
					alignSelf: 'center'
				}}>
					<Paragraph style={{textAlign: 'center'}}>Parece que voc?? ainda n??o adicionou nenhuma planta ?? sua cole????o. Clique no bot??o e comece agora!</Paragraph>
				</View>
			}
			{loading && <>
				<ActivityIndicator size='large' color="#545454"/>
				<Text>Carregando...</Text>
			</>}
			{!loading && cole????o.length > 0 &&<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>

				{cole????o.map((item, index) => {

					return(
						<Card style={{width: 0.9 * Dimensions.get('window').width, marginBottom: 15}} key={index}>
							<Card.Cover source={{ uri: item.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Content>
								<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<Title>{item.nome}</Title>
									<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
										<IconButton icon="pencil" color="#4592a0" size={25} onPress={() => navigation.navigate('EditPlanta', { id: ids[index], obj: item })}></IconButton>
										<IconButton icon="delete" color="#d4161d" size={25} onPress={() => deletePlanta(ids[index], item.path)}></IconButton>
									</View>
								</View>
								<Paragraph>Esp??cie: {item.esp??cie}</Paragraph>
								<Paragraph>Hor??rio de regar: {item.horaRegar}</Paragraph>
							</Card.Content>
						</Card>
					);
				})}
			</ScrollView>}
			{!loading && <>
				<Portal>
					<Dialog visible={visibleDialog} dismissable={false}>
						<Dialog.Content>
							<ActivityIndicator size='large' color="#545454"/>
							<Paragraph>Removendo item...</Paragraph>
						</Dialog.Content>
					</Dialog>
				</Portal>
			</>}
			<FAB
				style={styles.fab}
				icon='plus'
				onPress={() => navigation.navigate('AddCole????o')}
			/>
		</View>
	);
}

function telaAddCole????o({ navigation }){

	const [image, setImage] = useState(null);
	const [nome, setNome] = React.useState('');
	const [esp??cie, setEsp??cie] = React.useState('');
	const [horaRegar, setHoraRegar] = React.useState(new Date(2021, 0, 1, 15, 0, 0));
	const [visible, setVisible] = React.useState(false);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const userId = firebase.auth().currentUser.uid;

	useEffect(() => {

		async function getPermissions(){
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				navigation.goBack();
			}
		}

		getPermissions();
	});

	function onChange(event, selectedDate){

		const currentDate = selectedDate || horaRegar;
		setVisible(false);
		setHoraRegar(currentDate);
	};

	const pickImage = async () => {

		let result = await ImagePicker.launchImageLibraryAsync({
		  	mediaTypes: ImagePicker.MediaTypeOptions.All,
		 	quality: 1,
		});

		if (!result.cancelled) {
		  	setImage(result.uri);
		}
	};

	function verificarEntradas(){
		return(image !== null && nome !== '' && esp??cie !== '');
	}

	async function salvar(){

		setVisibleDialog(true);

		let i = await fetch(image);
		let file = await i.blob();
		let n = new Date();
        let dateTime = n.getFullYear() + '_' + (n.getMonth() + 1) + '_' + n.getDate() + '_' +
            n.getHours() + '_' + n.getMinutes() + '_' + n.getSeconds();
		let path = 'collection' + userId + '/' + dateTime;
		let strHora = horaRegar.getHours() + ':' + String(horaRegar.getMinutes()).padEnd('2', 0);

		firebase.storage().ref()
			.child(path)
			.put(file)
			.then((snapshot) => {
				snapshot.ref.getDownloadURL().then((u) => {

					firebase.firestore()
						.collection('users')
						.doc(userId)
						.collection('cole????o')
						.doc(dateTime)
						.set({
							nome: nome,
							esp??cie: esp??cie,
							horaRegar: strHora,
							urlImg: u,
							path: path
						})
				})
			})

		setVisibleDialog(false);
		navigation.goBack();
	}

	return(
		<View style={styles.container}>
			<TouchableOpacity onPress={() => pickImage()}>
				<Image source={image ? { uri: image } : placeholder} resizeMode="contain" style={{ width: 100, height: 100 }} />
			</TouchableOpacity>
			<TextInput style={styles.txtInput} placeholder='Nome da Planta' underlineColor='#d4161d' onChangeText={setNome} value={nome} />
			<TextInput style={styles.txtInput} placeholder='Esp??cie' underlineColor='#d4161d' onChangeText={setEsp??cie} value={esp??cie} />
			<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, marginTop: 15}}>
				<Text>Hor??rio para regar: </Text>
				<Button onPress={() => setVisible(true)}>Selecionar</Button>
				{visible && <DateTimePicker
					value={horaRegar}
					mode={'time'}
					is24Hour={true}
					display="default"
					onChange={onChange}
				/>}
			</View>
			<Button
				mode='contained'
				style={{
					marginTop: 15,
					marginBottom: 15,
					backgroundColor: verificarEntradas() ? 'blue' : 'gray',
					width: 0.35 * Dimensions.get('window').width
				}}
				onPress={() => salvar()}
				disabled={!verificarEntradas()}
			>
				salvar
			</Button>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={true}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#545454"/>
						<Paragraph>Adicionando item...</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function telaEditPlanta({ route, navigation }){

	const [image, setImage] = useState(route.params.obj.urlImg);
	const [nome, setNome] = React.useState(route.params.obj.nome);
	const [esp??cie, setEsp??cie] = React.useState(route.params.obj.esp??cie);
	const [horaRegar, setHoraRegar] = React.useState(new Date(2021, 0, 1, route.params.obj.horaRegar.split(':')[0], route.params.obj.horaRegar.split(':')[1], 0));
	const [visible, setVisible] = React.useState(false);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const [changedImage, setChangedImage] = useState(false);
	const userId = firebase.auth().currentUser.uid;

	useEffect(() => {

		async function getPermissions(){
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				navigation.goBack();
			}
		}

		getPermissions();
	});

	function onChange(event, selectedDate){

		const currentDate = selectedDate || horaRegar;
		setVisible(false);
		setHoraRegar(currentDate);
	};

	const pickImage = async () => {

		let result = await ImagePicker.launchImageLibraryAsync({
		  	mediaTypes: ImagePicker.MediaTypeOptions.All,
		 	quality: 1,
		});

		if (!result.cancelled) {
		  	setImage(result.uri);
			setChangedImage(true);
		}
	};

	function verificarEntradas(){
		return(image !== null && nome !== '' && esp??cie !== '');
	}

	async function salvar(){

		setVisibleDialog(true);

		let strHora = horaRegar.getHours() + ':' + String(horaRegar.getMinutes()).padEnd('2', 0);

		if(changedImage){

			let i = await fetch(image);
			let file = await i.blob();
			let n = new Date();
			let dateTime = n.getFullYear() + '_' + (n.getMonth() + 1) + '_' + n.getDate() + '_' +
				n.getHours() + '_' + n.getMinutes() + '_' + n.getSeconds();
			let path = 'collection' + userId + '/' + dateTime;

			firebase.storage().ref()
				.child(path)
				.put(file)
				.then((snapshot) => {
					snapshot.ref.getDownloadURL().then((u) => {

						firebase.firestore()
							.collection('users')
							.doc(userId)
							.collection('cole????o')
							.doc(route.params.id)
							.set({
								nome: nome,
								esp??cie: esp??cie,
								horaRegar: strHora,
								urlImg: u,
								path: path
							})

						firebase.storage().ref()
							.child(route.params.obj.path)
							.delete()
					})
				})
		}else{
			firebase.firestore()
				.collection('users')
				.doc(userId)
				.collection('cole????o')
				.doc(route.params.id)
				.update({
					nome: nome,
					esp??cie: esp??cie,
					horaRegar: strHora,
				})
		}

		setVisibleDialog(false);
		navigation.goBack();
	}

	return(
		<View style={styles.container}>
			<TouchableOpacity onPress={() => pickImage()}>
				<Image source={image ? { uri: image } : placeholder} resizeMode="contain" style={{ width: 100, height: 100 }} />
			</TouchableOpacity>
			<TextInput style={styles.txtInput} placeholder='Nome da Planta' onChangeText={setNome} value={nome} />
			<TextInput style={styles.txtInput} placeholder='Esp??cie' onChangeText={setEsp??cie} value={esp??cie} />
			<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, marginTop: 15}}>
				<Text>Hor??rio para regar: </Text>
				<Button onPress={() => setVisible(true)}>Selecionar</Button>
				{visible && <DateTimePicker
					value={horaRegar}
					mode={'time'}
					is24Hour={true}
					display="default"
					onChange={onChange}
				/>}
			</View>
			<Button
				mode='contained'
				style={{
					marginTop: 15,
					marginBottom: 15,
					backgroundColor: verificarEntradas() ? 'blue' : 'gray',
					width: 0.35 * Dimensions.get('window').width
				}}
				onPress={() => salvar()}
				disabled={!verificarEntradas()}
			>
				salvar
			</Button>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={true}>
					<Dialog.Content>
						<ActivityIndicator size='large' color="#545454"/>
						<Paragraph>Atualizando item...</Paragraph>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function stackCole????o({ navigation }){

	return(
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#577a48' }, headerTintColor: 'white' }}>
			<Stack.Screen name="Cole????o" component={telaCole????o} options={{title: 'Sua cole????o'}}/>
			<Stack.Screen name="AddCole????o" component={telaAddCole????o} options={{title: 'Adicionar para a cole????o'}}/>
			<Stack.Screen name="EditPlanta" component={telaEditPlanta} options={{title: 'Editar planta'}}/>
		</Stack.Navigator>
	);
}

function telaPrevis??o({ navigation }) {

	const [dias, setDias] = useState([]);
	const [ready, setReady] = useState(false);
	let list = [];

	var options = {
		method: 'GET',
		url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
		params: {q: '-26.874928726178037,-52.40490281906037', days: '3', lang: 'pt'},
		headers: {
		  	'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
		  	'x-rapidapi-key': '7a12ca91a5msh177f72e473b3829p12216bjsnba1204c54368'
		}
	};

	function fixDateFormat(d){
		let arr = d.split('-');
		return arr[2] + '/' + arr[1] + '/' + arr[0];
	}

	useEffect(() => {

		axios.request(options).then((response) => {

			let arr = response.data.forecast.forecastday;

			arr.forEach((day) => {

				let obj = {
					data: fixDateFormat(day.date),
					max: day.day.maxtemp_c,
					min: day.day.mintemp_c,
					mmChuva: day.day.totalprecip_mm,
					condi????o: day.day.condition.text,
				}

				list.push(obj);
			})

			setDias(list);
			setReady(true);

		}).catch(function (error) {
			console.error(error);
		});
	})

	return(
		<View style={styles.container}>
			<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>
				{!ready && <>
					<ActivityIndicator size='large' color='#545454'/>
					<Text>Carregando...</Text>
				</>}
				{ready && dias.map((d, index) => {

					return(
						<Card style={{width: 0.9 * Dimensions.get('window').width, marginBottom: 15}} key={index}>
							<Card.Content>
								<Title>{d.data}</Title>
								<Paragraph>???? {d.min}??C - ???? {d.max}??C</Paragraph>
								<Paragraph>Condi????o: {d.condi????o}</Paragraph>
								<Paragraph>Mil??metros de chuva: {d.mmChuva}</Paragraph>
							</Card.Content>
						</Card>
					);
				})}
			</ScrollView>
		</View>
	);
}

function stackPrevis??o() {

	return(
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#577a48' }, headerTintColor: 'white' }}>
			<Stack.Screen name="Previs??o do tempo" component={telaPrevis??o} />
		</Stack.Navigator>
	)
}

function telaLocal({ navigation }){

	return(
		<View style={styles.container}>
			<View style={{flex: 0.9}}>
				<MapView
					initialRegion={{
						latitude: -26.87649265433925,
						longitude: -52.41826050300975,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					}} style={{width: Dimensions.get('window').width, height: '100%'}}>
					<Marker coordinate={{latitude: -26.876358675100676, longitude: -52.41834633366091}} pinColor={'#aef490'}/>
				</MapView>
			</View>
			<View style={{flex: 0.1, alignItems: 'center', justifyContent: 'center'}}>
				<Text>Rua Euclides Hack, Bairro Veneza, 1603, Xanxer?? - SC</Text>
			</View>
		</View>
	);
}

function stackLocal() {

	return(
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#577a48' }, headerTintColor: 'white' }}>
			<Stack.Screen name="Encontre nossa loja" component={telaLocal} />
		</Stack.Navigator>
	)
}

function telaV??deos({ navigation }){

	const video = React.useRef(null);
	const [status, setStatus] = React.useState({});

	return(
		<View style={styles.container}>
			<View style={{
				borderWidth: 1,
				borderColor: '#d4161d',
				borderRadius: 5,
				padding: 15,
				margin: 10,
				marginBottom: 30,
				width: 0.9 * Dimensions.get('window').width,
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<Title style={styles.title}>V??deo da semana escolhido pela nossa equipe</Title>
			</View>
			<Card style={styles.cardProduto}>
				<Card.Content>
					<Title style={{textAlign: 'center', paddingHorizontal: 5}}>Os 7 ERROS mais comuns em suculentas</Title>
					<Video
						style={{width: 0.9 * Dimensions.get('window').width, height: 200}}
						source={{
							uri: 'https://firebasestorage.googleapis.com/v0/b/madame-jade.appspot.com/o/videos%2Fvideo-7erros.mp4?alt=media&token=9faec3f4-af84-47ef-96d4-5ad9bc57b7af',
						}}
						useNativeControls
						resizeMode="contain"
						onPlaybackStatusUpdate={status => setStatus(() => status)}
					/>
				</Card.Content>
			</Card>
		</View>
	);
}

function stackV??deos() {

	return(
		<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#577a48' }, headerTintColor: 'white' }}>
			<Stack.Screen name="V??deo da semana" component={telaV??deos} />
		</Stack.Navigator>
	)
}

function MenuLateral( props ) {

	const navigation = useNavigation();

	const press = () => {
		logout();
		navigation.replace('Loading');
	};

	return (
		<>
			<View style={{justifyContent: 'center', alignItems: 'center'}}>
				<Image source={logo} style={styles.logoMenu} />
			</View>
			<DrawerContentScrollView {...props}>
				<Divider style={{ marginBottom: 5, marginTop: 5 }} />
				<DrawerItemList {...props} />
				<Divider />
				<DrawerItem
					label='Sair'
					onPress={press}
				/>
			</DrawerContentScrollView>
		</>
  );
}

export default function home({ navigation }){

	return(
		<Drawer.Navigator drawerContentOptions={{activeTintColor: '#7aab65'}} drawerContent={(props) => <MenuLateral {...props} />}>
			<Drawer.Screen name="Loja Digital" component={stackLoja} />
			<Drawer.Screen name="Previs??o do Tempo" component={stackPrevis??o} />
			<Drawer.Screen name="Sua Cole????o" component={stackCole????o} />
			<Drawer.Screen name="Encontre Nossa Loja" component={stackLocal} />
			<Drawer.Screen name="V??deo da Semana" component={stackV??deos} />
		</Drawer.Navigator>
	);
}

const styles = StyleSheet.create({

	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#aef490',
		alignItems: 'center',
		justifyContent: 'center',
	},

	containerDetalhes: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#aef490',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 10,
	},

	containerScroll: {
		paddingVertical: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},

	containerScrollDetalhes: {
		justifyContent: 'center',
	},

	logoMenu: {
		width: 175,
		height: Math.floor(175 / 1.234636),
		marginTop: 25,
	},

	cardProduto: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		width: 0.9 * Dimensions.get('window').width,
	},

	fab: {
		position: 'absolute',
		backgroundColor: '#d4161d',
		margin: 15,
		right: 0,
		bottom: 0,
	},

	txtInput: {
		width: 200,
		height: 40,
		marginVertical: 10,
		width: 0.7 * Dimensions.get('window').width,
	},

	title: {
		textAlign: 'center',
		color: '#d4161d'
	},

	inputBox: {
		borderRadius: 5,
		width: 0.7 * Dimensions.get('window').width,
		marginVertical: 10,
	},
});
