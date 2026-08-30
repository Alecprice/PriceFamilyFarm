async function handler(event) {
    var response = event.response;
    var headers = response.headers;

    headers['strict-transport-security'] = {
        value: 'max-age=63072000; includeSubDomains'
    };

    headers['content-security-policy'] = {
        value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data: blob:; media-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; script-src-attr 'none'; connect-src 'self' https://api.weather.gov https://api.web3forms.com; worker-src 'self' blob:; manifest-src 'self'; form-action 'self'; upgrade-insecure-requests"
    };

    headers['x-content-type-options'] = {
        value: 'nosniff'
    };

    headers['x-frame-options'] = {
        value: 'DENY'
    };

    headers['referrer-policy'] = {
        value: 'strict-origin-when-cross-origin'
    };

    headers['permissions-policy'] = {
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    };

    headers['cross-origin-opener-policy'] = {
        value: 'same-origin'
    };

    headers['cross-origin-resource-policy'] = {
        value: 'same-origin'
    };

    headers['x-permitted-cross-domain-policies'] = {
        value: 'none'
    };

    return response;
}
