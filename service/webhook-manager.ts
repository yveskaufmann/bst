import {WebhookRequest} from "./webhook-request";
import * as net from "net";
import {Server} from "net";
import {SocketHandler} from "./socket-handler";
import {Socket} from "net";
import {BufferUtil} from "../core/buffer-util";

export interface WebhookReceivedCallback {
    (socket: Socket, webhookRequest: WebhookRequest): void;
}
export class WebhookManager {
    private server: Server;
    private host: string;
    public onWebhookReceived: WebhookReceivedCallback = null;

    constructor (private port: number) {
        this.host = "0.0.0.0";
    }

    public start(): void {
        let self = this;

        this.server = net.createServer(function(socket: Socket) {
            let message: string = "";
            socket.on('data', function(data: Buffer) {
                //Throw away the pings - too much noise
                let dataString = data.toString();
                if (dataString.length > 4 && dataString.substr(0, 3) != "GET") {
                    console.log('Webhook From ' + socket.remoteAddress + ":" + socket.remotePort);
                    console.log('Webhook Payload ' + BufferUtil.prettyPrint(data));
                }

                let webhookRequest = new WebhookRequest();
                webhookRequest.append(data);

                if (webhookRequest.done()) {
                    if (webhookRequest.isPing()) {
                        socket.write("HTTP/1.0 200 OK\r\nContent-Length: 10\r\n\r\nbst-server");
                        socket.end();
                    } else {
                        self.onWebhookReceived(socket, webhookRequest);
                    }
                }
            });

            // We have a connection - a socket object is assigned to the connection automatically
            //console.log('WEBHOOK CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);

        console.log('WebhookServer listening on ' + this.host + ':' + this.port);
    }
}