/**
 * Sudoku Cracker
 * Liang<cloudsthere@164.com>
 * @type {Object}
 */
var l = console.log.bind(console)
var cracker = {
    draft:[],
    usedTime : 0,
    scanSwitch : false,
    action:'',
    Natural : [1, 2, 3, 4, 5, 6, 7, 8, 9],
    
    _clone : function(obj){
        var clone = obj instanceof Array ? [] : {}
        for(var key in obj){
            if(obj.hasOwnProperty(key))
                clone[key] = typeof obj[key] == 'object' ? cracker._clone(obj[key]) : obj[key]
        }
        return clone;
    },
    _diff : function(ref, tar){
        for(var i = 0; i < ref.length; i++){

            do{

                var index = tar.indexOf(ref[i]);
                if(index != -1){
                     tar.splice(index, 1)
                }
            }while(index != -1)
        }
        return tar;

    },
    init : function(draft){
        // l(draft)
        cracker.draft = draft
        cracker._format()
    },
    solve : function(){
        cracker.action = 'solve';
        var start = (new Date).getTime()
        var r = cracker._scanAll()
        cracker.debug('初始扫描，剩余不确定个数: ' + cracker._countSingle(true))

        if(!r){
            cracker.debug('数解无解')
            return false;
        }
        r = cracker.trail();
        if(!r){
            cracker.debug('数解无解')
            return false;
        }

        var end = (new Date).getTime()
        cracker.usedTime = end - start

        cracker.debug('耗时: ' + (cracker.usedTime / 1000))

        return cracker.draft;
    },
    scan : function(){
        cracker.action = 'scan'
        var r = cracker._scanAll();
        if(!r){
            cracker.debug('数解无解')
            return false;
        }
        return cracker.draft
    },
    _randomSplice : function(arr){
        var i = Math.floor(Math.random() * arr.length)
        return arr.splice(i, 1);
    },

    trail : function(){

        cracker.debug('进入试错模式')

        var level = 0;
        var record = []

        outter : while(!cracker._success()){

            cracker.debug('进入第' + level + '层')

            if(record[level] == undefined){
                var ele = cracker._selectElement()
                record[level] = {
                    candidateIndex : ele['index'],
                    candidateKey : ele['key'],
                }
            }

            cracker.debug('选择' + record[level]['candidateIndex'].join('') + '作为候选元素')
            cracker.debug('候选值有:' + record[level]['candidateKey'].join(''))

            // 如果有候选
            while(record[level]['candidateKey'].length > 0){
                // 寻找最小keyCount
                record[level]['candidate'] = cracker._randomSplice(record[level]['candidateKey'])
                cracker.debug('选择' + record[level]['candidate'].join('') + '作为候选值')
                // 保存当前draft
                record[level]['reservedDraft'] = cracker._clone(cracker.draft);
                // 赋值
                cracker.draft[record[level]['candidateIndex'][0]][record[level]['candidateIndex'][1]][record[level]['candidateIndex'][2]][record[level]['candidateIndex'][3]] = record[level]['candidate']
                // 扫描
                var res = cracker._scanAll();
                // 处理
                if(res){
                    var singleCount = cracker._countSingle()
                    if(singleCount == 81){
                        cracker.debug('解题成功，退出试错模式')
                        return true
                    }else{
                        // 进入下一层
                        level++
                        cracker.debug('无冲突,且未填满，剩余不确定空格数' + singleCount)
                        continue outter;
                    }
                }else{
                    // 冲突       
                    cracker.draft = record[level]['reservedDraft']
                    cracker.debug('冲突')
                }
            }

            // 退层
            if(record[level]['candidateKey'].length == 0){
                delete record[level]
                level--
                cracker.debug('退至第' + level + '层')
                if(level < 0){
                    cracker.debug('数独无解')
                    return false;
                }
                // 还原
                cracker.draft = record[level]['reservedDraft']
            }
        }

        cracker.debug('解题成功，退出试错模式')

    },
    // 按key的数量，从少到多排列
    _selectElement : function(){
        var ele = []
        cracker.iterator(function(key, index){
            if(key.length > 1)
                ele.push([index, key])
        })
        ele.sort(function(m, n){
            return m[1].length - n[1].length
        })
        return {
            index : ele[0][0], 
            key : ele[0][1]
        }
    },
    _scanAll : function(){
        do{
            cracker.scanSwitch = false;
            var r = cracker._scanOnce()
            if(!r)
                return false;
        }while(cracker.scanSwitch)
        return true;
    },
    _countSingle : function(reverse){
        var count = 0;
        cracker.iterator(function(item, index){
            if(item.length == 1)
                count++
        })
        return reverse ? 81 - count : count;
    },
    _success : function(){
        return cracker._countSingle() == 81
    },
    _scanOnce : function(){

        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                for(var m = 0; m < 3; m++){
                    for(var n = 0; n < 3; n++){
                        // 以此元素为基准，扫描其他元素
                        if(cracker.draft[i][j][m][n].length == 1){
                            for(var p = 0; p < 3; p++){
                                for(var q = 0; q < 3; q++){
                                    // 行
                                    var keyCount
                                    if(!(j == p && n == q)){
                                        keyCount = cracker.draft[i][p][m][q].length
                                        cracker.draft[i][p][m][q] = cracker._diff(cracker.draft[i][j][m][n], cracker.draft[i][p][m][q])

                                        if(keyCount > 1 && cracker.draft[i][p][m][q].length ==1)
                                            cracker.scanSwitch = true
                                        if(cracker.draft[i][p][m][q].length == 0){
                                            cracker.debug('row : key长度为0---------------------', [i, p, m, q])       
                                            return false;
                                        }
                                    }

                                    // 列
                                    if(!(i == p && m == q)){
                                        keyCount = cracker.draft[p][j][q][n].length
                                        cracker.draft[p][j][q][n] = cracker._diff(cracker.draft[i][j][m][n], cracker.draft[p][j][q][n])

                                        if(keyCount > 1 && cracker.draft[p][j][q][n].length ==1)
                                            cracker.scanSwitch = true

                                        if(cracker.draft[p][j][q][n].length == 0){
                                            cracker.debug('column:key长度为0------------------------------', [p, j, q, n])       
                                            return false;
                                        }
                                    }

                                    // 块
                                    if(!(m == p && n == q)){
                                        keyCount = cracker.draft[i][j][p][q].length
                                        cracker.draft[i][j][p][q] = cracker._diff(cracker.draft[i][j][m][n], cracker.draft[i][j][p][q])

                                        if(keyCount > 1 && cracker.draft[i][j][p][q].length == 1)
                                            cracker.scanSwitch = true

                                        if(cracker.draft[i][j][p][q].length == 0){
                                            cracker.debug('block : key长度为0-----------------------------', [i, j, p, q])       
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    },
    debug : function(msg, index){
        var output = ''
        output += index == undefined ? '' : index.join('') + ':';
        output += msg
        console.log(output)
    },

    _format : function (){
        cracker.iterator(function(item){
            if(item == '')
                return cracker._clone(cracker.Natural)
            else{
                if(! (item instanceof Array)){
                    return [item]
                }
            }
        }, true)
    },
    iterator : function(callback, returned){
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                for(var m = 0; m < 3; m++){
                    for(var n = 0; n < 3; n++){
                        var returned = callback(cracker.draft[i][j][m][n], [i, j, m, n])
                        if(returned)
                            cracker.draft[i][j][m][n] = returned
                    }
                }
            }
        }
    }

    
}

