import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";
import { GameManager } from "../managers/GameManager";
import { PlayerManager } from "../managers/PlayerManager";
import { RoomManager } from "../managers/RoomManager";
import { useGameStore } from "../store/gameStore";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { CharacterCustomizationUI } from "../ui/CharacterCustomizationUI";
import { InventoryUI } from "../ui/InventoryUI";
import { PlacementUI } from "../ui/PlacementUI";
import { ShopUI } from "../ui/ShopUI";
import { COIN_ICON_TEXTURE, createReadableText, ensureCoinIconTexture } from "../ui/coinIcon";
import { canPlaceItem } from "../utils/collision";
import { listenNativeMessages, postToNative } from "../utils/webviewBridge";

export class GameScene extends Phaser.Scene {
  private gameManager = new GameManager();
  private roomManager = new RoomManager();
  private playerManager = new PlayerManager();
  private inventoryUI = new InventoryUI();
  private shopUI = new ShopUI();
  private placementUI = new PlacementUI();
  private customizationUI = new CharacterCustomizationUI();
  private coinBadge?: Phaser.GameObjects.Rectangle;
  private coinIcon?: Phaser.GameObjects.Image;
  private coinsText?: Phaser.GameObjects.Text;
  private unsubscribeNative?: () => void;
  private activePanel: "none" | "avatar" | "inventory" | "shop" = "none";
  private selectedFurniture: RoomFurnitureItem | null = null;
  private editPanel?: Phaser.GameObjects.Container;
  private editPanelTitle?: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  create() {
    const store = useGameStore.getState();
    this.cameras.main.setBounds(0, 0, 960, 640);
    this.roomManager.create(this);
    this.renderRoomItems();
    this.playerManager.create(this, store.clothes);
    this.createHud();
    this.bindInput();
    this.bindNativeMessages();

    postToNative({ type: "GAME_READY" });
    postToNative({ type: "GAME_EVENT", event: "scene-created" });
    this.reportRenderDiagnostics("scene-created");

    if (!window.ReactNativeWebView && !window.LevelUpGameBridge) {
      this.gameManager.firebase
        .bootstrap()
        .then(() => this.refreshFromStore())
        .catch((error) => {
          postToNative({ type: "ERROR", message: String(error) });
        });
    }
  }

  private reportRenderDiagnostics(stage: string) {
    this.time.delayedCall(150, () => {
      const canvas = this.game.canvas;
      const parent = canvas.parentElement;
      const parentBounds = parent?.getBoundingClientRect();
      const canvasBounds = canvas.getBoundingClientRect();

      const diagnostics = {
        stage,
        renderer: this.game.renderer.type === Phaser.WEBGL ? "webgl" : "canvas",
        scale: {
          width: this.scale.width,
          height: this.scale.height,
          gameWidth: this.scale.gameSize.width,
          gameHeight: this.scale.gameSize.height,
        },
        canvas: {
          width: canvas.width,
          height: canvas.height,
          cssWidth: Math.round(canvasBounds.width),
          cssHeight: Math.round(canvasBounds.height),
        },
        parent: {
          cssWidth: Math.round(parentBounds?.width ?? 0),
          cssHeight: Math.round(parentBounds?.height ?? 0),
        },
        objects: this.children.list.length,
        textures: {
          playerBody: this.textures.exists("player_body"),
          geckoBed: this.textures.exists("gecko_bed"),
        },
      };

      console.info("[LevelUpGame] render diagnostics", diagnostics);
      postToNative({ type: "GAME_EVENT", event: "render-diagnostics", payload: diagnostics });
    });
  }

  update(_: number, delta: number) {
    this.coinsText?.setText(`${useGameStore.getState().coins}`);

    const player = this.playerManager.player;
    if (!player) return;
    if (this.isMovementBlocked()) {
      this.gameManager.movement.stop(player);
      return;
    }
    const items = useGameStore.getState().roomItems;
    this.gameManager.movement.update(player, delta, items);
    player.syncFrame();
    this.playerManager.updateDepth();
  }

  private createHud() {
    ensureCoinIconTexture(this);

    this.coinBadge = this.add
      .rectangle(808, 20, 142, 34, 0x243447, 0.96)
      .setOrigin(0)
      .setStrokeStyle(1, 0x60519b)
      .setDepth(9000);
    this.coinIcon = this.add.image(825, 37, COIN_ICON_TEXTURE).setDisplaySize(20, 20).setDepth(9001);
    this.coinsText = createReadableText(this, 846, 25, `${useGameStore.getState().coins}`, {
      fontSize: "18px",
      fontStyle: "800",
    }).setDepth(9001);

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
    this.createFurnitureEditPanel();
  }

  private createMenuButtons() {
    const buttons: Array<{ label: string; panel: "avatar" | "inventory" | "shop"; x: number }> = [
      { label: "Avatar", panel: "avatar", x: 18 },
      { label: "Inventario", panel: "inventory", x: 104 },
      { label: "Loja", panel: "shop", x: 222 },
    ];

    buttons.forEach((button) => {
      const width = button.label.length > 8 ? 110 : 78;
      const background = this.add
        .rectangle(button.x, 20, width, 34, 0x243447, 0.96)
        .setOrigin(0)
        .setStrokeStyle(1, 0x60519b)
        .setDepth(9000)
        .setInteractive({ useHandCursor: true });
      const label = createReadableText(this, button.x + width / 2, 28, button.label, {
        fontSize: "14px",
        fontStyle: "700",
      })
        .setOrigin(0.5, 0)
        .setDepth(9001);
      background.on("pointerdown", () => this.togglePanel(button.panel));
      label.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.togglePanel(button.panel));
    });
  }

  private togglePanel(panel: "avatar" | "inventory" | "shop") {
    this.activePanel = this.activePanel === panel ? "none" : panel;
    if (this.activePanel !== "none") {
      this.gameManager.movement.stop(this.playerManager.player);
    }
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
      if (this.isMovementBlocked()) return;
      const player = this.playerManager.player;
      if (player) this.gameManager.movement.moveToPointer(player, pointer, useGameStore.getState().roomItems);
    });
  }

  private isMovementBlocked() {
    return this.activePanel !== "none" || Boolean(this.selectedFurniture);
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
        this.renderRoomItems();
      }
      if (message.type === "START_PLACEMENT") this.startPlacement(message.itemId);
    });
  }

  private refreshFromStore() {
    const store = useGameStore.getState();
    this.renderRoomItems();
    this.playerManager.player?.setClothes(store.clothes);
  }

  private startPlacement(itemId: string) {
    if (!this.gameManager.inventory.hasFurniture(itemId)) return;
    this.resetPlayerForFurnitureEditing();
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
    this.renderRoomItems();
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
    const store = useGameStore.getState();
    store.setCoins(result.coins);
    store.setInventory(result.inventory);
    this.coinsText?.setText(`${result.coins}`);
    await this.gameManager.firebase.saveCoins(result.coins);
    await this.gameManager.firebase.saveInventory(result.inventory);
    this.inventoryUI.render(this, (id) => this.startPlacement(id));
  }

  private async buyClothing(itemId: string) {
    const result = this.gameManager.shop.buyClothing(itemId);
    if (!result) return;
    const store = useGameStore.getState();
    store.setCoins(result.coins);
    store.setInventory(result.inventory);
    this.coinsText?.setText(`${result.coins}`);
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

  private renderRoomItems() {
    this.roomManager.renderItems(this, useGameStore.getState().roomItems, (item) => this.selectFurniture(item));
  }

  private createFurnitureEditPanel() {
    const panel = this.add.rectangle(0, 0, 222, 212, 0x212636, 0.98).setOrigin(0).setStrokeStyle(1, 0x60519b);
    this.editPanelTitle = createReadableText(this, 12, 10, "Mover item", {
      color: "#bfc0d1",
      fontSize: "16px",
      fontStyle: "700",
    });

    this.editPanel = this.add.container(720, 292, [panel, this.editPanelTitle]).setDepth(9100).setVisible(false);
    this.enablePanelDrag(panel, this.editPanel);

    const buttons = [
      { label: "Cima", x: 74, y: 46, action: () => this.moveSelectedFurniture(0, -1) },
      { label: "Esq", x: 24, y: 84, action: () => this.moveSelectedFurniture(-1, 0) },
      { label: "Dir", x: 124, y: 84, action: () => this.moveSelectedFurniture(1, 0) },
      { label: "Baixo", x: 68, y: 84, action: () => this.moveSelectedFurniture(0, 1) },
      { label: "Girar", x: 24, y: 122, action: () => this.rotateSelectedFurniture() },
      { label: "Fechar", x: 112, y: 122, action: () => this.hideFurnitureEditPanel() },
      { label: "Remover", x: 24, y: 162, action: () => this.removeSelectedFurniture(), danger: true },
    ];

    buttons.forEach((button) => {
      const background = this.add
        .rectangle(button.x, button.y, button.label.length > 5 ? 78 : 48, 30, button.danger ? 0x7c2430 : button.label === "Fechar" ? 0x3a4258 : 0x60519b, 1)
        .setOrigin(0)
        .setStrokeStyle(1, button.danger ? 0xef626c : 0x836fd1)
        .setInteractive({ useHandCursor: true });
      const label = createReadableText(this, button.x + 8, button.y + 6, button.label, {
        color: button.danger ? "#ffd7dc" : "#ffffff",
        fontSize: "13px",
        fontStyle: "700",
      });
      background.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        button.action();
      });
      label.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        button.action();
      });
      this.editPanel?.add([background, label]);
    });
  }

  private enablePanelDrag(handle: Phaser.GameObjects.Rectangle, container: Phaser.GameObjects.Container) {
    let previous: Phaser.Math.Vector2 | null = null;
    handle.setInteractive({ useHandCursor: true });
    handle.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      previous = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!previous || !pointer.isDown || !container.visible) return;
      container.x += pointer.x - previous.x;
      container.y += pointer.y - previous.y;
      previous.set(pointer.x, pointer.y);
    });
    this.input.on("pointerup", () => {
      previous = null;
    });
  }

  private selectFurniture(item: RoomFurnitureItem) {
    this.selectedFurniture = item;
    this.resetPlayerForFurnitureEditing();
    const definition = furnitureData[item.itemId];
    this.editPanelTitle?.setText(definition ? `Mover ${definition.name}` : "Mover item");
    this.editPanel?.setVisible(true);
    postToNative({ type: "GAME_EVENT", event: "furniture-selected", payload: { itemId: item.itemId, id: item.id } });
  }

  private resetPlayerForFurnitureEditing() {
    this.gameManager.movement.stop(this.playerManager.player);
    this.playerManager.resetToSpawn();
  }

  private hideFurnitureEditPanel() {
    this.selectedFurniture = null;
    this.editPanel?.setVisible(false);
  }

  private async moveSelectedFurniture(deltaX: number, deltaY: number) {
    if (!this.selectedFurniture?.id) return;
    this.resetPlayerForFurnitureEditing();
    const store = useGameStore.getState();
    const current = store.roomItems.find((item) => item.id === this.selectedFurniture?.id);
    if (!current) return;

    const next = { ...current, x: current.x + deltaX, y: current.y + deltaY };
    if (!canPlaceItem(next.itemId, next, store.roomItems, next.id)) return;

    store.setRoomItems(store.roomItems.map((item) => (item.id === next.id ? next : item)));
    this.selectedFurniture = next;
    this.renderRoomItems();
    await this.gameManager.firebase.saveRoomItems();
  }

  private async removeSelectedFurniture() {
    if (!this.selectedFurniture?.id) return;
    this.resetPlayerForFurnitureEditing();
    const store = useGameStore.getState();
    const current = store.roomItems.find((item) => item.id === this.selectedFurniture?.id);
    if (!current) return;

    store.setRoomItems(store.roomItems.filter((item) => item.id !== current.id));
    const inventory = this.gameManager.inventory.addFurniture(current.itemId);
    await this.gameManager.firebase.saveInventory(inventory);
    await this.gameManager.firebase.saveRoomItems();
    this.inventoryUI.render(this, (itemId) => this.startPlacement(itemId));
    this.hideFurnitureEditPanel();
    this.renderRoomItems();
    postToNative({ type: "GAME_EVENT", event: "furniture-removed", payload: { itemId: current.itemId, id: current.id } });
  }

  private async rotateSelectedFurniture() {
    if (!this.selectedFurniture?.id) return;
    this.resetPlayerForFurnitureEditing();
    const store = useGameStore.getState();
    const current = store.roomItems.find((item) => item.id === this.selectedFurniture?.id);
    if (!current) return;

    const next = { ...current, rotation: ((current.rotation ?? 0) + 90) % 360 };
    if (!canPlaceItem(next.itemId, next, store.roomItems, next.id)) return;
    store.setRoomItems(store.roomItems.map((item) => (item.id === next.id ? next : item)));
    this.selectedFurniture = next;
    this.renderRoomItems();
    await this.gameManager.firebase.saveRoomItems();
  }

  shutdown() {
    this.unsubscribeNative?.();
  }
}
