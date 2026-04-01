import { Dimensions, StyleSheet } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const mascara = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1c202c',
    margin: 0,
    padding: 0,
    zIndex: 0,
    width: windowWidth,
    height: windowHeight
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#bfc0d1',
  },
  logo: {
    width: "80%",
    maxWidth: 300,
    height: "30%",
    maxHeight: 280,
    borderRadius: 8,
    backgroundColor: 'transparent',
    resizeMode: 'cover',
    alignSelf: 'center',
    marginVertical: 5,
  },
  inputTexto: {
    borderWidth: 1,
    width: "80%",
    maxWidth: 400,
    borderColor: '#60519b',
    backgroundColor: '#0c101c',
    borderRadius: 5,
    margin: 5,
    padding: 10,
    alignSelf: "center",
    color: '#bfc0d1',
  },
  botao: {
    width: "60%",
    maxWidth: 200,
    borderWidth: 1,
    borderColor: '#bfc0d1',
    backgroundColor: '#60519b',
    borderRadius: 5,
    margin: 5,
    padding: 10,
    alignSelf: "center",
  },
  textoBotao: {
    color: "#ddd",
    fontWeight: "bold",
    alignSelf: "center",
  },
  botaoPressionado: {
    backgroundColor: "#7061ab",
    transform: [{ scale: 0.96 }]
  },
  cxTituloLogin: {
    borderBottomWidth: 2,
    borderColor: '#bfc0d1',
    margin: 0,
    padding: 0,
    alignSelf: "center",
    width: "95%",
    backgroundColor: "#2f2146",
  },
  cxLogin: {
    borderWidth: 1,
    borderColor: '#bfc0d1',
    margin: 0,
    padding: 5,
    width: '90%',
    maxWidth: 475,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: "#2f2146",
  },
  cxInput: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#1b1723",
  },
  imgFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    resizeMode: 'cover',
  },
  abaMenu: {
    margin: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 60,
    maxHeight: 60,
  },
  abaPressionada: {
    backgroundColor: "#3d2a5d",
    transform: [{ scale: 0.96 }]
  }
});

export default mascara;