import { useState, useEffect, useCallback } from "react";
import "./App.css";

import { Pn532 } from "pn532.js";
import Pn532WebserialAdapter from "pn532.js/plugin/WebserialAdapter.js";
import Pn532Hf14a from "pn532.js/plugin/Hf14a.js";

interface CardData {
  type: string;
  uid: string;
  atr: string;
  standard: string;
}

const pn532 = new Pn532();
pn532.use(new Pn532WebserialAdapter()); // A pn532 instance must register exactly one adapter plugin
pn532.use(new Pn532Hf14a());

function App() {
  const [serialReader, setSerialReader] = useState<object | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [cardData, setCardData] = useState<CardData | null>(null);

  const subscribeOnEvents = useCallback(() => {
    pn532.$hf14a
      .mfSelectCard()
      .then(data => {
        console.log(JSON.stringify(data));
        setMessages(prev => [...prev, JSON.stringify(data)]);
      })
      .finally(() => {
        subscribeOnEvents();
      });
  }, []);

  //console.log(JSON.stringify( )); // {"pack":"Packet(9): 010004080407460D6D","atqa":"Packet(2): 0004","sak":"Packet(1): 08","uid":"Packet(4): 07460D6D","rats":"Packet(0)"}

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setMessages(prev => [...prev, "[WS] Connected to WebSocket server"]);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "nfc_card") {
          setCardData(data);
          setMessages(prev => [...prev, `[WS] NFC Card detected: ${data.uid}`]);
        } else {
          setMessages(prev => [...prev, `[WS] Message: ${event.data}`]);
        }
      } catch (e) {
        setMessages(prev => [...prev, `[WS] Message: ${event.data}`]);
      }
    };

    ws.onerror = error => {
      console.error("WebSocket error:", error);
      setMessages(prev => [
        ...prev,
        `[WS] Error: ${JSON.stringify(error, null, 2)}`,
      ]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setMessages(prev => [...prev, "[WS] Disconnected from WebSocket server"]);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <h1>NFC Client</h1>

      {cardData && (
        <div className="card-info">
          <h2>NFC Card Detected</h2>
          <p>UID: {cardData.uid}</p>
          <p>Standard: {cardData.standard}</p>
        </div>
      )}

      {!!serialReader ? (
        <h3>{JSON.stringify(serialReader)}</h3>
      ) : (
        <button
          onClick={() =>
            pn532.getFirmwareVersion().then(data => {
              setSerialReader(data);
              console.log(JSON.stringify(data));
              subscribeOnEvents();
            })
          }>
          Connect Serial
        </button>
      )}

      <div className="messages">
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index} style={{ textAlign: "left" }}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
