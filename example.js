import RouteCollection from './src/Routing/RouteCollection';
import TabManager      from './src/Elements/TabManager';
import TabPanel        from './src/Elements/TabPanel';
import TabButton       from './src/Elements/TabButton';
import TabsBar         from './src/Elements/TabsBar';
import TabControls     from './src/Elements/TabControls';

customElements.define('tab-manager',  TabManager);
customElements.define('tab-panel',    TabPanel);
customElements.define('tab-button',   TabButton);
customElements.define('tab-bar',      TabsBar);
customElements.define('tab-controls', TabControls);

//-----------------------------------------------------------------------------

class FirstExample extends HTMLElement 
{
    getTitle()
    {
        return 'First example: introduction';
    }

    connectedCallback() 
    {
      this.innerHTML = 
      `<h1>Welcome</h1>
      <p>
          This library allow us to separate content into tabs.
      </p>
      <h2>Features</h2>
      <p>
          <strong>Navigation:</strong> We can navigate to different contents, go backwards and forwards in the navigation history.<br/>
          Click <a href="#second-example">here</a> to go to the next page.
      </p>`;
    }
}
customElements.define('first-example', FirstExample);

//-----------------------------------------------------------------------------

class SecondExample extends HTMLElement 
{
    getTitle()
    {
        var number = parseInt(this.request.getAttribute('number', 1));
        var title = 'Second example: introduction';

        if (number > 1) {
          title += ` ( ${number} )`;
        }
    
        return title;
    }

    connectedCallback() 
    {
        var number = parseInt(this.request.getAttribute('number', 1));

        var html =  
        `<h1>Links</h1>
        <p>
            You have just been introduced to the main feature of this library: the ability of navigating between diferent contents.
        </p>
        <p>
            The library includes a routing system, which we can use to pass parameters.<br/>
            Click <a href="#second-example:${number + 1}">here</a> to see this number incrementing: ${number}.
        </p>
        <h2>New tab</h2>
        <p>
            Add a <code>target="_blank"</code> to <a href="#second-example:${number + 1}" target="_blank">the link</a> or CTRL + click to open it in a new tab.
        </p>`;

        if (number > 1) {
            html = html +   
            `<h2>Navigation history</h2>
            <p>You will also notice that you can use the buttons at the top-right corner to go backwards and forwards.</p>`;
        }

        if (number > 4) {
            html = html +   
            `<p>Now let's check the last example: <a href="#third-example">forms</a>.</p>`;
        }

        this.innerHTML = html;
    }
}
customElements.define('second-example', SecondExample);

//-----------------------------------------------------------------------------

class ThirdExample extends HTMLElement 
{
    getTitle()
    {
        return 'Third example: forms';
    }

    connectedCallback() 
    {
        var html =  
        `<h1>Forms</h1>
        <p>
            Get forms work as well ( not post ).
        </p>
        <form action="#third-example">
            <label>Name:</label> <input type="text" name="name" /><br/>
            <label>Age:</label> <input type="number" name="age" /><br/>
            <input type="submit" value="Submit" />
        </form>`;

        var name = this.request.queryParams.get('name') || '';
        var age = this.request.queryParams.get('age') || '';

        if (name || age) {
            html += '<h2>Form submitted</h2>';
            if (name) {
                html += `Your name: ${name}<br/>`;
            }
            if (age) {
                html += `Your age: ${age}<br/>`;
            }
        }

        this.innerHTML = html;
    }
}
customElements.define('third-example', ThirdExample);

//-----------------------------------------------------------------------------

var routeCollection, tabManager, mainTab;

document.addEventListener('DOMContentLoaded', () =>
{
    routeCollection = new RouteCollection();
    routeCollection.createRoute(/first-example/, 'first-example');
    routeCollection.createRoute([/second-example$/, /second-example:(?<number>.+)/], 'second-example');
    routeCollection.createRoute(/third-example/, 'third-example');

    tabManager = new TabManager();
    tabManager.setRouteCollection(routeCollection);

    mainTab = tabManager.createTab('main-tab', 'Main tab', true);
    document.getElementById('wrapper').prepend(tabManager);

    mainTab.access('#first-example');
});

