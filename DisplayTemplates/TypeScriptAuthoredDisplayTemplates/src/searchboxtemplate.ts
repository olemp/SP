/**
 * Declaring Srch and $getItemValue
 */
declare var Srch: any;
declare function $isNull(clientControl): boolean;
declare function RegisterModuleInit(path: string, regFunc: Function): any;
declare function GetThemedImageUrl(str): string;
declare function $htmlEncode(str): string;
declare function $urlHtmlEncode(str): string;
declare function $scriptEncode(str): string;
declare function $isEmptyString(str): boolean;

/**
 * Defines a Control Template
 */
class SearchBoxTemplate {
    private filename: string;
    private useCache: boolean;
    private containerDivClass = "ms-floatLeft";
    private searchBoxDivClass = "ms-srch-sbLarge ms-srch-sb-border";
    private inputClass = "ms-textLarge ms-srch-sbLarge-fullWidth";
    private inputClass_showNavigation = "ms-textLarge ms-srch-sbLarge-navWidth";

    /**
     * Constructor
     * 
     * @param template The filename of the template
     * @param targetControlType The target control types for the template
     */
    constructor(filename: string, useCache = false) {
        this.filename = filename.toLowerCase();
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
     * Renders the template
     */
    private render(ctx: any, _ctx: SearchBoxTemplate): string {
        let cachePreviousTemplateData = ctx.DisplayTemplateData;
        ctx.DisplayTemplateData = {
            "TemplateUrl": _ctx.templateAbsPath(),
            "TemplateType": "Control",
            "TargetControlType": "Search",
        };
        let showQuerySuggestions = ctx.ClientControl.get_showQuerySuggestions(), showNavigation = ctx.ClientControl.get_showNavigation(), prompt = ctx.ClientControl.get_initialPrompt() || Srch.Res.sb_Prompt;
        if (showNavigation) {
            _ctx.inputClass = _ctx.inputClass_showNavigation;
        }
        const searchBoxDivId = `${ctx.ClientControl.get_id()}_sboxdiv`,
            searchBoxId = `${ctx.ClientControl.get_id()}_sbox`,
            navButtonId = `${ctx.ClientControl.get_id()}_NavButton`,
            suggestionsListId = `${ctx.ClientControl.get_id()}_AutoCompList`,
            navListId = `${ctx.ClientControl.get_id()}_NavDropdownList`,
            searchBoxLinkId = `${ctx.ClientControl.get_id()}_SearchLink`,
            searchBoxProgressClass = "ms-srch-sbprogressLarge",
            searchBoxPromptClass = "ms-srch-sb-prompt ms-helperText",
            imagesUrl = GetThemedImageUrl('searchresultui.png');

        ctx.OnPostRender = function (rCtx) {
            ctx.ClientControl.activate(
                prompt,
                searchBoxId,
                searchBoxDivId,
                navButtonId,
                suggestionsListId,
                navListId,
                searchBoxLinkId,
                searchBoxProgressClass,
                searchBoxPromptClass);
        }
        let ms_outHtml = [];
        ms_outHtml.push(`<div id="SearchBox" name="Control" class="${_ctx.containerDivClass}">
                        <div class="${_ctx.searchBoxDivClass}" id="${$htmlEncode(searchBoxDivId)}">
                            <input type="text" value="${$htmlEncode(ctx.ClientControl.get_currentTerm())}" maxlength="2048" accessKey="${$htmlEncode(Srch.Res.sb_AccessKey)}" title="${$htmlEncode(prompt)}" id="${$htmlEncode(searchBoxId)}" autocomplete="off" autocorrect="off" onkeypress="if (Srch.U.isEnterKey(String.fromCharCode(event.keyCode))) { $getClientControl(this).search(this.value);return Srch.U.cancelEvent(event); }" onkeydown="var ctl = $getClientControl(this);ctl.activateDefaultQuerySuggestionBehavior();" onfocus="var ctl = $getClientControl(this);ctl.hidePrompt();ctl.setBorder(true);" onblur="var ctl = $getClientControl(this);ctl.showPrompt();ctl.setBorder(false);" class="${_ctx.inputClass}" />`);

        /**
         * Navigation
         */
        if (showNavigation) {
            ms_outHtml.push(`<a class="ms-srch-sb-navLink" title="${$htmlEncode(Srch.Res.sb_GoNav)}" id="${$htmlEncode(navButtonId)}" onclick="$getClientControl(this).activateDefaultNavigationBehavior();return Srch.U.cancelEvent(event);" href="javascript: {}">
                                        <img src="${$urlHtmlEncode(imagesUrl)}" class="ms-srch-sbLarge-navImg" id="navImg" alt="${$htmlEncode(Srch.Res.sb_GoNav)}" />
                                    </a>`);
        }
        ms_outHtml.push(`<a title="${$htmlEncode(Srch.Res.sb_GoSearch)}" class="ms-srch-sb-searchLink" id="${$htmlEncode(searchBoxLinkId)}" onclick="$getClientControl(this).search($get('${$scriptEncode(searchBoxId)}').value);" href="javascript: {}">
            					<img src="${$urlHtmlEncode(imagesUrl)}" class="ms-srch-sbLarge-searchImg" id="searchImg" alt="${$htmlEncode(Srch.Res.sb_GoSearch)}" />
                            </a>`);

        /**
         * Query suggestions
         */
        if (showQuerySuggestions) {
            ms_outHtml.push(`<div class="ms-qSuggest-container ms-shadow" id="AutoCompContainer">
                                 <div id="${$htmlEncode(suggestionsListId)}"></div>
                                </div>`);
        }

        /**
         * Navigation
         */
        if (showNavigation) {
            ms_outHtml.push(`<div class="ms-qSuggest-container ms-shadow" id="NavDropdownListContainer">
                                    <div id="${$htmlEncode(navListId)}"></div>
                                </div>`);
        }

        ms_outHtml.push(`</div></div><div id="SearchOptions">`);

        /**
         * Advanced link
         */
        if (ctx.ClientControl.get_showAdvancedLink()) {
            var advancedUrl = ctx.ClientControl.get_advancedSearchPageAddress();
            if (!$isEmptyString(advancedUrl)) {
                ms_outHtml.push(`<div class="ms-srch-sbLarge-link"><a id="AdvancedLink" href="${$urlHtmlEncode(advancedUrl)}">${$htmlEncode(Srch.Res.sb_AdvancedLink)}</a></div>`);
            }
        }

        /**
         * Preferences link
         */
        if (ctx.ClientControl.get_showPreferencesLink()) {
            var preferencesUrl = ctx.ScriptApplicationManager.get_preferencesUrl();
            if (!$isEmptyString(preferencesUrl)) {
                ms_outHtml.push(`<div class="ms-srch-sbLarge-link"><a id="PreferencesLink" href="${$urlHtmlEncode(preferencesUrl)}">${$htmlEncode(Srch.Res.sb_PreferencesLink)}</a></div>`);
            }
        }
        ms_outHtml.push("<div>");

        /**
         * Cache display template data
         */
        if (_ctx.useCache) {
            ctx.DisplayTemplateData = cachePreviousTemplateData;
        }
        return ms_outHtml.join('');
    }

    public set_InputClass(value: string): SearchBoxTemplate {
        this.inputClass = value;
        return this;
    }

    public set_InputClass_showNavigation(value: string): SearchBoxTemplate {
        this.inputClass_showNavigation = value;
        return this;
    }

    public set_SearchBoxDivClass(value: string): SearchBoxTemplate {
        this.searchBoxDivClass = value;
        return this;
    }

    public set_ContainerDivClass(value: string): SearchBoxTemplate {
        this.containerDivClass = value;
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
