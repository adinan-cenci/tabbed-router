import Router from './src/Router';
import CustomRequest from './src/Request';
import TabManager from './src/TabManager';
import TabPanel from './src/TabPanel';

//--------------------------------

class TestFirst extends HTMLElement 
{
    connectedCallback() 
    {
        var n = parseInt(this.request.queryParams.get('n') || 1);

        this.append(this.createP('test: ' + n));

        this.append(this.createP('', [this.createA('<<', '#test-first:123?n=' + (n - 1)), '      ', this.createA('>>', '#test-first:123?n=' + (n + 1))] ));

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

    createA(text = '', href) 
    {
        var a = document.createElement('a');
        a.innerHTML = text;
        a.setAttribute('href', href);
        return a;
    }
}
customElements.define('test-first', TestFirst);

//--------------------------------

customElements.define('tab-manager', TabManager);
customElements.define('tab-panel', TabPanel);

//--------------------------------

document.addEventListener('DOMContentLoaded', () =>
{
    const router = new Router();
    router.createRoute(/test-first:(?<foobar>.+)/, 'test-first');

    const tabManager = new TabManager();
    tabManager.setRouter(router);

    const mainTab = new TabPanel();
    tabManager.setTab('main-tab', mainTab);

    const secondaryTab = new TabPanel();
    tabManager.setTab('secondary-tab', secondaryTab);

    tabManager.focusTab('main-tab');

    window.router = router;
    window.tabManager = tabManager;
    document.body.append(tabManager);

    const request = new CustomRequest('test-first:123', '');
    mainTab.goTo(request);

    var actualThing = document.createElement('div');
    actualThing.setAttribute('id', 'actualThing');
    document.body.append(actualThing);

    var outside = document.createElement('a');
    outside.setAttribute('href', '#test-first:123?n=1000');
    outside.innerHTML = 'outside';

    document.body.append(outside);
});

