import RouteCollection from './src/Routing/RouteCollection';
import HashRequest from './src/Routing/HashRequest';
import TabManager from './src/Elements/TabManager';
import TabPanel from './src/Elements/TabPanel';
import TabLink from './src/Elements/TabLink';

customElements.define('tab-manager', TabManager);
customElements.define('tab-panel', TabPanel);
customElements.define('tab-link', TabLink);

//--------------------------------

class TestFirst extends HTMLElement 
{
    connectedCallback() 
    {
        var n      = parseInt(this.request.getAttribute('number', 1));
        var phrase = this.request.queryParams.get('phrase') || '';

        var b = n - 1;
        var f = n + 1;

        this.innerHTML = `<ul>
            <li>number: ${n}</li>
            <li>phrase: ${phrase}</li>
        </ul>

        <hr>

        <ul>
            <li>
                open in the same tab: 
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="#test-counting:${b}" title="decrement"> << </a> 
                &nbsp;&nbsp;&nbsp;&nbsp; 
                <a href="#test-counting:${f}" title="increment"> >> </a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                ( press ctrl + LMB to open in a new tab )
            </li>
            <li>
                open in new tab: 
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="#test-counting:${b}" title="decrement ( new tab )" target="_blank"> << </a> 
                &nbsp;&nbsp;&nbsp;&nbsp; 
                <a href="#test-counting:${f}" title="increment ( new tab )" target="_blank"> >> </a>
            </li>
            <li><a href="#link-to-nowhere">broken link</a></li>
            <li><a href="#actualThing">link to an actual element</a></li>
            <li><a href="https://duckduckgo.com">regular links</a> remain unafected</li>
        </ul>

        <hr>

        <fieldset>
            <legend>forms work as well</legend>
            <form action="#test-counting:${n}" title="Form">
                <input type="text" name="phrase" placeholder="type phrase here" /> <br/>
                <input type="submit" value="submit" />
            </form>
        </fieldset>`;
    }

}
customElements.define('test-first', TestFirst);

//--------------------------------

document.addEventListener('DOMContentLoaded', () =>
{
    const routeCollection = new RouteCollection();
    routeCollection.createRoute(/test-counting:(?<number>.+)/, 'test-first');

    const tabManager = new TabManager();
    tabManager.setRouteCollection(routeCollection);

    const mainTab = tabManager.createTab('main-tab', 'Main tab', true);

    window.routeCollection = routeCollection;
    window.tabManager = tabManager;
    document.body.append(tabManager);

    const request = HashRequest.createFromHash('#test-counting:1');
    request.meta.title = 'Main tab';
    mainTab.goTo(request);

    //--------------------------------------

    var outside = document.createElement('a');
    outside.setAttribute('href', '#test-counting:1000');
    outside.setAttribute('title', 'from the outside');
    outside.innerHTML = 'this link';
    document.body.append(outside);

    outside = document.createElement('span');
    outside.innerHTML = ' from outside of the tabbed manager still works.';
    document.body.append(outside);

    //--------------------------------------

    var actualThing = document.createElement('div');
    actualThing.innerHTML = 'actual element';
    actualThing.setAttribute('id', 'actualThing');
    document.body.append(actualThing);

});

