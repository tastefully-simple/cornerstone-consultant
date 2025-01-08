import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'regenerator-runtime/runtime';

window.pendingJwtToken = false;
async function renewToken() {
    window.pendingJwtToken = true;
    const resource = `/customer/current.jwt?app_client_id=${window.currentCustomer.bigcommerce_app_client_id}`;
    return await fetch(resource).then(response => response.text()).then((jwtToken) => {
        localStorage.setItem('customer-jwt', jwtToken);
        window.pendingJwtToken = false;
        return jwtToken;

    }).catch(error => {
        console.error('Error getting jwt token. error:', error);
        return null;
    });
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getToken(getFreshToken = false) {
    let token = localStorage.getItem('customer-jwt') ?? null;

    if (window.pendingJwtToken) {
        await timeout(250);
        return getToken();
    } else if (!token || getFreshToken) {
        await renewToken();
        token = localStorage.getItem('customer-jwt') ?? null;
    }
    return token;
}

export default getToken;
