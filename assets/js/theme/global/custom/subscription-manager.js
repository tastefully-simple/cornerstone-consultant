import utils from '@bigcommerce/stencil-utils';
import modalFactory from '../../global/modal';
import $ from 'jquery';

function getSubscriptions(customerId) {
    const options = {
        params: {
            action: 'add',
            customer_id: customerId,
        },
    };

    utils.api.cart.makeRequest('/cart.php', 'GET', options, false, (err, response) => {
        console.log(response);
    });
}

export default function (customerId, status) {

    if (!status || !customerId) {
        return false;
    }

    const subscriptionModal = modalFactory('#subscriptionManager')[0];
    const content = $('#subscriptionManager .subscription-modal-form:first');
    const $subscriptionManagerTrigger = $('#subscriptionManager--trigger');
    $subscriptionManagerTrigger.on('click', () => {
        subscriptionModal.open({clearContent: false, pending: false});
    });

    $('body').on('click', '[list-subscriptions]', event => {
        // const product = event.currentTarget.value;
        // const $clickedCompareLink = $('a[data-compare-nav]');
    });
}
