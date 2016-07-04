/**
 * Declaring Srch and $getItemValue
 */
declare var Srch: any;
declare function $isNull(clientControl): boolean;
declare function RegisterModuleInit(path: string, regFunc: Function): any;

/**
 * Defines a Control Template
 */
class ControlTemplate {
    private filename: string;
    private targetControlType: Array<string>;
    private htmlTemplate: string;
    private itemWrapperTemplate: string;

    /**
     * Constructor
     * 
     * @param template The filename of the template
     * @param targetControlType The target control types for the template
     */
    constructor(filename: string, targetControlType: Array<string>) {
        this.filename = filename.toLowerCase();
        this.targetControlType = targetControlType;
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
     * Renders the items
     */
    private itemRendering(itemRenderResult, inCtx, tpl): string {
        return String.format(this.itemWrapperTemplate || `<li>{0}</li>`, itemRenderResult);
    }

    /**
     * Renders the template
     */
    private render(ctx: any, _ctx: ControlTemplate): string {
        let itemTemplateId = ctx.ClientControl.get_itemTemplateId().toLowerCase();
        let cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": itemTemplateId,
            "TemplateType": "Control",
            "TargetControlType": _ctx.targetControlType,
        };
        if (!$isNull(ctx.ClientControl) && !$isNull(ctx.ClientControl.shouldRenderControl) && !ctx.ClientControl.shouldRenderControl()) {
            return "";
        }
        ctx.ListDataJSONGroupsKey = "ResultTables";
        ctx.ItemRenderWrapper = _ctx.itemRendering;
        let htmlMarkup = String.format(this.htmlTemplate || `<ul class="cbs-List">{0}</ul>`, ctx.RenderGroups(ctx));
        ctx.DisplayTemplateData = cachePreviousTemplateData;
        return htmlMarkup;
    }

    /**
     * Sets the HTML template. Template must include a {0} token
     * which is replaced with the rendered items. 
     * Defaults to <ul class="cbs-List">{0}</ul>.
     * 
     * @param htmlTmpl The HTML template
     */
    public set_HtmlTemplate(htmlTmpl: string): void {
        this.htmlTemplate = htmlTmpl;
    }

    /**
     * Sets the Item Wrapper template. Template must include a {0} token
     * which is replaced with the rendered item.
     * Defaults to <li>{0}</li>.
     * 
     * @param itmWrpTmpl The item wrapper template
     */
    public set_ItemWrapperTemplate(itmWrpTmpl: string): void {
        this.itemWrapperTemplate = itmWrpTmpl;
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
