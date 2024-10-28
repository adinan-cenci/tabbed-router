import HashRequest from '../Routing/HashRequest';

class TabPanel extends HTMLElement 
{
    constructor() 
    {
        super();

        /**
         * @var {String}
         *   This panel unique id.
         */
        this.tabId           = null;
        
        /**
         * @var {Array}
         *   An history of requests for this specific panel.
         */
        this.history         = [];

        /**
         * @var {Int}
         *   Our position withing this.history.
         */
        this.historyIndex    = -1;

        /**
         * @var {RouteCollection}
         *   The collection of routes.
         */
        this.routeCollection = null;

        /**
         * @var {Bool}
         *   Indicates if the ctrl key is currently pressed.
         */
        this.ctrlKey         = false;

        /**
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered        = false;
    }

    /**
     * Sets the route collection.
     *
     * @param {RouteCollection} routeCollection 
     *
     * @return {TabPanel}
     *   Returns itself.
     */
    setRouteCollection(routeCollection) 
    {
        this.routeCollection = routeCollection;
        return this;
    }

    /**
     * Sets this panel unique id.
     *
     * @param {String} tabId
     *   Id.
     *
     * @return {TabPanel}
     *   Returns itself.
     */
    setTabId(tabId)
    {
        this.tabId = tabId;
        if (this.rendered) {
            this.setAttribute('id', tabId);
        }
    }

    /**
     * Returns the tab's title.
     *
     * It depends on what it is displaying at the moment.
     *
     * @returns {String}
     *   A title for the tab.
     */
    getTitle()
    {
        if (this.children.length && this.children[0].getTitle) {
            return this.children[0].getTitle();
        }
        
        if (this.history.length && this.history[ this.historyIndex ].meta.title) {
            return this.history[ this.historyIndex ].meta.title;
        }

        return 'New tab';
    }

    /**
     * Focus the panel.
     *
     * @return {TabPanel}
     *   Returns itself.
     */
    focus()
    {
        this.classList.add('tabbed-router__tab-panel--focused');
        return this;
    }

    /**
     * Unfocus the panel.
     *
     * @return {TabPanel}
     *   Returns itself.
     */
    unfocus()
    {
        this.classList.remove('tabbed-router__tab-panel--focused');
        return this;
    }

    canGoBackwards()
    {
        return this.historyIndex > 0;
    }

    canGoForwards()
    {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * Moves backwards in the navigation history.
     */
    backwards() 
    {
        if (!this.canGoBackwards()) {
            return;
        }

        this.historyIndex--;
        this.request( this.history[ this.historyIndex ] );
    }

    /**
     * Moves forwards in the navigation history.
     */
    forwards() 
    {
        if (!this.canGoForwards()) {
            return;
        }

        this.historyIndex++;
        this.request( this.history[ this.historyIndex ] );
    }

    /**
     * Processes a request.
     *
     * And pushes into the history.
     *
     * @param {HashRequest} request
     *   The request to be processed.
     */
    goTo(request) 
    {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(request);
        this.request(request);
        this.historyIndex++;
    }

    /**
     * Navigate to the specified href.
     *
     * @param {String} href
     *   The address.
     */
    access(href)
    {
        var request = HashRequest.createFromHash(href);
        this.goTo(request);
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
        this.classList.add('tabbed-router__tab-panel');
        this.setAttribute('id', this.tabId);
        this.addEventListener('click',   this.onAnchorClicked.bind(this));
        this.addEventListener('submit',  this.onFormSubmitted.bind(this));
        this.addEventListener('keydown', this.onKeyDown.bind(this));
        this.addEventListener('keyup',   this.onKeyUp.bind(this));

        var config = { 
            childList  : true,
            attributes : false,  
            subtree    : true 
        };

        this.observer = new MutationObserver( this.observer.bind(this) );
        this.observer.observe(this, config);

        this.updatedEvent();
    }

    /**
     * @private
     */
    observer()
    {
        this.updatedEvent();
    }

    /**
     * Fires an update event.
     *
     * @private
     *
     * @param {HashRequest|null} request
     *   Request that has updated the panel.
     */
    updatedEvent(request = null)
    {
        var options = {
            bubbles: true,
            detail: {
                tab: this,
                request: request
            }
        }

        var event = new CustomEvent('tabbed-router:tab-updated', options);
        this.dispatchEvent(event);
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
     * Event listener, called when anchors are clicked.
     *
     * @private
     *
     * @param {PointerEvent} evt
     *   Event.
     */
    onAnchorClicked(evt) 
    {
        var a = TabPanel.getAnchor(evt.target);

        if (!a) {
            return;
        }

        var openInNewTab = evt.ctrlKey || a.getAttribute('target') == '_blank';
        if (openInNewTab) {
            // Let the tabmanager handle it.
            return;
        }

        evt.tabbedRouterAvaliated = true;

        var request = HashRequest.createFromAnchor(a);
        if (
            request == false ||
            request.matchesHtmlElement()
        ) {
            // Nothing to do, let the tabmanager handle it.
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        this.goTo(request);
    }

    /**
     * Event listener, called when forms are submitted.
     *
     * @private
     *
     * @param {SubmitEvent} evt
     */
    onFormSubmitted(evt) 
    {
        var form = evt.target;

        var openInNewTab = this.ctrlKey || form.getAttribute('target') == '_blank';
        if (openInNewTab) {
            // Let the tabmanager handle it.
            return;
        }

        evt.tabbedRouterAvaliated = true;

        var request = HashRequest.createFromForm(form);
        if (
            request == false || 
            form.method != 'get' || 
            request.matchesHtmlElement()            
        ) {
            // Nothing to do, let the tabmanager handle it.
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        this.goTo(request);
    }

    /**
     * Finds a matching route and appends the returned element.
     *
     * @private
     *
     * @param {HashRequest} request
     *   The request.
     */
    request(request) 
    {
        var route = this.routeCollection.getMatchingRoute(request);
        var element = route
            ? route.callIt(request)
            : this.nothingFoundCallback(request);

        if (!element) {
            // Do nothing.
            console.error('Route failed in returning an element.');
            return;
        }

        this.stageElement(element);

        this.updatedEvent(request);
    }

    /**
     * Clears the stage and appends element.
     *
     * @private 
     */
    stageElement(element) 
    {
        this.clearStage();
        this.addToStage(element);
    }

    /**
     * Clears the tab of all its children.
     *
     * @private
     */
    clearStage() 
    {
        this.querySelectorAll(':scope > *').forEach((e) => 
        {
            e.remove();
        });
    }

    /**
     * Appends element.
     *
     * @private
     *
     * @param {HTMLElement} element 
     */
    addToStage(element) 
    {
        this.append(element);
    }

    /**
     * Generates generic element with an error message.
     * 
     * @private
     *
     * @param {HashRequest} request
     *   The request with no matchin routes.
     */
    nothingFoundCallback(request)
    {
        var defaultElement = document.createElement('div');
        defaultElement.innerHTML = 'Nothing found';

        request.meta.title = request.meta.title
            ? request.meta.title + ' ( not found )'
            : 'not found';

        defaultElement.getTitle = function()
        {
            return 'nothing found';
        }
        
        return defaultElement;
    }

    /**
     * Returns the first parent element that is an anchor.
     *
     * It iterates through the parentNode attributes until it finds an anchor.
     *
     * @param {HTMLElement} element
     *   An element inside the panel.
     * 
     * @returns {HTMLAnchorElement|null}
     *   The anchor element, null if there is none.
     */
    static getAnchor(element)
    {
        // Is itself the anchor.
        if (element instanceof HTMLAnchorElement) {
            return element;
        }

        do {
            element = element.parentNode;
        } while(element.parentNode && !(element instanceof HTMLAnchorElement));

        return element && element instanceof HTMLAnchorElement
            ? element
            : null;
    }
}

export default TabPanel;
