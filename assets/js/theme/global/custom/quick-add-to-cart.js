import utils from '@bigcommerce/stencil-utils';
import $ from 'jquery';

export default function () {
    const $quickAddToCart = $('[data-quick-add-to-cart]');
    $quickAddToCart.on('submit', event => {
        event.preventDefault();

        // Verify if fields have been sent
        const sku = $(event.currentTarget).find('[name=sku]')[0].value;
        const qty = $(event.currentTarget).find('[name=qty]')[0].value || 1;
        const inputSubmit = $(event.currentTarget).find('button[type=submit] span')[0];

        if (sku.length < 1 || qty.length < 1) {
            // Show error message and hide it after a few seconds
            $($(event.currentTarget).find('div[data-error-enter-sku]')).show().delay(5000).fadeOut();
            return;
        }

        const options = {
            params: {
                action: 'add',
                sku,
                'qty[]': qty,
            },
        };

        // Store current button label and change to the temporary value "adding..."
        const tempLabel = inputSubmit.innerHTML;
        inputSubmit.innerHTML = $(inputSubmit).attr('data-wait-message');

        utils.api.cart.makeRequest('/cart.php', 'GET', options, false, (err, response) => {
            const isAddedToCart = $(response).find('div[data-cart-status]')[0].children.length;
            if (isAddedToCart === 0) {
                $($(event.currentTarget).find('div[data-sku-success]')).show().delay(5000).fadeOut();
            } else {
                $($(event.currentTarget).find('div[data-error-sku-unavailable]')).show().delay(5000).fadeOut();
            }
            // Reset button label back to the original value
            inputSubmit.innerHTML = tempLabel;
        });
    });
}
