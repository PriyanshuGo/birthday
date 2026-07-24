/**
 * Canvas Recorder Utility
 *
 * Records the AR canvas MediaStream using MediaRecorder and streams
 * the resulting chunks to the backend over a plain WebSocket as they're
 * produced (not buffered until the end) so a tab close loses at most
 * one chunk (~1s) of footage.
 *
 * Reports upload status back to the caller via callbacks passed to start().
 */

export const ENABLE_RECORDING = true;

const DEFAULT_WS_URL = "ws://localhost:5000/webrtc";

export type RecordingStatus =
  | { type: "uploaded"; url: string }
  | { type: "upload_error"; message: string };

interface StartOptions {
  url?: string;
  onStatus?: (status: RecordingStatus) => void;
}

class CanvasRecorder {
  private recorder: MediaRecorder | null = null;
  private ws: WebSocket | null = null;
  private active = false;
  private onStatus: ((status: RecordingStatus) => void) | null = null;

  start(stream: MediaStream, options: StartOptions = {}): void {
    const { url = DEFAULT_WS_URL, onStatus } = options;

    if (this.active) {
      console.warn("[CanvasRecorder] Already recording. Call stop() first.");
      return;
    }

    this.onStatus = onStatus ?? null;

    try {
      console.log("Connecting to", url);
      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        console.log(
          "[CanvasRecorder] WebSocket connected, starting MediaRecorder",
        );

        this.recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8",
        });

        this.recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then((buf) => {
              if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(buf);
              }
            });
          }
        };

        this.recorder.onerror = (e) => {
          console.error("[CanvasRecorder] MediaRecorder error:", e);
        };

        // Emit a chunk every 1s so at most ~1s of footage is ever unsent
        this.recorder.start(1000);
        this.active = true;
      };

      this.ws.onmessage = (event) => {
        let msg: RecordingStatus;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return; // not JSON, ignore
        }

        if (msg.type === "uploaded") {
          console.log("[CanvasRecorder] Video ready:", msg.url);
        } else if (msg.type === "upload_error") {
          console.error("[CanvasRecorder] Upload failed:", msg.message);
        }

        this.onStatus?.(msg);
      };

      this.ws.onerror = (err) => {
        console.warn("[CanvasRecorder] WebSocket error:", err);
      };

      this.ws.onclose = () => {
        console.log("[CanvasRecorder] WebSocket closed");
      };

      window.addEventListener("pagehide", this.handlePageHide);
    } catch (err) {
      console.error("[CanvasRecorder] Failed to start recording:", err);
      this.cleanup();
    }
  }

  stop(): void {
    if (!this.active) {
      console.log("[CanvasRecorder] No active recording to stop.");
      return;
    }
    console.log("[CanvasRecorder] Stopping recording...");
    this.cleanup(true);
  }

  private handlePageHide = () => {
    this.cleanup(true);
  };

  private cleanup(sendStopSignal = false): void {
    const ws = this.ws;

    if (this.recorder && this.recorder.state !== "inactive") {
      // Ask MediaRecorder to flush its final chunk before we close the socket
      this.recorder.requestData();
      this.recorder.stop();
    }
    this.recorder = null;

    if (ws?.readyState === WebSocket.OPEN) {
      if (sendStopSignal) {
        ws.send(JSON.stringify({ type: "stop" }));
      }
      // Give the stop message a tick to actually flush over the socket,
      // and give the server a moment to reply with the upload result,
      // before we close the connection out from under it.
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
      }, 3000);
    }
    // Clearing the class reference here is safe even though the socket
    // stays open a little longer above — its onmessage/onclose handlers
    // are bound to the socket object itself, not to this.ws, so the
    // "uploaded" / "upload_error" message still arrives and onStatus
    // still fires.
    this.ws = null;

    window.removeEventListener("pagehide", this.handlePageHide);
    this.active = false;
    console.log("[CanvasRecorder] Cleaned up");
  }
}

export const canvasRecorder = new CanvasRecorder();