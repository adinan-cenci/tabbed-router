import HashRequest from './HashRequest';

class Route 
{
    /**
     * @param {RegExp|Array} pattern
     *   Regex expression(s) to match against a request's path.
     * @param {callable|String} callback
     *   Either the name of an HTML tag or a function that returns an HTML
     *   element.
     */
    constructor(patterns, callback) 
    {
        this.patterns = Array.isArray(patterns)
            ? patterns
            : [patterns];

        this.callback = callback;
    }

    /**
     * Calls the route to instantiate the callback element.
     *
     * @param {HashRequest} request
     *   The request.
     * 
     * @return {HTMLElement}
     *   The callback element.
     */
    callIt(request) 
    {
        var pattern    = this.getMatchingPattern(request.path);
        var attributes = this.getAttributesFromPath(request.path, pattern);

        request.setAttributes(attributes);

        return this.instantiateElement(request);
    }

    /**
     * Instantiate an element based out of the request.
     *
     * @param {HashRequest} request 
     *
     * @return {HTMLElement}
     */
    instantiateElement(request) 
    {
        var element;

        if (typeof this.callback == 'string') {

            element = document.createElement(this.callback);
            if (element.setHashRequest) {
                element.setHashRequest(request);
            }

        } else if (typeof this.callback == 'function') {

            element = this.callback.apply(this, [request]);

        }

        element.request = request;

        return element;
    }

    /**
     * Checks weather or not this route matches provided request.
     *
     * @param {HashRequest} request
     *   The request
     *
     * @return {bool}
     *   Returns true if it matches.
     */
    doesItMatchTheRequest(request) 
    {
        return request.path && this.getMatchingPattern(request.path)
            ? true
            : false;
    }

    /**
     * Returns the first pattern that matches the path.
     *
     * @param {String} path
     *
     * @return {RegexExp|null} 
     */
    getMatchingPattern(path) 
    {
        for (var pattern of this.patterns) {
            if (path.match(pattern)) {
                return pattern;
            }
        }

        return null;
    }

    /**
     * Based on the regex pattern, extracts named captures (attributes) from
     * the path.
     *
     * @param {string} path
     *   The path.
     * @param {RegexExp} pattern
     *   Regex expression.
     *
     * @return {Object}
     *   Key => value list of named captures.
     */
    getAttributesFromPath(path, pattern) 
    {
        var matches    = pattern.exec(path);
        var attributes = matches.groups;

        return attributes || {};
    }
}

export default Route;