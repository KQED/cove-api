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

describe("COVE API Module", function() {
    it("Should be creatable", function(){
        coveAPI.must.be.an.instanceof(COVEApi);
    });

    it("Should generate a nonce that is 32 characters and a string", function(){
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

    it("Should produce a correct signature", function (){
        var nonce = '66486f690b8030fa661e315749ff5d95',
            timestamp = '1430872773',
            url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            expected_sig = '8092d5ec042cbcf46e9312f1c32dbfd836aa5688';

        var normalized_url = coveAPI.normalizeUrl(url, timestamp, nonce);

        var sig = coveAPI.generateSignature(normalized_url, timestamp, nonce);

        sig.must.be.equal.to(expected_sig);
    });

    // This follows the docs
    // https://projects.pbs.org/confluence/display/coveapi/Authentication#Authentication-Creatingthesignature
    it("Should produce a correct signature using example params from docs", function (){
        var options = {
                api_id : 'test-abc-123',
                api_secret : '843e62bafd4573263e439a2463b4fe78b9a0b14c'
            },
            nonce = 'abcdef-tuv-wxyz',
            timestamp = '12345',
            url = 'http://api.pbs.org/cove/v1/videos?format=json&filter_nola_root=NOVA&filter_type=Episode',
            expected_sig = '3231b9c2b2f247d31aa8bc6495615e0ad8f8b665';

        coveAPI.setAuth(options);

        var normalized_url = coveAPI.normalizeUrl(url, timestamp, nonce),
            sig = coveAPI.generateSignature(normalized_url, timestamp, nonce);

        sig.must.be.equal.to(expected_sig);
    });

    // This follows the docs
    // https://projects.pbs.org/confluence/display/coveapi/Authentication#Authentication-Creatingthesignature
    it("Should produce a correctly normalized and signed URL", function (){
        var options = {
                api_id : 'JOSHTEST-171ca88c-e987-4a06-a3f7-d46f2d6fa272',
                api_secret : '1e7321e3-30f5-4df1-82a0-c4dd283b5f65'
            },
            nonce = 'c21d32917b0e71febd9',
            timestamp = '1288144873',
            url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            expected_url = 'http://api.pbs.org/cove/v1/videos/?consumer_key=JOSHTEST-171ca88c-e987-4a06-a3f7-d46f2d6fa272&fields=tp_media_object_id%252Ctitle%252Cassociated_images&filter_mediafile_set__video_encoding__mime_type=application%252Fx-mpegURL&filter_nola_root=SOTM&nonce=c21d32917b0e71febd9&timestamp=1288144873&signature=0a2d687dd230aad395db7591b5e68643c96a25f7';

        coveAPI.setAuth(options);

        var normalized_url = coveAPI.normalizeUrl(url, timestamp, nonce),
            signed_url = coveAPI.signUrl(normalized_url, timestamp, nonce);

        signed_url.must.be.equal.to(expected_url);
    });

});