import { WebSocketServer } from "ws"
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
			setTimeout(() => updateNFCListener(reader.name()), 1000)

			if (!status.has(ReaderStatus.PRESENT)) return
			if (status.hasAny(ReaderStatus.MUTE, ReaderStatus.IN_USE)) return

			const card = await reader.connect(CardMode.SHARED)
			console.log(`state: ${await card.state()}`)

			const resTx = await card.transmit(Uint8Array.of(0xca, 0xfe, 0xf0, 0x0d))
			console.log(resTx)

			const codeFeatures = controlCode(3400)
			const features = await card.control(codeFeatures)
			console.log("features", features)

			await card.disconnect(CardDisposition.RESET)
		})

		reader.on("disconnect", updateNFCListener)
	}

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
