class TabLink extends HTMLElement 
{
    constructor() 
    {
        super();
        this.$refs = {};

        this.label = '';
        this.tabId = '';
        this.rendered = false;
    }

    /**
     * @param {string} label 
     *
     * @return TabLink
     */
    setLabel(label) 
    {
        this.label = label;
        if (this.rendered) {
            this.$refs.label.innerHTML = label;
        }
    }

    /**
     * @param {string} tabId 
     *
     * @return TabLink
     */
    setTabId(tabId) 
    {
        this.tabId = tabId;
        return this;
    }

    connectedCallback() 
    {
        if (!this.rendered) {
            this.render();
        }
    }

    /**
     * @private
     */
    render() 
    {
        this.rendered = true;
        this.classList.add('tabbed-router__tab-link');

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
        var event = new CustomEvent('tabbed-router:tab-link:clicked', {});
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

        var event = new CustomEvent('tabbed-router:tab-link:request-closing', options);
        this.dispatchEvent(event);
    }
}

export default TabLink;
