var demand  = require('must'),
    assert  = require('assert'),
    moment  = require('moment'),
    COVEApi = require('./../');


var options = {
    api_id          : process.env.COVE_API_ID || null,
    api_secret      : process.env.COVE_API_SECRET || null,
    log_level       : 'debug'
};

if (options.api_id === null) {
    console.log('DEFINE: export COVE_API_ID="YOUR COVE API_ID"');
}
if (options.api_secret === null) {
    console.log('DEFINE: export COVE_API_SECRET="YOUR COVE API_SECRET"');
}

var coveAPI = new COVEApi(options);

describe("COVE API ", function() {
    it("must be creatable", function(){
        coveAPI.must.be.an.instanceof(COVEApi);
    });

    it("should generate a nonce that is 32 characters and a string", function(){
        var nonce = coveAPI.generateNonce();
        nonce.must.be.a.string();
        nonce.must.have.length(32);
    });

    it("Should properly normalize a url", function (){
        var url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images';
    });

});