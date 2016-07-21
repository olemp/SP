/**
 * Declaring Srch and $getItemValue
 */
declare var Srch: any;
declare function $isNull(clientControl): boolean;
declare function RegisterModuleInit(path: string, regFunc: Function): any;
declare function GetThemedImageUrl(str): string;
declare function $htmlEncode(str): string;
declare function $urlHtmlEncode(str): string;

/**
 * Defines a Control Template
 */
class ControlTemplate {
    private filename: string;
    private targetControlType: Array<string>;
    private htmlTemplate: string;
    private itemWrapperTemplate = "<li>{0}</li>";
    private useCache: boolean;

    /**
     * Constructor
     * 
     * @param template The filename of the template
     * @param targetControlType The target control types for the template
     */
    constructor(filename: string, targetControlType: Array<string>, useCache = false) {
        this.filename = filename.toLowerCase();
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
     * Renders the items
     */
    private itemRendering(itemRenderResult, inCtx, tpl): string {
        return String.format(this.itemWrapperTemplate, itemRenderResult);
    }

    /**
     * Renders the paging element
     */
    private renderPaging(ctx: any) {
        var pagingInfo = ctx.ClientControl.get_pagingInfo(), ms_outHtml = [];
        if (!pagingInfo || pagingInfo.length == 0) {
            return;
        }
        let _outHtml = pagingInfo.map(pl => {
            if ($isNull(pl)) {
                return "";
            }
            let imagesUrl = GetThemedImageUrl('searchresultui.png');
            if (pl.startItem == -1) {
                let selfLinkId = "SelfLink_" + pl.pageNumber;
                return `<li id="PagingSelf"><a id="${$htmlEncode(selfLinkId)}">${$htmlEncode(pl.pageNumber)}</a></li>`;
            } else if (pl.pageNumber == -1) {
                let iconClass = Srch.U.isRTL() ? "ms-srch-pagingNext" : "ms-srch-pagingPrev";
                return `<li id="PagingImageLink"><a id="PageLinkPrev" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="${$htmlEncode(pl.title)}" onclick="$getClientControl(this).page(${$htmlEncode(pl.startItem)});return Srch.U.cancelEvent(event);"><span class="ms-promlink-button-image"><img src="${$urlHtmlEncode(imagesUrl)}" class="${$htmlEncode(iconClass)}" alt="${$htmlEncode(pl.title)}" /></span></a></li>`;
            } else if (pl.pageNumber == -2) {
                let iconClass = Srch.U.isRTL() ? "ms-srch-pagingPrev" : "ms-srch-pagingNext";
                return `<li id="PagingImageLink"><a id="PageLinkNext" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="${$htmlEncode(pl.title)}" onclick="$getClientControl(this).page(${$htmlEncode(pl.startItem)});return Srch.U.cancelEvent(event);">
                            <span class="ms-promlink-button-image">
                            <img src="${$urlHtmlEncode(imagesUrl)}" class="${$htmlEncode(iconClass)}" alt="${$htmlEncode(pl.title)}" />
                            </span>
                            </a></li>`;
            } else {
                return `<li id="PagingLink"><a id="${$htmlEncode("PageLink_" + pl.pageNumber)}" href="#" title="${$htmlEncode(pl.title)}" onclick="$getClientControl(this).page(${$htmlEncode(pl.startItem)});return Srch.U.cancelEvent(event);">${$htmlEncode(pl.pageNumber)}</a></li>`;
            }

        });
        return `<ul id="Paging" class="ms-srch-Paging">${_outHtml.join("")}</ul>`;
    }

    /**
     * Renders the template
     */
    private render(ctx: any, _ctx: ControlTemplate): string {
        let itemTemplateId = ctx.ClientControl.get_renderTemplateId().toLowerCase();
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
        if (ctx.ClientControl.get_showPaging()) {
            htmlMarkup += this.renderPaging(ctx);
        }
        if (_ctx.useCache) {
            ctx.DisplayTemplateData = cachePreviousTemplateData;
        }
        return htmlMarkup;
    }

    /**
     * Sets the HTML template. Template must include a {0} token
     * which is replaced with the rendered items. 
     * Defaults to <ul class="cbs-List">{0}</ul>.
     * 
     * @param htmlTmpl The HTML template
     */
    public set_HtmlTemplate(htmlTmpl: string): ControlTemplate {
        this.htmlTemplate = htmlTmpl;
        return this;
    }

    /**
     * Sets the Item Wrapper template. Template must include a {0} token
     * which is replaced with the rendered item.
     * Defaults to <li>{0}</li>.
     * 
     * @param itmWrpTmpl The item wrapper template
     */
    public set_ItemWrapperTemplate(itmWrpTmpl: string): ControlTemplate {
        this.itemWrapperTemplate = itmWrpTmpl;
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
