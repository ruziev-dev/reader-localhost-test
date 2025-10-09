import { EventEmitter } from "node:events"
import * as pcsc from "./addon.node"
import { type Err } from "./addon.node"
import { Reader } from "./reader"
export { type Err }
export import MAX_READERS = pcsc.MAX_READERS
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
export declare class Client extends EventEmitter<{
	error: [Err]
	reader: [Reader]
}> {
	#private
	constructor(addon?: typeof pcsc)
	/**
	 * The reader identified by `name`, if it is currently connected.
	 */
	reader(name: string): Reader | undefined
	/**
	 * `true` if the reader state monitoring thread is currently running.
	 */
	running(): boolean
	/**
	 * Start monitoring for reader status changes.
	 *
	 * A subsequent call to {@link stop} will stop monitoring and detach
	 * this client.
	 *
	 * @throws {@link Err}
	 */
	start(): Client
	/**
	 * Stop monitoring for reader status changes and detach the client from the
	 * PCSC server. Any in-progress transmissions will be cancelled.
	 *
	 * Monitoring can be resumed with another call to {@link start};
	 *
	 * @throws {@link Err}
	 */
	stop(): void
}
