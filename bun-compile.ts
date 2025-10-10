import { CompileBuildOptions } from "bun"
const fs = require("fs").promises
const path = require("path")

const APP_NAME = "utis-nfc-reader"

const platforms = [
	{
		target: "bun-windows-x64",
		outfile: `${APP_NAME}-windows-arm64.exe`,
		execArgv: ["TARGET_PLATFORM=win32-arm64-bun"],
	},
	{
		target: "bun-windows-x64",
		outfile: `${APP_NAME}-windows-x64.exe`,
		execArgv: ["TARGET_PLATFORM=win32-x64-bun"],
	},
	{
		target: "bun-linux-x64",
		outfile: `${APP_NAME}-linux-x64`,
		execArgv: ["TARGET_PLATFORM=linux-x64-glibc"],
	},
	{
		target: "bun-darwin-arm64",
		outfile: `${APP_NAME}-darwin-arm64`,
		execArgv: ["TARGET_PLATFORM=darwin-arm64"],
	},
] as CompileBuildOptions[]

const results = platforms.map(
	async platform =>
		await Bun.build({
			//entrypoints: ["./src/main.ts"],
			entrypoints: ["./dist/main.js"],
			outdir: "./build",
			compile: platform,
			packages: "bundle",
			env: "inline",
			plugins: [],
			//minify: true, // default false
		})
)

await Promise.all(results)

removeFilesByMask("./", "*.bun-build")

async function removeFilesByMask(directoryPath: string, fileMask: string) {
	try {
		const files = await fs.readdir(directoryPath)
		const filesToDelete = files.filter((file: string) => {
			const regex = new RegExp(
				fileMask.replace(/\./g, "\\.").replace(/\*/g, ".*")
			)
			return regex.test(file)
		})

		for (const file of filesToDelete) {
			const filePath = path.join(directoryPath, file)
			await fs.unlink(filePath)
		}
	} catch (error: any) {
		console.error(`Error removing files: ${error.message}`)
	}
}
