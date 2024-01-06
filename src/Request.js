
class Request 
{
    /**
     * @param {string} path 
     * @param {Object} queryParams 
     * @param {Object} attributes 
     */
    constructor(path, queryParams, attributes = {}) 
    {
        this.path        = path;
        this.queryParams = typeof queryParams == 'string' ? new URLSearchParams(queryParams) : queryParams;
        this.attributes  = attributes;
    }

    /**
     * @param {Object} attributes 
     */
    setAttributes(attributes) 
    {
        this.attributes = attributes;
    }

    /**
     * 
     * @param {string} attrName
     * @param {mix} defaultValue 
     *
     * @return {string|null}
     */
    getAttribute(attrName, defaultValue = null) 
    {
        return this.attributes[attrName] || defaultValue;
    }

    /**
     * Creates a Request based on an anchor's href.
     *
     * @param {HTMLAnchorElement} a
     *
     * @return {Request|null} 
     */
    static createFromAnchor(a) 
    {
        var href = a.getAttribute('href');
        return Request.createFromHref(href);
    }

    /**
     * Creates a Request based on a href.
     *
     * @param {string} href
     *
     * @return {Request|null} 
     */
    static createFromHref(href) 
    {
        var url = new URL(href, 'https://' + window.location.host);

        if (!url.hash) {
            return null;
        }

        var local = new URL(url.hash.replace('#', '/'), 'https://' + window.location.host);

        if (url.host != window.location.host) {
            return null;
        }

        var request = new Request(local.pathname, local.searchParams);
        return request;
    }
}

export default Request;