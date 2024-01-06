(()=>{"use strict";const t=class{constructor(t,e){this.patterns=Array.isArray(t)?t:[t],this.callback=e}callIt(t){var e=this.getMatchingPattern(t.path),s=this.getAttributesFromPath(t.path,e);return t.setAttributes(s),this.instantiateElement(t)}instantiateElement(t){var e;return"string"==typeof this.callback?e=document.createElement(this.callback):"function"==typeof this.callback&&(e=this.callback.apply(this,[t])),e.request=t,e}doesItMatcheRequest(t){return!!this.getMatchingPattern(t.path)}getMatchingPattern(t){for(var e of this.patterns)if(t.match(e))return e;return null}getAttributesFromPath(t,e){return e.exec(t).groups||{}}},e=class{constructor(){this.routes=[]}call(t,e){return t.callIt(e)}getMatchingRoute(t){for(var e of this.routes)if(e.doesItMatcheRequest(t))return e;return null}addRoute(t){return this.routes.push(t),this}createRoute(e,s){return this.addRoute(new t(e,s))}};class s{constructor(t,e,s={}){this.path=t,this.queryParams="string"==typeof e?new URLSearchParams(e):e,this.attributes=s}setAttributes(t){this.attributes=t}getAttribute(t,e=null){return this.attributes[t]||e}static createFromAnchor(t){var e=t.getAttribute("href");return s.createFromHref(e)}static createFromHref(t){var e=new URL(t,"https://"+window.location.host);if(!e.hash)return null;var r=new URL(e.hash.replace("#","/"),"https://"+window.location.host);return e.host!=window.location.host?null:new s(r.pathname,r.searchParams)}}const r=s;class a extends HTMLElement{constructor(){super(),this.$refs={},this.links={},this.tabs={},this.rendered=!1,this.currentTabId=null}setRouter(t){this.router=t}connectedCallback(){this.rendered||this.render()}render(){for(var t in this.rendered=!0,this.classList.add("tab-manager"),this.$refs.header=document.createElement("div"),this.$refs.header.classList.add("tab-manager--header"),this.append(this.$refs.header),this.$refs.controls=document.createElement("div"),this.$refs.controls.classList.add("tab-manager--controls"),this.$refs.header.append(this.$refs.controls),this.$refs.backwardButton=document.createElement("button"),this.$refs.controls.append(this.$refs.backwardButton),this.$refs.backwardButton.innerHTML="B",this.$refs.forwardButton=document.createElement("button"),this.$refs.forwardButton.innerHTML="F",this.$refs.controls.append(this.$refs.forwardButton),this.$refs.backwardButton.addEventListener("click",this.backwards.bind(this)),this.$refs.forwardButton.addEventListener("click",this.forwards.bind(this)),this.$refs.tabLinks=document.createElement("div"),this.$refs.tabLinks.classList.add("tab-manager--tab-links"),this.$refs.header.append(this.$refs.tabLinks),this.$refs.tabPanes=document.createElement("div"),this.$refs.tabPanes.classList.add("tab-manager--tab-panes"),this.append(this.$refs.tabPanes),this.tabs)this.attachTab(t);document.addEventListener("click",this.onClick.bind(this))}onClick(t){if(!t.tabAvaliated&&"A"==t.target.tagName){var e=t.target,s=r.createFromAnchor(e);if(s){var a,i=s.path.replace("/","#");try{a=document.querySelector(i)}catch{a=!1}a||(t.stopPropagation(),t.preventDefault(),this.tabs[this.currentTabId].goTo(s))}}}backwards(){this.tabs[this.currentTabId].backwards()}forwards(){this.tabs[this.currentTabId].forwards()}focusTab(t){for(var e in this.currentTabId=t,this.tabs)e==t?(this.tabs[e].classList.add("focused"),this.links[e].classList.add("focused")):(this.tabs[e].classList.remove("focused"),this.links[e].classList.remove("focused"))}setTab(t,e){if(this.tabs[t])throw"Tab {tabId} is already set";e.setRouter(this.router);var s=this.createTabButton(t,t);this.tabs[t]=e,this.links[t]=s,this.rendered&&this.attachTab(t)}removeTab(t){var e;return this.tabs[t]?(this.rendered&&this.detachTab(t),e=this.tabs[t],this.tabs[t]=null,e):null}attachTab(t){var e=this.tabs[t],s=this.links[t];this.$refs.tabLinks.append(s),this.$refs.tabPanes.append(e)}detachTab(t){this.links[t].remove(),this.links[t]=null,this.tabs[t].remove()}createTabButton(t,e){var s=document.createElement("button");return s.setAttribute("data-id",t),s.innerHTML=e,s.addEventListener("click",(t=>{this.focusTab(t.target.getAttribute("data-id"))})),s}}const i=a;class n extends HTMLElement{constructor(){super(),this.history=[],this.historyIndex=-1}setRouter(t){this.router=t}connectedCallback(){this.addEventListener("click",this.linkClick.bind(this))}linkClick(t){if("A"==t.target.tagName){t.tabAvaliated=!0;var e=t.target,s=r.createFromAnchor(e);if(s){var a,i=s.path.replace("/","#");try{a=document.querySelector(i)}catch{a=!1}a||(t.stopPropagation(),t.preventDefault(),this.goTo(s))}}}request(t){var e=this.router.getMatchingRoute(t),s=e?e.callIt(t):this.notFoundCallback();this.stageElement(s)}backwards(){this.historyIndex<=0||(this.historyIndex--,this.request(this.history[this.historyIndex]))}forwards(){this.historyIndex!=this.history.length-1&&(this.historyIndex++,this.request(this.history[this.historyIndex]))}goTo(t){this.history=this.history.slice(0,this.historyIndex+1),this.history.push(t),this.request(t),this.historyIndex++}stageElement(t){this.clearStage(),this.addToStage(t)}clearStage(){this.querySelectorAll(":scope > *").forEach((t=>{t.remove()}))}addToStage(t){this.append(t)}notFoundCallback(){var t=document.createElement("div");return t.innerHTML="Nothing found",t}}const h=n;class o extends HTMLElement{connectedCallback(){var t=parseInt(this.request.queryParams.get("n")||1);this.append(this.createP("test: "+t)),this.append(this.createP("",[this.createA("<<","#test-first:123?n="+(t-1)),"      ",this.createA(">>","#test-first:123?n="+(t+1))])),this.append(this.createP("",this.createA("broken link","#broken"))),this.append(this.createP("",this.createA("actual thing","#actualThing"))),this.append(this.createP("",this.createA("regular link","https://google.com")))}createP(t="",e=null){e=Array.isArray(e)?e:[e];var s=document.createElement("p");for(var r of(s.innerHTML=t,e))r&&s.append(r);return s}createA(t="",e){var s=document.createElement("a");return s.innerHTML=t,s.setAttribute("href",e),s}}customElements.define("test-first",o),customElements.define("tab-manager",i),customElements.define("tab-panel",h),document.addEventListener("DOMContentLoaded",(()=>{const t=new e;t.createRoute(/test-first:(?<foobar>.+)/,"test-first");const s=new i;s.setRouter(t);const a=new h;s.setTab("main-tab",a);const n=new h;s.setTab("secondary-tab",n),s.focusTab("main-tab"),window.router=t,window.tabManager=s,document.body.append(s);const o=new r("test-first:123","");a.goTo(o);var c=document.createElement("div");c.setAttribute("id","actualThing"),document.body.append(c);var d=document.createElement("a");d.setAttribute("href","#test-first:123?n=1000"),d.innerHTML="outside",document.body.append(d)}))})();