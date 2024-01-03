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
                // Mobile
                document.querySelector('.mobile-nav-name .razoyo-sticker.incentives .sticker-text').innerText = response.rewards.count;
                // Desktop
                document.querySelector('.navUser-item .razoyo-sticker.incentives .sticker-text').innerText = response.rewards.count;
            } else {
                // Mobile
                document.querySelector('.mobile-nav-name .razoyo-sticker.incentives .sticker-text').innerText = 0;
                // Desktop
                document.querySelector('.navUser-item .razoyo-sticker.incentives .sticker-text').innerText = 0;
            }
        },
        error(xhr, status, error) {
            console.error('Error getting incentive count', xhr, status, error);
            // Mobile
            document.querySelector('.mobile-nav-name .razoyo-sticker.incentives .sticker-text').innerText = 0;
            // Desktop
            document.querySelector('.navUser-item .razoyo-sticker.incentives .sticker-text').innerText = 0;
        },
    });
}
