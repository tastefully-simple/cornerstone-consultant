import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'regenerator-runtime/runtime';

async function renewToken() {
    const resource = `/customer/current.jwt?app_client_id=${window.currentCustomer.bigcommerce_app_client_id}`;
    return await fetch(resource).then(response => response.text()).then((jwtToken) => {
        localStorage.setItem('customer-jwt-expiry-at', new Date().getTime() + 600000);
        localStorage.setItem('customer-jwt', jwtToken);
        return jwtToken;

    }).catch(error => {
        console.error('Error getting jwt token. error:', error);
        return null;
    });
}

export default async function () {
    const currentTime = new Date().getTime();
    const expiryAt = localStorage.getItem('customer-jwt-expiry-at') ?? null;
    const token = localStorage.getItem('customer-jwt') ?? null;

    if (!token || !expiryAt || currentTime >= expiryAt) {
        // Token is expired or never created, so let's get a new one
        return await renewToken();
    }
    return token;
}
