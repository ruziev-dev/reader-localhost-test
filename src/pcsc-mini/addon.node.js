const fs = require("node:fs")

let pkg = ""

const abi = detectAbi()
const target = process.env.TARGET_PLATFORM
	? process.env.TARGET_PLATFORM
	: abi
	? `${process.platform}-${process.arch}-${abi}`
	: `${process.platform}-${process.arch}`

console.log({ target })

try {
	switch (target) {
		case "linux-arm64-glibc":
			module.exports = require("./arch/linux-aarch64-gnu/addon.node")
			break
		case "linux-arm64-musl":
			module.exports = require("./arch/linux-aarch64-musl/addon.node")
			break
		case "linux-x64-glibc":
			module.exports = require("./arch/linux-x86_64-gnu/addon.node")
			break
		case "linux-x64-musl":
			module.exports = require("./arch/linux-x86_64-musl/addon.node")
			break
		case "linux-ia32-glibc":
			module.exports = require("./arch/linux-x86-gnu/addon.node")
			break
		case "linux-ia32-musl":
			module.exports = require("./arch/linux-x86-musl/addon.node")
			break
		case "darwin-arm64":
			// работает если наверху import macosAarch64 from "./arch/macos-aarch64/addon.node"
			//module.exports = macosAarch64

			//console.log(macosAarch64)
			//module.exports = import.meta.require("./arch/macos-aarch64/addon.node")
			module.exports = require("./arch/macos-aarch64/addon.node")
			break
		case "darwin-x64":
			module.exports = require("./arch/macos-x86_64/addon.node")
			break
		case "win32-arm64-bun":
			//module.exports = winAarch64
			module.exports = require("./arch/windows-aarch64-bun/addon.node")
			break
		case "win32-x64-bun":
			//module.exports = winX86_64
			module.exports = require("./arch/windows-x86_64-bun/addon.node")
			break
		default:
			throw new Error(`Unsupported platform: ${target}`)
	}
} catch (error) {
	throw new Error(
		`Required addon dependency not found (${pkg}):\n${error}\n\n` +
			`⚠ NOTE: If optional dependencies are disabled, you may need ` +
			`to add ${pkg} as an explicit dependency.\n`
	)
}

function detectAbi() {
	if (process.platform === "win32") {
		if (process.versions.bun) return "bun"
		if (process.versions.electron) return "electron"
		return "node"
	}

	if (process.platform !== "linux") return null

	try {
		const lddContents = fs.readFileSync("/usr/bin/ldd", "utf8")
		if (lddContents.includes("GLIBC")) return "glibc"
		if (lddContents.includes("musl")) return "musl"
	} catch {}

	//@ts-expect-error ---
	if (process.report?.getReport()?.header.glibcVersionRuntime) {
		return "glibc"
	}

	throw new Error("Unable to detect Linux ABI")
}
