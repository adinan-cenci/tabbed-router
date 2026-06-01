# Tabbed router
A small vanila JS router I made for personal use.

It supports tabs, so you may have tabs within your browser's tabs.

Ok, how to use it ?

## First we import the classes
```js
import   TabManager        from 'tabbed-router';
import { TabPanel }        from 'tabbed-router';
import { TabButton }       from 'tabbed-router';
import { TabsBar }         from 'tabbed-router';
import { TabControls }     from 'tabbed-router';
import { RouteCollection } from 'tabbed-router';
```

## Define the custom elements
```js
customElements.define('tab-manager',  TabManager);
customElements.define('tab-panel',    TabPanel);
customElements.define('tab-link',     TabButton);
customElements.define('tab-links',    TabsBar);
customElements.define('tab-controls', TabControls);
```

## Add the routes
```js 
const routeCollection = new RouteCollection();

// It support elements:
customElements.define('my-custom-element', MyCustomElement);
routeCollection.createRoute(/my-custom-route/, 'my-custom-element');

// Functions too:
routeCollection.createRoute(/product:(?<productId>.+)/, (request) => {
    var element = document.createElement('my-product');
    element.productId = request.getAttribute('productId');
    return element;
});
```

## Append to the document
```js
const tabManager = new TabManager();
tabManager.setRouteCollection(routeCollection);

var tab = tabManager.addNewTabPanel('main-tab', 'Main tab');
document.body.append(tabManager);
```

## Now add anchors and forms
The router will react to anchors being clicked and forms being submitted.

```html
<a href="#my-custom-route" title="foo bar">foo bar</a>

<a href="#product:123" data-tabbed-router-title="foo bar">my product</a>
```

See a working example in the `example/` directory.

## License
MIT
