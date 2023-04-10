import modalFactory from '../../global/modal';
import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';

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
 * Format date "2023-03-31T21:38:22Z" to "March 31, 2023"
 * @param myDate
 * @returns {string}
 */
function formatDate(myDate) {
    const date = new Date(myDate);
    return date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
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

function updateSubscription(subscriptionId, productId) {
    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/Subscriptions/${subscriptionId}/products`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'jwt-token': '', // @TODO: Implement the Current Customer API here
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
            // @TODO: Add error message popup
        },
    });
}

function getProductsImageList(products) {
    let images = '';
    // eslint-disable-next-line guard-for-in
    for (const key in products) {
        images += `<img src="${products[key].images[0].src}">`;
    }

    return images;
}

export default function (customerId, productId, subscriptionManagement) {
    if (!customerId || !subscriptionManagement.enabled) {
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

    getSubscriptions(customerId);

    const $subscriptionManagerTrigger = $('#subscriptionManager--trigger');
    $subscriptionManagerTrigger.on('click', () => {
        subscriptionModal.open({clearContent: false, pending: false});
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
            $('#subscriptionManager .subscriptions-list').append(formatTemplate(subscriptionTemplate, map));
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
