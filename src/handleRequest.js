const { getResource, getCustomConnectionToken, checkSignature } = require("./xeroApi.js")
const respondToEvent = require('./events.js').respondToEvent

module.exports = async function handleRequest(request) {
  var payload = await request.text();

  signature = request.headers.get('x-xero-signature')

  if (request.method !== "POST"
    || !signature
    || ! await checkSignature(XERO_WEBHOOK_KEY, signature, payload)) {
    return new Response('', { status: 401 })
  }

  var data = JSON.parse(payload)

  if (data.events.length >= 0) {
    const token = await getCustomConnectionToken(XERO_CLIENT_ID, XERO_CLIENT_SECRET, 'accounting.transactions')

    await Promise.all(data.events.map(async (event) => {
      var resource = await getResource(token, event.resourceUrl)
      await respondToEvent(token, event, resource)
    }))
  }

  return new Response();
}
