import MenuInf from '@/components/Menu';
import { View, useWindowDimensions } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';
import GameScreen from '../screens/gameScreen';


export default function Game() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={[mascara.container, { flex: 1, paddingBottom: isDesktop ? 0 : 130, paddingLeft: isDesktop ? 90 : 0, paddingTop: isDesktop ? 0 : 30 }]}>
      <MenuInf />
      <View style={conteudoStyle.conteudo}>
        <GameScreen />
      </View>
    </View >
  )
}