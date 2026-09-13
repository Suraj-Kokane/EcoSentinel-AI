// Socket event emitter — decouples services from the Socket.IO instance.
// Services call emit* helpers; if no server is attached, they are no-ops.

let io = null

export function setSocketIO(instance) {
  io = instance
}

export function getSocketIO() {
  return io
}

export function emitEvent(event, payload) {
  if (!io) return
  io.emit(event, payload)
}

// Named emitters (payload shapes mirror the frontend's LiveDataContext data).
export function emitAlert(alert) {
  emitEvent('new-alert', alert)
}

export function emitReport(report) {
  emitEvent('new-report', report)
}

export function emitSensorUpdate(node) {
  emitEvent('sensor-update', node)
}

export function emitEarthquake(eq) {
  emitEvent('earthquake-update', eq)
}

export default { setSocketIO, getSocketIO, emitEvent, emitAlert, emitReport, emitSensorUpdate, emitEarthquake }