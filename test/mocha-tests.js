var demand  = require('must'),
    assert  = require('assert'),
    moment  = require('moment'),
    COVEApi = require('./../');

var api_id =  process.env.COVE_API_ID || null,
    api_secret = process.env.COVE_API_SECRET || null;

var options = {
    api_id          : api_id,
    api_secret      : api_secret,
    log_level       : 'debug'
};

var dummy_options = {
    api_id          : 'TEST123',
    api_secret      : 'TEST456'
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

    it("Should allow api_id and api_secret to be set", function (){
        coveAPI.setAuth(dummy_options);
        coveAPI.api_id.must.equal(dummy_options.api_id);
        coveAPI.api_secret.must.equal(dummy_options.api_secret);
    });

    it("Should properly normalize a url", function (){
        var url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            correctly_normalized = 'http://api.pbs.org/cove/v1/videos/?consumer_key=TEST123&fields=tp_media_object_id%252Ctitle%252Cassociated_images&filter_mediafile_set__video_encoding__mime_type=application%252Fx-mpegURL&filter_nola_root=SOTM&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });
});