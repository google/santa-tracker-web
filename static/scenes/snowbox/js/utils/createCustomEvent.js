export default function createCustomEvent(eventName, data = {}) {
  const event = new window.CustomEvent(eventName, {
    detail: data,
  })
  return event
}
