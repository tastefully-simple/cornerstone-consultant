class StickyHeader {
    constructor($header, config) {
        this.$header = $header;
        this.sticky = $header.offsetTop;
        this.config = config;

        window.addEventListener('scroll', () =>
            this.onScroll(this.$header, this.sticky, this.config.screenMinWidth));
    }

    onScroll($mainHeader, sticky, screenMinWidth) {
        const $navlinks = document.getElementsByClassName('navUser-section--alt');
        const $topHeaderContainer = document.querySelector('header .navUser');
        const $mainHeaderContainer = document.querySelector('.navContainer');
        const $mainMenu = document.querySelector('.navPage-subMenu');

        if (document.querySelector('sticky-header')) {
            $mainMenu.classList.add('sticky-menu');
        } else {
            $mainMenu.classList.remove('sticky-menu');
        }

        if (
            window.pageYOffset > sticky &&
            window.innerWidth >= screenMinWidth
        ) {
            $mainHeader.classList.add('sticky-header');
            $mainMenu.classList.add('sticky-menu');
            for (const navlink of $navlinks) {
                $mainHeaderContainer.appendChild(navlink);
            }
        } else {
            $mainMenu.classList.remove('sticky-menu');
            $mainHeader.classList.remove('sticky-header');
            for (const navlink of $navlinks) {
                $topHeaderContainer.appendChild(navlink);
            }
        }
    }
}

export default function () {
    const stickyHeader = new StickyHeader(
        document.querySelector('.header-container'),
        { screenMinWidth: 801 },
    );

    return stickyHeader;
}
