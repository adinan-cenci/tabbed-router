import Route from './Route';
import HashRequest from './HashRequest';

class RouteCollection 
{
    constructor() 
    {
        this.routes = [];
    }

    /**
     * @param {Route} route
     * @param {HashRequest} request
     * 
     * @return {HTMLElement}
     */
    call(route, request) 
    {
        return route.callIt(request);
    }

    /**
     * Returns the first route that matches the request.
     *
     * @param {HashRequest} request
     *   The request.
     * 
     * @return {Route|null}
     *   The matching route, null if none matches.
     */
    getMatchingRoute(request) 
    {
        for (var route of this.routes) {
            if (route.doesItMatchTheRequest(request)) {
                return route;
            }
        }

        return null;
    }

    /**
     * Adds a new route to the collection.
     *
     * @param {Route} route
     *   The route to be added.
     * 
     * @return {RouteCollection}
     *   Returns Itself to allow for method chaining.
     */
    addRoute(route) 
    {
        this.routes.push(route);
        return this;
    }

    /**
     * Creates a new route and imediately adds it.
     *
     * @param {RegExp|Array} pattern 
     *   Regex expression(s) to match against a request's path.
     * @param {callable} callback
     *   Either the name of an HTML tag or a function that returns an HTML
     *   element.
     * 
     * @return {RouteCollection}
     *   Returns Itself to allow for method chaining.
     */
    createRoute(pattern, callback) 
    {
        return this.addRoute(new Route(pattern, callback));
    }
}

export default RouteCollection;
