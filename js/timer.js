    function Timer($titer){

        this.update = function(str){
            var spliter = str.split(/[:\.]/)
            this.min = spliter[0]
            this.sec = spliter[1]
            this.milli = spliter[2]
        }

        this.titer = $titer
        var current = '00:00.00'
        this.update(current)
        // this.runner = null

        // public
        this.toString = function(){
            return leadingZero(this.min) + ':' + leadingZero(this.sec) + '.' + leadingZero(this.milli)
        }

        this.run = function(){

            var This = this
            this.runner = setInterval(function(){
            // setInterval(function(){
                // l('aa')
                // l(this)
                current = This.increase().toString()
                $titer.text(current)
            }, 10)
            // this.runner = runner
            // l(this.runner)
        }

        this.stop = function(){
            clearInterval(this.runner)
            this.reset()
        }

        this.increase = function(){
            this.milli++
            if(this.milli == 100){
                this.milli = 0
                this.sec++
            }

            if(this.sec == 60){
                this.min++
                this.sec = 0
            }

            if(this.min == 60)
                this.min = 0

            return this;
        }

        this.reset = function(){
            this.milli = this.sec = this.min = 0
        }

        var leadingZero = function(input){
            var input = typeof input == 'String' ? input : input.toString()
            return input.length == 1 ? '0' + input : input;
        }
    }