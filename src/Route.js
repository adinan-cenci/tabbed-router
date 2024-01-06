import Request from './Request';

class Route 
{
    /**
     * @param {RegExp} pattern 
     * @param {callable} callback
     */
    constructor(patterns, callback) 
    {
        this.patterns = Array.isArray(patterns)
            ? patterns
            : [patterns];

        this.callback = callback;
    }

    /**
     * Calls the route to instantiate an element.
     *
     * @param {Request} request 
     * 
     * @return {HTMLElement}
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
     * @param {Request} request 
     *
     * @return {HTMLElement}
     */
    instantiateElement(request) 
    {
        var element;

        if (typeof this.callback == 'string') {

            element = document.createElement(this.callback);

        } else if (typeof this.callback == 'function') {

            element = this.callback.apply(this, [request]);

        }

        element.request = request;

        return element;
    }

    /**
     * Checks weather or not this route matches provided request.
     *
     * @param {Request} request 
     *
     * @return {bool}
     */
    doesItMatcheRequest(request) 
    {
        return this.getMatchingPattern(request.path)
            ? true
            : false;
    }

    /**
     * Returns the patterns that matches the path.
     *
     * @param {string} path
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
     * Extracts attributes in path.
     *
     * Matches the regex pattern agains the path.
     *
     * @param {string} path
     * @param {RegexExp} pattern 
     *
     * @return {Object}
     */
    getAttributesFromPath(path, pattern) 
    {
        var matches    = pattern.exec(path);
        var attributes = matches.groups;

        return attributes || {};
    }
}

export default Route;