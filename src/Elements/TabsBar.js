import TabButton from './TabButton';

/**
 * @class
 *
 * A bar to group multiple tab buttons together.
 */
class TabsBar extends HTMLElement 
{
    /**
     * Constructor.
     */
    constructor()
    {
        super();

        /**
         * @protected
         *
         * @var {Int}
         *   The number of buttons.
         */
        this.buttonCount = 0;

        /**
         * @protected
         *
         * @var {Object}
         *   Relational object to track DOM elements.
         */
        this.$refs = {
            buttons: {}
        };

        /**
         * @protected
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered        = false;
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
        this.classList.add('tabbed-router__tab-manager__tabs-bar');
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-updated', this.onTabPanelUpdated.bind(this));
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-focused', this.onTabPanelFocused.bind(this));  
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-closed',  this.onTabPanelClosed.bind(this));
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-reordered',   this.onTabPanelReordered.bind(this));

        this.addEventListener('dragstart', this.onDragStart.bind(this));
        this.addEventListener('dragstop', this.onDragStop.bind(this));
        this.addEventListener('dragover', this.onDragOver.bind(this));
        this.addEventListener('drop', this.onDragDrop.bind(this));
    }

    /**
     * Creates and adds a new tab button.
     *
     * @protected
     *
     * @param {String} tabId
     *   The tab id.
     * @param {String} label
     *   Human-readable text to be displayed in the button.
     *
     * @return {TabButton}
     *   The newly created button.
     */
    addNewTabButton(tabId, label = 'new tab')
    {
        var button = this.createNewTabButton(tabId, label);
        this.addTabButton(button);

        return button;
    }

    /**
     * Adds a tab button to the bar.
     *
     * @param {TabButton} button
     *   The button to add.
     */
    addTabButton(button)
    {
        this.append(button);
        this.$refs.buttons[button.tabId] = button;
        this.buttonCount++;
    }

    /**
     * Creates a new button.
     *
     * @protected
     *
     * @param {String} tabId
     *   The tab id.
     * @param {String} label
     *   Human-readable text to be displayed in the button.
     *
     * @return {TabButton}
     *   The newly created button.
     */
    createNewTabButton(tabId, label = 'new tab')
    {
        var button = new TabButton();
        button.setTabId(tabId);
        button.setLabel(label);
        button.setAttribute('draggable', 'true');

        return button;
    }

    /**
     * Returns the button with the matching id.
     *
     * @protected
     *
     * @param {String} tabId
     *   The tab id.
     *
     * @returns {TabButton|null}
     *   The matching button.
     */
    getTabButton(tabId)
    {
        return this.$refs.buttons[tabId] || null;
    }

    /**
     * Return all the buttons.
     *
     * @protected
     *
     * @returns {Array}
     *   The buttons in the bar.
     */
    getTabButtons()
    {
        return Object.values(this.$refs.buttons);
    }

    /**
     * Focus the specified tab button.
     *
     * @protected
     *
     * @param {String} tabId 
     *   The tab id.
     *
     * @returns {TabButton|null}
     *   The focused button.
     */
    focusTabButton(tabId)
    {
        var button = this.getTabButton(tabId);
        if (!button) {
            throw `Tab ${tabId} not found`;
        }

        for (var tb of this.getTabButtons()) {
            tb.tabId == tabId
                ? tb.focus()
                : tb.unfocus();
        }

        return button;
    }

    /**
     * Event listener.
     *
     * @protected
     *
     * @param {Event} evt
     */
    onTabPanelFocused(evt)
    {
        var tabId = evt.detail.tab.tabId;
        this.focusTabButton(tabId);
    }

    /**
     * Event listener.
     *
     * Reacts at panels being closed and removes the respective tab button.
     *
     * @protected
     *
     * @param {Event} evt
     *   The tab close event.
     */
    onTabPanelClosed(evt)
    {
        var tabId = evt.detail.tab.tabId;
        this.$refs.buttons[tabId].remove();
        delete this.$refs.buttons[tabId];
        this.buttonCount--;
    }

    /**
     * Event listener.
     *
     * Reacts at panels being updated and reflect the changes on the respective 
     * tab button.
     *
     * @protected
     *
     * @param {Event} evt
     *   The panel update event.
     */
    onTabPanelUpdated(evt)
    {
        var tab, tabId, button;

        tab   = evt.detail.tab;
        tabId = tab.tabId;

        if (button = this.getTabButton(tabId)) {
            button.setLabel(tab.getTitle());
        } else {
            button = this.addNewTabButton(tabId, tab.getTitle());
        }

        if (this.buttonCount == 1) {
            this.focusTabButton(tabId);
        }
    }

    /**
     * Event listener.
     *
     * Reacts to the start of elements being dragged.
     *
     * @protected
     *
     * @param {Event} evt
     *   Drag start event.
     */
    onDragStart(evt)
    {
        if (evt.target.constructor.name == TabButton.name) {
            this.dragged = evt.target;
        }
    }

    /**
     * Event listener.
     *
     * Reacts to the stop of elements being dragged.
     *
     * @protected
     *
     * @param {Event} evt
     *   Drag stop event.
     */
    onDragStop(evt)
    {
        this.dragged = null;
    }

    /**
     * Event listener.
     *
     * Reacts to elements being dropped over it.
     *
     * @protected
     *
     * @param {Event} evt
     *   Drag event.
     */
    onDragOver(evt)
    {
        // Prevent default to allow the drop event to fire.
        evt.preventDefault();
    }

    /**
     * Event listener.
     *
     * Reacts to elements being dropped on it.
     *
     * @protected
     *
     * @param {Event} evt
     *   Drop event.
     */
    onDragDrop(evt)
    {
        var droppedOn = evt.target;
        if (droppedOn.constructor.name != TabButton.name) {
            droppedOn = droppedOn.closest((new TabButton).tagName);
        }

        if (!this.dragged || !droppedOn) {
            return;
        }

        if (this.dragged.index() == droppedOn.index()) {
            return;
        }

        var options = {
            bubbles: true,
            detail: {
                tabId: this.dragged.tabId,
                from: this.dragged.index(),
                to: droppedOn.index()
            }
        }

        var event = new CustomEvent('tabbed-router:request-reorder-tab', options);
        this.dispatchEvent(event);
    }

    onTabPanelReordered(evt)
    {
        const { tabId, from, to } = evt.detail;
        const tabButton = this.getTabButton(tabId);
        const child = this.children[to];

        from > to
            ? child.before(tabButton)
            : child.after(tabButton);
    }
}

export default TabsBar;
