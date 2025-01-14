import modalFactory from '../../global/modal';
import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import swal from '../../global/sweet-alert';

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
 * Format date "2023-03-31T21:38:22Z" to "March 31, 2023"
 * @param myDate
 * @returns {string}
 */
function formatDate(myDate) {
    const date = new Date(myDate);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Sort array by "position" key in its objects
 * @param arr
 * @returns {*}
 */
function sortByPosition(arr) {
    return arr.sort((a, b) => a.position - b.position);
}

/**
 * Get a list of all images
 * @param products
 * @returns {string}
 */
function getProductsImageList(products) {
    let images = '';
    let sortedImages = [];

    // eslint-disable-next-line guard-for-in
    for (const key in products) {
        sortedImages = sortByPosition(products[key].images);
        images += `<img alt="${products[key].ProductName}" src="${sortedImages[0].src}">`;
    }

    return images;
}

/**
 *  Open subscription modal and load content inside of it
 * @param subscriptionModal
 * @param contentTemplate
 */
function loadSubscriptionModal(subscriptionModal, contentTemplate) {
    // Open Modal with a Preloader layer
    subscriptionModal.open({ clearContent: true, pending: true });

    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/customers/${window.subscriptionManager.customerId}/subscriptions`,
        type: 'GET',
        dataType: 'JSON',
        success(response) {
            if (response.length >= 1) {
                window.subscriptionManager.subscriptions = response;

                const subscriptionTemplate = window.subscriptionManager.subscriptionCard;
                const subscriptions = window.subscriptionManager.subscriptions;
                subscriptionModal.updateContent(contentTemplate);
                $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-list-content`).html(' ');

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
                    $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-list-content`).prepend(formatTemplate(subscriptionTemplate, map));
                });
            }
        },
    });
}

/**
 * Verify if this product has the autoship widget
 * @param productId
 */
function isAutoshipEnabled(productId) {
    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/Products/${productId}`,
        type: 'GET',
        dataType: 'JSON',
        success(response) {
            if (response) {
                // This product is Autoship Eligible. Show  Widget Version 2
                window.subscriptionManager.version = 'future';
            }
            // Display Button and message
            $(`#subscription--container-${window.subscriptionManager.version}`).show();
            const subscriptionModal = modalFactory(`#subscriptionManager--${window.subscriptionManager.version}`)[0];
            // Show Add to Next Delivery (Widget Version 1)
            const $subscriptionManagerTrigger = $(`#subscriptionManager--trigger-${window.subscriptionManager.version}`);
            $subscriptionManagerTrigger.on('click', () => {
                loadSubscriptionModal(subscriptionModal, $(`#subscriptionManager--${window.subscriptionManager.version}`).html());
            });
            $('body').on('click', '.close-subscriptions', () => {
                subscriptionModal.close();
            });
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
        dataType: 'JSON',
        success(response) {
            if (response === true) {
                // show component if the customer has active subscriptions
                $('#subscription-manager-block').show();
            }
        },
    });
}

/**
 * Updates the modal display after the product has been added, showing the details of the updated subscription
 * @param subscriptionId
 */
function subscriptionUpdated(subscriptionId) {
    const newImageUrl = $('.productView-thumbnail-link:first img').attr('src');
    const newImageAltTitle = $('.productView-thumbnail-link:first img').attr('alt');
    const successTemplate = $(`#subscription-success-template--${window.subscriptionManager.version}`).html();
    const subscription = window.subscriptionManager.subs[subscriptionId];
    window.subscriptionManager.subs[subscriptionId] += `<img alt="${newImageAltTitle}" src="${newImageUrl}">`;

    const map = {
        '#NextOrder': formatDate(subscription.NextOrder),
        '#Id': subscriptionId,
        '#SubscriptionProducts': subscription.images,
        '#NewProduct': `<img alt="${newImageAltTitle}" src="${newImageUrl}">`,
    };

    $(`#subscriptionManager--${window.subscriptionManager.version} .modal-body:first`).html(formatTemplate(successTemplate, map));
}

/**
 * Send a request to add productId into subscriptionId
 * @param subscriptionId
 * @param productId
 * @returns {Promise<void>}
 */
async function updateSubscription(subscriptionId, productId, quantitySubscription) {

    const jwtToken = await window.jwtToken();
    const retryCount = 2;
    let tryCount = 1;

    $.ajax({
        url: `${window.subscriptionManager.apiUrl}/Subscriptions/${subscriptionId}/products`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwtToken
        },
        data: JSON.stringify({
            productId,
            variantId: '',
            quantity: quantitySubscription,
        }),
        // eslint-disable-next-line no-unused-vars
        success(response) {
            console.log('SUBSCRIPTION MANAGER SUCCESSFULL');
            subscriptionUpdated(subscriptionId);
            $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-footer:first`).hide();
            $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-cancel`).hide();
            $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-continue`).hide();
            $(`#subscriptionManager--${window.subscriptionManager.version} .subscriptions-done`).show();
            $(`#subscriptionManager--${window.subscriptionManager.version} .modal-header p`).html('product added to delivery');
        },
        // eslint-disable-next-line no-unused-vars
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
                swal.fire({
                    text: 'An error has happened. Please, try again later. (003)',
                    icon: 'error',
                });
            }
        },
    });
}

/**
 * Creates CSS styles to display the autoship buttons
 * @param products
 */
function displayAutoshipButtonForProducts(products) {
    // eslint-disable-next-line guard-for-in
    for (const i in products) {
        $(`#autoship-card${products[i]}`).addClass('autoship-enabled-product');
    }
}

function isSubscriptionProduct(productId) {
    let data = window.BOLD.subscriptions.data;
    for (let i = 0; i < data.subscriptionGroups.length; i += 1) {
        let subscriptionGroup = data.subscriptionGroups[i];
        for (let j = 0; j < subscriptionGroup.selection_options.length; j += 1) {
            let selectionOption = subscriptionGroup.selection_options[j];
            if (selectionOption.platform_entity_id === productId) {
                return true;
            }
        }
    }
    return false;
}

function toggleAutoshipButtons() {
    const onPageProducts = document.getElementsByName('product_id');
    const subscriptionProductIds = [];
    for (let i = 0; i < onPageProducts.length; i++) {
        if (isSubscriptionProduct(onPageProducts[i].defaultValue)) {
            subscriptionProductIds.push(onPageProducts[i].defaultValue);
        }
    }
    if (subscriptionProductIds.length > 0) {
        displayAutoshipButtonForProducts(subscriptionProductIds);
    }
}

/**
 * Main function
 * @param customerId
 * @param productId
 * @param subscriptionManagement
 * @returns {boolean}
 */
export default function (customerId, productId, subscriptionManagement) {
    if (!customerId || !subscriptionManagement.enabled) {
        return false;
    }

    // Toggle Autoship buttons after DOM is ready
    $(document).ready(() => {
        toggleAutoshipButtons();
    });

    if (productId === undefined) {
        return false;
    }

    // Set template data for the modal
    window.subscriptionManager = {
        subscriptionCard: $('#subscription-card-template').html(),
        apiUrl: subscriptionManagement.api_url,
        subscriptions: [],
        subs: [],
        version: 'next',
        customerId,
        productId,
    };
    // Verify if this customer has subscriptions
    hasSubscriptions(customerId);
    // Verify if this product has the Bold widget
    isAutoshipEnabled(productId);

    $('body').on('click', '.subscription-select', (event) => {
        $('.subscriptions-continue').removeClass('disabled');
        $('.subscription-next-order-message').show();
        $('.subscription-card').removeClass('subscription-selected');
        $(event.currentTarget.parentElement.parentElement).addClass('subscription-selected');
    });

    $('body').on('click', '.subscriptions-continue', () => {
        const selectedSubscription = $('input[name="select-subscription"]:checked').val();
        const quantitySubscription = parseInt(document.getElementById('qty[]').value, 10);
        $('.subscriptions-continue').addClass('disabled');

        if (selectedSubscription !== undefined) {
            updateSubscription(selectedSubscription, productId, quantitySubscription);
        }
    });
}
