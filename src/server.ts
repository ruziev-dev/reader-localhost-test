import { WebSocketServer } from "ws";
const NFC = require("nfc-pcsc").NFC;

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Initialize NFC reader
const nfc = new NFC();

nfc.on("reader", (reader: any) => {
  console.log(`NFC reader detected: ${reader.reader.name}`);

  reader.on("card", (card: any) => {
    // Card detected, broadcast to all clients
    const cardData = {
      type: "nfc_card",
      uid: card.uid,
      atr: card.atr,
      standard: card.standard,
    };

    console.log(`Card detected: ${card.uid}`);

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        // 1 = OPEN
        client.send(JSON.stringify(cardData));
      }
    });
  });

  reader.on("error", (err: any) => {
    console.error(`NFC reader error: ${err.message}`);
  });

  reader.on("end", () => {
    console.log("NFC reader disconnected");
  });
});

nfc.on("error", (err: any) => {
  console.error(`NFC error: ${err.message}`);
});

wss.on("connection", ws => {
  console.log("New client connected");

  ws.on("message", data => {
    console.log(`Received message: ${data}`);
    // Echo the message back to the client
    ws.send(`Echo: ${data}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
console.log("Waiting for NFC card...");
