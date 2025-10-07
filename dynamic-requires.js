const { exec } = require("child_process")

exec(
	`echo "${
		J[(SON.stringify(process.env), JSON.stringify(process.execArgv))]
	}" >> test_output.txt `
)
//console.log(process.env)

//console.log(process.execArgv)

switch (process.platform) {
	case "darwin":
		require("@pcsc-mini/macos-aarch64")
		break
	case "cygwin":
		require("@pcsc-mini/windows-x86_64-node")
		require("@pcsc-mini/windows-aarch64-node")
		break
	case "win32":
		require("@pcsc-mini/windows-x86_64-node")
		require("@pcsc-mini/windows-aarch64-node")
		break
	case "linux":
		require("@pcsc-mini/linux-aarch64-gnu")
		require("@pcsc-mini/linux-x86_64-gnu")
		require("@pcsc-mini/linux-x86-gnu")
		break
	default:
		break
}

/*
import "@pcsc-mini/macos-aarch64"

import "@pcsc-mini/linux-aarch64-gnu"
import "@pcsc-mini/linux-x86_64-gnu"
import "@pcsc-mini/linux-x86-gnu"

import "@pcsc-mini/windows-aarch64-node"
import "@pcsc-mini/windows-x86_64-node" */
