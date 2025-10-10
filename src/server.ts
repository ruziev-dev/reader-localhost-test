import { WebSocketServer } from "ws"
/* import {
	CardDisposition,
	CardMode,
	Client,
	controlCode,
	ReaderStatus,
} from "./pcsc-mini" */
import { Reader, ReaderStatus } from "./pcsc-mini/reader"
import { Client } from "./pcsc-mini/client"
import { CardDisposition, CardMode, controlCode } from "./pcsc-mini/addon.node"
export const PORT = 5002
export const wss = new WebSocketServer({ port: PORT })

export const RunServerAndNFCListener = (
	updateClients: (clients: number) => void,
	updateNFCListener: (name?: string) => void
) => {
	const client = new Client()
		.on("reader", onReader)
		.on("error", e => {
			console.log("[ERROR] ", e)
			client.stop()
			client.start()
		})
		.start()

	function onReader(reader: Reader) {
		reader.on("change", async status => {
			console.log(status)
			setTimeout(() => {
				updateNFCListener(reader.name())
			}, 1000)

			if (!status.has(ReaderStatus.PRESENT)) return
			if (status.hasAny(ReaderStatus.MUTE, ReaderStatus.IN_USE)) return

			const card = await reader.connect(CardMode.SHARED)
			console.log(`state: ${await card.state()}`)

			//const resTx = await card.transmit(Uint8Array.of(0xca, 0xfe, 0xf0, 0x0d))
			//console.log(resTx)

			const codeFeatures = controlCode(3400)
			const features = await card.control(codeFeatures)
			console.log("features", features)

			await card.disconnect(CardDisposition.RESET)
			//client.stop()
			//process.exit(0)
		})

		reader.on("disconnect", updateNFCListener)
	}

	/* nfc.on("reader", reader => {
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
	}) */

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
