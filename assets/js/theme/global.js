import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import carousel from './common/carousel';
import svgInjector from './global/svg-injector';
import quickAddToCart from './global/custom/quick-add-to-cart';
import gridListSwitcher from './global/custom/grid-list-switcher';
import loginModal from './global/custom/login-modal';
import sessionManager from './global/custom/session-manager';
import subscriptionManager from './global/custom/subscription-manager';

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        svgInjector();

        // Custom components
        loginModal(
            this.context.sessionManagement.enabled,
            this.context.sessionManagement.timeout_minutes,
        );
        quickAddToCart();
        gridListSwitcher();
        sessionManager(this.context.customerId, false);
        subscriptionManager(this.context.customerId, this.context.subscriptionManagement);
        const accountMenu = document.getElementById('navPages-account-main');
        if (accountMenu) {
            accountMenu.classList.add('is-open');
        }
    }
}
