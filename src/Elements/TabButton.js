/**
 * Represents a tab in the tab bar.
 *
 * @class
 */
class TabButton extends HTMLElement 
{
    constructor() 
    {
        super();

        /**
         * @protected
         *
         * @var {Object}
         *   Relational object to track dom elements.
         */
        this.$refs = {};

        /**
         * @protected
         *
         * @var {String}
         *   Human-readable text to be displayed in the button.
         */
        this.label = '';

        /**
         * @protected
         *
         * @var {String}
         *   This panel unique id.
         */
        this.tabId = '';

        /**
         * @protected
         *
         * @var {Bool}
         *   Indicates if the tab has been rendered already.
         */
        this.rendered = false;
    }

    /**
     * Sets the panel lable.
     *
     * @param {String} label
     *   Human readable label.
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
     * Focus the tab.
     *
     * Visualy.
     *
     * @return {TabButton}
     */
    focus()
    {
        this.classList.add('tabbed-router__tab-button--focused');
        return this;
    }

    /**
     * Unfocus the tab.
     *
     * Visualy.
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
     * @protected
     */
    connectedCallback() 
    {
        if (this.rendered) {
            return;
        }

        this.render();
        this.rendered = true;
    }

    /**
     * Builds up the element and set up event listeners.
     *
     * @protected
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
     * Called when the tab is clicked.
     *
     * @protected
     *
     * @param {PointerEvent}
     *   The click event.
     */
    onClick(evt) 
    {
        var options = {
            bubbles: true,
            detail: this.tabId
        };

        var event = new CustomEvent('tabbed-router:request-focus-on-tab', options);
        this.dispatchEvent(event);
    }

    /**
     * Event listener.
     *
     * Called when the close button is clicked.
     *
     * @protected
     *
     * @param {PointerEvent}
     *   The click event.
     */
    onCloseBtnClicked(evt) 
    {
        evt.stopPropagation();
        evt.preventDefault();

        var options = {
            bubbles: true,
            detail: this.tabId
        };

        var event = new CustomEvent('tabbed-router:request-closing-of-tab', options);
        this.dispatchEvent(event);
    }
}

export default TabButton;
