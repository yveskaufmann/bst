import {LogQueue, Log, LogType} from "../logless/log-queue";
const uuid = require("uuid");

export class Logless {
    private _callback: Function;
    private _context: any;
    private _event: any;
    private _queue: LogQueue = null;
    private _source: string;
    private _transactionID: string;
    private _wrappedCallback: Function;

    public static capture(source: string, event: any, context: any): Logless {
        return new Logless(source, event, context);
    }

    public static captureWithCallback(source: string, event: any, context: any, callback: Function): Logless {
        return new Logless(source, event, context, callback);
    }

    constructor (source: string, event: any, context: any, callback?: Function, public captureURL?: string) {
        this._source = source;
        this._event = event;
        this._context = context;
        this._wrappedCallback = callback;
        this.init();

        this._queue.enqueue(new Log(LogType.INFO, [event], ["request"]));
    }

    private init () {
        let self = this;
        this._queue = new LogQueue(this);

        if (this._context.awsRequestId !== undefined && this._context.awsRequestId !== null) {
            this._transactionID = this._context.awsRequestId;
        } else {
            this._transactionID = uuid.v4();
        }

        this.wrapCall(console, "error", LogType.ERROR);
        this.wrapCall(console, "info", LogType.INFO);
        this.wrapCall(console, "log", LogType.DEBUG);
        this.wrapCall(console, "warn", LogType.WARN);

        let done = this.context().done;
        this.context().done = function(error: any, result: any) {
            self.logResponse(error, result);
            self._queue.flush();
            done(error, result);
        };

        let fail = this.context().fail;
        this.context().fail = function(error: any) {
            self.logResponse(error, null);
            self._queue.flush();
            fail(error);
        };

        let succeed = this.context().succeed;
        this.context().succeed = function(result: any) {
            self.logResponse(null, result);
            self._queue.flush();
            succeed(result);
        };

        if (this._wrappedCallback !== undefined && this._wrappedCallback !== null) {
            this._callback = function(error: any, result: any) {
                self.logResponse(error, result);
                self._queue.flush();
                self._wrappedCallback.call(this, error, result);
            };
        }
    }

    public context(): any {
        return this._context;
    }

    public callback(): Function {
        return this._callback;
    }

    public source(): string {
        return this._source;
    }

    public wrapCall(console: Console, name: string, type: LogType): void {
        let self = this;
        let originalCall = (<any> console)[name];
        (<any> console)[name] = function (...data: Array<any>) {
            self._queue.enqueue(new Log(type, data));
            originalCall.apply(this, data);
        };
    }

    public transactionID(): string {
        return this._transactionID;
    }

    private logResponse(error: Error, result: any) {
        if (error !== undefined && error !== null) {
            this._queue.enqueue(new Log(LogType.ERROR, [error.message]));
        } else {
            this._queue.enqueue(new Log(LogType.INFO, [result], ["response"]));
        }

    }
}