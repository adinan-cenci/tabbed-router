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
     * @param {Router} router 
     */
    setRouter(router) 
    {
        this.router = router;
    }

    connectedCallback() 
    {
        this.addEventListener('click', this.linkClick.bind(this));
    }

    linkClick(evt) 
    {
        if (evt.target.tagName != 'A') {
            return;
        }

        evt.tabAvaliated = true;

        var a = evt.target;
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
        var route = this.router.getMatchingRoute(request);
        var element = route
            ? route.callIt(request)
            : this.notFoundCallback();

        this.stageElement(element);
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

    notFoundCallback()
    {
        var defaultElement = document.createElement('div');
        defaultElement.innerHTML = 'Nothing found';

        return defaultElement;
    }
}

export default TabPanel;
