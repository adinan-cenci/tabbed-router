import TabButton from './TabButton';

class TabsBar extends HTMLElement 
{
    constructor() 
    {
        super();

        /**
         * @private
         *
         * @var {Int}
         *   The number of buttons.
         */
        this.buttonCount = 0;

        /**
         * @private
         *
         * @var {Object}
         *   Relational object to track dom elements.
         */
        this.$refs = {
            buttons: {}
        };

        /**
         * @private
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered        = false;
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
        this.classList.add('tabbed-router__tab-manager__tabs-bar');
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-updated', this.onTabUpdated.bind(this));
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-focused', this.onTabFocused.bind(this));  
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-closed',  this.onTabClosed.bind(this));
    }

    /**
     * Creates a new button.
     *
     * @private
     *
     * @param {String} tabId
     *   The tab id.
     * @param {String} label
     *   Text to be displayed in the button.
     *
     * @return {TabButton}
     *   The newly created button.
     */
    createButton(tabId, label = 'new tab')
    {
        var button = new TabButton();
        button.setTabId(tabId);
        button.setLabel(label);
        this.append(button);

        this.$refs.buttons[tabId] = button;
        this.buttonCount++;

        return button;
    }

    /**
     * Returns the button with the matching id.
     *
     * @private
     *
     * @param {String} tabId
     *   The tab id.
     *
     * @returns {TabButton|null}
     *   The matching button.
     */
    getButton(tabId)
    {
        return this.$refs.buttons[tabId] || null;
    }

    /**
     * Return all the buttons.
     *
     * @private
     *
     * @returns {Array}
     */
    getButtons()
    {
        return Object.values(this.$refs.buttons);
    }

    /**
     * Focus the specified button.
     *
     * @private
     *
     * @param {String} tabId 
     *   The tab id.
     *
     * @returns {TabButton|null}
     *   The focused button.
     */
    focusButton(tabId)
    {
        var button = this.getButton(tabId);
        if (!button) {
            throw `Tab ${tabId} not found`;
        }

        for (var tb of this.getButtons()) {
            tb.tabId == tabId
                ? tb.focus()
                : tb.unfocus();
        }

        return button;
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onTabFocused(evt)
    {
        var tabId = evt.detail.tab.tabId;
        this.focusButton(tabId);
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onTabClosed(evt)
    {
        var tabId = evt.detail.tab.tabId;
        this.$refs.buttons[tabId].remove();
        delete this.$refs.buttons[tabId];
        this.buttonCount--;
    }

    /**
     * Event listener.
     *
     * @private
     *
     * @param {Event} evt
     */
    onTabUpdated(evt)
    {
        var tab, tabId, button;

        tab   = evt.detail.tab;
        tabId = tab.tabId;

        if (button = this.getButton(tabId)) {
            button.setLabel(tab.getTitle());
        } else {
            button = this.createButton(tabId, tab.getTitle());
        }

        if (this.buttonCount == 1) {
            this.focusButton(tabId);
        }
    }
}

export default TabsBar;
