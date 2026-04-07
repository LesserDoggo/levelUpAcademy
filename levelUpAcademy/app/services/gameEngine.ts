// ========== TIPOS E INTERFACES ==========

export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  position: Position;
  width: number;
  height: number;
  speed: number;
  isMoving: boolean;
  targetPosition: Position | null;
}

export interface GameObject {
  id: string;
  position: Position;
  width: number;
  height: number;
  type: "furniture" | "decoration" | "cosmetic";
  name: string;
  icon: string;
  isSelected: boolean;
}

export interface GameState {
  character: Character;
  gameObjects: GameObject[];
  selectedObject: GameObject | null;
  roomWidth: number;
  roomHeight: number;
}

// ========== CONSTANTES ==========

export const GAME_CONFIG = {
  CHARACTER_WIDTH: 40,
  CHARACTER_HEIGHT: 50,
  CHARACTER_SPEED: 2.5,
  OBJECT_WIDTH: 50,
  OBJECT_HEIGHT: 50,
  INTERACTION_DISTANCE: 70,
  MOVEMENT_THRESHOLD: 3,
};

// ========== FUNÇÕES DE INICIALIZAÇÃO ==========

export const initializeGameState = (
  roomWidth: number,
  roomHeight: number,
): GameState => {
  const character: Character = {
    id: "player",
    position: {
      x: Math.max(
        0,
        Math.min(
          roomWidth / 2 - GAME_CONFIG.CHARACTER_WIDTH / 2,
          roomWidth - GAME_CONFIG.CHARACTER_WIDTH,
        ),
      ),
      y: Math.max(
        0,
        Math.min(roomHeight - 100, roomHeight - GAME_CONFIG.CHARACTER_HEIGHT),
      ),
    },
    width: GAME_CONFIG.CHARACTER_WIDTH,
    height: GAME_CONFIG.CHARACTER_HEIGHT,
    speed: GAME_CONFIG.CHARACTER_SPEED,
    isMoving: false,
    targetPosition: null,
  };

  const gameObjects: GameObject[] = [
    {
      id: "bed",
      position: { x: 50, y: 50 },
      width: GAME_CONFIG.OBJECT_WIDTH,
      height: GAME_CONFIG.OBJECT_HEIGHT,
      type: "furniture",
      name: "Cama",
      icon: "bed",
      isSelected: false,
    },
    {
      id: "desk",
      position: { x: Math.max(50, roomWidth - 100), y: 80 },
      width: GAME_CONFIG.OBJECT_WIDTH,
      height: GAME_CONFIG.OBJECT_HEIGHT,
      type: "furniture",
      name: "Escrivaninha",
      icon: "desk",
      isSelected: false,
    },
    {
      id: "bookshelf",
      position: { x: 30, y: Math.max(50, roomHeight - 120) },
      width: GAME_CONFIG.OBJECT_WIDTH,
      height: GAME_CONFIG.OBJECT_HEIGHT,
      type: "furniture",
      name: "Estante",
      icon: "bookshelf",
      isSelected: false,
    },
    {
      id: "plant",
      position: {
        x: Math.max(50, roomWidth - 60),
        y: Math.max(50, roomHeight - 100),
      },
      width: GAME_CONFIG.OBJECT_WIDTH,
      height: GAME_CONFIG.OBJECT_HEIGHT,
      type: "decoration",
      name: "Planta",
      icon: "flower",
      isSelected: false,
    },
  ];

  return {
    character,
    gameObjects,
    selectedObject: null,
    roomWidth,
    roomHeight,
  };
};

// ========== FUNÇÕES DE MOVIMENTO ==========

export const moveCharacterTowards = (
  character: Character,
  targetX: number,
  targetY: number,
  roomWidth: number,
  roomHeight: number,
): Character => {
  if (!character.isMoving || !character.targetPosition) {
    return character;
  }

  const dx = targetX - character.position.x;
  const dy = targetY - character.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Se chegou ao destino
  if (distance <= GAME_CONFIG.MOVEMENT_THRESHOLD) {
    return {
      ...character,
      position: { x: targetX, y: targetY },
      isMoving: false,
      targetPosition: null,
    };
  }

  // Calcular nova posição
  const angle = Math.atan2(dy, dx);
  let newX = character.position.x + Math.cos(angle) * character.speed;
  let newY = character.position.y + Math.sin(angle) * character.speed;

  // Clampar para não sair dos limites
  newX = Math.max(0, Math.min(newX, roomWidth - character.width));
  newY = Math.max(0, Math.min(newY, roomHeight - character.height));

  return {
    ...character,
    position: { x: newX, y: newY },
  };
};

export const setCharacterTarget = (
  character: Character,
  targetX: number,
  targetY: number,
  roomWidth: number,
  roomHeight: number,
): Character => {
  // Clampar target para os limites da sala
  const clampedTargetX = Math.max(
    0,
    Math.min(targetX, roomWidth - character.width),
  );
  const clampedTargetY = Math.max(
    0,
    Math.min(targetY, roomHeight - character.height),
  );

  // Calcular distância
  const dx = clampedTargetX - character.position.x;
  const dy = clampedTargetY - character.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Se a distância é muito pequena, não se move
  if (distance < GAME_CONFIG.MOVEMENT_THRESHOLD) {
    return {
      ...character,
      isMoving: false,
      targetPosition: null,
    };
  }

  return {
    ...character,
    isMoving: true,
    targetPosition: { x: clampedTargetX, y: clampedTargetY },
  };
};

// ========== FUNÇÕES DE INTERAÇÃO ==========

export const checkObjectInteraction = (
  character: Character,
  gameObject: GameObject,
): boolean => {
  const charCenterX = character.position.x + character.width / 2;
  const charCenterY = character.position.y + character.height / 2;

  const objCenterX = gameObject.position.x + gameObject.width / 2;
  const objCenterY = gameObject.position.y + gameObject.height / 2;

  const dx = charCenterX - objCenterX;
  const dy = charCenterY - objCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= GAME_CONFIG.INTERACTION_DISTANCE;
};

export const selectObject = (
  gameState: GameState,
  objectId: string,
): GameState => {
  const selectedObject =
    gameState.gameObjects.find((obj) => obj.id === objectId) ?? null;

  const updatedObjects = gameState.gameObjects.map((obj) => ({
    ...obj,
    isSelected: obj.id === objectId,
  }));

  return {
    ...gameState,
    gameObjects: updatedObjects,
    selectedObject,
  };
};

export const deselectObject = (gameState: GameState): GameState => {
  const updatedObjects = gameState.gameObjects.map((obj) => ({
    ...obj,
    isSelected: false,
  }));

  return {
    ...gameState,
    gameObjects: updatedObjects,
    selectedObject: null,
  };
};

// ========== FUNÇÕES DE ATUALIZAÇÃO ==========

export const updateGameState = (
  gameState: GameState,
  deltaTime: number,
): GameState => {
  let updatedCharacter = gameState.character;

  // Atualizar movimento do personagem
  if (updatedCharacter.isMoving && updatedCharacter.targetPosition) {
    updatedCharacter = moveCharacterTowards(
      updatedCharacter,
      updatedCharacter.targetPosition.x,
      updatedCharacter.targetPosition.y,
      gameState.roomWidth,
      gameState.roomHeight,
    );
  }

  // Manter a seleção anterior (não resetar automaticamente)
  let selectedObject = gameState.selectedObject;

  return {
    ...gameState,
    character: updatedCharacter,
    selectedObject,
  };
};

// ========== FUNÇÕES UTILITÁRIAS ==========

export const getCharacterDirection = (
  character: Character,
): "up" | "down" | "left" | "right" | "idle" => {
  if (!character.isMoving || !character.targetPosition) {
    return "idle";
  }

  const dx = character.targetPosition.x - character.position.x;
  const dy = character.targetPosition.y - character.position.y;

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle > -45 && angle <= 45) {
    return "right";
  } else if (angle > 45 && angle <= 135) {
    return "down";
  } else if (angle > 135 || angle <= -135) {
    return "left";
  } else {
    return "up";
  }
};
