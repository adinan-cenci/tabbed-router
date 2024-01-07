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

    connectedCallback() 
    {
        if (!this.rendered) {
            this.render();
        }
    }

    render() 
    {
        this.rendered = true;
        this.classList.add('tab-link');

        this.$refs.label = document.createElement('span');
        this.$refs.label.innerHTML = this.label;
        this.append(this.$refs.label);

        this.$refs.closeBtn = document.createElement('button');
        this.$refs.closeBtn.setAttribute('title', 'close tab');
        this.append(this.$refs.closeBtn);

        this.addEventListener('click', this.onclick.bind(this));
        this.$refs.closeBtn.addEventListener('click', this.onCloseBtnClick.bind(this));
    }

    onclick() 
    {
        var event = new CustomEvent('tab-link:clicked', {});
        this.dispatchEvent(event);
    }

    onCloseBtnClick(evt) 
    {
        evt.stopPropagation();
        evt.preventDefault();

        var options = {
            bubbles: true,
            detail: this.tabId
        };

        var event = new CustomEvent('tab-request:closing', options);
        this.dispatchEvent(event);
    }

    setLabel(label) 
    {
        this.label = label;
        if (this.rendered) {
            this.$refs.label.innerHTML = label;
        }
    }

    setTabId(tabId) 
    {
        this.tabId = tabId;
    }
}

export default TabLink;
