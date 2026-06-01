/**
 * Hash requests are created out of an URL's hash.
 */
class HashRequest 
{
    /**
     * Constructor.
     *
     * @param {string} path
     *   Path part of the hash.
     * @param {string|URLSearchParams} queryParams
     *   Query parameters.
     * @param {Object} attributes 
     *   Regex capture matches.
     * @param {Object} meta
     *   Adjacent data.
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
     * Sets atrributes ( capture groups taken from the path ).
     *
     * @param {Object} attributes 
     *   The attributes.
     *
     * @return {HashRequest}
     *   Returns itself.
     */
    setAttributes(attributes) 
    {
        this.attributes = attributes;
        return this;
    }

    /**
     * Sets a single attribute.
     *
     * @param {String} attrName
     *   The name of the attribute.
     * @param {mixed} value
     *   The value of the attribute.
     *
     * @return {HashRequest}
     *   Returns itself.
     */
    setAttribute(attrName, value) 
    {
        this.attributes[attrName] = value;
        return this;
    }

    /**
     * Returns the specified attribute.
     *
     * @param {String} attrName
     *   The attribute name.
     * @param {mix} defaultValue 
     *   Default value in case attrName is unset.
     *
     * @return {String|null}
     *   The value of the attribute.
     */
    getAttribute(attrName, defaultValue = null) 
    {
        return this.attributes[attrName] || defaultValue;
    }

    /**
     * Checks if the path ( hash ) mathes the id of a dom element.
     *
     * Not all hashes are intended for routing.
     * 
     * @return {Bool}
     *   If it matches or not.
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
     * Creates a HashRequest off of an anchor element.
     *
     * Based on the anchor's href attribute.
     *
     * @param {HTMLAnchorElement} anchor
     *   Anchor element.
     *
     * @return {HashRequest|null}
     *   The generated request.
     */
    static createFromAnchor(anchor) 
    {
        var href  = anchor.getAttribute('href');
        var title = anchor.getAttribute('data-tabbed-router-title') || anchor.getAttribute('title') || null;
        
        var request = HashRequest.createFromUrl(href);

        if (!request) {
            return null;
        }

        request.meta.title = title;

        return request;
    }

    /**
     * Creates a HashRequest off of a form element.
     *
     * Based on the form's action and input elements.
     *
     * @param {HTMLFormElement} form
     *   The form element.
     *
     * @return {HashRequest|null} 
     *   The generated request.
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
     * Creates a HashRequest off of an URL.
     *
     * Based on the URL's hash.
     *
     * @param {string} urlString
     *   URL string.
     * @return {HashRequest|null}
     *   Hash request.
     */
    static createFromUrl(urlString) 
    {
        var url = new URL(urlString, 'https://' + window.location.host);

        return url.hash
            ? HashRequest.createFromHash(url.hash, url.host)
            : null;
    }

    /**
     * Creates a HashRequest based off of a URL's hash.
     *
     * @param {string} hashString
     *   Hash part of a URL.
     * @return {HashRequest|null}
     *   Hash request.
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