import $ from 'jquery';

function setCookie(key, value, expiry) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = `${key}=${value};path=/;expires=${expires.toUTCString()}`;
}

function getCookie(key) {
    const keyValue = document.cookie.match(`(^|;) ?${key}=([^;]*)(;|$)`);
    return keyValue ? keyValue[2] : null;
}

export default function () {
    // Disable on Wishlist page
    if (window.location.pathname === '/wishlist.php') {
        return true;
    }
    const gridSwitcherCookie = 'grid-switcher';
    const expiryDays = 10;
    const $gridListSwitcher = $('.grid-list-selectors button');
    const defaultDisplay = 'list-switch';

    if (!getCookie(gridSwitcherCookie)) {
        setCookie(gridSwitcherCookie, defaultDisplay, expiryDays);
    }

    const currentDisplay = getCookie(gridSwitcherCookie);
    const currentDisplayId = `#${currentDisplay}`;
    $(currentDisplayId).addClass('active');

    if (currentDisplay === defaultDisplay) {
        $('.productGrid:first').addClass('list-switch');
    }

    $gridListSwitcher.on('click', event => {
        event.preventDefault();

        $('#list-switch').toggleClass('active');
        $('#grid-switch').toggleClass('active');
        $('.productGrid:first').toggleClass('list-switch');

        setCookie(gridSwitcherCookie, event.currentTarget.id, expiryDays);
    });
}
