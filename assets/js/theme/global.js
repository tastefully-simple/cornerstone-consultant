import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import 'regenerator-runtime/runtime';
import 'foundation-sites/js/foundation/foundation';
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
import sessionManager from './global/custom/session-manager';
import subscriptionManager from './global/custom/subscription-manager';
import stickyHeader from './global/sticky-header';
import globalIncentives from './global/global-incentives';
import jwtTokenManager from './global/jwt-token';

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context;

        window.jwtToken = jwtTokenManager;

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
        stickyHeader();
        globalIncentives(this.context.customerId ?? 0, this.context.consultantManagement.api_url);

        // Custom components
        sessionManager(
            this.context.sessionManagement.enabled,
            this.context.sessionManagement.timeout_minutes,
            this.context.customerId >= 1,
        );

        quickAddToCart();
        gridListSwitcher();
        subscriptionManager(
            this.context.customerId, this.context.productId,
            this.context.subscriptionManagement,
        );
        const accountMenu = document.getElementById('navPages-account-main');
        if (accountMenu) {
            accountMenu.classList.add('is-open');
        }
    }
}
