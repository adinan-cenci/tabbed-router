/**
 * Controls for the tabs.
 *
 * Mainly the backward and forward buttons for the navigation history.
 */
class TabControls extends HTMLElement 
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
         * @var {Object}
         *   Relational object to track DOM elements.
         */
        this.$refs = {};

        /**
         * @protected
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered = false;
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
        this.classList.add('tabbed-router__tab-manager__controls');
        this.$refs.backwardButton = document.createElement('button');
        this.$refs.backwardButton.title = 'Click to go back';
        this.$refs.backwardButton.classList.add('tabbed-router__tab-manager__backwards-button');
        this.append(this.$refs.backwardButton);

        this.$refs.forwardButton  = document.createElement('button');
        this.$refs.forwardButton.title = 'Click to go forward';
        this.$refs.forwardButton.classList.add('tabbed-router__tab-manager__forwards-button');
        this.append(this.$refs.forwardButton);

        this.$refs.backwardButton.addEventListener('click', () => 
        {
            var event = new CustomEvent('tabbed-router:request-backwards', { bubbles: true });
            this.dispatchEvent(event);
        });

        this.$refs.forwardButton.addEventListener('click', () => 
        {
            var event = new CustomEvent('tabbed-router:request-forwards', { bubbles: true });
            this.dispatchEvent(event);
        });

        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-focused', this.onTabPanelFocused.bind(this));
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-panel-updated', this.onTabPanelUpdated.bind(this));
    }

    /**
     * Event listener.
     *
     * Reacts to the panel being updated.
     *
     * @protected
     *
     * @param {Event} evt
     */
    onTabPanelUpdated(evt)
    {
        var tabPanel = evt.detail.tab;

        if (this.parentNode.parentNode.focusedTabId != tabPanel.tabId) {
            return;
        }

        this.onTabPanelFocused(evt);
    }

    /**
     * Event listener.
     *
     * Reacts to the panel being focused.
     *
     * @protected
     *
     * @param {Event} evt
     */
    onTabPanelFocused(evt)
    {
        var tabPanel = evt.detail.tab;

        tabPanel.canGoForwards()
            ? this.$refs.forwardButton.removeAttribute('disabled')
            : this.$refs.forwardButton.setAttribute('disabled', 'disabled');

        tabPanel.canGoBackwards()
            ? this.$refs.backwardButton.removeAttribute('disabled')
            : this.$refs.backwardButton.setAttribute('disabled', 'disabled');
    }
}

export default TabControls;
