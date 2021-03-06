    _mask_vars : function() {
        return {
            'HH:MM AM' : { 
                #import 12hr_time_mask.js
            },
            'Mon DD, YYYY' : { 
                #import mon_dd_yyyy_mask.js
            },
            'YYYYMMDD' : { 
                #import yyyymmdd_mask.js
            },
            'USphone' : { 
                #import phone_mask.js
            },
            'Money' : { 
                #import money_mask.js
            },
            'CredCdExp' : {
                #import cc_exp.js
            }
        };
    },

    _set_initial_mask_value : function ( flag ) {
        var val, ofs;
        if ( this.cached['.mo_elem'].val().length === 0 ) {
            if ( this.options._mask.hasOwnProperty('initial') ) {
                if ( this.options._mask.initial.hasOwnProperty('val') ) {
                    val = this.options._mask.initial.val;
                    this.element.val(val);
                }
                if ( this.options._mask.initial.hasOwnProperty('ofs') ) {
                    ofs = val.length - this.options._mask.initial.ofs;
                    this.element.focus().get(0).setSelectionRange(ofs,ofs);
                    if ( /blur/i.test(flag) ) {
                        this.element.blur();
                    }
                }
            }
        }
    },

    _set_valid_mask : function () {
        if ( /RegExp/.test(this.options.Mask) ) {
            return; // user defined regexp skips this setup logic
        }
        var mo_type = this._test_mask_cfg();
        if ( ! /^mask/i.test(mo_type)) {
            return;
        }
        var all_masks = this._mask_vars();
        if ( this.options.Mask.length > 0 ) {
            if ( all_masks.hasOwnProperty(this.options.Mask) ) {
                this.options._mask = all_masks[this.options.Mask];
                $(this.element).prop('FixedLength', this.options._mask.FixedLen);
            } else {
                return this._validation_fail(this.options.Mask+" is not a valid mask.",'fatal');
            }
        }
    },

    _initial_bg : function ( params ) {
        if ( new RegExp(params.mask.Whole).test(this.element.val()) === true ) {
           this._set_bg_color('good');
        } else {
           this._set_bg_color('err');
        }
    },

     _initial_MdY : function ( params ) { 
         var val = this.element.val();
         if ( params.mask.FixedLen === val.length && this._get_days(val,'MdY') === true ) {
            this._set_bg_color('good');
            $(this.element).attr('menu_opt_key', val);
         }
     }, 

    _initial_money : function ( params ){
        var raw_data=this.element.val().replace(new RegExp('[^'+params.valid_regex+']', 'g'), '');
        var mony = this._money_init();
        this._money_output(mony);
        this._initial_bg( params );
    },

    _initial_phone : function ( params ){
        var raw_data=this.element.val().replace(new RegExp('[^'+params.valid_regex+']', 'g'), ''),
            consts = params.mask.consts,
            len = params.mask.FixedLen,
            fmted_str = '',
            nums_only = raw_data;
        if ( this.cached['.mo_elem'].val().length === 0 ) {
            fmted_str = consts[1];
        } else {
            for ( var x = 1; x <= len; x++) {
                if ( consts.hasOwnProperty(x) ) {
                    fmted_str = fmted_str + consts[x];
                } else {
                    fmted_str = fmted_str + raw_data.charAt(0);
                    raw_data = raw_data.substring(1);
                }
            }
        }
        this.element.val(fmted_str);
        this.element.attr('menu_opt_key', nums_only);
        this._initial_bg( params );
    },

