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
exports.ReaderStatusFlags =
	exports.Reader =
	exports.readerStatusString =
	exports.ReaderStatus =
		void 0
const node_events_1 = require("node:events")
const pcsc = __importStar(require("./addon.node"))
const card_1 = require("./card")
exports.ReaderStatus = pcsc.ReaderStatus
exports.readerStatusString = pcsc.readerStatusString
/**
 * Represents a connected card reader. Provides an API for connecting to
 * inserted cards and an {@link EventEmitter} interface for reader/card state
 * notifications.
 *
 * ## Events
 * - **`"change"` [ {@link ReaderStatusFlags}, {@link Uint8Array} ]** - Emitted
 *   when a change is detected in the state of the reader. The event handler is
 *   invoked with the new reader status and
 *   [ATR](https://en.wikipedia.org/wiki/Answer_to_reset) value of the inserted
 *   card, if present.
 * - **`"disconnect"` [ _no args_ ]** - Emitted when the reader is no longer
 *   detected (e.g. physically disconnected from the system).
 *
 * ## Example
 *
 * ```ts
 * import * as pcsc from "pcsc-mini";
 * const { CardDisposition, CardMode, ReaderStatus } = pcsc;
 *
 * const client = new pcsc.Client()
 *   .on("reader", onReader)
 *   .start();
 *
 * function onReader(reader: pcsc.Reader) {
 *   let card: pcsc.Card | undefined;
 *
 *   reader.on("change", async status => {
 *     if (!status.has(ReaderStatus.PRESENT)) return;
 *     if (status.hasAny(ReaderStatus.MUTE, ReaderStatus.IN_USE)) return;
 *
 *     if (!card) card = await reader.connect(CardMode.SHARED);
 *
 *     // ...
 *   });
 *
 *   reader.on("disconnect", () => {
 *     void card?.disconnect(CardDisposition.RESET);
 *     card = undefined;
 *   });
 * }
 * ```
 */
class Reader extends node_events_1.EventEmitter {
	#client
	#name
	constructor(client, name) {
		super()
		this.#client = client
		this.#name = name
	}
	/**
	 * Establishes a new connection with an inserted card, if available, with the
	 * specified protocol (or an appropriate one for the card, if unspecified).
	 *
	 * {@link Protocol.UNSET} can be used only in conjunction with
	 * {@link CardMode.DIRECT} and will cause the connection to be made without
	 * any protocol negotiation. A protocol can subsequently be set via
	 * {@link Card.control} with the `IOCTL_SMARTCARD_SET_PROTOCOL` control code -
	 * i.e. {@link pcsc.controlCode}(12).
	 *
	 * See https://learn.microsoft.com/en-us/windows/win32/api/winscard/nf-winscard-scardconnecta#parameters
	 *
	 * @param mode - Access mode for the connection.
	 * @param protocol - Preferred protocol for the connection. Defaults to
	 *   {@link Protocol.ANY}.
	 *
	 * @returns The newly connected card.
	 * @throws {@link Err}
	 */
	async connect(mode, protocol) {
		try {
			return new card_1.Card(
				await this.#client.connect(this.#name, mode, protocol)
			)
		} catch (err) {
			return Promise.reject(err)
		}
	}
	/**
	 * The driver-provided reader name.
	 *
	 * > [!NOTE]
	 * > If multiple readers of the same model are connected, this will be
	 * > disambiguated (e.g. `"FOO Inc Reader 00"`, `"FOO Inc Reader 01"`), but
	 * > the assigned index is not guaranteed to be consistent across
	 * > disconnects/reconnects.
	 */
	name() {
		return this.#name
	}
	/**
	 * Alias of {@link name}.
	 */
	toString() {
		return this.#name
	}
}
exports.Reader = Reader
/**
 * Bit flag representation of a card reader's status.
 */
class ReaderStatusFlags {
	/** The raw mask value of the status flags. */
	raw
	constructor(raw) {
		this.raw = raw
	}
	/**
	 * `true` iff *all* the specified flags are set.
	 */
	has(...flags) {
		let mask = 0
		for (const flag of flags) mask |= flag
		return (this.raw & mask) === mask
	}
	/**
	 * `true` if *any* of the specified flags are set.
	 */
	hasAny(...flags) {
		let mask = 0
		for (const flag of flags) mask |= flag
		return (this.raw & mask) !== 0
	}
	/**
	 * Human-readable names of the enabled flags, for logging/debugging.
	 */
	toString() {
		return (0, exports.readerStatusString)(this.raw)
	}
}
exports.ReaderStatusFlags = ReaderStatusFlags
