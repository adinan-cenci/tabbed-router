import Route from './Route';
import Request from './Request';

class RouteCollection 
{
    constructor() 
    {
        this.routes = [];
    }

    /**
     * @param {Route} route 
     * @param {Request} request 
     * 
     * @return {HTMLElement}
     */
    call(route, request) 
    {
        return route.callIt(request);
    }

    /**
     * @param {Request} request 
     * 
     * @return {Route}
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