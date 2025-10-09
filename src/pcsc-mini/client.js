"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (
					!desc ||
					("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
		  }
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
		  })
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
		  }
		: function (o, v) {
				o["default"] = v
		  })
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o)
						if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.Client = exports.MAX_READERS = void 0
const node_events_1 = require("node:events")
const pcsc = __importStar(require("./addon.node"))
const reader_1 = require("./reader")
exports.MAX_READERS = pcsc.MAX_READERS
/**
 * Represents a PCSC client connection. Provides notifications for reader
 * connection state changes via an {@link EventEmitter} interface.
 *
 * ## Events
 * - **`"error"` [ {@link Err} ]** - Emitted when an error is encountered
 *   while monitoring for reader state updates in the background thread.
 * - **`"reader"` [ {@link Reader} ]** - Emitted once for each card reader when
 *   it is detected (connected/re-connected to the system) and also once for
 *   each reader that is already connected when monitoring is {@link start}ed.
 *
 * ## Example
 * ```ts
 * import * as pcsc from "pcsc-mini";
 *
 * const client = new pcsc.Client()
 *   .on("reader", onReader);
 *   .on("error", onError);
 *   .start(); // Start monitoring for reader state changes.
 *
 * function onError(err: pcsc.Err) {
 *   console.error("Unexpected PCSC error:", err);
 *   client.stop();
 * };
 *
 * function onReader(reader: pcsc.Reader) {
 *   console.log(`Reader detected: ${reader}`);
 *   // ...
 * }
 * ```
 */
class Client extends node_events_1.EventEmitter {
	#client
	#readers = {}
	#running = false
	constructor(addon = pcsc) {
		super()
		this.#client = addon.newClient()
	}
	/**
	 * The reader identified by `name`, if it is currently connected.
	 */
	reader(name) {
		return this.#readers[name]
	}
	/**
	 * `true` if the reader state monitoring thread is currently running.
	 */
	running() {
		return this.#running
	}
	/**
	 * Start monitoring for reader status changes.
	 *
	 * A subsequent call to {@link stop} will stop monitoring and detach
	 * this client.
	 *
	 * @throws {@link Err}
	 */
	start() {
		this.#running = true
		this.#client.start(this.#onStateChange, this.#onError)
		return this
	}
	/**
	 * Stop monitoring for reader status changes and detach the client from the
	 * PCSC server. Any in-progress transmissions will be cancelled.
	 *
	 * Monitoring can be resumed with another call to {@link start};
	 *
	 * @throws {@link Err}
	 */
	stop() {
		this.#running = false
		this.#client.stop()
		for (const name of Object.keys(this.#readers)) {
			this.#onReaderDisconnect(name)
		}
	}
	#onError = err => {
		// Ignore shutdown errors when the monitoring thread is stopped.
		if (!this.#running) return
		this.emit("error", err)
	}
	#onReaderConnect = name => {
		const existingReader = this.#readers[name]
		if (existingReader) return existingReader
		const reader = new reader_1.Reader(this.#client, name)
		this.#readers[name] = reader
		this.emit("reader", reader)
		return reader
	}
	#onReaderDisconnect = name => {
		if (!this.#readers[name]) return
		this.#readers[name].emit("disconnect")
		this.#readers[name].removeAllListeners()
		delete this.#readers[name]
	}
	#onStateChange = (readerName, rawStatus, atr) => {
		const status = new reader_1.ReaderStatusFlags(rawStatus)
		if (
			status.hasAny(
				reader_1.ReaderStatus.UNKNOWN,
				reader_1.ReaderStatus.UNAVAILABLE
			)
		) {
			return this.#onReaderDisconnect(readerName)
		}
		this.#onReaderConnect(readerName).emit("change", status, atr)
	}
}
exports.Client = Client
