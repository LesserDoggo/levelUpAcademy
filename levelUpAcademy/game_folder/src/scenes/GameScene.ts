import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { GameManager } from "../managers/GameManager";
import { PlayerManager } from "../managers/PlayerManager";
import { RoomManager } from "../managers/RoomManager";
import { useGameStore } from "../store/gameStore";
import { CharacterCustomizationUI } from "../ui/CharacterCustomizationUI";
import { InventoryUI } from "../ui/InventoryUI";
import { PlacementUI } from "../ui/PlacementUI";
import { ShopUI } from "../ui/ShopUI";
import { listenNativeMessages, postToNative } from "../utils/webviewBridge";

export class GameScene extends Phaser.Scene {
  private gameManager = new GameManager();
  private roomManager = new RoomManager();
  private playerManager = new PlayerManager();
  private inventoryUI = new InventoryUI();
  private shopUI = new ShopUI();
  private placementUI = new PlacementUI();
  private customizationUI = new CharacterCustomizationUI();
  private coinsText?: Phaser.GameObjects.Text;
  private unsubscribeNative?: () => void;
  private activePanel: "none" | "avatar" | "inventory" | "shop" = "none";

  constructor() {
    super("GameScene");
  }

  create() {
    const store = useGameStore.getState();
    this.cameras.main.setBounds(0, 0, 960, 640);
    this.roomManager.create(this);
    this.roomManager.renderItems(this, store.roomItems);
    this.playerManager.create(this, store.clothes);
    this.createHud();
    this.bindInput();
    this.bindNativeMessages();

    postToNative({ type: "GAME_READY" });
    postToNative({ type: "GAME_EVENT", event: "scene-created" });

    if (!window.ReactNativeWebView && !window.LevelUpGameBridge) {
      this.gameManager.firebase
        .bootstrap()
        .then(() => this.refreshFromStore())
        .catch((error) => {
          postToNative({ type: "ERROR", message: String(error) });
        });
    }
  }

  update(_: number, delta: number) {
    const player = this.playerManager.player;
    if (!player) return;
    const items = useGameStore.getState().roomItems;
    this.gameManager.movement.update(player, delta, items);
    player.syncFrame();
    this.playerManager.updateDepth();
    this.coinsText?.setText(`Moedas ${useGameStore.getState().coins}`);
  }

  private createHud() {
    this.coinsText = this.add
      .text(392, 18, `Moedas ${useGameStore.getState().coins}`, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        backgroundColor: "#243447",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000);

    this.createMenuButtons();
    this.inventoryUI.create(this, (itemId) => this.startPlacement(itemId));
    this.shopUI.create(
      this,
      (itemId) => this.buyFurniture(itemId),
      (itemId) => this.buyClothing(itemId),
    );
    this.placementUI.create(
      this,
      () => this.confirmPlacement(),
      () => this.cancelPlacement(),
    );
    this.customizationUI.create(this, (itemId) => this.equipClothing(itemId));
  }

  private createMenuButtons() {
    const buttons: Array<{ label: string; panel: "avatar" | "inventory" | "shop"; x: number }> = [
      { label: "Avatar", panel: "avatar", x: 392 },
      { label: "Inventario", panel: "inventory", x: 480 },
      { label: "Loja", panel: "shop", x: 588 },
    ];

    buttons.forEach((button) => {
      const background = this.add
        .rectangle(button.x, 68, button.label.length > 6 ? 96 : 76, 32, 0x60519b, 1)
        .setDepth(9000)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(button.x, 68, button.label, {
          color: "#ffffff",
          fontFamily: "Arial",
          fontSize: "12px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(9001);
      background.on("pointerdown", () => this.togglePanel(button.panel));
      label.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.togglePanel(button.panel));
    });
  }

  private togglePanel(panel: "avatar" | "inventory" | "shop") {
    this.activePanel = this.activePanel === panel ? "none" : panel;
    this.customizationUI.setVisible(this.activePanel === "avatar");
    this.inventoryUI.setVisible(this.activePanel === "inventory");
    this.shopUI.setVisible(this.activePanel === "shop");
  }

  private bindInput() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.gameManager.placement.isActive()) {
        if (pointer.y < 150) return;
        this.gameManager.placement.update(pointer, useGameStore.getState().roomItems);
        return;
      }
      const player = this.playerManager.player;
      if (player) this.gameManager.movement.moveToPointer(player, pointer, useGameStore.getState().roomItems);
    });
  }

  private bindNativeMessages() {
    this.unsubscribeNative = listenNativeMessages((message) => {
      if (message.type === "AUTH") {
        if (message.firebaseCustomToken) {
          this.gameManager.firebase
            .bootstrap(message.uid, message.firebaseCustomToken)
            .then(() => this.refreshFromStore())
            .catch((error) => {
              postToNative({ type: "ERROR", message: String(error) });
            });
        } else {
          const store = useGameStore.getState();
          store.setUid(message.uid);
          if (typeof message.coins === "number") store.setCoins(message.coins);
          postToNative({ type: "GAME_EVENT", event: "native-session-linked" });
        }
      }
      if (message.type === "SYNC_COINS") useGameStore.getState().setCoins(message.coins);
      if (message.type === "SYNC_INVENTORY") {
        useGameStore.getState().setInventory(message.inventory as ReturnType<typeof useGameStore.getState>["inventory"]);
        this.inventoryUI.render(this, (itemId) => this.startPlacement(itemId));
      }
      if (message.type === "SYNC_CLOTHES") {
        useGameStore.getState().setClothes(message.clothes);
        this.playerManager.player?.setClothes(useGameStore.getState().clothes);
      }
      if (message.type === "SYNC_ROOM_ITEMS" && Array.isArray(message.roomItems)) {
        useGameStore.getState().setRoomItems(message.roomItems);
        this.roomManager.renderItems(this, useGameStore.getState().roomItems);
      }
      if (message.type === "START_PLACEMENT") this.startPlacement(message.itemId);
    });
  }

  private refreshFromStore() {
    const store = useGameStore.getState();
    this.roomManager.renderItems(this, store.roomItems);
    this.playerManager.player?.setClothes(store.clothes);
  }

  private startPlacement(itemId: string) {
    if (!this.gameManager.inventory.hasFurniture(itemId)) return;
    useGameStore.getState().startPlacement(itemId);
    this.gameManager.placement.start(this, itemId);
    this.placementUI.setActive(true);
    postToNative({ type: "GAME_EVENT", event: "placement-started", payload: { itemId } });
  }

  private async confirmPlacement() {
    const item = this.gameManager.placement.confirm(useGameStore.getState().roomItems);
    if (!item) return;

    const store = useGameStore.getState();
    store.setRoomItems([...store.roomItems, item]);
    store.stopPlacement();
    const inventory = this.gameManager.inventory.consumeFurniture(item.itemId);
    await this.gameManager.firebase.saveInventory(inventory);
    await this.gameManager.firebase.saveRoomItems();
    this.roomManager.renderItems(this, useGameStore.getState().roomItems);
    this.inventoryUI.render(this, (itemId) => this.startPlacement(itemId));
    this.placementUI.setActive(false);
  }

  private cancelPlacement() {
    this.gameManager.placement.cancel();
    useGameStore.getState().stopPlacement();
    this.placementUI.setActive(false);
    postToNative({ type: "GAME_EVENT", event: "placement-cancelled" });
  }

  private async buyFurniture(itemId: string) {
    const result = this.gameManager.shop.buyFurniture(itemId);
    if (!result) return;
    await this.gameManager.firebase.saveCoins(result.coins);
    await this.gameManager.firebase.saveInventory(result.inventory);
    this.inventoryUI.render(this, (id) => this.startPlacement(id));
  }

  private async buyClothing(itemId: string) {
    const result = this.gameManager.shop.buyClothing(itemId);
    if (!result) return;
    await this.gameManager.firebase.saveCoins(result.coins);
    await this.gameManager.firebase.saveInventory(result.inventory);
  }

  private async equipClothing(itemId: string) {
    const item = clothingData[itemId];
    const patch = this.gameManager.customization.equip(item.slot, item.itemId);
    if (!patch) return;
    await this.gameManager.firebase.saveClothes(patch);
    this.playerManager.player?.setClothes(useGameStore.getState().clothes);
  }

  shutdown() {
    this.unsubscribeNative?.();
  }
}
