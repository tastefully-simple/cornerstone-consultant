import modalFactory from '../../global/modal';
import $ from 'jquery';

export default function (status) {
    if (!status) {
        return;
    }

    // Set last time the user loaded a page + 1 hour
    window.localStorage.setItem('consultant-timeout', new Date().getTime() + 3600000);

    const loginModal = modalFactory('#loginModal')[0];
    const content = $('#loginModal .login-modal-form:first');
    const $loginModalTrigger = $('#loginModal--trigger');
    $loginModalTrigger.on('click', () => {
        loginModal.open();
        loginModal.updateContent(content);
    });

    // Verify if the page has been inactive for more than 1 hour. If it is, show login popup
    setTimeout(() => {
        if (new Date().getTime() > window.localStorage.getItem('consultant-timeout')) {
            loginModal.open();
            loginModal.updateContent(content);
            $('#sso_login_message').hide();
            $('#sso_login_message_inactive').show();
        }
    }, 30000);
}
