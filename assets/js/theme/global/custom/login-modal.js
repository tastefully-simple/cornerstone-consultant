import modalFactory from '../../global/modal';
import $ from 'jquery';

export default function (status) {
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
}
