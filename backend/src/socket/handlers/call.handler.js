const { CallService } = require("../../services/conversation/call.service");

function safeAck(callback, payload) {
    if (typeof callback === "function") {
        callback(payload);
    }
}

function callHandler(socket) {
    socket.on("rtc:offer", async (data = {}, callback) => {
        try {
            const userId = socket.user.id;
            const { callId, offer } = data;

            if (!callId) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing callId"
                });
            }

            if (!offer) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing offer"
                });
            }

            await CallService.forwardRtcSignal(
                callId,
                userId,
                "rtc:offer",
                { offer }
            );

            return safeAck(callback, {
                success: true
            });
        } catch (error) {
            console.error("[CallSocket] rtc:offer failed:", error.message);

            return safeAck(callback, {
                success: false,
                error: error.message
            });
        }
    });

    socket.on("rtc:answer", async (data = {}, callback) => {
        try {
            const userId = socket.user.id;
            const { callId, answer } = data;

            if (!callId) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing callId"
                });
            }

            if (!answer) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing answer"
                });
            }

            await CallService.forwardRtcSignal(
                callId,
                userId,
                "rtc:answer",
                { answer }
            );

            return safeAck(callback, {
                success: true
            });
        } catch (error) {
            console.error("[CallSocket] rtc:answer failed:", error.message);

            return safeAck(callback, {
                success: false,
                error: error.message
            });
        }
    });

    socket.on("rtc:ice-candidate", async (data = {}, callback) => {
        try {
            const userId = socket.user.id;
            const { callId, candidate } = data;

            if (!callId) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing callId"
                });
            }

            if (!candidate) {
                return safeAck(callback, {
                    success: false,
                    error: "Missing candidate"
                });
            }

            await CallService.forwardRtcSignal(
                callId,
                userId,
                "rtc:ice-candidate",
                { candidate }
            );

            return safeAck(callback, {
                success: true
            });
        } catch (error) {
            console.error(
                "[CallSocket] rtc:ice-candidate failed:",
                error.message
            );

            return safeAck(callback, {
                success: false,
                error: error.message
            });
        }
    });
}

module.exports = callHandler;