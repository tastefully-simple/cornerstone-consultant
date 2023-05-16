import modalFactory from '../../global/modal';
import $ from 'jquery';

let intervalId = null;

/**
 * Verify if the session timed out and display modal
 * @param loginModal
 * @param content
 */
function verifyTimeout(loginModal, content) {
    if (new Date().getTime() > window.localStorage.getItem('consultant-timeout')) {
        const $element = $(document);
        $element.foundation({
            reveal: {
                close_on_background_click: false,
                close_on_esc: false,
                bg_class: 'modal-background-solid',
            },
        });
        loginModal.open();
        loginModal.updateContent(content);
        $('#sso_login_message').hide();
        $('#sso_login_message_inactive').show();
        clearInterval(intervalId);
    }
}

export default function (status, timeoutMinutes, isLogged) {
    if (!status) {
        return;
    }

    // Prevent modal from closing when clicking on the background
    const $element = $(document);
    $element.foundation({
        reveal: {
            close_on_background_click: false,
            close_on_esc: false,
            bg_class: 'modal-background-solid',
        },
    });

    const loginModal = modalFactory('#loginModal', { $context: $element })[0];
    const content = $('#loginModal .login-modal-form:first');
    const $loginModalTrigger = $('#loginModal--trigger');
    $loginModalTrigger.on('click', () => {
        loginModal.open();
        loginModal.updateContent(content);
    });

    if (isLogged) {
        // Set last time the user loaded a page + 1 hour
        window.localStorage.setItem('consultant-timeout', new Date().getTime() + (timeoutMinutes * 60000));
    } else {
        // Session is already timed out
        window.localStorage.setItem('consultant-timeout', 0);
        // Show login modal
        loginModal.open();
        loginModal.updateContent(content);

        return;
    }

    // Verify if the page has been inactive for more than the time defined
    // on config.json (session_management.timeout_minutes). If it is, show login modal
    intervalId = setInterval(() => {
        verifyTimeout(loginModal, content);
    }, 10000); // runs every ten seconds
}
