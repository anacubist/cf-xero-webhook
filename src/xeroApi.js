const xeroTokenUrl = 'https://identity.xero.com/connect/token'

async function getCustomConnectionToken(id, secret, scopes) {
    try {
        const encoded = btoa(`${id}:${secret}`)

        const formData = new FormData()
        formData.append('grant_type', 'client_credentials')
        formData.append('scope', scopes)

        const init = {
            headers: { Authorization: `Basic ${encoded}` },
            method: 'POST',
            body: formData
        }

        const response = await fetch(xeroTokenUrl, init)

        if (response.status !== 200) {
            return null;
        }

        const json = await response.json()

        return json.access_token
    } catch (e) {
        console.log(e.message)
    }
}

async function checkSignature(key, signature, data) {
    encoder = new TextEncoder();

    key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    )

    return await crypto.subtle.verify(
        "HMAC",
        key,
        byteStringToUint8Array(atob(signature)),
        encoder.encode(data),
    )
}

function byteStringToUint8Array(byteString) {
    const ui = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; ++i) {
        ui[i] = byteString.charCodeAt(i)
    }
    return ui
}

async function getResource(token, url) {
    try {
        const init = {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            },
            method: 'GET',
        }

        const response = await fetch(url, init)

        if (response.status !== 200) {
            return null;
        }

        return await response.json()

    } catch (e) {
        console.log(e.message)
    }
}

async function updateResource(token, url, data) {
    try {
        const init = {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: data
        }

        const response = await fetch(url, init)

        if (response.status !== 200) {
            return null;
        }

        return await response.json()

    } catch (e) {
        console.log(e.message)
    }
}

module.exports = { checkSignature, getCustomConnectionToken, getResource, updateResource }