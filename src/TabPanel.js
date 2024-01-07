import Request from './Request';

class TabPanel extends HTMLElement 
{
    constructor() 
    {
        super();
        this.history = [];
        this.historyIndex = -1;
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
        this.classList.add('tab-panel');
        this.addEventListener('click', this.linkClick.bind(this));
    }

    linkClick(evt) 
    {
        var a = TabPanel.getAnchor(evt.target);

        if (!a) {
            return;
        }

        if (evt.ctrlKey || evt.target.getAttribute('target') == '_blank') {
            // Let the tabmanager handle it.
            return;
        }

        evt.tabAvaliated = true;

        var request = Request.createFromAnchor(a);

        if (!request) {
            return;
        }

        var hash = request.path.replace('/', '#');
        var selected;

        try {
            selected = document.querySelector(hash);
        } catch {
            selected = false;
        }

        if (selected) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        this.goTo(request);
    }

    /**
     * @param {Request} request 
     */
    request(request) 
    {
        var route = this.routeCollection.getMatchingRoute(request);
        var element = route
            ? route.callIt(request)
            : this.notFoundCallback(request);

        this.stageElement(element);

        var options = {
            bubbles: true,
            detail: request
        };

        var event = new CustomEvent('tab:request', options);
        this.dispatchEvent(event);
    }

    backwards() 
    {
        if (this.historyIndex <= 0) {
            return;
        }

        this.historyIndex--;
        this.request( this.history[ this.historyIndex ] );
    }

    forwards() 
    {
        if (this.historyIndex == this.history.length - 1) {
            return;
        }

        this.historyIndex++;
        this.request( this.history[ this.historyIndex ] );
    }

    goTo(request) 
    {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(request);
        this.request(request);
        this.historyIndex++;
    }

    stageElement(element) 
    {
        this.clearStage();
        this.addToStage(element);
    }

    clearStage() 
    {
        this.querySelectorAll(':scope > *').forEach((e) => 
        {
            e.remove();
        });
    }

    addToStage(element) 
    {
        this.append(element);
    }

    notFoundCallback(request)
    {
        var defaultElement = document.createElement('div');
        defaultElement.innerHTML = 'Nothing found';

        request.meta.title = request.meta.title
            ? request.meta.title + ' ( not found )'
            : 'not found';
        
        return defaultElement;
    }

    static getAnchor(element) 
    {
        if (element.tagName == 'A') {
            return element;
        }

        do {
            element = element.parentNode;
        } while(element.parentNode && element.parentNode.tagName == 'A');

        return element;
    }
}

export default TabPanel;
