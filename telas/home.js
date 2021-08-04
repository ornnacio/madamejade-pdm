import React, { useState, state, Component, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, ScrollView, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Card, Title, Paragraph, Button, Snackbar, Portal, Dialog, Menu, FAB, List, Divider } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Video, AVPlaybackStatus } from 'expo-av';

import firebase from 'firebase';
import "firebase/firestore";
import "firebase/storage";
import { logout } from "../firebase/firebaseMethods.js";

import logo from "./assets/logo.png";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
var count = 0;

function telaLoja({ navigation }){
	
	const [produtos, setProdutos] = React.useState([]);
	const [ids, setIds] = React.useState([]);
	const [arrImagens, setArrImagens] = React.useState([]);
	const [loading1, setLoading1] = React.useState(true);
	const [loading2, setLoading2] = React.useState(true);
	const [visible, setVisible] = React.useState(false);
	const userId = firebase.auth().currentUser.uid;
	const onDismissSnackBar = () => setVisible(false);
	var storage = firebase.storage();
	
	useEffect(() => {
		
		async function getProdutos(){
			
			let doc = await firebase
			.firestore()
			.collection('produtos')
			.get()
			.then((query) => {
				
				const list = [], ids = [];
				
				query.forEach((doc) => {
					list.push(doc.data());
					ids.push(doc.id);
				})
				
				setProdutos(list);
				setIds(ids);
				setLoading1(false);
			})
		}
		
		getProdutos();
		
		async function getImagemProdutos(){
			
			const imageRefs = await firebase.storage().ref().listAll();
			const urls = await Promise.all(imageRefs.items.map((ref) => ref.getDownloadURL()));
			setArrImagens(urls);
			setLoading2(false);
			
		}
		
		getImagemProdutos();
		
		async function getQntdCarrinho(){
			
			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(userId)
			.collection('carrinho')
			.get()
			.then((query) => {
				
				query.forEach((doc) => {
					count = count + 1;
				})
			
			})
			
		}
		
		getQntdCarrinho();
		
	}, []);
	
	function comprar(index){
		
		let str = 'p' + String(count + 1).padStart(3, '0');
		
		firebase
		.firestore()
		.collection('users')
		.doc(userId)
		.collection('carrinho')
		.doc(str)
		.set({
			nome: produtos[index].nome,
			preço: produtos[index].preço,
			categoria: produtos[index].categoria,
			urlImg: arrImagens[index]
		});
		
		setVisible(true);
		count = count + 1;
		
	}
	
	return(
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" hidden={false} backgroundColor="#aef490"/>
			<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>
				{loading1 || loading2 && <>
					<ActivityIndicator size='large' color="#545454"/>
					<Text>Carregando...</Text>
				</>}
				{!loading1 && !loading2 && arrImagens.map((url, index) => {
					
					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{produtos[index].nome}</Title>
								<Paragraph>{'R$' + produtos[index].preço.toFixed(2)}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: url }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<Button color='#d4161d' onPress={() => navigation.navigate('Detalhes', {id: ids[index], urlImg: url})}>Detalhes</Button>
								<Button color='#d4161d' onPress={() => comprar(index)}>Comprar</Button>
							</Card.Actions>
						</Card>
					);
				})}
			</ScrollView>
			<Snackbar
				visible={visible}
				onDismiss={onDismissSnackBar}>
				Produto adicionado com sucesso!
			</Snackbar>
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
				<Title style={{marginBottom: 25}}>{info.nome}</Title>
				<Image source={{uri: url}} style={{width: '100%', height: '50%'}} />
				<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScrollDetalhes}>
					<Paragraph>{info.desc}</Paragraph>
				</ScrollView>
				<Button mode='contained' onPress={() => navigation.goBack()}>Voltar</Button>
			</>}
		</View>
	);
}

function stackLoja({ navigation }){
	
	return(
		<Stack.Navigator>
			<Stack.Screen name="Loja" component={telaLoja} options={{headerShown: false}}/>
			<Stack.Screen name="Detalhes" component={telaDetalhes} options={{headerShown: false}}/>
		</Stack.Navigator>
	);
}

function telaColeção({ navigation }){
	
	const [coleção, setColeção] = React.useState([]);
	const [ids, setIds] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const [refreshDummy, setRefreshDummy] = React.useState(0);
	const userId = firebase.auth().currentUser.uid;
	
	useEffect(() => {
		
		async function getColeção(){
			
			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(userId)
			.collection('coleção')
			.onSnapshot((query) => {
				
				const list = [], ids = [];
				
				query.forEach((doc) => {
					list.push(doc.data());
					ids.push(doc.id);
				})
				
				setColeção(list);
				setIds(ids);
				setLoading(false);
			});
			
		}
		
		getColeção();
		
	}, [refreshDummy]);
	
	function deletePlanta(id){
		
		setVisibleDialog(true);
		
		firebase
		.firestore()
		.collection('users')
		.doc(userId)
		.collection('coleção')
		.doc(id)
		.delete()
		.then(() => {
			setVisibleDialog(false);
			setRefreshDummy(refreshDummy + 1);
		}).catch((e) => {
			alert(e);
		});
	}
	
	return(
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" hidden={false} backgroundColor="#aef490"/>
			<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>
				{loading && <>
					<ActivityIndicator size='large' color="#545454"/>
					<Text>Carregando...</Text>
				</>}
				{!loading && coleção.length == 0 && <>
					<Paragraph>Parece que você ainda não adicionou nenhuma planta à sua coleção. Clique no botão e comece agora!</Paragraph>
				</>}
				{!loading && coleção.map((item, index) => {
					
					return(
						<Card style={{width: 0.9 * Dimensions.get('window').width, marginBottom: 15}} key={index}>
							<Card.Content>
								<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
									<Title>{item.nome}</Title>
									<Button color='red' onPress={() => deletePlanta(ids[index])}>Remover</Button>
								</View>
								<Paragraph>Espécie: {item.espécie}</Paragraph>
								<Paragraph>Horário de regar: {item.horaRegar}</Paragraph>
							</Card.Content>
						</Card>
					);
				})}
			</ScrollView>
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
				onPress={() => navigation.navigate('AddColeção')}
			/>
		</View>
	);
}

function telaAddColeção({ navigation }){
	
	const [nome, setNome] = React.useState('');
	const [espécie, setEspécie] = React.useState('');
	const [horaRegar, setHoraRegar] = React.useState(new Date(2021, 0, 1, 15, 0, 0));
	const [visible, setVisible] = React.useState(false);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const userId = firebase.auth().currentUser.uid;
	
	function onChange(event, selectedDate){
		
		const currentDate = selectedDate || horaRegar;
		setVisible(false);
		setHoraRegar(currentDate);
		
	};
	
	function geradorDeId(length) {
		
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() *  charactersLength));
	    }
		return result;
		
	}
	
	function salvar(){
		
		let strHora = horaRegar.getHours() + ':' + String(horaRegar.getMinutes()).padEnd('2', 0); 
		
		firebase
		.firestore()
		.collection('users')
		.doc(userId)
		.collection('coleção')
		.doc(geradorDeId(8))
		.set({
			nome: nome,
			espécie: espécie,
			horaRegar: strHora,
		}).then(() => {
			setVisibleDialog(true);
		});
		
	}
	
	return(
		<View style={styles.container}>
			<TextInput style={styles.txtInput} placeholder='Nome da Planta' onChangeText={setNome} value={nome} />
			<TextInput style={styles.txtInput} placeholder='Espécie' onChangeText={setEspécie} value={espécie} />
			<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, marginTop: 15}}>
				<Text>Horário para regar: </Text>
				<Button onPress={() => setVisible(true)}>Selecionar</Button>
				{visible && <DateTimePicker
					value={horaRegar}
					mode={'time'}
					is24Hour={true}
					display="default"
					onChange={onChange}
				/>}
			</View>
			<Button mode='contained' style={{marginTop: 15, marginBottom: 15}} onPress={() => salvar()}>salvar</Button>
			<Button mode='contained' style={{marginTop: 15, marginBottom: 15}} onPress={() => navigation.goBack()}>voltar</Button>
			<Portal>
				<Dialog visible={visibleDialog} dismissable={true}>
					<Dialog.Content>
						<Paragraph>Item salvo com sucesso!</Paragraph>
						<Button onPress={() => navigation.navigate('Coleção')}>Ver sua coleção</Button>
					</Dialog.Content>
				</Dialog>
			</Portal>
		</View>
	);
}

function stackColeção({ navigation }){
	
	return(
		<Stack.Navigator>
			<Stack.Screen name="Coleção" component={telaColeção} options={{headerShown: false}}/>
			<Stack.Screen name="AddColeção" component={telaAddColeção} options={{headerShown: false}}/>
		</Stack.Navigator>
	);
}

function telaLocal({ navigation }){
	
	return(
		<View style={styles.container}>
			<View style={{flex: 0.1}}>
				<StatusBar barStyle="dark-content" hidden={false} backgroundColor="#aef490"/>
				<Title style={{marginTop: 10}}>Localização da nossa loja</Title>
			</View>
			<View style={{flex: 0.8}}>
				<MapView
					initialRegion={{
						latitude: -26.87649265433925, 
						longitude: -52.41826050300975,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					}} style={{width: Dimensions.get('window').width, height: '90%'}}>
					<Marker coordinate={{latitude: -26.876358675100676, longitude: -52.41834633366091}} pinColor={'#aef490'}/>
				</MapView>
			</View>
			<View style={{flex: 0.1}}>
				<Text>Rua Euclides Hack, Bairro Veneza, 1603, Xanxerê - SC</Text>
			</View>
		</View>
	);
}

function telaCarrinho({ navigation }){
	
	const [carrinho, setCarrinho] = React.useState([]);
	const [carrinhoPlantas, setCarrinhoPlantas] = React.useState([]);
	const [carrinhoVasos, setCarrinhoVasos] = React.useState([]);
	const [filtroPlantas, setFiltroPlantas] = React.useState(false);
	const [filtroVasos, setFiltroVasos] = React.useState(false);
	const [ids, setIds] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [visibleDialog, setVisibleDialog] = React.useState(false);
	const [visibleMenu, setVisibleMenu] = React.useState(false);
	const [refreshDummy, setRefreshDummy] = React.useState(0);
	const userId = firebase.auth().currentUser.uid;
	
	const openMenu = () => setVisibleMenu(true);
	const closeMenu = () => setVisibleMenu(false);
	
	useEffect(() => {
		
		async function getCarrinho(){
			
			let doc = await firebase
			.firestore()
			.collection('users')
			.doc(userId)
			.collection('carrinho')
			.onSnapshot((query) => {
				
				const list = [], ids = [];
				
				query.forEach((doc) => {
					list.push(doc.data());
					ids.push(doc.id);
				})
				
				setCarrinho(list);
				setIds(ids);
				setLoading(false);
				
				let apenasPlantas = list.filter(checkPlanta);
				setCarrinhoPlantas(apenasPlantas);
				
				let apenasVasos = list.filter(checkVaso);
				setCarrinhoVasos(apenasVasos);
			})
		}
		
		getCarrinho();
		
	}, [refreshDummy])
	
	function checkPlanta(item){
		return item.categoria === 'planta';
	}
	
	function checkVaso(item){
		return item.categoria === 'vaso';
	}
	
	function deleteItem(id){
		
		setVisibleDialog(true);
		
		firebase
		.firestore()
		.collection('users')
		.doc(userId)
		.collection('carrinho')
		.doc(id)
		.delete()
		.then(() => {
			setVisibleDialog(false);
			setRefreshDummy(refreshDummy + 1);
		}).catch((e) => {
			alert(e);
		});
		
	}
	
	return(
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" hidden={false} backgroundColor="#aef490"/>
			<ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={styles.containerScroll}>
				{loading && <>
					<ActivityIndicator size='large' color="#545454"/>
					<Text>Carregando...</Text>
				</>}
				{!loading && <Menu
					visible={visibleMenu}
					onDismiss={closeMenu}
					anchor={<Button mode='outlined' onPress={openMenu} style={{marginBottom: 15, marginTop: 15}}>Filtrar itens</Button>}>
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
				</Menu>}
				{!loading && (carrinho.length == 0) && <>
					<Text>Visite a loja e adicione produtos ao seu carrinho!</Text>
				</>}
				{!loading && !filtroPlantas && !filtroVasos && carrinho.map((item, index) => {
					
					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{item.nome}</Title>
								<Paragraph>{'R$' + item.preço.toFixed(2)}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: item.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<Button color='#d4161d' onPress={() => deleteItem(ids[index])}>Remover</Button>
							</Card.Actions>
						</Card>
					);
				})}
				{!loading && filtroPlantas && !filtroVasos && carrinhoPlantas.map((item, index) => {
					
					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{item.nome}</Title>
								<Paragraph>{'R$' + item.preço.toFixed(2)}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: item.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<Button color='#d4161d' onPress={() => deleteItem(ids[index])}>Remover</Button>
							</Card.Actions>
						</Card>
					);
				})}
				{!loading && !filtroPlantas && filtroVasos && carrinhoVasos.map((item, index) => {
					
					return(
						<Card style={styles.cardProduto} key={index}>
							<Card.Content>
								<Title>{item.nome}</Title>
								<Paragraph>{'R$' + item.preço.toFixed(2)}</Paragraph>
							</Card.Content>
							<Card.Cover source={{ uri: item.urlImg }} style={{width: 0.9 * Dimensions.get('window').width}}/>
							<Card.Actions>
								<Button color='#d4161d' onPress={() => deleteItem(ids[index])}>Remover</Button>
							</Card.Actions>
						</Card>
					);
				})}
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
			</ScrollView>
		</View>
	);
}

function telaVídeos({ navigation }){
	
	const video = React.useRef(null);
	const [status, setStatus] = React.useState({});

	return(
		<View style={styles.container}>
			<Title style={styles.title}>Vídeo da semana escolhido pela nossa equipe</Title>
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
			<Drawer.Screen name="Seu Carrinho" component={telaCarrinho} />
			<Drawer.Screen name="Sua Coleção" component={stackColeção} />
			<Drawer.Screen name="Encontre Nossa Loja" component={telaLocal} />
			<Drawer.Screen name="Vídeo da Semana" component={telaVídeos} />
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
		padding: 10, 
		marginBottom: 10
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
		margin: 25,
		right: 0,
		bottom: 0,
	},
	
	txtInput: {
		width: 200,
		height: 40,
		color: '#545454',
		borderColor: '#545454',
		borderBottomWidth: 2,
	},
	
	title: {
		textAlign: 'center', 
		marginBottom: 50, 
		paddingHorizontal: 10
	},
});