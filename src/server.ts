import { WebSocketServer } from "ws"
import PCSC from "@tockawa/nfc-pcsc"
import { CardReader } from "@tockawa/nfc-pcsc/dist/types/src/utils/readers/Reader.typings"
export const PORT = 8080
export const wss = new WebSocketServer({ port: PORT })

const nfc = new PCSC()

export const RunServerAndNFCListener = (
	updateClients: (clients: number) => void,
	updateNFCListener: (name?: string) => void
) => {
	setTimeout(() => {
		updateNFCListener((Object.values(nfc.readers)?.[0] as CardReader)?.name)
	}, 1000)

	nfc.on("reader", reader => {
		updateNFCListener(reader.name)
		console.log(`NFC reader detected: ${reader.name}`)

		reader.on("card", card => {
			// Card detected, broadcast to all clients
			const cardData = {
				type: "nfc_card",
				uid: card.uid,
				atr: card.atr,
				standard: card.standard,
			}

			console.log(`Card detected: ${card.uid}`)

			wss.clients.forEach(client => {
				if (client.readyState === 1) {
					// 1 = OPEN
					client.send(JSON.stringify(cardData))
				}
			})
		})

		reader.on("error", (err: any) => {
			console.error(`NFC reader error: ${err.message}`)
		})

		reader.on("end", () => {
			console.log("NFC reader disconnected")
			updateNFCListener()
		})
	})

	nfc.on("error", (err: any) => {
		console.error(`NFC error: ${err.message}`)
	})

	wss.on("connection", ws => {
		console.log("New client connected")
		updateClients(wss.clients.size)

		ws.on("close", () => {
			updateClients(wss.clients.size)
			console.log("Client disconnected")
		})
	})

	console.log(`WebSocket server running on ws://localhost:${PORT}`)
	console.log("Waiting for NFC card...")
}
