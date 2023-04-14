import modalFactory from '../../global/modal';
import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import swal from '../../global/sweet-alert';

/**
 * List all subscriptions for the customer
 * @param customerId
 */
function getSubscriptions(customerId) {
    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/customers/${customerId}/subscriptions`,
        type: 'GET',
        dataType: 'JSON', // added data type
        success(response) {
            if (response.length >= 1) {
                // show component if the customer has active subscriptions
                $('#subscription-manager-block').show();
                window.subscriptionManager.subscriptions = response;
            }
        },
    });
}

/**
 * Verifies if the current customer has subscriptions
 * @param customerId
 */
function hasSubscriptions(customerId) {
    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/customers/${customerId}/hassubscriptions`,
        type: 'GET',
        dataType: 'JSON', // added data type
        success(response) {
            if (response === true) {
                // show component if the customer has active subscriptions
                $('#subscription-manager-block').show();
                window.subscriptionManager.subscriptions = response;
            }
        },
    });
}

/**
 * Format date "2023-03-31T21:38:22Z" to "March 31, 2023"
 * @param myDate
 * @returns {string}
 */
function formatDate(myDate) {
    const date = new Date(myDate);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Replaces all occurrences of the string "mapArray key" with the "mapArray value" in the "template" string
 * @param template
 * @param mapArray
 * @returns {*}
 */
function formatTemplate(template, mapArray) {
    let finalObj = template;
    // Replace all static data
    // eslint-disable-next-line guard-for-in
    for (const key in mapArray) {
        finalObj = finalObj.replaceAll(key, mapArray[key]);
    }
    return finalObj;
}

/**
 * Updates the modal display after the product has been added, showing the details of the updated subscription
 * @param subscriptionId
 */
function subscriptionUpdated(subscriptionId) {
    const newImageUrl = $('.productView-thumbnail-link:first img').attr('src');
    const successTemplate = window.subscriptionManager.successModal;
    const subscription = window.subscriptionManager.subs[subscriptionId];
    window.subscriptionManager.subs[subscriptionId] += `<img src="${newImageUrl}">`;

    const map = {
        '#NextOrder': formatDate(subscription.NextOrder),
        '#Id': subscriptionId,
        '#SubscriptionProducts': subscription.images,
        '#NewProduct': `<img src="${newImageUrl}">`,
    };

    $('#subscriptionManager .modal-body:first').html(formatTemplate(successTemplate, map));
}

/**
 * Renew the Current Customer API JWT token
 * @returns {Promise<void>}
 */
async function renewToken() {
    const resource = `/customer/current.jwt?app_client_id=${window.currentCustomer.bigcommerce_app_client_id}`;
    window.currentCustomer.token = await fetch(resource)
        .then(response => {
            if (response.status === 200) {
                return response.text();
            }
            swal.fire({
                text: 'An error has happened. Please, try again later. (001)',
                icon: 'error',
            });
            return response.status;
        })
        .catch(error => {
            console.log(error);
            swal.fire({
                text: 'An error has happened. Please, try again later. (002)',
                icon: 'error',
            });
            return -1;
        });
}

/**
 * Send a request to add productId into subscriptionId
 * @param subscriptionId
 * @param productId
 * @returns {Promise<void>}
 */
async function updateSubscription(subscriptionId, productId) {
    await renewToken();

    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/Subscriptions/${subscriptionId}/products`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'jwt-token': window.currentCustomer.token,
        },
        data: JSON.stringify({
            productId,
            variantId: '',
            quantity: 1,
        }),
        // eslint-disable-next-line no-unused-vars
        success(response) {
            subscriptionUpdated(subscriptionId);
            $('#subscriptionManager .subscriptions-footer:first').hide();
            $('#subscriptionManager .subscriptions-cancel').hide();
            $('#subscriptionManager .subscriptions-continue').hide();
            $('#subscriptionManager .subscriptions-done').show();
            $('#subscriptionManager .modal-header p').html('product added to delivery');
        },
        // eslint-disable-next-line no-unused-vars
        error(xhr, status, error) {
            swal.fire({
                text: 'An error has happened. Please, try again later. (003)',
                icon: 'error',
            });
        },
    });
}

/**
 * Get a list of all images
 * @param products
 * @returns {string}
 */
function getProductsImageList(products) {
    let images = '';
    // eslint-disable-next-line guard-for-in
    for (const key in products) {
        images += `<img src="${products[key].images[0].src}">`;
    }

    return images;
}

/**
 * Main function
 * @param customerId
 * @param productId
 * @param subscriptionManagement
 * @returns {boolean}
 */
export default function (customerId, productId, subscriptionManagement) {
    if (!customerId || !subscriptionManagement.enabled || productId === undefined) {
        return false;
    }

    const subscriptionModal = modalFactory('#subscriptionManager')[0];

    // Set template data for the modal
    window.subscriptionManager = {
        originalModal: $('#subscriptionManager').html(),
        subscriptionCard: $('#subscription-card-template').html(),
        successModal: $('#subscription-success-template').html(),
        apiUrl: subscriptionManagement.api_url,
        subscriptions: [],
        subs: [],
    };

    hasSubscriptions(customerId);
    getSubscriptions(customerId);

    const $subscriptionManagerTrigger = $('#subscriptionManager--trigger');
    $subscriptionManagerTrigger.on('click', () => {
        subscriptionModal.open({ clearContent: false, pending: true });
        subscriptionModal.updateContent(window.subscriptionManager.originalModal);
        const subscriptionTemplate = window.subscriptionManager.subscriptionCard;
        const subscriptions = window.subscriptionManager.subscriptions;

        // Create subscriptions list
        subscriptions.forEach((subscription) => {
            const subscriptionImages = getProductsImageList(subscription.LineItems);
            const map = {
                '#NextOrder': formatDate(subscription.NextOrder),
                '#Id': subscription.Id,
                '#ProductsList': subscriptionImages,
            };
            window.subscriptionManager.subs[subscription.Id] = subscription;
            window.subscriptionManager.subs[subscription.Id].images = subscriptionImages;
            $('#subscriptionManager .subscriptions-list-content').prepend(formatTemplate(subscriptionTemplate, map));
        });
    });

    $('body').on('click', '.close-subscriptions', () => {
        subscriptionModal.close();
    });

    $('body').on('click', '.subscription-select', (event) => {
        $('.subscriptions-continue').removeClass('disabled');
        $('.subscription-next-order-message').show();
        $('.subscription-card').removeClass('subscription-selected');
        $(event.currentTarget.parentElement.parentElement).addClass('subscription-selected');
    });

    $('body').on('click', '.subscriptions-continue', () => {
        const selectedSubscription = $('input[name="select-subscription"]:checked').val();
        $('.subscriptions-continue').addClass('disabled');

        if (selectedSubscription !== undefined) {
            updateSubscription(selectedSubscription, productId);
        }
    });
}
