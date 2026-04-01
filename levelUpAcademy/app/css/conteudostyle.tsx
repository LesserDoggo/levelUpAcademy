import { StyleSheet } from "react-native";

const conteudoStyle = StyleSheet.create({
    titulo: {
        color: "#bfc0d1",
        alignSelf: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'justify',
    },
    subtitulo: {
        color: "#bfc0d1",
        alignSelf: 'center',
        fontSize: 20,
    },
    textoBotao: {
        color: "#fff",
        alignSelf: 'center',
        fontSize: 16,
    },
    conteudo: {
        //backgroundColor: "#00ff0010",
        left: 0,
        right: 0,
        bottom: 0,
        top: 15,
        width: "100%",
        height: "100%",
        padding: 10,
        paddingTop: 20,
    },
    cardProgresso: {
        backgroundColor: '#567',
    },
    cardSugestao: {
        backgroundColor: '#212636',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '75%',
        maxWidth: 600,
        height: '40%',
        maxHeight: 350,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#7061ab',
    },
    botao: {
        width: "60%",
        maxWidth: 200,
        borderWidth: 2,
        borderColor: '#836fd1',
        backgroundColor: '#60519b',
        borderRadius: 5,
        margin: 5,
        padding: 10,
        alignSelf: "center",
        alignItems: 'center',
    }
})

export default conteudoStyle;