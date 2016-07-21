/**
 * Declaring Srch and $getItemValue
 */
declare var Srch: any;
declare function $isNull(clientControl): boolean;
declare function RegisterModuleInit(path: string, regFunc: Function): any;

/**
 * Defines a Group Template
 */
class GroupTemplate {
    private filename: string;
    private targetControlType: Array<string>;

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
     * Renders the template
     */
    private render(ctx: any, _ctx: GroupTemplate): string {
        let groupTemplateId = ctx.ClientControl.get_itemTemplateId().toLowerCase();
        let cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": groupTemplateId,
            "TemplateType": "Group",
            "TargetControlType": _ctx.targetControlType,
        };
        ctx.ListDataJSONGroupsKey = "ResultRows";
        ctx.DisplayTemplateData = cachePreviousTemplateData;
        return ctx.RenderItems(ctx);
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
