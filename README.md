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

// It accepts tag names:
routeCollection.createRoute(/my-custom-route/, 'my-custom-element');

// Functions too:
routeCollection.createRoute(/product:(?<productId>.+)/, (request) => {
    var element = document.createElement('my-custom-element');
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
<!-- The title abribute will be used as the label for the tab -->
<a href="#my-custom-route" title="foo bar">foo bar</a>

<!-- If you rather not have text hovering your anchors, data-tabbed-router-title is an alternative. -->
<a href="#product:123" data-tabbed-router-title="foo bar">my product</a>

<!-- Target blank will cause the manager to open a new tab, and so will CTRL + click. -->
<a href="#product:456" target="_blank">open in new tab</a>
```

See a working example in the `example/` directory.

## License
MIT
