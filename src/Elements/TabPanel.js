import HashRequest from '../Routing/HashRequest';

class TabPanel extends HTMLElement 
{
    constructor() 
    {
        super();
        // Request history.
        this.history         = [];
        this.historyIndex    = -1;
        this.routeCollection = null;
        this.ctrlKey         = false;
    }

    /**
     * Sets the route collection.
     *
     * @param {RouteCollection} routeCollection 
     */
    setRouteCollection(routeCollection) 
    {
        this.routeCollection = routeCollection;
    }

    connectedCallback()
    {
        this.classList.add('tabbed-router__tab-panel');
        this.addEventListener('click',   this.onAnchorClicked.bind(this));
        this.addEventListener('submit',  this.onFormSubmitted.bind(this));
        this.addEventListener('keydown', this.onKeyDown.bind(this));
        this.addEventListener('keyup',   this.onKeyUp.bind(this));
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
     * Event listener, called when anchors are clicked.
     *
     * @private
     *
     * @param {PointerEvent} evt
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
     * Event listener, called when anchors are clicked.
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
     * Moves backwards in the history of requests.
     */
    backwards() 
    {
        if (this.historyIndex <= 0) {
            return;
        }

        this.historyIndex--;
        this.request( this.history[ this.historyIndex ] );
    }

    /**
     * Moves forwards in the history of requests.
     */
    forwards() 
    {
        if (this.historyIndex == this.history.length - 1) {
            return;
        }

        this.historyIndex++;
        this.request( this.history[ this.historyIndex ] );
    }

    /**
     * Navigates to request.
     *
     * Pushes request into the history.
     *
     * @param {HashRequest} request
     */
    goTo(request) 
    {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(request);
        this.request(request);
        this.historyIndex++;
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

        var options = {
            bubbles: true,
            detail: request
        };

        var event = new CustomEvent('tabbed-router:tab-panel:request-made', options);
        this.dispatchEvent(event);
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

    nothingFoundCallback(request)
    {
        var defaultElement = document.createElement('div');
        defaultElement.innerHTML = 'Nothing found';

        request.meta.title = request.meta.title
            ? request.meta.title + ' ( not found )'
            : 'not found';
        
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
