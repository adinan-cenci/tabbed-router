class TabControls extends HTMLElement 
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
        this.$refs = {};

        /**
         * @private
         *
         * @var {Bool}
         *   Indicates if the panel has been rendered already.
         */
        this.rendered = false;
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

        this.parentNode.parentNode.addEventListener('tabbed-router:tab-focused', this.onTabFocused.bind(this));
        this.parentNode.parentNode.addEventListener('tabbed-router:tab-updated', this.onTabUpdated.bind(this));
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
        this.onTabFocused(evt);
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
        var tab = evt.detail.tab;

        tab.canGoForwards()
            ? this.$refs.forwardButton.removeAttribute('disabled')
            : this.$refs.forwardButton.setAttribute('disabled', 'disabled');

        tab.canGoBackwards()
            ? this.$refs.backwardButton.removeAttribute('disabled')
            : this.$refs.backwardButton.setAttribute('disabled', 'disabled');
    }
}

export default TabControls;
