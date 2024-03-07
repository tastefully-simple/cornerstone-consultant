import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'regenerator-runtime/runtime';

export default async function (customerId, apiUrl) {

    if(!customerId ? true : false) {
        return null;
    }

    const jwtToken = await window.jwtToken();
    const mobileSelector = '.mobile-nav-name .razoyo-sticker.incentives';
    const desktopSelector = '.navUser-item .razoyo-sticker.incentives';
    const retryCount = 2;
    let tryCount = 1;

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
               document.querySelector(mobileSelector + ' .sticker-text').innerText = response.rewards.count;

               // Desktop
               document.querySelector(desktopSelector + ' .sticker-text').innerText = response.rewards.count;

               if(response.rewards.count != 0) {
                   document.querySelector(mobileSelector).classList.remove('hidden');
                   document.querySelector(desktopSelector).classList.remove('hidden');
               }
           } else {
               // Mobile
               document.querySelector(mobileSelector + ' .sticker-text').innerText = 0;

               // Desktop
               document.querySelector(desktopSelector + ' .sticker-text').innerText = 0;

               document.querySelector(mobileSelector).classList.add('hidden');
               document.querySelector(desktopSelector).classList.add('hidden');
           }
       },
       error(xhr, status, error) {
           const request = this;
           // Retry req with fresh token
           if (xhr.status == 401 && tryCount <= retryCount) {
               tryCount++;
               window.jwtToken(true).then((freshToken) => {
                   request.headers['jwt-token'] = freshToken;
                   return $.ajax(request);
               });
           } else {
               // Mobile
               document.querySelector(mobileSelector + ' .sticker-text').innerText = 0;

               // Desktop
               document.querySelector(desktopSelector + ' .sticker-text').innerText = 0;

               document.querySelector(mobileSelector).classList.add('hidden');
               document.querySelector(desktopSelector).classList.add('hidden');
           }
       },
   });
}
