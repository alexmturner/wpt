// META: script=/resources/WebIDLParser.js
// META: script=/resources/idlharness.js
setup(function() {
    var request = new XMLHttpRequest();
    request.open("GET", "../interfaces/WebCryptoAPI.idl");
    request.send();
    request.onload = function() {
        var idl_array = new IdlArray();
        var idls = request.responseText;

        idl_array.add_untested_idls("[Global] interface Window { };");

        idl_array.add_untested_idls("interface ArrayBuffer {};");
        idl_array.add_untested_idls("interface ArrayBufferView {};");

        idl_array.add_idls(idls);

        idl_array.add_objects({"Crypto":["crypto"], "SubtleCrypto":["crypto.subtle"]});

        idl_array.test();
        done();
    };
}, {explicit_done: true});
