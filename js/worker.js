importScripts('cracker.js')

onmessage = function(e){
    // returned
   cracker.init(e.data.draft);
    // console.log(cracker.draft)
    // console.log(cracker.draft[0][0][0][0])
    // console.log(e.data.action)
    var res = eval('cracker.' + e.data.action + '()');
    // console.log(res)
    // if(res != false)
        var msg = res === false ? false : JSON.stringify(cracker.draft)

   postMessage(msg)
}     
