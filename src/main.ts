import { RunServerAndNFCListener } from "./server"

RunServerAndNFCListener(
	clients => console.log(`clients: ${clients}`),
	name => console.log(`ReaderName: ${name}`)
)
