import { useState, useEffect } from "react";
import "./App.css";

interface CardData {
  type: string;
  uid: string;
  atr: string;
  standard: string;
}

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [cardData, setCardData] = useState<CardData | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setMessages(prev => [...prev, "Connected to WebSocket server"]);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "nfc_card") {
          setCardData(data);
          setMessages(prev => [...prev, `NFC Card detected: ${data.uid}`]);
        } else {
          setMessages(prev => [...prev, `Message: ${event.data}`]);
        }
      } catch (e) {
        setMessages(prev => [...prev, `Message: ${event.data}`]);
      }
    };

    ws.onerror = error => {
      console.error("WebSocket error:", error);
      setMessages(prev => [
        ...prev,
        `Error: ${JSON.stringify(error, null, 2)}`,
      ]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setMessages(prev => [...prev, "Disconnected from WebSocket server"]);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <h1>NFC WebSocket Client</h1>

      {cardData && (
        <div className="card-info">
          <h2>NFC Card Detected</h2>
          <p>UID: {cardData.uid}</p>
          <p>Standard: {cardData.standard}</p>
        </div>
      )}

      <div className="messages">
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
