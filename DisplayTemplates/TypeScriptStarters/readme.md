## TypeScript Item Starter Template (SP Search)

### Introduction
TypeScript Item Starter template that makes it easier to create and use Display Templates when you don't have publishing enabled at Site Collection level. Based on [Item_Minimal.js](https://github.com/SPCSR/DisplayTemplates/blob/master/Search%20Display%20Templates/JavaScript%20Starter%20Template/Item_Minimal.js) from [Elio Struyf](https://github.com/estruyf).

### It's quite simple
### Using JS dist
Include the compiled JS in any way you want.

### Using TS source
Include the class with the module system you're using.

_Then just do.._

```javascript
let tmpl = new ItemTemplate("item_minimal.js", { "Path": "Path", "Title": ["Title"] }, ["SearchResults"]);
tmpl.set_HtmlTemplate(` <div>
                            <h3>{{Title}}</h3>
                            <h4>{{Path}}</h4>
                        </div>`);
tmpl.register();```