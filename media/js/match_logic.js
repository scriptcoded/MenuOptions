    _check_mask : function (e) {
        if ( this.cached['.mo_elem'].val().length === this.options._mask.MaxLen ) {
            if ( this._match_complete() === true ) {
                return;
            } 
        }
        this._is_last_mask_char_valid(e, this.cached['.mo_elem'].val());
    },

    _match_complete : function () {
        if ( this.options._mask.hasOwnProperty('Whole') === false ||
             this.options._mask.hasOwnProperty('MaxLen') === false ) {
            return false;
        }
        var val = this.cached['.mo_elem'].val();
        if ( val.length === this.options._mask.MaxLen ) {
            if ( $.isFunction(this.options._mask.Whole) && this.options._mask.Whole(val, this) === true ) {
                this.__set_help_msg('', 'completed');
                return true;
            } else if (new RegExp(this.options._mask.Whole).test(val) === true ) {
                this.__set_help_msg('', 'completed');
                return true;
            } else {
                return false;
            }
        }
    },

    _build_match_ary : function (event, StrToCheck) {
        var matched = this._match_list_hilited({'StrToCheck': StrToCheck, 'chk_key': false, 'case_ins': true, evt: event});
        if ( /Select/.test(this.options.MenuOptionsType) && matched.length === 0 && this.options._CurrentFilter === '') {
            if ( this._is_last_mask_char_valid(event, StrToCheck) === true ) { 
                this._match_complete();
            } else {
                return this._match_list_hilited({'StrToCheck': this.cached['.mo_elem'].val(), 'chk_key': false, 'case_ins': true, evt: event});
            }
        }
        return matched;
    },

    _add_const : function (StrToCheck) {
        /*--  append constant value to end of string  --*/
        var str_len = StrToCheck.length;
        if (this.options._mask.hasOwnProperty('consts')) {
            for (var x = str_len; str_len < this.options._mask.MaxLen; str_len++) {
                if (this.options._mask.consts.hasOwnProperty(str_len+1)) {
                    this.cached['.mo_elem'].val(this.cached['.mo_elem'].val()+this.options._mask.consts[str_len+1]);
                    if ( this._match_complete() === true ) {
                        return true;
                    }
                } else {
                    break;
                }
            }
        }
        return false;
    },

    _match_list_hilited : function (params) {
        if ( /Select|Rocker/.test(this.options.MenuOptionsType) && params.StrToCheck.length === 0 ) {
                return [];
        }
        if ( /Select/.test(this.options.MenuOptionsType) && this.options._CurrentFilter === '' &&
             this.options.Mask.length > 0 && params.evt.type.length > 0 && /keyup/.test(params.evt.type)) {
             if ( this._is_last_mask_char_valid(params.evt, params.StrToCheck) === true ) { 
                 this._add_const (this.cached['.mo_elem'].val());
             } else {
                 return [];
             }
        } 
        var origImg = "",
            no_img='',
            newval = "",
            re = /(\{|\}|\\|\*|\(|\))|\[|\]/g;
        if ( !/Navigate/i.test(this.options.MenuOptionsType) ) {
            params.StrToCheck=params.StrToCheck.replace(re, '\\$&');
        }
        var RegExStr = params.case_ins ? new RegExp(params.StrToCheck, 'i') : new RegExp(params.StrToCheck);
        var matching = $.map(this.orig_objs, function (o) {
            no_img = o.val.replace(/<img[\w\W]*?>/, '');
            if ( params.chk_key && RegExStr.test(o.ky.toString())) {
                return o;
            }
            if ( RegExStr.test(no_img) ) {
                newval = no_img.replace(RegExStr, '<span style="color:brown;font-size:110%;">' +
                        RegExStr.exec(no_img)[0] + '</span>');
                origImg = o.val.match(/<img[\w\W]*?>/);
                if (origImg) {
                    newval = origImg + newval;
                }
                return { ky: o.ky, val: newval };
            }
        });
        if ( this.options._CurrentFilter.length === 0 ) {
            this.__check_match_results(matching, params.StrToCheck, params.evt);
        }
        return matching;
    },

    __check_match_results : function (matching, StrToCheck, e) {
        if ( matching.length === 0 ) { 
            /*--  if no match and no mask then  cut last char  --*/
            if ( this.options.Mask.length === 0 ) {
                this._cut_last_char(StrToCheck, 'invalid key',e); 
            }
        } else {
            if ( StrToCheck === matching[0].val.replace(/<span[\w\W]*?>|<\/span>/g,'') ) {
                this.__set_help_msg('', 'completed');
            } else if ( matching.length > 1 ) {
                this.cached['.mo_elem'].removeClass('data_good').addClass('data_error'); 
            } else {
                this.__set_help_msg('', 'good');
            }
        }
    },

    __set_help_msg : function (help_msg, err_or_good) {
        switch ( err_or_good ) {
            case 'error':
                $("span#HLP_"+this.options._ID).show()
                        .html('<span style="margin-left:16px">'+help_msg+"</span>")
                        .removeClass('helptext mask_match').addClass('err_text');
                this.cached['.mo_elem'].removeClass('data_good').addClass('data_error'); 
                break;
            case 'completed': 
                if ( $("span#HLP_"+this.options._ID).hasOwnProperty('background-image') && 
                     $("span#HLP_"+this.options._ID).css('background-image').match('greencheck.png') ) {
                    $("span#HLP_"+this.options._ID).show();
                    return;
                }
                this.cached['.mo_elem'].removeClass('data_error').addClass('data_good'); 
                $("span#HLP_"+this.options._ID).show().html('&nbsp;').removeClass('helptext err_text').addClass('mask_match');
                var val = this.cached['.mo_elem'].val();
                this.options._mask_status.mask_passed = true;
                this.__exec_trigger({ 'newCode': val, 'newVal' : val, 'type': "Completed" }); 
                break;
            case 'good':
                help_msg = this.options._mask.hasOwnProperty('Help') ? this.options._mask.Help : '';
                $("span#HLP_"+this.options._ID).show().html(help_msg)
                    .removeClass('err_text mask_match').addClass('helptext');
                break;
        }
        if ( this.cached['.mo_elem'].val().length === 0 ) {
           this.cached['.mo_elem'].removeClass('data_good data_error');
        } else if ( this.cached['.mo_elem'].val().length < this.options._mask.MaxLen ) {
           this.cached['.mo_elem'].removeClass('data_good').addClass('data_error'); 
        }
    },

    _matches : function(StrToCheck, exact) {
        return $.map(this.orig_objs, function (o) { 
            if (exact === 'exact' && StrToCheck === o.val.replace(/<img[\w\W]*?>/, '')) { return o; }
            else if (exact === 'partial' && new RegExp(StrToCheck).test(o.val.replace(/<img[\w\W]*?>/, ''))) { return o; }
        });
    },

    _cut_last_char : function (StrToCheck, err_msg,e) {
        this.cached['.mo_elem'].val(StrToCheck.slice(0, -1));  
        this.__set_help_msg(err_msg, 'error'); 
    },

    _run_valid_mask_test : function (e, StrToCheck, str_len) {
        if ( this.options._mask.hasOwnProperty('consts') && 
             this.options._mask.consts[str_len] ) {
            if ( this.cached['.mo_elem'].val().substring(str_len-1,str_len) !== this.options._mask.consts[str_len]) {
                this.cached['.mo_elem'].val(this.cached['.mo_elem'].val().substring(0,str_len-1));
            } 
        } else if ( this.options._mask.hasOwnProperty('valid') &&
                this.options._mask.valid.hasOwnProperty(str_len)) {
            if ( $.isFunction(this.options._mask.valid[str_len])){
                this.options._mask.valid[str_len](this.cached['.mo_elem'].val(),this);
            } else if (this.options._mask.valid[str_len].hasOwnProperty('max_val')) {
                var max_val = this.options._mask.valid[str_len].max_val;
                if ( ! new RegExp('[0-'+max_val+']').test(this.cached['.mo_elem'].val()[str_len-1])) {
                    this.cached['.mo_elem'].val(this.cached['.mo_elem'].val().substring(0,str_len-1));
                    this.__set_help_msg('0 - '+max_val+' only', 'error');
                }  
            }
        }
    },

    _valid_test : function (e, StrToCheck) {
        var str_len = StrToCheck.length;
        if ( StrToCheck.length > this.options._mask.MaxLen ) {
            this.cached['.mo_elem'].val(StrToCheck.substring(0, this.options._mask.MaxLen));
        }
        for (var x = str_len; str_len > 0; str_len--) {
            this._run_valid_mask_test(e, StrToCheck, str_len);
            if ( this.cached['.mo_elem'].val().length === 0 ) {
                return true;
            }
        }
        this._add_const (this.cached['.mo_elem'].val());
        this.__set_help_msg('', '');
        return true; 
    },

    _is_last_mask_char_valid : function (e, StrToCheck) {
        if ( StrToCheck.length > this.options._mask.MaxLen ) {
            this.cached['.mo_elem'].val(StrToCheck.substring(0, this.options._mask.MaxLen));
            return true;
        }
        if ( this.options._mask.hasOwnProperty('hotkey') &&
             this.options._mask.hotkey.hasOwnProperty(StrToCheck.length)) {
               if (this.options._mask.hotkey[StrToCheck.length](StrToCheck,this) === true) {
                    this.__set_help_msg('', 'good');
                    return true;
               }
        }
        if ( this.options._mask.hasOwnProperty('valid') &&
             this.options._mask.valid.hasOwnProperty(StrToCheck.length) ||
             this.options._mask.hasOwnProperty('consts') &&
             this.options._mask.consts.hasOwnProperty(StrToCheck.length)) {
            return this._valid_test(e, StrToCheck);
        }
    },

    _process_matches : function (event, StrToCheck) {
        var matching = [];
        if (StrToCheck !== '') {
            matching = this._build_match_ary(event, StrToCheck); 
            this.cached['.dropdownspan'].remove();
        }
        if (matching.length > 0) {
            // re-create drop down select
            this._build_filtered_dropdown(event, matching);
        } else {
            this._buildWholeDropDown(event);
        }
    },
