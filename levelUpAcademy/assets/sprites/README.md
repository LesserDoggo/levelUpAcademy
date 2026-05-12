# Estrutura de sprites do jogo

Este projeto agora usa **apenas sprites externos** para player e moveis.

## Pastas esperadas

```text
assets/
  sprites/
    player/
      head/
      face/
      torso/
      legs/
      feet/
    furniture/
```

## Nomes de arquivos esperados (player)

Cada parte do player deve ter os mesmos frames:

- `idle_0.png`
- `idle_1.png`
- `walk_0.png`
- `walk_1.png`

Exemplo:

```text
assets/sprites/player/head/idle_0.png
assets/sprites/player/head/idle_1.png
assets/sprites/player/head/walk_0.png
assets/sprites/player/head/walk_1.png
```

Repita o mesmo para `face`, `torso`, `legs` e `feet`.

## Nomes sugeridos para moveis

No minimo, mantenha 1 arquivo por tipo:

- `bed.png`
- `table.png`
- `chair.png`
- `plant.png`

Em:

```text
assets/sprites/furniture/
```

## Como o jogo carrega sprites

- O player e carregado por camadas em `app/screens/gameScreen.tsx` usando `PLAYER_SPRITES`.
- A ordem visual da composicao e: `head` -> `face` -> `torso` -> `legs` -> `feet`.
- Os moveis usam `FURNITURE_SPRITES`, tambem em `app/screens/gameScreen.tsx`.
- Atualize as URIs do manifesto para apontar para seus arquivos finais (CDN, storage, ou caminho empacotado no app).
