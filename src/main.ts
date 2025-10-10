//import { SysTray } from "node-systray-v2"
//import { icoIconBase64 } from "./assets/ico-icon"
//import { pngIconBase64 } from "./assets/png-icon"
import { RunServerAndNFCListener } from "./server"

RunServerAndNFCListener(
	clients => console.log(`clients: ${clients}`),
	name => console.log(`ReaderName: ${name}`)
)
