$(function(){
        
        var l = console.log.bind(console)

        String.prototype.leading = function(chara, digit){
            var digit = digit == undefined ? 4 : digit;
            var lack = digit - this.length
            var leading = '';
            for(var i = 0; i < lack; i++){
                leading += chara.toString()
            }
            return leading + this
        }


        var timer = new Timer($('.titer'))


        var solveLock = false;
        $('#crack-btn').click(function(){
            if(solveLock)
                return false;
            solveLock = true
            run('solve', function(res){
                if(res)
                    changeStatus('solved')
                solveLock = false;
            })

        })

        var scanLock = false;
        $('#scan-btn').click(function(res){
            if(scanLock)
                return false;
            scanLock = true

            run('scan', function(res){
                if(res)
                    changeStatus('scaned')
                scanLock = false;
            })
        })

        function run(action,callback){
            changeStatus('running')
            var draft = dataCollector();
            timer.run()
            var w = new Worker('js/worker.js')
            var data = {
                draft : draft,
                action : action,
            }
            // l(JSON.stringify(data.draft))
            // console.log(data.draft[0][0][0][0])

            w.postMessage(data)
            // l('aa')
            w.onmessage = function(e){
                // l(JSON.parse(e.data))
                if(e.data !== false){
                    cracker.init(JSON.parse(e.data))
                    // l('aa')
                    cracker.action = action
                    // l(cracker.draft)
                    // return
                    output(cracker)
                }else{
                    changeStatus('noSolution')
                }

                timer.stop()
                w.terminate()  
                callback(e.data)              
            }

        }

        function changeStatus(status){
            var state = {
                entering : '请输入数字',
                running : '正在计算',
                solved : '解题成功',
                scaned : '扫描完毕',
                noSolution : '数独无解'
            }
            $('.note').text(state[status])
        }

        $('#restore-btn').click(function(){
            cracker.iterator(function(item, index){
                var $input = $('input[data-no="' + index.join('') + '"]')
                var $span = $input.siblings('.show_num')
                if(!$span.hasClass('cell-origin') || $span.text() == ''){
                    clearClass($span)
                    $span.text('')
                    $input.val('')
                }
            })
        })

        $('#restore-btn').click(function(){
            cracker.iterator(function(item, index){
                var $input = $('input[data-no="' + index.join('') + '"]').val('')
                var $span = $input.siblings('.show_num').text('')
                clearClass($span)
            })
            changeStatus('entering')
        })


        var output = function(cracker){
            // l(cracker.draft)
            // return
                // l('aa')
            cracker.iterator(function(item, index){
                // l(item)
                var $span = $('input[data-no="' + index.join('') + '"]').siblings('.show_num')
                if(item.length == 1){
                    if(!$span.hasClass('cell-origin')){
                        clearClass($span)
                        $span.addClass('cell-certain')
                        $span.text(item.join(','))
                    }
                }else{
                    // l('longger than 1')
                    if(cracker.action == 'scan'){
                        // l('scan')
                        // alert('scan')
                        clearClass($span)
                        $span.addClass('cell-option')

                        $span.text(item.join(','))
                    }
                }
            })
        }

        function dataCollector(){

            var stack = [];
            for(var i = 0; i < 3; i++){
                if(stack[i] == undefined)
                    stack[i] = []
                for(var j = 0; j < 3; j++){
                    if(stack[i][j] == undefined)
                        stack[i][j] = []
                    for(var m = 0; m < 3; m++){
                        if(stack[i][j][m] == undefined)
                            stack[i][j][m] = []
                        for(var n = 0; n < 3; n++){
                            var $input = $('input[data-no="'+ i + j + m + n +'"]');
                            var val = $input.val();
                            // l(val)
                            // return
                            stack[i][j][m][n] = val == '' ? '' : parseInt(val)

                            $span = $input.siblings('.show_num')
                            // l($span)
                            clearClass($span)
                            if(val != '')
                                $span.addClass('cell-origin')
                            else
                                $span.text('')
                        }
                    }
                }
            }
            // l(stack)
            return stack;
        }

        var clearClass = function($ele){
            $ele.prop('class', 'show_num')
        }


        
        $('.text').focus(function(){
            $('.wrap.input_focus').attr('class','wrap');
            $(this).parent('.wrap').attr('class','wrap input_focus');

        })
        .change(function(event){
            var regx=/^\d{1}$/g;
            if(!regx.test($(this).val())){
                $(this).val('');
            }
            
        })
        .keydown(function(event){

            var event = event || window.event;
            event.preventDefault()

            var code = event.keyCode || event.which
            // l(code)
            if(code == 8 || code == 32){
                $(event.target).next('.show_num').text('');
            }
            // if(code ==)

            var no = $(this).data('no').toString()
            var dec = parseInt(no, 3)
            // var dec = no.toString()
            var $span = $(this).siblings('.show_num')
            clearClass($span);
            $span.addClass('cell-origin')

            switch(code){

                case 37: //×ó¼ü
                    if(no[1] == 0 && no[3] == 0){
                        dec += 20
                    }else{
                        if(dec % 3 == 0){
                            dec -= 7 
                        }else{
                            dec--
                        }
                    }
                    // l(dec.toString(3).leading('0'))
                    $('input[data-no="' + dec.toString(3).leading('0') + '"]').focus()
                    break;
                case 38: //ÉÏ
                    if(no[0] == 0 && no[2] == 0){
                        dec += 60
                    }else{
                        if(no[2] == 0){
                            dec -= 21 
                        }else{
                            dec -= 3
                        }
                    }
                    // l(dec.toString(3).leading('0'))
                    $('input[data-no="' + dec.toString(3).leading('0') + '"]').focus()

                    break;
                case 39://向右
                    if(no[1] == 2 && no[3] == 2){
                        dec -= 20
                    }else{
                        if(no[3] == 2){
                            dec += 7 
                        }else{
                            dec ++
                        }
                    }
                    $('input[data-no="' + dec.toString(3).leading('0') + '"]').focus()

                    break;
                case 40: //ÏÂ
                    if(no[0] == 2 && no[2] == 2){
                        dec -= 60
                    }else{
                        if(no[2] == 2){
                            dec += 21 
                        }else{
                            dec += 3
                        }
                    }
                    $('input[data-no="' + dec.toString(3).leading('0') + '"]').focus()

                    break;
            }


            // var value = String.fromCharCode(code);
            var value;
            if(code >= 49 && code <= 57){
                value = code - 48
            }else if(code >= 97 && code <= 105){
                value = code -96;
            }

            if(value != undefined){
                $(this).val(value)
                $span.text(value)
            }

        })
        
        
        
        

        
    })
    
   
    