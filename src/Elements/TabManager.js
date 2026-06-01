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
         * @protected
         *
         * @var {Object}
         *   Relational object to track DOM elements.
         */
        this.$refs           = {
            tabPanelsWrapper: null,
            tabPanels: {}
        };

        /**
         * @protected
         *
         * @var {Int}
         *   The number of opened tabs.
         */
        this.tabCount        = 0;

        /**
         * @protected
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered        = false;

        /**
         * @protected
         *
         * @var {String}
         *   The id of the currently focused tab.
         */
        this.focusedTabId    = null;

        /**
         * @protected
         *
         * @var {RouteCollection}
         *   The collection of routes.
         */
        this.routeCollection = null;

        /**
         * @protected
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
     *   The route collection.
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
        } while(this.$refs.tabPanels[id]);

        return id;
    }

    /**
     * Moves backwards in the navigation history of the focused tab.
     */
    backwards() 
    {
        var tab;

        if (tab = this.getFocusedTabPanel()) {
            tab.backwards();
        }
    }

    /**
     * Moves forwards in the navigation history of the focused tab.
     */
    forwards() 
    {
        var tab;

        if (tab = this.getFocusedTabPanel()) {
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
    focusTabPanel(tabId) 
    {
        var tab = this.getTabPanel(tabId);
        if (!tab) {
            throw `Tab ${tabId} not found`;
        }

        // Already focused, do nothing.
        if (this.focusedTabId == tabId) {
            return;
        }

        this.focusedTabId = tabId;

        for (var tb of this.getTabPanels()) {
            tb.tabId == tabId
                ? tb.focus()
                : tb.unfocus()
        }

        this.fireEvent('tabbed-router:tab-panel-focused', true, {tab});

        return tab;
    }

    /**
     * Creates and adds a new tab panel.
     *
     * @param {String} tabId
     *   The tab id.
     * @param {Bool} focus
     *   To focus on it once added.
     *
     * @returns {TabPanel}
     *   The newly created tab.
     */
    addNewTabPanel(tabId, focus = true) 
    {
        var newTab = new TabPanel();
        this.setTabPanel(tabId, newTab);
        if (focus) {
            this.focusTabPanel(tabId);
        }

        return newTab;
    }

    /**
     * Return all opened tab panels.
     *
     * @returns {Array}
     */
    getTabPanels()
    {
        return Object.values(this.$refs.tabPanels);
    }

    /**
     * Returns the tab panel with the matching id.
     *
     * @param {String} tabId
     *
     * @returns {TabPanel|null}
     *   The matching tab.
     */
    getTabPanel(tabId)
    {
        return this.$refs.tabPanels[ tabId ] || null;
    }

    /**
     * Returns the currently focused tab.
     *
     * @returns {TabPanel|null}
     */
    getFocusedTabPanel()
    {
        return this.$refs.tabPanels[ this.focusedTabId ] || null;
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
    setTabPanel(tabId, tabPanel) 
    {
        if (this.$refs.tabPanels[tabId]) {
            throw `Tab {tabId} is already set`;
        }

        tabPanel.setRouteCollection(this.routeCollection);
        tabPanel.setTabId(tabId);

        this.$refs.tabPanels[tabId] = tabPanel;

        if (this.rendered) {
            this.attachTabPanel(tabId);
        }
    }

    /**
     * Removes the specified tab panel.
     *
     * @param {string} tabId
     *   The tab id.
     *
     * @return {TabPanel|null}
     *   The removed tab.
     */
    rereorderTabPanel(tabId) 
    {
        var tabPanel;

        if (!this.$refs.tabPanels[tabId]) {
            return null;
        }

        tabPanel = this.$refs.tabPanels[tabId];

        if (this.rendered) {
            this.detachTab(tabId);
        }

        this.fireEvent('tabbed-router:tab-panel-closed', true, {tab: tabPanel});

        return tabPanel;
    }

    /**
     * Callback of the Custom elements API.
     *
     * @protected
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
     * @protected
     */
    render() 
    {
        this.classList.add('tabbed-router__tab-manager');
        
        this.subRenderHeader();
        this.subRenderPanes();        

        for (var tabId in this.$refs.tabPanels) {
            this.attachTabPanel(tabId);
        }

        document.addEventListener('click',   this.onAnchorClicked.bind(this));
        document.addEventListener('submit',  this.onFormSubmitted.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup',   this.onKeyUp.bind(this));

        this.addEventListener('tabbed-router:request-closing-of-tab', this.onRequestToCloseTab.bind(this));
        this.addEventListener('tabbed-router:request-focus-on-tab', this.onRequestFocus.bind(this));

        this.addEventListener('tabbed-router:request-backwards', this.onRequestBackwards.bind(this));
        this.addEventListener('tabbed-router:request-forwards', this.onRequestForwards.bind(this));
        this.addEventListener('tabbed-router:request-reorder-tab', this.onRequestReorderTab.bind(this));
    }

    /**
     * @protected
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
     * @protected
     */
    subRenderPanes() 
    {
        this.$refs.tabPanelsWrapper = document.createElement('div');
        this.$refs.tabPanelsWrapper.classList.add('tabbed-router__tab-manager__tab-panels');
        this.append(this.$refs.tabPanelsWrapper);
    }

    /**
     * Event listener.
     *
     * Reacts to a request to focus on a specific tab panel.
     *
     * @protected
     *
     * @param {Event} evt
     *   Focus event.
     */
    onRequestFocus(evt)
    {
        var tabId = evt.detail;
        this.focusTabPanel(tabId);
    }

    /**
     * Event listener.
     *
     * Reacts to a request go backwards in the tab panel' navigation history.
     *
     * @protected
     *
     * @param {Event} evt
     *   Backwards event.
     */
    onRequestBackwards(evt)
    {
        this.backwards();
    }

    /**
     * Event listener.
     *
     * Reacts to a request go forwardss in the tab panel' navigation history.
     *
     * @protected
     *
     * @param {Event} evt
     *   Forward event.
     */
    onRequestForwards(evt)
    {
        this.forwards();
    }

    /**
     * Event listener.
     *
     * Reacts to a request to re-order tabs.
     *
     * @protected
     *
     * @param {Event} evt
     *   Reorder event.
     */
    onRequestReorderTab(evt)
    {
        var { tabId, from, to } = evt.detail;

        this.reorderTabPanel(tabId, from, to);
    }

    /**
     * Re-order tabs.
     *
     * @protected
     *
     * @param {string} tabId
     *   To identify the tab to be moved.
     * @param {Int} from
     *   The tab's current position.
     * @param {Int} to
     *   The intended position.
     */
    reorderTabPanel(tabId, from, to)
    {
        const tabPanel = this.getTabPanel(tabId);        
        const child = this.$refs.tabPanelsWrapper.children[to];

        from > to
            ? child.before(tabPanel)
            : child.after(tabPanel);

        this.fireEvent('tabbed-router:tab-panel-reordered', true, { tabId, from, to });
    }

    /**
     * Event listener.
     *
     * Reacts to a request to close a specified tab.
     *
     * @protected
     *
     * @param {Event} evt
     *   Event to close a tab.
     */
    onRequestToCloseTab(evt) 
    {
        // Won't be closing the only tab.
        if (this.tabCount <= 1) {
            return;
        }

        var tabId = evt.detail;

        if (tabId == this.focusedTabId) {
            var newFocus = (this.$refs.tabLinks.getTabButton(tabId).previousSibling || this.$refs.tabLinks.getTabButton(tabId).nextSibling).tabId;
            this.focusTabPanel(newFocus);
        }

        this.rereorderTabPanel(tabId);
    }

    /**
     * Event listener.
     *
     * Reacts to a key being pressed.
     *
     * @protected
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
     * Reacts to a key being released.
     *
     * @protected
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
     * Reacts to an anchor being clicked.
     *
     * @protected
     *
     * @param {PointerEvent} evt
     *   The click event.
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
            this.openInNewTabPanel(request, false);
        } else {
            var target = a.getAttribute('target') || 'self';
            // target blank ? new tab, do focus.
            target == '_blank'
                ? this.openInNewTabPanel(request, true)
                : this.$refs.tabPanels[this.focusedTabId].goTo(request);
        }
    }

    /**
     * Event listener.
     *
     * Reacts to a form being submitted.
     *
     * @protected
     *
     * @param {SubmitEvent} evt
     *   Form submit event.
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
            this.openInNewTabPanel(request, false);
            return;
        }

        var target = form.getAttribute('target') || 'self';
        // target blank ? new tab, do focus.
        target == '_blank'
            ? this.openInNewTabPanel(request, true)
            : this.$refs.tabPanels[this.focusedTabId].goTo(request);
    }

    /**
     * Open the request in a new tab.
     *
     * @protected
     *
     * @param {HashRequest} request
     *   Request object
     * @param {Boolean} focus
     *   Should the new tab be focused ?
     *
     * @returns {TabPanel}
     *   The new tab pane.
     */
    openInNewTabPanel(request, focus = false) 
    {
        var tabId = this.generateNewTabId();
        var tab   = this.addNewTabPanel(tabId, focus);
        tab.goTo(request);

        return tab;
    }

    /**
     * Attatches the specified tab.
     *
     * @protected
     *
     * @param {string} tabId
     *   The tab id.
     *
     * @return {TabPanel}
     *   The attached tab.
     */
    attachTabPanel(tabId) 
    {
        var tab = this.$refs.tabPanels[tabId];

        this.$refs.tabPanelsWrapper.append( tab );

        this.tabCount++;

        return tab;
    }

    /**
     * Removes the specified tab.
     *
     * @protected
     *
     * @param {string} tabId 
     *   The tab id.
     *
     * @return {TabPanel}
     *   The detatched tab.
     */
    detachTab(tabId) 
    {        
        var tab = this.$refs.tabPanels[tabId];
        tab.remove();
        delete this.$refs.tabPanels[tabId];
        this.tabCount--;

        return tab;
    }

    /**
     * Short hand to fire custom events.
     *
     * @protected
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
