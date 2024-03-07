(()=>{"use strict";const t=class{constructor(t,e){this.patterns=Array.isArray(t)?t:[t],this.callback=e}callIt(t){var e=this.getMatchingPattern(t.path),s=this.getAttributesFromPath(t.path,e);return t.setAttributes(s),this.instantiateElement(t)}instantiateElement(t){var e;return"string"==typeof this.callback?e=document.createElement(this.callback):"function"==typeof this.callback&&(e=this.callback.apply(this,[t])),e.request=t,e}doesItMatcheRequest(t){return!(!t.path||!this.getMatchingPattern(t.path))}getMatchingPattern(t){for(var e of this.patterns)if(t.match(e))return e;return null}getAttributesFromPath(t,e){return e.exec(t).groups||{}}},e=class{constructor(){this.routes=[]}call(t,e){return t.callIt(e)}getMatchingRoute(t){for(var e of this.routes)if(e.doesItMatcheRequest(t))return e;return null}addRoute(t){return this.routes.push(t),this}createRoute(e,s){return this.addRoute(new t(e,s))}};class s{constructor(t,e,s={},n={}){this.path=t,this.queryParams="string"==typeof e?new URLSearchParams(e):e,this.attributes=s,this.meta=n}setAttributes(t){return this.attributes=t,this}setAttribute(t,e){return this.attributes[t]=e,this}getAttribute(t,e=null){return this.attributes[t]||e}matchesHtmlElement(){var t=this.path.replace(/^\//,"#"),e=!1;try{e=document.querySelector(t)}catch{e=!1}return!!e}static createFromAnchor(t){var e=t.getAttribute("href"),n=t.getAttribute("title")||null,a=s.createFromUrl(e);return a?(a.meta.title=n,a):null}static createFromForm(t){var e=t.getAttribute("action"),n=t.getAttribute("title")||null,a=s.createFromUrl(e);if(!a)return null;a.meta.title=n;var r=new FormData(t),i=new URLSearchParams(r);return s.mergeUrlSearchParams(a.queryParams,i),a}static mergeUrlSearchParams(t,e){for(let[s,n]of e.entries())s.indexOf("[]")>=0&&t.has(s)?t.append(s,n):t.set(s,n)}static createFromUrl(t){var e=new URL(t,"https://"+window.location.host);return e.hash?s.createFromHash(e.hash,e.host):null}static createFromHash(t,e=window.location.host){var n=t.replace(/^#\/?/,"/"),a=new URL(n,"https://"+window.location.host);return e!=window.location.host?null:new s(a.pathname,a.searchParams)}}const n=s;class a extends HTMLElement{constructor(){super(),this.$refs={},this.label="",this.tabId="",this.rendered=!1}setLabel(t){this.label=t,this.rendered&&(this.$refs.label.innerHTML=t)}setTabId(t){return this.tabId=t,this}connectedCallback(){this.rendered||this.render()}render(){this.rendered=!0,this.classList.add("tabbed-router__tab-link"),this.$refs.label=document.createElement("span"),this.$refs.label.innerHTML=this.label,this.append(this.$refs.label),this.$refs.closeBtn=document.createElement("button"),this.$refs.closeBtn.setAttribute("title","close tab"),this.append(this.$refs.closeBtn),this.addEventListener("click",this.onClick.bind(this)),this.$refs.closeBtn.addEventListener("click",this.onCloseBtnClicked.bind(this))}onClick(){var t=new CustomEvent("tabbed-router:tab-link:clicked",{});this.dispatchEvent(t)}onCloseBtnClicked(t){t.stopPropagation(),t.preventDefault();var e={bubbles:!0,detail:this.tabId},s=new CustomEvent("tabbed-router:tab-link:request-closing",e);this.dispatchEvent(s)}}const r=a;class i extends HTMLElement{constructor(){super(),this.history=[],this.historyIndex=-1,this.ctrlKey=!1}setRouteCollection(t){this.routeCollection=t}connectedCallback(){this.classList.add("tabbed-router__tab-panel"),this.addEventListener("click",this.onAnchorClicked.bind(this)),this.addEventListener("submit",this.onFormSubmitted.bind(this)),this.addEventListener("keydown",this.onKeyDown.bind(this)),this.addEventListener("keyup",this.onKeyUp.bind(this))}onKeyDown(t){this.ctrlKey=t.ctrlKey}onKeyUp(t){this.ctrlKey=t.ctrlKey}onAnchorClicked(t){var e=i.getAnchor(t.target);if(e&&!t.ctrlKey&&"_blank"!=e.getAttribute("target")){t.tabbedRouterAvaliated=!0;var s=n.createFromAnchor(e);0==s||s.matchesHtmlElement()||(t.stopPropagation(),t.preventDefault(),this.goTo(s))}}onFormSubmitted(t){var e=t.target;if(!this.ctrlKey&&"_blank"!=e.getAttribute("target")){t.tabbedRouterAvaliated=!0;var s=n.createFromForm(e);0==s||"get"!=e.method||s.matchesHtmlElement()||(t.stopPropagation(),t.preventDefault(),this.goTo(s))}}backwards(){this.historyIndex<=0||(this.historyIndex--,this.request(this.history[this.historyIndex]))}forwards(){this.historyIndex!=this.history.length-1&&(this.historyIndex++,this.request(this.history[this.historyIndex]))}goTo(t){this.history=this.history.slice(0,this.historyIndex+1),this.history.push(t),this.request(t),this.historyIndex++}request(t){var e=this.routeCollection.getMatchingRoute(t),s=e?e.callIt(t):this.nothingFoundCallback(t);if(s){this.stageElement(s);var n=new CustomEvent("tabbed-router:tab-panel:request-made",{bubbles:!0,detail:t});this.dispatchEvent(n)}else console.error("Route failed in returning an element.")}stageElement(t){this.clearStage(),this.addToStage(t)}clearStage(){this.querySelectorAll(":scope > *").forEach((t=>{t.remove()}))}addToStage(t){this.append(t)}nothingFoundCallback(t){var e=document.createElement("div");return e.innerHTML="Nothing found",t.meta.title=t.meta.title?t.meta.title+" ( not found )":"not found",e}static getAnchor(t){if(t instanceof HTMLAnchorElement)return t;do{t=t.parentNode}while(t.parentNode&&t.parentNode instanceof HTMLAnchorElement);return t&&t instanceof HTMLAnchorElement?t:null}}const o=i;class h extends HTMLElement{constructor(){super(),this.$refs={},this.links={},this.tabs={},this.tabCount=0,this.rendered=!1,this.focusedTabId=null,this.routeCollection=null,this.ctrlKey=!1}setRouteCollection(t){this.routeCollection=t}connectedCallback(){this.rendered||this.render()}render(){for(var t in this.rendered=!0,this.classList.add("tabbed-router__tab-manager"),this.subRenderHeader(),this.subRenderPanes(),this.tabs)this.attachTab(t);document.addEventListener("click",this.onAnchorClicked.bind(this)),document.addEventListener("submit",this.onFormSubmitted.bind(this)),document.addEventListener("keydown",this.onKeyDown.bind(this)),document.addEventListener("keyup",this.onKeyUp.bind(this)),this.addEventListener("tabbed-router:tab-panel:request-made",this.onTabRequest.bind(this)),this.addEventListener("tabbed-router:tab-link:request-closing",this.onRequestToCloseTab.bind(this))}subRenderHeader(){this.$refs.header=document.createElement("div"),this.$refs.header.classList.add("tabbed-router__tab-manager__header"),this.append(this.$refs.header),this.subRenderControls(),this.subRenderTabLinks()}subRenderControls(){this.$refs.controls=document.createElement("div"),this.$refs.controls.classList.add("tabbed-router__tab-manager__controls"),this.$refs.header.append(this.$refs.controls),this.$refs.backwardButton=document.createElement("button"),this.$refs.backwardButton.title="Backwards",this.$refs.backwardButton.classList.add("tabbed-router__tab-manager__backwards-button"),this.$refs.controls.append(this.$refs.backwardButton),this.$refs.forwardButton=document.createElement("button"),this.$refs.forwardButton.title="Forwards",this.$refs.forwardButton.classList.add("tabbed-router__tab-manager__forwards-button"),this.$refs.controls.append(this.$refs.forwardButton),this.$refs.backwardButton.addEventListener("click",this.backwards.bind(this)),this.$refs.forwardButton.addEventListener("click",this.forwards.bind(this))}subRenderTabLinks(){this.$refs.tabLinks=document.createElement("div"),this.$refs.tabLinks.classList.add("tabbed-router__tab-manager__tab-links"),this.$refs.header.append(this.$refs.tabLinks)}subRenderPanes(){this.$refs.tabPanes=document.createElement("div"),this.$refs.tabPanes.classList.add("tabbed-router__tab-manager__tab-panes"),this.append(this.$refs.tabPanes)}onRequestToCloseTab(t){if(!(this.tabCount<=1)){var e=t.detail;if(e==this.focusedTabId){var s=(this.links[e].previousSibling||this.links[e].nextSibling).tabId;this.focusTab(s)}this.removeTab(e),this.updated()}}onKeyDown(t){this.ctrlKey=t.ctrlKey}onKeyUp(t){this.ctrlKey=t.ctrlKey}onAnchorClicked(t){if(!t.tabbedRouterAvaliated){var e=o.getAnchor(t.target);if(e){var s=n.createFromAnchor(e);0==s||s.matchesHtmlElement()||(t.stopPropagation(),t.preventDefault(),t.ctrlKey?this.openInNewTab(s,!1):"_blank"==(e.getAttribute("target")||"self")?this.openInNewTab(s,!0):this.tabs[this.focusedTabId].goTo(s))}}}onFormSubmitted(t){if(!t.tabbedRouterAvaliated){var e=t.target;t.tabbedRouterAvaliated=!0;var s=n.createFromForm(e);0==s||"get"!=e.method||s.matchesHtmlElement()||(t.stopPropagation(),t.preventDefault(),this.ctrlKey?this.openInNewTab(s,!1):"_blank"==(e.getAttribute("target")||"self")?this.openInNewTab(s,!0):this.tabs[this.focusedTabId].goTo(s))}}openInNewTab(t,e=!1){var s=this.generateNewTabId(),n=this.createTab(s,t.meta.title||s,e);return n.goTo(t),n}generateNewTabId(){var t;do{t="tab-"+Math.floor(1e3*Math.random())}while(this.tabs[t]);return t}onTabRequest(t){var e=this.getTabIdForTabPanel(t.target),s=t.detail;this.links[e].setLabel(s.meta.title||e),this.updated()}getTabIdForTabPanel(t){for(var e in this.tabs)if(this.tabs[e]==t)return e;return null}backwards(){this.tabs[this.focusedTabId].backwards()}forwards(){this.tabs[this.focusedTabId].forwards()}focusTab(t){for(var e in this.focusedTabId=t,this.tabs)e==t?(this.tabs[e].classList.add("focused"),this.links[e].classList.add("focused")):(this.tabs[e].classList.remove("focused"),this.links[e].classList.remove("focused"))}createTab(t,e=null,s=!0){var n=new o;return this.setTab(t,n,e),s&&this.focusTab(t),n}setTab(t,e,s){if(this.tabs[t])throw"Tab {tabId} is already set";e.setRouteCollection(this.routeCollection);var n=this.createTabButton(t,s||t);this.tabs[t]=e,this.links[t]=n,this.rendered&&this.attachTab(t)}removeTab(t){var e;return this.tabs[t]?(e=this.tabs[t],this.rendered&&this.detachTab(t),e):null}attachTab(t){var e=this.tabs[t],s=this.links[t];this.$refs.tabLinks.append(s),this.$refs.tabPanes.append(e),this.tabCount++}detachTab(t){this.links[t].remove(),delete this.links[t],this.tabs[t].remove(),delete this.tabs[t],this.tabCount--}createTabButton(t,e){var s=new r;return s.setTabId(t),s.setLabel(e),s.addEventListener("tabbed-router:tab-link:clicked",(t=>{this.focusTab(t.target.tabId)})),s}updated(){var t=new CustomEvent("tabbed-router:updated",{bubbles:!0});this.dispatchEvent(t)}}const l=h;customElements.define("tab-manager",l),customElements.define("tab-panel",o),customElements.define("tab-link",r);class d extends HTMLElement{connectedCallback(){var t=parseInt(this.request.getAttribute("number",1)),e=this.request.queryParams.get("phrase")||"",s=t-1,n=t+1;this.innerHTML=`<ul>\n            <li>number: ${t}</li>\n            <li>phrase: ${e}</li>\n        </ul>\n\n        <hr>\n\n        <ul>\n            <li>\n                open in the same tab: \n                &nbsp;&nbsp;&nbsp;&nbsp;\n                <a href="#test-counting:${s}" title="decrement"> << </a> \n                &nbsp;&nbsp;&nbsp;&nbsp; \n                <a href="#test-counting:${n}" title="increment"> >> </a>\n                &nbsp;&nbsp;&nbsp;&nbsp;\n                ( press ctrl + LMB to open in a new tab )\n            </li>\n            <li>\n                open in new tab: \n                &nbsp;&nbsp;&nbsp;&nbsp;\n                <a href="#test-counting:${s}" title="decrement ( new tab )" target="_blank"> << </a> \n                &nbsp;&nbsp;&nbsp;&nbsp; \n                <a href="#test-counting:${n}" title="increment ( new tab )" target="_blank"> >> </a>\n            </li>\n            <li><a href="#link-to-nowhere">broken link</a></li>\n            <li><a href="#actualThing">link to an actual element</a></li>\n            <li><a href="https://duckduckgo.com">regular links</a> remain unafected</li>\n        </ul>\n\n        <hr>\n\n        <fieldset>\n            <legend>forms work as well</legend>\n            <form action="#test-counting:${t}" title="Form">\n                <input type="text" name="phrase" placeholder="type phrase here" /> <br/>\n                <input type="submit" value="submit" />\n            </form>\n        </fieldset>`}}customElements.define("test-first",d),document.addEventListener("DOMContentLoaded",(()=>{const t=new e;t.createRoute(/test-counting:(?<number>.+)/,"test-first");const s=new l;s.setRouteCollection(t);const a=s.createTab("main-tab","Main tab",!0);window.routeCollection=t,window.tabManager=s,document.body.append(s);const r=n.createFromHash("#test-counting:1");r.meta.title="Main tab",a.goTo(r);var i=document.createElement("a");i.setAttribute("href","#test-counting:1000"),i.setAttribute("title","from the outside"),i.innerHTML="this link",document.body.append(i),(i=document.createElement("span")).innerHTML=" from outside of the tabbed manager still works.",document.body.append(i);var o=document.createElement("div");o.innerHTML="actual element",o.setAttribute("id","actualThing"),document.body.append(o)}))})();