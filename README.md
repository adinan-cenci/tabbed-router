# Tabbed router
A little tabbed router I made for my own use.

```js
import   TabManager        from 'tabbed-router';
import { RouteCollection } from 'tabbed-router';
import { HashRequest }     from 'tabbed-router';
import { TabPanel }        from 'tabbed-router';
import { TabLink }         from 'tabbed-router';

import   MyCustomElement   from './MyCustomElement';

//--------------------------------

customElements.define('tab-manager', TabManager);
customElements.define('tab-panel', TabPanel);
customElements.define('tab-link', TabLink);

customElements.define('my-custom-element', MyCustomElement);

//--------------------------------

const tabManager = new TabManager();
const routeCollection = new RouteCollection();

routeCollection.createRoute(/my-custom-route:(?<id>.+)/, 'my-custom-element');
tabManager.setRouteCollection(routeCollection);

var tab = tabManager.createTab('main-tab', 'Main tab');

document.body.append(tabManager);

```


```html
<a href="#my-custom-route:123" title="foo bar">foo bar</a>
```

See a working example in the `example/` directory.


## Todo
Make it work with the browser's history api.


## License
MIT
