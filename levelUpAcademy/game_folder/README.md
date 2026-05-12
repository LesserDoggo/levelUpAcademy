# LevelUp Room - Phaser 3 + TypeScript + Firebase

Jogo social 2D simplificado, isolado em `game_folder/`, pronto para rodar no navegador e dentro do Expo via `react-native-webview`.

## Rodando

```bash
cd game_folder
npm install
npm run dev
```

Para embutir o jogo no app Expo sem depender de servidor Vite:

```bash
npm run build:game
```

Esse comando gera `app/gameBundleHtml.ts`, usado diretamente pela tela `app/screens/gameScreen.tsx`.

No app Expo, a tela abre `EXPO_PUBLIC_GAME_URL` somente quando essa variável existir. Sem essa variável, ela usa o HTML embutido e não precisa que `game_folder` esteja rodando em outro terminal.

## SPRITE PATH CONFIG

Todos os caminhos ficam centralizados em `src/config/spritePaths.ts`.

```ts
export const PLAYER_BODY_SPRITE = "assets/player/body/base.svg";
export const PLAYER_HAT_RED = "assets/player/hats/red_hat.svg";
export const TABLE_WOOD_SPRITE = "assets/furniture/table_wood.svg";
```

Não coloque caminhos diretamente em cenas ou sistemas. Adicione a constante, registre no `data/*Data.ts` e carregue no `PreloadScene`.

## Arquitetura

`scenes/` inicializa Phaser, assets e loop principal. `systems/` guarda regras desacopladas: movimento, colisão, placement, Firebase, loja, inventário, personalização e depth. `entities/` representa `Player`, `Furniture` e `Room`. `managers/` orquestram criação/renderização. `store/gameStore.ts` usa Zustand para estado global.

O Firebase salva somente entidades existentes:

```json
{
  "coins": 120,
  "clothes": {
    "hat": "red_hat",
    "shirt": "hoodie_black",
    "pants": "jeans_blue",
    "shoes": "sneaker_white"
  },
  "inventory": {
    "furniture": { "table_wood": 1 },
    "clothes": { "hat": ["red_hat"] }
  },
  "roomItems": [{ "itemId": "table_wood", "x": 3, "y": 1 }]
}
```

O grid inteiro não é persistido. Ele é reconstruído localmente a partir de `roomItems`, o que mantém Firestore pequeno, barato e fácil de migrar.

## WebView bridge

React Native envia mensagens com `webViewRef.current?.postMessage(JSON.stringify(...))`.

Exemplos RN -> Phaser:

```ts
{ type: "AUTH", uid, coins }
{ type: "SYNC_COINS", coins: 80 }
{ type: "SYNC_CLOTHES", clothes: { hat: "red_hat" } }
{ type: "START_PLACEMENT", itemId: "table_wood" }
```

Phaser envia mensagens com:

```ts
window.ReactNativeWebView?.postMessage(JSON.stringify({
  type: "ROOM_ITEMS_CHANGED",
  roomItems
}));
```

Exemplos Phaser -> RN: `GAME_READY`, `COINS_CHANGED`, `INVENTORY_CHANGED`, `CLOTHES_CHANGED`, `ROOM_ITEMS_CHANGED` e `GAME_EVENT`.

Moedas, inventário e roupas são sincronizados em dois níveis: o estado instantâneo fica no Zustand para resposta rápida da UI; persistência acontece via `FirebaseSyncSystem`, que escreve em `users/{uid}` no Firestore.

## Movimento

`MovementSystem.ts` usa `pointerdown` para clique/toque e `pointermove` durante placement. O jogador anda até o destino convertido por `worldToGrid`, para ao chegar e interrompe movimento quando `CollisionSystem` detecta móvel na célula. O mesmo input funciona em mouse, touch e WebView.

## Colisão

Cada móvel declara `collision` em `furnitureData.ts`. Para configurar:

```ts
collision: { width: 3, height: 2, offsetX: 0, offsetY: 0 }
```

O sistema marca células ocupadas com `occupiedCells()`. Para móveis com base menor que a arte, reduza `collision.width/height` sem mudar o tamanho visual.

## Grid system

`utils/grid.ts` contém:

```ts
gridToWorld({ x: 3, y: 1 });
worldToGrid(pointer.worldX, pointer.worldY);
```

O quarto usa grid isométrico lógico. O Firebase salva apenas `{ itemId, x, y }`, nunca tiles inteiros.

## Tiled Map Editor

Crie um mapa isométrico no Tiled com `tilewidth: 64`, `tileheight: 32`, `width: 12`, `height: 8`. Exporte como JSON em `public/assets/maps/room.json`. Para colisão, crie uma camada `objectgroup` chamada `collision`; objetos dessa camada podem virar bloqueios fixos no futuro. Hoje a colisão principal vem de `roomItems`, para manter o quarto editável pelo jogador.

## Depth automático

`DepthSystem` usa:

```ts
sprite.depth = sprite.y;
```

Isso faz objetos mais baixos na tela aparecerem na frente dos objetos mais altos, essencial em jogos estilo Habbo/isométricos. Para evitar bugs visuais, mantenha o ponto de origem visual na base do sprite (`originY = 1`) e chame `updateDepth()` quando a entidade mover.

## Paper doll character

O personagem não é sprite único:

```txt
PlayerContainer
├ body
├ shirt
├ pants
├ shoes
├ faceAccessory
└ hat
```

Cada layer é um spritesheet separado com o mesmo tamanho (`48x64`), mesma quantidade de frames e mesmo alinhamento. `Player.syncFrame()` aplica o mesmo frame em todas as layers, mantendo animações sincronizadas. Para trocar roupa em tempo real, `Player.setClothes()` troca a textura da layer correspondente e preserva o frame atual.

Animações suportadas: `idle`, `walk`, `up`, `down`, `left`, `right`. O spritesheet placeholder tem 4 linhas de direção (`down`, `left`, `right`, `up`) e 4 colunas de frame.

## Loja, inventário e placement

`ShopSystem` valida moedas e retorna novo estado. `InventorySystem` adiciona/consome itens. `FurniturePlacementSystem` faz preview transparente, snap automático no grid, valida posição, impede sobreposição e bloqueia fora da sala.

Fluxo:

1. Jogador seleciona móvel no inventário.
2. `startPlacement(itemId)` cria preview.
3. Preview acompanha cursor/toque com `pointermove`.
4. `confirm()` valida com `canPlaceItem`.
5. `FirebaseSyncSystem.saveRoomItems()` persiste.

## Escopo atual

Implementado para quarto único: movimento, personalização, decoração, inventário, loja e salvamento. A arquitetura deixa espaço para visitar quarto de outro jogador e entidades secundárias futuramente, sem implementar multiplayer, NPCs, pets, quests ou crafting agora.
