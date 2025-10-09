import * as pcsc from "./addon.node"
import { type Err, type Transaction } from "./addon.node"
export import MAX_ATR_LEN = pcsc.MAX_ATR_LEN
export import MAX_BUFFER_LEN = pcsc.MAX_BUFFER_LEN
export { type Err, type Transaction }
export import attributes = pcsc.attributes
export import CardDisposition = pcsc.CardDisposition
export import CardMode = pcsc.CardMode
export import CardStatus = pcsc.CardStatus
export import Protocol = pcsc.Protocol
export import controlCode = pcsc.controlCode
export import cardStatusString = pcsc.cardStatusString
export import protocolString = pcsc.protocolString
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
export declare class Card {
	#private
	constructor(card: pcsc.Card)
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
	attributeGet(id: number, outputBuffer?: ArrayBuffer): Promise<Uint8Array>
	/**
	 * Sets an attribute of the IFD Handler.
	 *
	 * @param id - ID of the requested attribute. {@link attributes.ids} provides
	 *   a non-exhaustive list of available attribute IDs that may be useful.
	 * @param value - The new byte data value of the attribute.
	 *
	 * @throws {@link Err}
	 */
	attributeSet(id: number, value: Uint8Array): Promise<void>
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
	control(
		code: number,
		command?: Uint8Array,
		outputBuffer?: ArrayBuffer
	): Promise<Uint8Array>
	/**
	 * Closes the connection to the card, rendering this instance invalid.
	 *
	 * @param then - Action to take after disconnection.
	 *
	 * @throws {@link Err}
	 */
	disconnect(then: CardDisposition): Promise<void>
	/**
	 * The currently active card communication protocol.
	 *
	 * This is set when the card connection is first established and updated after
	 * {@link reconnect} calls. It will *not* be updated if/when a protocol is
	 * negotiated via {@link control}.
	 *
	 * @throws {@link Err}
	 */
	protocol(): Protocol
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
	reconnect(mode: CardMode, initAction: CardDisposition): Promise<Protocol>
	/**
	 * The current state of the card.
	 * @throws {@link Err}
	 */
	state(): Promise<CardState>
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
	transaction(): Promise<Transaction>
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
	transmit(input: Uint8Array, outputBuffer?: ArrayBuffer): Promise<Uint8Array>
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
	transmitProtocol(
		protocol: Protocol,
		input: Uint8Array,
		outputBuffer?: ArrayBuffer
	): Promise<Uint8Array>
}
/**
 * The state of a connected smart card.
 */
export declare class CardState {
	/**
	 * The card [ATR](https://en.wikipedia.org/wiki/Answer_to_reset) value.
	 */
	readonly atr: Uint8Array
	/**
	 * The currently active protocol.
	 */
	readonly protocol: Protocol
	/**
	 * Name of the reader containing the card.
	 */
	readonly readerName: string
	/**
	 * The current card status.
	 */
	readonly status: CardStatusFlags
	constructor(state: pcsc.CardState)
	/**
	 * Human-friendly card info.
	 */
	toString(): string
}
/**
 * Bit flag representation of a card's status.
 */
export declare class CardStatusFlags {
	/**
	 * The raw mask value of the status flags.
	 */
	readonly raw: number
	constructor(raw: number)
	/**
	 * `true` iff *all* the specified flags are set.
	 */
	has(...flags: readonly CardStatus[]): boolean
	/**
	 * `true` if *any* of the specified flags are set.
	 */
	hasAny(...flags: readonly CardStatus[]): boolean
	/**
	 * Human-readable names of the enabled flags, for logging/debugging.
	 */
	toString(): string
}
