import RouteCollection from './src/RouteCollection';
import CustomRequest from './src/Request';
import TabManager from './src/TabManager';
import TabPanel from './src/TabPanel';
import TabLink from './src/TabLink';


//--------------------------------

class TestFirst extends HTMLElement 
{
    connectedCallback() 
    {
        var n = parseInt(this.request.queryParams.get('n') || 1);

        this.append(this.createP('test: ' + n));

        this.append(this.createP('', [this.createA('<<', '#test-first:123?n=' + (n - 1), 'decrement'), '      ', this.createA('>>', '#test-first:123?n=' + (n + 1), 'increment')] ));

        this.append(this.createP('', this.createA('open in new tab', '#test-first:123?n=69', 'new tab', '_blank')));

        this.append(this.createP('', this.createA('broken link', '#broken')));

        this.append(this.createP('', this.createA('actual thing', '#actualThing')));

        this.append(this.createP('', this.createA('regular link', 'https://google.com')));
    }

    createP(text = '', child = null) 
    {
        child = Array.isArray(child) ? child : [child];

        var p = document.createElement('p');
        p.innerHTML = text;
        
        for (var c of child) {
            if (c) {
                p.append(c);
            }
        }

        return p;
    }

    createA(text = '', href, title = '', target = '_self') 
    {
        var a = document.createElement('a');
        a.innerHTML = text;
        a.setAttribute('title', title);
        a.setAttribute('href', href);
        a.setAttribute('target', target);
        return a;
    }
}
customElements.define('test-first', TestFirst);

//--------------------------------

customElements.define('tab-manager', TabManager);
customElements.define('tab-panel', TabPanel);
customElements.define('tab-link', TabLink);

//--------------------------------

document.addEventListener('DOMContentLoaded', () =>
{
    const routeCollection = new RouteCollection();
    routeCollection.createRoute(/test-first:(?<foobar>.+)/, 'test-first');

    const tabManager = new TabManager();
    tabManager.setRouteCollection(routeCollection);

    const mainTab = tabManager.createTab('main-tab', true);
    tabManager.createTab('secondary-tab', false);

    window.routeCollection = routeCollection;
    window.tabManager = tabManager;
    document.body.append(tabManager);

    const request = new CustomRequest('test-first:123', '');
    mainTab.goTo(request);

    var actualThing = document.createElement('div');
    actualThing.setAttribute('id', 'actualThing');
    document.body.append(actualThing);

    var outside = document.createElement('a');
    outside.setAttribute('href', '#test-first:123?n=1000');
    outside.setAttribute('title', 'from the outside');
    outside.innerHTML = 'outside';

    document.body.append(outside);
});

