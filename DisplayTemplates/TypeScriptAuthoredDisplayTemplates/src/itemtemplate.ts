let _item_template_js_cache = {};

/**
 * Defines a Item Template
 */
class ItemTemplate {
    private filename: string;
    private propertyMappings: any;
    private TargetControlType: Array<string>;
    private htmlTemplate: string;

    /**
     * Constructor
     * 
     * @param template The filename of the template
     * @param propertyMappings The property mappings for the template
     * @param targetControlType The target control types for the template
     */
    constructor(filename: string, propertyMappings: any, targetControlType: Array<string>) {
        this.filename = filename.toLowerCase();
        this.propertyMappings = propertyMappings;
        this.TargetControlType = targetControlType;
    }

    /**
     * Find the absolute path of the template
     */
    private templateAbsPath(): string {
        let _templateAbsPath = null, scriptUrl = null, scripts = document.head.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            let src = scripts[i].src.toLowerCase();
            if (src.indexOf("/_catalogs/") > 0 && src.indexOf(this.filename) > 0) {
                scriptUrl = src;
                break;
            }
        }
        if (scriptUrl !== null) {
            if (scriptUrl.indexOf("?") > 0) {
                scriptUrl = scriptUrl.split("?")[0];
            }
            _templateAbsPath = `~sitecollection${scriptUrl.substr(scriptUrl.indexOf("/_catalogs/"))}`;
            _templateAbsPath = decodeURI(_templateAbsPath);
        }
        return _templateAbsPath;
    }

    /**
     * Replaces tokens in the string
     * 
     * @param str The string
     * @param itemValues The item values to replace with
     */
    private replaceTokens(str: string, itemValues: any): string {
        const regExp = /{{(\w+)}}/g;
        let _str = str;
        str.match(regExp).forEach(t => _str = _str.replace(t, itemValues[t.replace(/[^a-zA-Z0-9]/g, "")]));
        return _str;
    }

    /**
     * Renders the template
     */
    private render(ctx): string {
        let itemTemplateId = ctx.ClientControl.get_itemTemplateId().toLowerCase();
        let cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": itemTemplateId,
            "TemplateType": "Item",
            "TargetControlType": _item_template_js_cache[itemTemplateId].TargetControlType,
            "ManagedPropertyMapping": _item_template_js_cache[itemTemplateId].PropertyMappings,
        };
        let cachePreviousItemValuesFunction = ctx.ItemValues;
        ctx.ItemValues = (slotOrPropName) => {
            return Srch.ValueInfo.getCachedCtxItemValue(ctx, slotOrPropName);
        };
        let itemValues = {};
        Object.keys(ctx.DisplayTemplateData.ManagedPropertyMapping).forEach(key => itemValues[key] = $getItemValue(ctx, key));
        let htmlMarkup = _item_template_js_cache["replaceTokens"](_item_template_js_cache[itemTemplateId].HtmlTemplate, itemValues);
        ctx.ItemValues = cachePreviousItemValuesFunction;
        ctx.DisplayTemplateData = cachePreviousTemplateData;
        return htmlMarkup;
    }

    /**
     * Sets the HTML template
     * 
     * @param htmlTmpl The HTML template
     */
    public set_HtmlTemplate(htmlTmpl: string): void {
        this.htmlTemplate = htmlTmpl;
    }

    public register(): void {
        let absPath = this.templateAbsPath();
        if (absPath) {
            _item_template_js_cache["replaceTokens"] = this.replaceTokens;
            _item_template_js_cache[absPath] = {
                TargetControlType: this.TargetControlType,
                PropertyMappings: this.propertyMappings,
                HtmlTemplate: this.htmlTemplate,
            };
            if ("undefined" !== typeof (Srch) && "undefined" !== typeof (Srch.U) && typeof (Srch.U.registerRenderTemplateByName) === "function") {
                Srch.U.registerRenderTemplateByName(absPath, this.render);
            }
            if (typeof (RegisterModuleInit) === "function" && typeof (Srch.U.replaceUrlTokens) === "function") {
                RegisterModuleInit(Srch.U.replaceUrlTokens(absPath), this.register);
            }
        }
    }
}
