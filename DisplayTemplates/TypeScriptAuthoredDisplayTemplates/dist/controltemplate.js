/**
 * Defines a Control Template
 */
var ControlTemplate = (function () {
    /**
     * Constructor
     *
     * @param template The filename of the template
     * @param targetControlType The target control types for the template
     */
    function ControlTemplate(filename, targetControlType) {
        this.filename = filename.toLowerCase();
        this.targetControlType = targetControlType;
    }
    /**
     * Find the absolute path of the template
     */
    ControlTemplate.prototype.templateAbsPath = function () {
        var _templateAbsPath = null, scriptUrl = null, scripts = document.head.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src.toLowerCase();
            if (src.indexOf("/_catalogs/") > 0 && src.indexOf(this.filename) > 0) {
                scriptUrl = src;
                break;
            }
        }
        if (scriptUrl !== null) {
            if (scriptUrl.indexOf("?") > 0) {
                scriptUrl = scriptUrl.split("?")[0];
            }
            _templateAbsPath = decodeURI("~sitecollection" + scriptUrl.substr(scriptUrl.indexOf("/_catalogs/")));
        }
        return _templateAbsPath;
    };
    /**
     * Renders the items
     */
    ControlTemplate.prototype.itemRendering = function (itemRenderResult, inCtx, tpl) {
        return String.format(this.itemWrapperTemplate || "<li>{0}</li>", itemRenderResult);
    };
    /**
     * Renders the template
     */
    ControlTemplate.prototype.render = function (ctx, _ctx) {
        var itemTemplateId = ctx.ClientControl.get_itemTemplateId().toLowerCase();
        var cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": itemTemplateId,
            "TemplateType": "Control",
            "TargetControlType": _ctx.targetControlType
        };
        if (!$isNull(ctx.ClientControl) && !$isNull(ctx.ClientControl.shouldRenderControl) && !ctx.ClientControl.shouldRenderControl()) {
            return "";
        }
        ctx.ListDataJSONGroupsKey = "ResultTables";
        ctx.ItemRenderWrapper = _ctx.itemRendering;
        var htmlMarkup = String.format(this.htmlTemplate || "<ul class=\"cbs-List\">{0}</ul>", ctx.RenderGroups(ctx));
        ctx.DisplayTemplateData = cachePreviousTemplateData;
        return htmlMarkup;
    };
    /**
     * Sets the HTML template. Template must include a {0} token
     * which is replaced with the rendered items.
     * Defaults to <ul class="cbs-List">{0}</ul>.
     *
     * @param htmlTmpl The HTML template
     */
    ControlTemplate.prototype.set_HtmlTemplate = function (htmlTmpl) {
        this.htmlTemplate = htmlTmpl;
    };
    /**
     * Sets the Item Wrapper template. Template must include a {0} token
     * which is replaced with the rendered item.
     * Defaults to <li>{0}</li>.
     *
     * @param itmWrpTmpl The item wrapper template
     */
    ControlTemplate.prototype.set_ItemWrapperTemplate = function (itmWrpTmpl) {
        this.itemWrapperTemplate = itmWrpTmpl;
    };
    ControlTemplate.prototype.register = function () {
        var _this = this;
        var absPath = this.templateAbsPath();
        if (absPath) {
            if ("undefined" !== typeof (Srch) && "undefined" !== typeof (Srch.U) && typeof (Srch.U.registerRenderTemplateByName) === "function") {
                Srch.U.registerRenderTemplateByName(absPath, function (ctx) {
                    return _this.render(ctx, _this);
                });
            }
            if (typeof (RegisterModuleInit) === "function" && typeof (Srch.U.replaceUrlTokens) === "function") {
                RegisterModuleInit(Srch.U.replaceUrlTokens(absPath), this.register);
            }
        }
    };
    return ControlTemplate;
}());
