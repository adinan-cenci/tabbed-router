# Tabbed router
A little tabbed router I made for my own use.

```js
// Import.
import   TabManager        from 'tabbed-router';
import { TabPanel }        from 'tabbed-router';
import { TabButton }       from 'tabbed-router';
import { TabsBar }         from 'tabbed-router';
import { TabControls }     from 'tabbed-router';
import { RouteCollection } from 'tabbed-router';

// And define the elements.
customElements.define('tab-manager',  TabManager);
customElements.define('tab-panel',    TabPanel);
customElements.define('tab-link',     TabButton);
customElements.define('tab-links',    TabsBar);
customElements.define('tab-controls', TabControls);

// And whatever other customelement you may want to use.
import   MyCustomElement   from './MyCustomElement';
customElements.define('my-custom-element', MyCustomElement);

//--------------------------------

// Adds the routes.
const routeCollection = new RouteCollection();
routeCollection.createRoute(/my-custom-route:(?<id>.+)/, 'my-custom-element');

// Set the route collection.
const tabManager      = new TabManager();
tabManager.setRouteCollection(routeCollection);

// Append.
var tab = tabManager.createTab('main-tab', 'Main tab');
document.body.append(tabManager);

```

```html
<a href="#my-custom-route:123" title="foo bar">foo bar</a>
```

See a working example in the `example/` directory.


## Todo
- Add the ability of re-ordering the tabs.

## License
MIT
