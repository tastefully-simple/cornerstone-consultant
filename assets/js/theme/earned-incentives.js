import PageManager from './page-manager';

import utils from '@bigcommerce/stencil-utils';
import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'regenerator-runtime/runtime';

export default class EarnedIncentives extends PageManager {
    constructor(context) {
        super(context);
        return this;
    }

    onReady() {
        if(!this.isLoggedIn()) {
            window.location.href = '/login.php';
        }

        this.bindIncentiveOnclick();

        this.setupIncentives();
    }

    isLoggedIn() {
        return this.context.customerId ? true : false;
    }

    bindIncentiveOnclick() {
        document.querySelector('.incentive-list').addEventListener('click', function (e) {
            if(e.target.parentNode.classList.contains('incentive-item-add') && e.target.disabled == false) {

                e.target.disabled = true;
                e.target.innerText = 'Adding...';

                let formData = new FormData();
                formData.set('action', 'add');
                formData.set('product_id', e.target.dataset.productId);
                formData.set('qty[]', '1');

                utils.api.cart.itemAdd(formData, (err, response) => {
                        console.warn('err', err);
                        console.warn('err response', response);
                    if(err == null) {
                        e.target.innerText = 'Added!';
                    } else {
                    }
                });
            }
        })
    }

    async setupIncentives() {
        await this.grabIncentives();
        await this.getIncentives(this.cartItemIds);
    }

    async grabIncentives() {
        const that = this;
        const itemIds = [];
        if(that.context.cartId) {
            await fetch('/api/storefront/checkouts/' + that.context.cartId, {
                credentials: 'include'
            }).then(
                response => response.json()
            ).then(function (response) {
                if(response) {
                    response.cart.lineItems.physicalItems.forEach((product) => {
                        itemIds.push(product.productId);
                    });
                }
                that.cartItemIds = itemIds;
            }).catch(function (err) {
                that.cartItemIds = itemIds;
            });
        } else {
            that.cartItemIds = itemIds;
        }
    }

    async getIncentives(disabledItemIds) {
        const that = this;
        const jwtToken = await window.jwtToken();
        $.ajax({
            url: `${that.context.consultantManagement.api_url}/incentives/${that.context.customerId}/list`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'jwt-token': jwtToken
            },
            success(response) {
                if(response && response.rewards && response.rewards.items) {
                    response.rewards.items.forEach((product) => {
                        let productDisabled = false;
                        if(disabledItemIds.includes(product.id)) {
                            productDisabled = true;
                        }
                        const effectiveDate = new Date(Date.parse(product.effectiveDate));
                        const effectiveDateString = `${effectiveDate.getMonth()}/${effectiveDate.getDay()}/${effectiveDate.getFullYear()}`;
                        that.addIncentive(product.productName, effectiveDateString, product.id, productDisabled);
                    });
                }
            },
            // eslint-disable-next-line no-unused-vars
            error(xhr, status, error) {
                console.error('Error getting incentive products', xhr, status, error);
            },
        });
    }

    addIncentive (title, date, id, disabled) {
        var incentiveItem = document.createElement('div');
        incentiveItem.classList.add("incentive-item");
        incentiveItem.innerHTML = `
            <p class="incetinve-item-title">${title}</p>
            <p class="incetinve-item-date">Available Until: ${date}</p>
            <div class="incentive-item-add"><button ${disabled ? 'disabled="true"' : ''} data-product-id="${id}" class="button button--primary">Add to Cart</button></div>
        `;
        document.querySelector('.incentive-list').append(incentiveItem);
    }

}
