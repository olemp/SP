/**
 * Declaring Srch, RegisterModuleInit and $getItemValue
 */
declare var Srch: any;
declare function $getItemValue(ctx, key): any;
declare function RegisterModuleInit(path: string, regFunc: Function): any;

/**
 * Defines a Item Template
 */
class ItemTemplate {
    private filename: string;
    private propertyMappings: any;
    private targetControlType: Array<string>;
    private htmlTemplate: string;
    private useCache: boolean;
    private overrideItemValues: Function;


    /**
     * Constructor
     * 
     * @param template The filename of the template
     * @param propertyMappings The property mappings for the template
     * @param targetControlType The target control types for the template
     */
    constructor(filename: string, propertyMappings: any, targetControlType: Array<string>, useCache = false) {
        this.filename = filename.toLowerCase();
        this.propertyMappings = propertyMappings;
        this.targetControlType = targetControlType;
        this.useCache = useCache;
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
            _templateAbsPath = decodeURI(`~sitecollection${scriptUrl.substr(scriptUrl.indexOf("/_catalogs/"))}`);
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
    private render(ctx: any, _ctx: ItemTemplate): string {
        let itemTemplateId = ctx.ClientControl.get_itemTemplateId().toLowerCase();
        let cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": itemTemplateId,
            "TemplateType": "Item",
            "TargetControlType": _ctx.targetControlType,
            "ManagedPropertyMapping": _ctx.propertyMappings,
        };
        let cachePreviousItemValuesFunction = ctx.ItemValues;
        ctx.ItemValues = (slotOrPropName) => {
            return Srch.ValueInfo.getCachedCtxItemValue(ctx, slotOrPropName);
        };
        let itemValues = {};
        Object.keys(_ctx.propertyMappings).forEach(key => itemValues[key] = $getItemValue(ctx, key));
        if(_ctx.overrideItemValues) {
            itemValues = _ctx.overrideItemValues(itemValues, ctx);
        }
        let htmlMarkup = _ctx.replaceTokens(_ctx.htmlTemplate, itemValues);
        if (_ctx.useCache) {
            ctx.ItemValues = cachePreviousItemValuesFunction;
            ctx.DisplayTemplateData = cachePreviousTemplateData;
        }
        return htmlMarkup;
    }

    /**
     * Sets the HTML template
     * 
     * @param htmlTmpl The HTML template
     */
    public set_HtmlTemplate(htmlTmpl: string): ItemTemplate {
        this.htmlTemplate = htmlTmpl;
        return this;
    }

    /**
     * Sets the overrideItemValues function
     * 
     * @param value The overideitemvalues function
     */
    public set_overrideItemValues(value: Function): ItemTemplate {
        this.overrideItemValues = value;
        return this;
    }

    public register(): void {
        let absPath = this.templateAbsPath();
        if (absPath) {
            if ("undefined" !== typeof (Srch) && "undefined" !== typeof (Srch.U) && typeof (Srch.U.registerRenderTemplateByName) === "function") {
                Srch.U.registerRenderTemplateByName(absPath, (ctx) => {
                    return this.render(ctx, this);
                });
            }
            if (typeof (RegisterModuleInit) === "function" && typeof (Srch.U.replaceUrlTokens) === "function") {
                RegisterModuleInit(Srch.U.replaceUrlTokens(absPath), this.register);
            }
        }
    }
}
