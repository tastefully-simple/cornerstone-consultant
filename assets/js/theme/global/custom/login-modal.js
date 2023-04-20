import modalFactory from '../../global/modal';
import $ from 'jquery';

export default function (status, timeoutMinutes, isLogged) {
    if (!status) {
        return;
    }

    const loginModal = modalFactory('#loginModal')[0];
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
    setInterval(() => {
        if (new Date().getTime() > window.localStorage.getItem('consultant-timeout')) {
            loginModal.open();
            loginModal.updateContent(content);
            $('#sso_login_message').hide();
            $('#sso_login_message_inactive').show();
        }
    }, 10000); // runs every ten seconds
}
