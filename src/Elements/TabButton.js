class TabButton extends HTMLElement 
{
    constructor() 
    {
        super();

        /**
         * @var {Object}
         *   Relational object to track dom elements.
         */
        this.$refs = {};

        /**
         * @var {String}
         *   The text to be displayed.
         */
        this.label = '';

        /**
         * @var {String}
         *   This panel unique id.
         */
        this.tabId = '';

        /**
         * @var {Bool}
         *   Indicates if the tab has been rendered already.
         */
        this.rendered = false;
    }

    /**
     * Sets the panel unique id.
     *
     * @param {String} tabId
     *   Id.
     *
     * @return {TabButton}
     *   Returns itself.
     */
    setLabel(label) 
    {
        this.label = label;
        if (this.rendered) {
            this.$refs.label.innerHTML = label;
        }

        return this;
    }

    /**
     * Focus.
     *
     * @return {TabButton}
     */
    focus()
    {
        this.classList.add('tabbed-router__tab-button--focused');
        return this;
    }

    /**
     * Unfocus.
     *
     * @return {TabButton}
     */
    unfocus()
    {
        this.classList.remove('tabbed-router__tab-button--focused');
        return this;
    }

    /**
     * Sets the panel unique id.
     *
     * @param {string} tabId
     *   Id.
     *
     * @return {TabButton}
     *   Returns itself.
     */
    setTabId(tabId) 
    {
        this.tabId = tabId;
        return this;
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
        this.classList.add('tabbed-router__tab-button');

        this.$refs.label = document.createElement('span');
        this.$refs.label.innerHTML = this.label;
        this.append(this.$refs.label);

        this.$refs.closeBtn = document.createElement('button');
        this.$refs.closeBtn.setAttribute('title', 'close tab');
        this.append(this.$refs.closeBtn);

        this.addEventListener('click', this.onClick.bind(this));
        this.$refs.closeBtn.addEventListener('click', this.onCloseBtnClicked.bind(this));
    }

    /**
     * Event listener.
     *
     * @private
     */
    onClick() 
    {
        var options = {
            bubbles: true,
            detail: this.tabId
        };

        var event = new CustomEvent('tabbed-router:request-focus', options);
        this.dispatchEvent(event);
    }

    /**
     * Event listener.
     *
     * @private
     */
    onCloseBtnClicked(evt) 
    {
        evt.stopPropagation();
        evt.preventDefault();

        var options = {
            bubbles: true,
            detail: this.tabId
        };

        var event = new CustomEvent('tabbed-router:request-closing', options);
        this.dispatchEvent(event);
    }
}

export default TabButton;
