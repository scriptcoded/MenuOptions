                'FixedLen' : 8,
                'HelpMsg': 'YYYYMMDD',
                'hotkey' : { 1: function( val,obj ) { return obj._date_hotkeys({'val': val,'ofs':1, 'fmt': 'YMD'}); } }, 
                'valid' : { 1: { max_val: 9 },
                            2: { max_val: 9 },
                            3: { max_val: 9 },
                            4: { max_val: 9 },
                            5: { max_val: 1 },
                            6: function( val,obj ) { return /1/.test(val[4]) ? obj._max_val_test(val,2,5) : obj._max_val_test(val,9,5); },
                            7: function( val, obj ) { return obj._get_days(val,'YMD'); },
                            8: function( val, obj ) { return obj._get_days(val,'YMD'); } }, 
                'Whole' : function( val, obj ) { return obj._get_days(val,'YMD'); }
