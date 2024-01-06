import Request from './Request';

class TabManager extends HTMLElement 
{
    constructor() 
    {
        super();

        this.$refs = {};
        this.links = {};
        this.tabs  = {};

        this.rendered = false;

        this.currentTabId = null;
    }

    setRouter(router) 
    {
        this.router = router;
    }

    connectedCallback() 
    {
        if (!this.rendered) {
            this.render();
        }
    }

    render() 
    {
        this.rendered = true;
        this.classList.add('tab-manager');

        this.$refs.header = document.createElement('div');
        this.$refs.header.classList.add('tab-manager--header');
        this.append(this.$refs.header);

        this.$refs.controls = document.createElement('div');
        this.$refs.controls.classList.add('tab-manager--controls');
        this.$refs.header.append(this.$refs.controls);

        this.$refs.backwardButton = document.createElement('button');
        this.$refs.controls.append(this.$refs.backwardButton);
        this.$refs.backwardButton.innerHTML = 'B';

        this.$refs.forwardButton  = document.createElement('button');
        this.$refs.forwardButton.innerHTML = 'F';
        this.$refs.controls.append(this.$refs.forwardButton);

        this.$refs.backwardButton.addEventListener('click', this.backwards.bind(this));
        this.$refs.forwardButton.addEventListener('click', this.forwards.bind(this));

        this.$refs.tabLinks = document.createElement('div');
        this.$refs.tabLinks.classList.add('tab-manager--tab-links');
        this.$refs.header.append(this.$refs.tabLinks);

        this.$refs.tabPanes = document.createElement('div');
        this.$refs.tabPanes.classList.add('tab-manager--tab-panes');
        this.append(this.$refs.tabPanes);

        for (var tabId in this.tabs) {
            this.attachTab(tabId);
        }

        document.addEventListener('click', this.onClick.bind(this));
    }

    onClick(evt) 
    {
        if (evt.tabAvaliated) {
            return;
        }

        if (evt.target.tagName != 'A') {
            return;
        }

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

        this.tabs[this.currentTabId].goTo(request);
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

    /**
     * Attatches a tab.
     *
     * @param {string} tabId 
     * @param {TabPanel} tabPanel 
     */
    setTab(tabId, tabPanel) 
    {
        if (this.tabs[tabId]) {
            throw `Tab {tabId} is already set`;
        }

        tabPanel.setRouter(this.router);

        var button = this.createTabButton(tabId, tabId);

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

        if (this.rendered) {
            this.detachTab(tabId);
        }

        tabPanel = this.tabs[tabId];
        this.tabs[tabId] = null;

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
    }

    /**
     * @private
     *
     * @param {string} tabId 
     */
    detachTab(tabId) 
    {
        this.links[tabId].remove();
        this.links[tabId] = null;
        this.tabs[tabId].remove();
    }

    /**
     * @private
     *
     * @param {string} tabId
     * @param {string} title 
     */
    createTabButton(tabId, title) 
    {
        var button = document.createElement('button');
        button.setAttribute('data-id', tabId);
        button.innerHTML = title;

        button.addEventListener('click', (evt) => 
        {
            this.focusTab( evt.target.getAttribute('data-id') );
        });

        return button;
    }
}

export default TabManager;
