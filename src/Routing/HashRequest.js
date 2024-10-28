/**
 * Hash requests 
 */
class HashRequest 
{
    /**
     * @param {string} path
     *   Path of an URL.
     * @param {string|URLSearchParams} queryParams
     *   Query parameters.
     * @param {Object} attributes 
     *   Regex capture matches.
     * @param {Object} meta
     */
    constructor(path, queryParams, attributes = {}, meta = {}) 
    {
        this.path        = path;
        this.queryParams = typeof queryParams == 'string' 
            ? new URLSearchParams(queryParams) 
            : queryParams;
        this.attributes  = attributes;
        this.meta        = meta;
    }

    /**
     * @param {Object} attributes 
     *
     * @return {HashRequest}
     */
    setAttributes(attributes) 
    {
        this.attributes = attributes;
        return this;
    }

    /**
     * @param {string} attrName 
     * @param {mixed} value 
     */
    setAttribute(attrName, value) 
    {
        this.attributes[attrName] = value;
        return this;
    }

    /**
     * Returns the specified attribute.
     *
     * @param {string} attrName
     *   The attribute name.
     * @param {mix} defaultValue 
     *   Default value in case attrName is unset.
     *
     * @return {string|null}
     *   The value of the attribute.
     */
    getAttribute(attrName, defaultValue = null) 
    {
        return this.attributes[attrName] || defaultValue;
    }

    /**
     * Not all hashes are intended for routing.
     * 
     * @return {bool}
     */
    matchesHtmlElement() 
    {
        var selector = this.path.replace(/^\//, '#');

        var selected = false;

        try {
            selected = document.querySelector(selector);
        } catch {
            selected = false;
        }

        return selected 
            ? true
            : false;
    }

    /**
     * Creates a HashRequest based on an anchor's href.
     *
     * @param {HTMLAnchorElement} a
     *
     * @return {HashRequest|null} 
     */
    static createFromAnchor(a) 
    {
        var href  = a.getAttribute('href');
        var title = a.getAttribute('title') || null;
        
        var request = HashRequest.createFromUrl(href);

        if (!request) {
            return null;
        }

        request.meta.title = title;

        return request;
    }

    /**
     * Creates a HashRequest based on a form's action and input elements.
     *
     * @param {HTMLFormElement} form
     *
     * @return {HashRequest|null} 
     */
    static createFromForm(form) 
    {
        var action = form.getAttribute('action');
        var title  = form.getAttribute('title') || null;

        var request = HashRequest.createFromUrl(action);

        if (!request) {
            return null;
        }

        request.meta.title = title;

        var formData = new FormData(form);
        var submitedData = new URLSearchParams(formData);

        HashRequest.mergeUrlSearchParams(request.queryParams, submitedData);

        return request;
    }

    static mergeUrlSearchParams(original, additions) 
    {
        for (let [key, val] of additions.entries()) {
            key.indexOf('[]') >= 0 && original.has(key)
                ? original.append(key, val)
                : original.set(key, val);
        }
    }

    /**
     * Creates a HashRequest based on a href.
     *
     * @param {string} urlString
     *
     * @return {HashRequest|null} 
     */
    static createFromUrl(urlString) 
    {
        var url = new URL(urlString, 'https://' + window.location.host);

        return url.hash
            ? HashRequest.createFromHash(url.hash, url.host)
            : null;
    }

    /**
     * Creates a HashRequest based on an url hash.
     *
     * @param {string} hashString
     *
     * @return {HashRequest|null} 
     */
    static createFromHash(hashString, host = window.location.host) 
    {
        var path = hashString.replace(/^#\/?/, '/');

        var local = new URL(path, 'https://' + window.location.host);

        if (host != window.location.host) {
            return null;
        }

        var request = new HashRequest(local.pathname, local.searchParams);
        return request;
    }
}

export default HashRequest;