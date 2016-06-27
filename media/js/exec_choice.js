    __exec_trigger : function(params) {
        var newVal = $.trim(params.newVal);
        this.cached['.mo_elem'].val(newVal);
        this.cached['.mo_elem'].attr('menu_opt_key',params.newCode);
        this._trigger("onSelect", this, {
            "newCode": params.newCode,
            "newVal" : newVal,
            "type": params.type
        });
        if ( ! /Rocker/i.test(this.options.MenuOptionsType) ) {
            this.cached['.mo_elem'].removeClass('data_error').addClass('data_good'); 
            $("span#HLP_"+this.options._ID).show().html('&nbsp;').removeClass('helptext err_text').addClass('mask_match');
        }
    },

    _run_menu_item : function (e) {
        // the replace below is to strip out images
        var SelectedCellValue = $(e.target).text(),
            hilited = $('.CrEaTeDtAbLeStYlE tr td.mo'),
            MatchedObjects = [];
        if (hilited.length > 0) {
            SelectedCellValue = hilited.text();
        }
        MatchedObjects = $.grep(this.ary_of_objs, function (rec) {
            return SelectedCellValue === rec.val.replace(/^< *img[\w\W]*?>/, '');
        });
        if (MatchedObjects && MatchedObjects.length > 0) {
            if ($.isFunction(MatchedObjects[0].ky)) {
                MatchedObjects[0].ky.call();
            } else {
                if (! $(e.target).hasOwnProperty('class') || ! /^divider$/i.test((e.target).attr('class'))) {
                    if (/^new$/i.test(this.options.Window)) {
                        window.open(MatchedObjects[0].ky);
                    } else {
                        window.open(MatchedObjects[0].ky, "_self");
                    }
                }
            }
        }
    },

    _choice_selected : function (e) {
        if (/^ *divider *$/i.test($(e.target).attr('class'))) {
            return;
        }
        this.options._prev.event = e.type;
        if ( /Select/i.test(this.options.MenuOptionsType) ) {
            this.__exec_trigger({ 'newCode': $(e.target).closest('td').attr('menu_opt_key'),
                              'newVal' : $(e.target).closest('td').text(), 'type': "Click" });
            e.target.className = e.target.className.replace(/ mo/, '');
        } else {
            this._run_menu_item(e);
        }
        /*--  remove mouseover class in the cached elements  --*/
        $(this.cached['.dropdowncells']).removeClass('mo');
        // once user clicks their choice, remove dropdown span from DOM
        $('span#SP_' + this.options._ID).remove();
    },
