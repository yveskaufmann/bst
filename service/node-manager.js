var net = require('net');
var node_1 = require("./node");
var socket_handler_1 = require("./socket-handler");
var NodeManager = (function () {
    function NodeManager(port) {
        this.port = port;
        this.host = '0.0.0.0';
        this.nodes = {};
    }
    NodeManager.prototype.node = function (nodeID) {
        return this.nodes[nodeID];
    };
    NodeManager.prototype.start = function () {
        var self = this;
        net.createServer(function (socket) {
            var socketHandler = new socket_handler_1.SocketHandler(socket, function (message) {
                var connectData = JSON.parse(message);
                var node = new node_1.Node(connectData.id, socketHandler);
                self.nodes[node.id] = node;
                socketHandler.send("ACK");
                if (self.onConnect != null) {
                    self.onConnect(node);
                }
            });
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);
        console.log('Server listening on ' + this.host + ':' + this.port);
    };
    return NodeManager;
})();
exports.NodeManager = NodeManager;
//# sourceMappingURL=node-manager.js.map