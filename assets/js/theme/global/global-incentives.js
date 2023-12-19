import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'regenerator-runtime/runtime';

export default async function (customerId, apiUrl) {

    if(!customerId ? true : false) {
        return null;
    }

    const jwtToken = await window.jwtToken();

    $.ajax({
        url: `${apiUrl}/incentives/${customerId}/count`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwtToken
        },
        success(response) {
            if (response && response.rewards && response.rewards.count) {
                document.querySelector('.razoyo-sticker.incentives .sticker-text').innerText = response.rewards.count;
            } else {
                document.querySelector('.razoyo-sticker.incentives .sticker-text').innerText = 0;
            }
        },
        error(xhr, status, error) {
            console.error('Error getting incentive count', xhr, status, error);
            document.querySelector('.razoyo-sticker.incentives .sticker-text').innerText = 0;
        },
    });
}
