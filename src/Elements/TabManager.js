import HashRequest from '../Routing/HashRequest';
import TabPanel    from './TabPanel';
import TabControls from './TabControls';
import TabsBar     from './TabsBar';

class TabManager extends HTMLElement 
{
    constructor() 
    {
        super();

        /**
         * @private
         *
         * @var {Object}
         *   Relational object to track dom elements.
         */
        this.$refs           = {
            tabs: {}
        };

        /**
         * @private
         *
         * @var {Int}
         *   The number of opened tabs.
         */
        this.tabCount        = 0;

        /**
         * @private
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered        = false;

        /**
         * @private
         *
         * @var {String}
         *   The id of the currently focused tab.
         */
        this.focusedTabId    = null;

        /**
         * @private
         *
         * @var {RouteCollection}
         *   The collection of routes.
         */
        this.routeCollection = null;

        /**
         * @private
         *
         * @var {Bool}
         *   Indicates if the ctrl key is currently pressed.
         */
        this.ctrlKey         = false;
    }

    /**
     * Sets the route collection.
     *
     * @param {RouteCollection} routeCollection 
     *
     * @return {TabManager}
     *   Returns itself.
     */
    setRouteCollection(routeCollection) 
    {
        this.routeCollection = routeCollection;
        return this;
    }

    /**
     * Generates an unique id to be used as a tab id.
     *
     * @returns {String}
     *   An unique id.
     */
    generateNewTabId() 
    {
        var id;

        do {
            id = 'tab-' + Math.floor(Math.random() * 1000);
        } while(this.$refs.tabs[id]);

        return id;
    }

    /**
     * Moves backwards in the navigation history of the focused tab.
     */
    backwards() 
    {
        var tab;

        if (tab = this.getFocusedTab()) {
            tab.backwards();
        }
    }

    /**
     * Moves forwards in the navigation history of the focused tab.
     */
    forwards() 
    {
        var tab;

        if (tab = this.getFocusedTab()) {
            tab.forwards();
        }
    }

    /**
     * Focus the specified tab.
     *
     * @param {String} tabId 
     *   The tab id.
     *
     * @returns {TabPanel|null}
     *   The focused tab.
     */
    focusTab(tabId) 
    {
        var tab = this.getTab(tabId);
        if (!tab) {
            throw `Tab ${tabId} not found`;
        }

        this.focusedTabId = tabId;

        for (var tb of this.getTabs()) {
            tb.tabId == tabId
                ? tb.focus()
                : tb.unfocus()
        }

        this.fireEvent('tabbed-router:tab-focused', true, {tab});

        return tab;
    }

    /**
     * Creates a new tab and adds it.
     *
     * @param {String} tabId
     *   The tab id.
     * @param {Bool} focus
     *   To focus on it once added.
     *
     * @returns {TabPanel}
     *   The newly created tab.
     */
    createTab(tabId, focus = true) 
    {
        var newTab = new TabPanel();
        this.setTab(tabId, newTab);
        if (focus) {
            this.focusTab(tabId);
        }

        return newTab;
    }

    /**
     * Return all opened tabs.
     *
     * @returns {Array}
     */
    getTabs()
    {
        return Object.values(this.$refs.tabs);
    }

    /**
     * Returns the tab with the matching id.
     *
     * @param {String} tabId
     *
     * @returns {TabPanel|null}
     *   The matching tab.
     */
    getTab(tabId)
    {
        return this.$refs.tabs[ tabId ] || null;
    }

    /**
     * Returns the currently focused tab.
     *
     * @returns {TabPanel|null}
     */
    getFocusedTab()
    {
        return this.$refs.tabs[ this.focusedTabId ] || null;
    }

    /**
     * Adds a tab.
     *
     * @param {string} tabId
     *   The tab id.
     *
     * @param {TabPanel} tabPanel
     *   The tab to be added.
     */
    setTab(tabId, tabPanel) 
    {
        if (this.$refs.tabs[tabId]) {
            throw `Tab {tabId} is already set`;
        }

        tabPanel.setRouteCollection(this.routeCollection);
        tabPanel.setTabId(tabId);

        this.$refs.tabs[tabId] = tabPanel;

        if (this.rendered) {
            this.attachTab(tabId);
        }
    }

    /**
     * Removes the specified tab.
     *
     * @param {string} tabId
     *   The tab id.
     *
     * @return {TabPanel|null}
     *   The removed tab.
     */
    removeTab(tabId) 
    {
        var tabPanel;

        if (!this.$refs.tabs[tabId]) {
            return null;
        }

        tabPanel = this.$refs.tabs[tabId];

        if (this.rendered) {
            this.detachTab(tabId);
        }

        this.fireEvent('tabbed-router:tab-closed', true, {tab: tabPanel});

        return tabPanel;
    }

    /**
     * Callback of the Custom elements API.
     *
     * @private
     */
    connectedCallback() 
    {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    /**
     * Builds up the element and set up event listeners.
     *
     * @private
     */
    render() 
    {
        this.classList.add('tabbed-router__tab-manager');
        
        this.subRenderHeader();
        this.subRenderPanes();        

        for (var tabId in this.$refs.tabs) {
            this.attachTab(tabId);
        }

        document.addEventListener('click',   this.onAnchorClicked.bind(this));
        document.addEventListener('submit',  this.onFormSubmitted.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup',   this.onKeyUp.bind(this));

        this.addEventListener('tabbed-router:request-closing', this.onRequestToCloseTab.bind(this));
        this.addEventListener('tabbed-router:request-focus', this.onRequestFocus.bind(this));

        this.addEventListener('tabbed-router:request-backwards', this.onRequestBackwards.bind(this));
        this.addEventListener('tabbed-router:request-forwards', this.onRequestForwards.bind(this));
    }

    /**
     * @private
     */
    subRenderHeader() 
    {
        this.$refs.header = document.createElement('div');
        this.$refs.header.classList.add('tabbed-router__tab-manager__header');
        this.append(this.$refs.header);

        this.$refs.controls = new TabControls();
        this.$refs.header.append(this.$refs.controls);
        
        this.$refs.tabLinks = new TabsBar();
        this.$refs.header.append(this.$refs.tabLinks);
    }

    /**
     * @private
     */
    subRenderPanes() 
    {
        this.$refs.tabPanels = document.createElement('div');
        this.$refs.tabPanels.classList.add('tabbed-router__tab-manager__tab-panels');
        this.append(this.$refs.tabPanels);
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onRequestFocus(evt)
    {
        var tabId = evt.detail;
        this.focusTab(tabId);
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onRequestBackwards(evt)
    {
        this.backwards();
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onRequestForwards(evt)
    {
        this.forwards();
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onRequestToCloseTab(evt) 
    {
        // Won't be closing the only tab.
        if (this.tabCount <= 1) {
            return;
        }

        var tabId = evt.detail;

        if (tabId == this.focusedTabId) {
            var newFocus = (this.$refs.tabLinks.getButton(tabId).previousSibling || this.$refs.tabLinks.getButton(tabId).nextSibling).tabId;
            this.focusTab(newFocus);
        }

        this.removeTab(tabId);
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {KeyboardEvent} evt
     *   Keyboard event.
     */
    onKeyDown(evt) 
    {
        this.ctrlKey = evt.ctrlKey;
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {KeyboardEvent} evt
     *   Keyboard event.
     */
    onKeyUp(evt) 
    {
        this.ctrlKey = evt.ctrlKey;
    }

    /**
     * Event listener.
     *
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
            // Nothing to do, stop here.
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        if (evt.ctrlKey) {
            // New tab, do not focus.
            this.openInNewTab(request, false);
        } else {
            var target = a.getAttribute('target') || 'self';
            // target blank ? new tab, do focus.
            target == '_blank'
                ? this.openInNewTab(request, true)
                : this.$refs.tabs[this.focusedTabId].goTo(request);
        }
    }

    /**
     * Event listener.
     *
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
            // Nothing to do, stop here.
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
                : this.$refs.tabs[this.focusedTabId].goTo(request);
        }
    }

    openInNewTab(request, focus = false) 
    {
        var tabId = this.generateNewTabId();
        var tab   = this.createTab(tabId, focus);
        tab.goTo(request);

        return tab;
    }

    /**
     * Attatches the specified tab.
     *
     * @private
     *
     * @param {string} tabId
     *   The tab id.
     *
     * @return {TabPanel}
     *   The attached tab.
     */
    attachTab(tabId) 
    {
        var tab = this.$refs.tabs[tabId];

        this.$refs.tabPanels.append( tab );

        this.tabCount++;

        return tab;
    }

    /**
     * Removes the specified tab.
     *
     * @private
     *
     * @param {string} tabId 
     *   The tab id.
     *
     * @return {TabPanel}
     *   The detatched tab.
     */
    detachTab(tabId) 
    {        
        var tab = this.$refs.tabs[tabId];
        tab.remove();
        delete this.$refs.tabs[tabId];
        this.tabCount--;

        return tab;
    }

    /**
     * Short cut to fire custom events.
     *
     * @private
     *
     * @param {String} eventName
     *   Event name.
     * @param {Bool} bubbles
     *   Should the event bubble up the dom tree ?
     * @param {Object} detail
     *   Detail object.
     */
    fireEvent(eventName, bubbles = true, detail = {})
    {
        var options = {
            bubbles: bubbles,
            detail: detail
        };

        var event = new CustomEvent(eventName, options);
        this.dispatchEvent(event);
    }

}

export default TabManager;
