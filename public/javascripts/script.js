var es = new EventSource('/mainchain/stream');

es.onmessage = function (event) {
    console.log("asd");
    //console.log(event.data);
};
es.addEventListener('message', function (event) {
    document.getElementById('test') = "asd";
    console.log(event.data);
});
