export default function createCustomEvent(eventName, data = {}) {
  const event = new CustomEvent(eventName, {
    detail: data,
  })
  return event
}
