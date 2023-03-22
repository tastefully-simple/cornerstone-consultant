import modalFactory from '../../global/modal';
import $ from 'jquery';

export default function (customerId, config) {
    if (!config.enabled) {
        return;
    }

    if (!customerId) {
        // Show login modal
        const $element = $(document);
        $element.foundation({
            reveal: {
                close_on_background_click: false,
            },
        });

        const loginModal = modalFactory('#loginModal', { $context: $element })[0];
        const content = $('#loginModal .login-modal-form:first');
        loginModal.open();
        loginModal.updateContent(content);
    }
}
