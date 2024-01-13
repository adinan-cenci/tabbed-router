import HashRequest from './HashRequest';
import TabLink     from './TabLink';
import TabPanel    from './TabPanel';

class TabManager extends HTMLElement 
{
    constructor() 
    {
        super();

        this.$refs    = {};
        this.links    = {};
        this.tabs     = {};
        this.tabCount = 0;

        this.rendered = false;

        this.currentTabId = null;

        this.routeCollection = null;

        this.ctrlKey = false;
    }

    /**
     * @param {RouteCollection} routeCollection 
     */
    setRouteCollection(routeCollection) 
    {
        this.routeCollection = routeCollection;
    }

    connectedCallback() 
    {
        if (!this.rendered) {
            this.render();
        }
    }

    /**
     * @private
     */
    render() 
    {
        this.rendered = true;
        this.classList.add('tabbed-router__tab-manager');
        
        this.subRenderHeader();
        this.subRenderPanes();        

        for (var tabId in this.tabs) {
            this.attachTab(tabId);
        }

        document.addEventListener('click', this.onAnchorClicked.bind(this));
        document.addEventListener('submit', this.onFormSubmitted.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        this.addEventListener('tabbed-router:tab-panel:request-made', this.onTabRequest.bind(this));
        this.addEventListener('tabbed-router:tab-link:request-closing', this.onRequestToCloseTab.bind(this));
    }

    /**
     * @private
     */
    subRenderHeader() 
    {
        this.$refs.header = document.createElement('div');
        this.$refs.header.classList.add('tabbed-router__tab-manager__header');
        this.append(this.$refs.header);

        this.subRenderControls();
        this.subRenderTabLinks();
    }

    /**
     * @private
     */
    subRenderControls() 
    {
        this.$refs.controls = document.createElement('div');
        this.$refs.controls.classList.add('tabbed-router__tab-manager__controls');
        this.$refs.header.append(this.$refs.controls);

        this.$refs.backwardButton = document.createElement('button');
        this.$refs.backwardButton.title = 'Backwards';
        this.$refs.backwardButton.classList.add('tabbed-router__tab-manager__backwards-button');
        this.$refs.controls.append(this.$refs.backwardButton);

        this.$refs.forwardButton  = document.createElement('button');
        this.$refs.forwardButton.title = 'Forwards';
        this.$refs.forwardButton.classList.add('tabbed-router__tab-manager__forwards-button');
        this.$refs.controls.append(this.$refs.forwardButton);

        this.$refs.backwardButton.addEventListener('click', this.backwards.bind(this));
        this.$refs.forwardButton.addEventListener('click', this.forwards.bind(this));
    }

    /**
     * @private
     */
    subRenderTabLinks() 
    {
        this.$refs.tabLinks = document.createElement('div');
        this.$refs.tabLinks.classList.add('tabbed-router__tab-manager__tab-links');
        this.$refs.header.append(this.$refs.tabLinks);
    }

    /**
     * @private
     */
    subRenderPanes() 
    {
        this.$refs.tabPanes = document.createElement('div');
        this.$refs.tabPanes.classList.add('tab-manager__tab-panes');
        this.append(this.$refs.tabPanes);
    }

    /**
     * @private
     */
    onRequestToCloseTab(evt) 
    {
        if (this.tabCount <= 1) {
            return;
        }

        var tabId = evt.detail;
        if (tabId == this.currentTabId) {
            var newFocus = (this.links[tabId].previousSibling || this.links[tabId].nextSibling).tabId;
            this.focusTab(newFocus);
        }

        this.removeTab(tabId);
    }

    onKeyDown(evt) 
    {
        this.ctrlKey = evt.ctrlKey;
    }

    onKeyUp(evt) 
    {
        this.ctrlKey = evt.ctrlKey;
    }

    /**
     * @private
     *
     * @param {PointerEvent} evt
     */
    onAnchorClicked(evt) 
    {
        if (evt.tabbedRouterAvaliated) {
            return;
        }

        var a = TabPanel.getAnchor(evt.target);

        if (!a) {
            return;
        }

        var request = HashRequest.createFromAnchor(a);
        if (
            request == false ||
            request.matchesHtmlElement()
        ) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        if (evt.ctrlKey) {
            // Net tab, do not focus.
            this.openInNewTab(request, false);
        } else {
            var target = a.getAttribute('target') || 'self';
            // target blank ? new tab, do focus.
            target == '_blank'
                ? this.openInNewTab(request, true)
                : this.tabs[this.currentTabId].goTo(request);
        }
    }

    /**
     * @private
     *
     * @param {SubmitEvent} evt
     */
    onFormSubmitted(evt) 
    {
        if (evt.tabbedRouterAvaliated) {
            return;
        }

        var form = evt.target;

        evt.tabbedRouterAvaliated = true;

        var request = HashRequest.createFromForm(form);
        if (
            request == false || 
            form.method != 'get' || 
            request.matchesHtmlElement()            
        ) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        if (this.ctrlKey) {
            // Net tab, do not focus.
            this.openInNewTab(request, false);
        } else {
            var target = form.getAttribute('target') || 'self';
            // target blank ? new tab, do focus.
            target == '_blank'
                ? this.openInNewTab(request, true)
                : this.tabs[this.currentTabId].goTo(request);
        }
    }

    openInNewTab(request, focus = false) 
    {
        var tabId = this.generateNewTabId();
        var tab = this.createTab(tabId, request.meta.title || tabId, focus);
        tab.goTo(request);

        return tab;
    }

    generateNewTabId() 
    {
        var id;

        do {
            id = 'tab-' + Math.floor(Math.random() * 1000);
        } while(this.tabs[id]);

        return id;
    }

    onTabRequest(evt) 
    {
        var tabId = this.getTabIdForTabPanel(evt.target);
        var request = evt.detail;

        this.links[tabId].setLabel(request.meta.title || tabId);
    }

    getTabIdForTabPanel(tabPanel) 
    {
        for (var tabId in this.tabs) {
            if (this.tabs[tabId] == tabPanel) {
                return tabId;
            }
        }

        return null;
    }

    backwards() 
    {
        this.tabs[ this.currentTabId ].backwards();
    }

    forwards() 
    {
        this.tabs[ this.currentTabId ].forwards();
    }

    focusTab(tabId) 
    {
        this.currentTabId = tabId;

        for (var tId in this.tabs) {
            if (tId == tabId) {
                this.tabs[tId].classList.add('focused');
                this.links[tId].classList.add('focused');
            } else {
                this.tabs[tId].classList.remove('focused');
                this.links[tId].classList.remove('focused');
            }
        }
    }

    createTab(tabId, label = null, focus = true) 
    {
        var newTab = new TabPanel();
        this.setTab(tabId, newTab, label);
        if (focus) {
            this.focusTab(tabId);
        }

        return newTab;
    }

    /**
     * Attatches a tab.
     *
     * @param {string} tabId 
     * @param {TabPanel} tabPanel
     * @param {string|null} label
     */
    setTab(tabId, tabPanel, label) 
    {
        if (this.tabs[tabId]) {
            throw `Tab {tabId} is already set`;
        }

        tabPanel.setRouteCollection(this.routeCollection);

        var button = this.createTabButton(tabId, label || tabId);

        this.tabs[tabId]  = tabPanel;
        this.links[tabId] = button;

        if (this.rendered) {
            this.attachTab(tabId);
        }
    }

    /**
     * Remove tab.
     *
     * @param {string} tabId
     *
     * @return {TabPanel|null} 
     */
    removeTab(tabId) 
    {
        var tabPanel;

        if (!this.tabs[tabId]) {
            return null;
        }

        tabPanel = this.tabs[tabId];

        if (this.rendered) {
            this.detachTab(tabId);
        }

        return tabPanel;
    }

    /**
     * @private
     *
     * @param {string} tabId 
     */
    attachTab(tabId) 
    {
        var tab    = this.tabs[tabId];
        var button = this.links[tabId];

        this.$refs.tabLinks.append( button );
        this.$refs.tabPanes.append( tab );

        this.tabCount++;
    }

    /**
     * @private
     *
     * @param {string} tabId 
     */
    detachTab(tabId) 
    {
        this.links[tabId].remove();
        delete this.links[tabId];
        
        this.tabs[tabId].remove();
        delete this.tabs[tabId];

        this.tabCount--;
    }

    /**
     * @private
     *
     * @param {string} tabId
     * @param {string} title
     *
     * @return {TabLink}
     */
    createTabButton(tabId, title) 
    {
        var button = new TabLink;
        button.setTabId(tabId);
        button.setLabel(title);

        button.addEventListener('tabbed-router:tab-link:clicked', (evt) => 
        {
            this.focusTab( evt.target.tabId );
        });

        return button;
    }
}

export default TabManager;
