import { SysTray } from "node-systray-v2"
import { icoIconBase64 } from "./assets/ico-icon"
import { pngIconBase64 } from "./assets/png-icon"
import { RunServerAndNFCListener } from "./server"

RunServerAndNFCListener(
	clients => console.log(`Clients: ${clients}`),
	name => console.log(`New reader connected: ${name}`)
)
/* 
try {
	const files = fs.readdirSync(assets_path)
	console.log(`[assets_path]: Files in ${assets_path}:`)
	files.forEach(file => {
		console.log(file)
	})
} catch (err) {
	console.error(`Error reading directory: ${err}`)
}

export const Systray = new SysTray({
	menu: {
		// you should using .png icon in macOS/Linux, but .ico format in windows
		icon:
			process.platform === "win32" || process.platform === "cygwin"
				? icoIconBase64
				: pngIconBase64,
		title: "UTIS NFC",
		tooltip: "Tips",
		items: [
			{
				title: "NFC Считыватель: не подключен",
				tooltip: "",
				checked: false,
				enabled: false,
			},
			{
				title: "Подключено слушателей: 0",
				tooltip: "",
				checked: false,
				enabled: false,
			},
			{
				title: "Закрыть",
				tooltip: "Выход",
				checked: false,
				enabled: true,
			},
		],
	},
	debug: false,
	copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
})

Systray.onError(err => {
	console.error(err)
})

Systray.onReady(() => {
	function updateClients(clients: number) {
		Systray.sendAction({
			type: "update-item",
			item: {
				title: `Подключено слушателей: ${clients}`,
				tooltip: "",
				checked: false,
				enabled: false,
			},
			seq_id: 1,
		})
	}

	function updateNFCListener(name?: string) {
		Systray.sendAction({
			type: "update-item",
			item: {
				title: `NFC Считыватель: ${name || "не подключен"}`,
				tooltip: "",
				checked: false,
				enabled: false,
			},
			seq_id: 0,
		})
	}

	Systray.onClick(event => {
		if (event.seq_id === 2) {
			console.log("Killing the systray...")
			Systray.kill()
			process.exit(0)
		}
	})
	RunServerAndNFCListener(updateClients, updateNFCListener)
})
 */
