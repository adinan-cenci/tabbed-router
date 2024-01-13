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
     * @param {HashRequest} request 
     * 
     * @return {Route|null}
     */
    getMatchingRoute(request) 
    {
        for (var route of this.routes) {
            if (route.doesItMatcheRequest(request)) {
                return route;
            }
        }

        return null;
    }

    /**
     * Adds a new route to the collection.
     *
     * @param {Route} route
     * 
     * @return {RouteCollection}
     */
    addRoute(route) 
    {
        this.routes.push(route);
        return this;
    }

    /**
     * Creates and adds a new route.
     *
     * @param {RegExp} pattern 
     * @param {callable} callback
     * 
     * @return {RouteCollection}
     */
    createRoute(pattern, callback) 
    {
        return this.addRoute(new Route(pattern, callback));
    }
}

export default RouteCollection;