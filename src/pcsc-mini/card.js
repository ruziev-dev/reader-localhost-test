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
exports.CardStatusFlags =
	exports.CardState =
	exports.Card =
	exports.protocolString =
	exports.cardStatusString =
	exports.controlCode =
	exports.Protocol =
	exports.CardStatus =
	exports.CardMode =
	exports.CardDisposition =
	exports.attributes =
	exports.MAX_BUFFER_LEN =
	exports.MAX_ATR_LEN =
		void 0
const pcsc = __importStar(require("./addon.node"))
exports.MAX_ATR_LEN = pcsc.MAX_ATR_LEN
exports.MAX_BUFFER_LEN = pcsc.MAX_BUFFER_LEN
exports.attributes = pcsc.attributes
exports.CardDisposition = pcsc.CardDisposition
exports.CardMode = pcsc.CardMode
exports.CardStatus = pcsc.CardStatus
exports.Protocol = pcsc.Protocol
exports.controlCode = pcsc.controlCode
exports.cardStatusString = pcsc.cardStatusString
exports.protocolString = pcsc.protocolString
/**
 * Represents a connection to an inserted smart card.
 *
 * ## Example
 * ```ts
 * import * as pcsc from "pcsc-mini";
 * const { CardDisposition, CardMode, ReaderStatus } = pcsc;
 *
 * const client = new pcsc.Client()
 *   .on("reader", onReader)
 *   .start();
 *
 * function onReader(reader: pcsc.Reader) {
 *   reader.on("change", async status => {
 *     if (!status.has(ReaderStatus.PRESENT)) return;
 *     if (status.hasAny(ReaderStatus.MUTE, ReaderStatus.IN_USE)) return;
 *
 *     const card = await reader.connect(CardMode.EXCLUSIVE);
 *     console.log(`${await card.state()}`);
 *
 *     const resTx = await card.transmit(
 *       Uint8Array.of(0xca, 0xfe, 0xf0, 0x0d)
 *     );
 *     console.log(resTx);
 *
 *     const codeFeatures = pcsc.controlCode(3400);
 *     const resCtrl = await card.control(codeFeatures);
 *     console.log(resCtrl);
 *
 *     await card.disconnect(CardDisposition.RESET);
 *     client.stop();
 *     process.exit(0);
 *   });
 * }
 * ```
 */
class Card {
	#card
	constructor(card) {
		this.#card = card
	}
	/**
	 * Gets an attribute from the IFD Handler.
	 *
	 * @param id - ID of the requested attribute. {@link attributes.ids} provides
	 *   a non-exhaustive list of available attribute IDs that may be useful.
	 *
	 * @param outputBuffer - Backing buffer for the response. If omitted, a new
	 *   buffer will be allocated with enough space for the response.
	 *
	 * @returns The attribute value response.
	 * @throws {@link Err}
	 */
	attributeGet(id, outputBuffer) {
		return this.#card.attributeGet(id, outputBuffer)
	}
	/**
	 * Sets an attribute of the IFD Handler.
	 *
	 * @param id - ID of the requested attribute. {@link attributes.ids} provides
	 *   a non-exhaustive list of available attribute IDs that may be useful.
	 * @param value - The new byte data value of the attribute.
	 *
	 * @throws {@link Err}
	 */
	attributeSet(id, value) {
		return this.#card.attributeSet(id, value)
	}
	/**
	 * Sends a command directly to the IFD Handler (reader driver).
	 *
	 * This is useful for creating client side reader drivers for functions like
	 * PIN pads, biometrics, or other extensions to the normal smart card reader
	 * that are not normally handled by PC/SC.
	 *
	 * ## Example:
	 * ```ts
	 * import * as pcsc from "pcsc-mini";
	 *
	 * const IOCTL_GET_FEATURE_REQUEST = pcsc.controlCode(3400);
	 *
	 * function getFeatures(card: pcsc.Card): Promise<Uint8Array> {
	 *   return card.control(IOCTL_GET_FEATURE_REQUEST);
	 * }
	 * ```
	 *
	 * @param code - The card reader device control code. For cross platform
	 *   compatibility, use {@link controlCode} to construct the control code.
	 * @param command - Control command data, if any.
	 * @param outputBuffer - Backing buffer for the response. If omitted, a new
	 *   buffer will be allocated with enough space for the response.
	 *
	 * @returns The response data from the reader.
	 * @throws {@link Err}
	 */
	control(code, command, outputBuffer) {
		return this.#card.control(code, command, outputBuffer)
	}
	/**
	 * Closes the connection to the card, rendering this instance invalid.
	 *
	 * @param then - Action to take after disconnection.
	 *
	 * @throws {@link Err}
	 */
	disconnect(then) {
		return this.#card.disconnect(then)
	}
	/**
	 * The currently active card communication protocol.
	 *
	 * This is set when the card connection is first established and updated after
	 * {@link reconnect} calls. It will *not* be updated if/when a protocol is
	 * negotiated via {@link control}.
	 *
	 * @throws {@link Err}
	 */
	protocol() {
		return this.#card.protocol()
	}
	/**
	 * Attempts to re-establish a previously reset connection.
	 *
	 * If connected in {@link CardMode.SHARED}, another process may reset the
	 * card, causing successive commands to return an error. In those cases,
	 * calling {@link reconnect} will restore the connection accordingly.
	 *
	 * > [!NOTE]
	 * > For the sake of portability across platforms, the reconnect request is
	 * > sent with the previously active protocol. To change protocols, first
	 * > {@link disconnect} and then establish a new connection.
	 *
	 * @param mode - Access mode for the restored connection.
	 * @param initAction - Action to take on the card when reconnecting.
	 * @returns - The active protocol after reconnection.
	 *
	 * @throws {@link Err}
	 */
	reconnect(mode, initAction) {
		return this.#card.reconnect(mode, initAction)
	}
	/**
	 * The current state of the card.
	 * @throws {@link Err}
	 */
	async state() {
		return new CardState(await this.#card.state())
	}
	/**
	 * Establishes a temporary {@link CardMode.EXCLUSIVE} connection to the card,
	 * if originally connected with {@link CardMode.SHARED}, creating a lock for
	 * issuing multiple commands without interruption from other processes.
	 *
	 * > [!IMPORTANT]
	 * > Must be followed up with a matching call to
	 * > {@link Transaction.end}() when done with the session.
	 *
	 * ## Example
	 * ```ts
	 * import * as pcsc from "pcsc-mini";
	 *
	 * async function longRunningProcess(card: pcsc.Card) {
	 *   const txn = card.transaction();
	 *
	 *   try {
	 *     const r1 = await card.transmit(Uint8Array.of(0xca, 0xfe, 0xf0, 0x0d));
	 *     const r2 = await card.transmit(Uint8Array.of(0xfa, 0xde, 0xfa, 0xce));
	 *
	 *     return processResults(r1, r2);
	 *   } catch (err) {
	 *     console.error("Something went wrong:", err);
	 *   } finally {
	 *     txn.end(pcsc.CardDisposition.LEAVE);
	 *   }
	 * }
	 * ```
	 *
	 * @returns A handle to the newly active transaction.
	 * @throws {@link Err}
	 */
	transaction() {
		return this.#card.transaction()
	}
	/**
	 * Sends an [APDU](https://en.wikipedia.org/wiki/Smart_card_application_protocol_data_unit)
	 * to the card.
	 *
	 * ## Example
	 * ```ts
	 * import { Buffer } from "node:buffer";
	 * import * as pcsc from "pcsc-mini";
	 *
	 * async function getData(card: pcsc.Card) {
	 *   const buf = new ArrayBuffer(pcsc.MAX_BUFFER_LEN);
	 *
	 *   try {
	 *     const res1 = await card.transmit(Uint8Array.of(0xca, 0xfe), buf);
	 *     const foo = processRes1(res1);
	 *
	 *     const res2 = await card.transmit(Buffer.of(0xf0, 0x0d), buf);
	 *     const bar = processRes2(res2);
	 *
	 *     return processResults(foo, bar);
	 *   } catch (err) {
	 *     console.error("Something went wrong:", err);
	 *     return null;
	 *   }
	 * }
	 * ```
	 *
	 * @param input - The APDU byte data.
	 * @param outputBuffer - Backing buffer for the response. If omitted, a new
	 *   buffer will be allocated with enough space for the response.
	 *
	 * @returns The response data from the card.
	 * @throws {@link Err}
	 */
	transmit(input, outputBuffer) {
		return this.#card.transmit(undefined, input, outputBuffer)
	}
	/**
	 * Sends an [APDU](https://en.wikipedia.org/wiki/Smart_card_application_protocol_data_unit)
	 * to the card with a specific protocol. Useful for {@link CardMode.DIRECT}
	 * connections, when a specific protocol has not yet been negotiated.
	 *
	 * ## Example
	 * ```ts
	 * import { Buffer } from "node:buffer";
	 * import * as pcsc from "pcsc-mini";
	 *
	 * async function getData(card: pcsc.Card) {
	 *
	 *   try {
	 *     const foo = await card.transmit(
	 *       pcsc.Protocol.T1,
	 *       Uint8Array.of(0xca, 0xfe),
	 *     );
	 *
	 *     const bar = await card.transmit(
	 *       pcsc.Protocol.T1,
	 *       Buffer.of(0xf0, 0x0d),
	 *     );
	 *
	 *     return processResults(foo, bar);
	 *   } catch (err) {
	 *     console.error("Something went wrong:", err);
	 *     return null;
	 *   }
	 * }
	 * ```
	 *
	 * @param input - The APDU byte data.
	 * @param outputBuffer - Backing buffer for the response. If omitted, a new
	 *   buffer will be allocated with enough space for the response.
	 *
	 * @returns The response data from the card.
	 * @throws {@link Err}
	 */
	transmitProtocol(protocol, input, outputBuffer) {
		return this.#card.transmit(protocol, input, outputBuffer)
	}
}
exports.Card = Card
/**
 * The state of a connected smart card.
 */
class CardState {
	/**
	 * The card [ATR](https://en.wikipedia.org/wiki/Answer_to_reset) value.
	 */
	atr
	/**
	 * The currently active protocol.
	 */
	protocol
	/**
	 * Name of the reader containing the card.
	 */
	readerName
	/**
	 * The current card status.
	 */
	status
	constructor(state) {
		this.atr = state.atr
		this.protocol = state.protocol
		this.readerName = state.readerName
		this.status = new CardStatusFlags(state.status)
	}
	/**
	 * Human-friendly card info.
	 */
	toString() {
		return (
			`[${this.readerName}]:\n` +
			`    Protocol: ${pcsc.protocolString(this.protocol)}\n` +
			`    Status: ${this.status}\n` +
			`    ATR: { ${byteString(this.atr)} }`
		)
	}
}
exports.CardState = CardState
/**
 * Bit flag representation of a card's status.
 */
class CardStatusFlags {
	/**
	 * The raw mask value of the status flags.
	 */
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
		return (0, exports.cardStatusString)(this.raw)
	}
}
exports.CardStatusFlags = CardStatusFlags
function byteString(buf) {
	const chunks = new Array(buf.length)
	for (let i = 0; i < buf.length; i += 1) {
		chunks[i] = buf[i].toString(16)
	}
	return chunks.join(", ")
}
