const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-game-engine",
  "src",
  "DefaultTouchProcessor.js",
);

const source = `export default ({
  triggerPressEventBefore = 200,
  triggerLongPressEventAfter = 700,
  moveThreshold = 0
}) => {
  return touches => {
    const activeTouches = new Map();

    const distanceFromStart = (start, event) => {
      const dx = (event.pageX || 0) - (start.pageX || 0);
      const dy = (event.pageY || 0) - (start.pageY || 0);
      return Math.sqrt(dx * dx + dy * dy);
    };

    const clearLongPress = record => {
      if (record && record.longPressTimer) clearTimeout(record.longPressTimer);
    };

    return {
      process(type, event) {
        const id = event.identifier || 0;

        if (type === "start") {
          const record = {
            start: event,
            last: event,
            moved: false,
            longPressed: false,
            longPressTimer: null
          };

          record.longPressTimer = setTimeout(() => {
            const current = activeTouches.get(id);
            if (!current || current.moved || current.longPressed) return;
            current.longPressed = true;
            touches.push({ id, type: "long-press", event: current.last });
          }, triggerLongPressEventAfter);

          activeTouches.set(id, record);
          touches.push({ id, type: "start", event });
          return;
        }

        const record = activeTouches.get(id);
        if (!record) return;

        if (type === "move") {
          const delta = {
            locationX: (event.locationX || 0) - (record.last.locationX || 0),
            locationY: (event.locationY || 0) - (record.last.locationY || 0),
            pageX: (event.pageX || 0) - (record.last.pageX || 0),
            pageY: (event.pageY || 0) - (record.last.pageY || 0),
            timestamp: (event.timestamp || Date.now()) - (record.last.timestamp || Date.now())
          };

          record.last = event;

          if (distanceFromStart(record.start, event) > moveThreshold) {
            record.moved = true;
            clearLongPress(record);
          }

          touches.push({ id, type: "move", event, delta });
          return;
        }

        if (type === "end") {
          clearLongPress(record);
          activeTouches.delete(id);
          touches.push({ id, type: "end", event });

          const elapsed = (event.timestamp || Date.now()) - (record.start.timestamp || Date.now());
          if (!record.moved && !record.longPressed && elapsed <= triggerPressEventBefore) {
            touches.push({ id, type: "press", event });
          }
        }
      },
      end() {
        activeTouches.forEach(clearLongPress);
        activeTouches.clear();
      }
    };
  };
};
`;

if (fs.existsSync(target)) {
  fs.writeFileSync(target, source);
  console.log("Patched react-native-game-engine DefaultTouchProcessor for Expo Web.");
}
