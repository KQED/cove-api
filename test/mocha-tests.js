var demand  = require('must'),
    assert  = require('assert'),
    COVEApi = require('./../');

// These work in a limited capacity
var sandbox_options = {
    api_id          : 'Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821',
    api_secret      : 'f650d902-5657-4881-a305-ed96ccae551d',
};

// These creds do not work with the api
var bad_options = {
    api_id : 'test-abc-123',
    api_secret : '843e62bafd4573263e439a2463b4fe78b9a0b14c'
};


var coveAPI = new COVEApi(sandbox_options);

describe("COVE API Module", function() {
    this.timeout(10000); // The PBS API is slow.

    it("Should be creatable", function(){
        coveAPI.must.be.an.instanceof(COVEApi);
    });

    it("Should generate a nonce that is 32 characters and a string", function(){
        var nonce = coveAPI.generateNonce();
        nonce.must.be.a.string();
        nonce.must.have.length(32);
    });

    it("Should allow api_id and api_secret to be set", function (){
        var dummy_options = {
            api_id          : 'TEST123',
            api_secret      : 'TEST456'
        };
        coveAPI.setAuth(dummy_options);
        coveAPI.api_id.must.equal(dummy_options.api_id);
        coveAPI.api_secret.must.equal(dummy_options.api_secret);
    });

    it("Should properly normalize a url", function (){
        var url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            correctly_normalized = 'http://api.pbs.org/cove/v1/videos/?consumer_key=TEST123&fields=tp_media_object_id%2Ctitle%2Cassociated_images&filter_mediafile_set__video_encoding__mime_type=application%2Fx-mpegURL&filter_nola_root=SOTM&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });

    it("Should produce a correct signature", function (){
        var nonce = '66486f690b8030fa661e315749ff5d95',
            timestamp = '1430872773',
            url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            expected_sig = '3717f89ea68b0b792f790370374d14a682033aa4';

        var normalized_url = coveAPI.normalizeUrl(url, timestamp, nonce);

        var sig = coveAPI.generateSignature(normalized_url, timestamp, nonce);

        sig.must.be.equal.to(expected_sig);
    });

    // This follows the docs
    // https://projects.pbs.org/confluence/display/coveapi/Authentication#Authentication-Creatingthesignature
    it("Should produce a correct signature using example params from docs", function (){
        var options = bad_options,
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
        var options = sandbox_options,
            nonce = 'c21d32917b0e71febd9',
            timestamp = '1288144873',
            url = 'http://api.pbs.org/cove/v1/videos/?filter_nola_root=SOTM&filter_mediafile_set__video_encoding__mime_type=application/x-mpegURL&fields=tp_media_object_id,title,associated_images',
            expected_url = 'http://api.pbs.org/cove/v1/videos/?consumer_key=Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821&fields=tp_media_object_id%2Ctitle%2Cassociated_images&filter_mediafile_set__video_encoding__mime_type=application%2Fx-mpegURL&filter_nola_root=SOTM&nonce=c21d32917b0e71febd9&timestamp=1288144873&signature=c4a818cb1c59763e0d25e2a1422730c086e44ef2';

        coveAPI.setAuth(options);

        var normalized_url = coveAPI.normalizeUrl(url, timestamp, nonce),
            signed_url = coveAPI.signUrl(normalized_url, timestamp, nonce);

        signed_url.must.be.equal.to(expected_url);
    });

    it("Should properly normalize a URL with spaces and ':'", function (){
        var url = 'http://api.pbs.org/cove/v1/programs/?filter_title=A Raisin in the Sun Revisited: The Raisin Cycle at Center Stage';
            correctly_normalized = 'http://api.pbs.org/cove/v1/programs/?consumer_key=Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821&filter_title=A+Raisin+in+the+Sun+Revisited%3A+The+Raisin+Cycle+at+Center+Stage&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });

    it("Should properly normalize a URL with single quote in it", function (){
        var url = "http://api.pbs.org/cove/v1/programs/?filter_title=Cat's Meow";
            correctly_normalized = 'http://api.pbs.org/cove/v1/programs/?consumer_key=Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821&filter_title=Cat%27s+Meow&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });

    it("Should properly normalize a URL with exclamation point in it", function (){
        var url = "http://api.pbs.org/cove/v1/programs/?filter_title=Check Please!";
            correctly_normalized = 'http://api.pbs.org/cove/v1/programs/?consumer_key=Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821&filter_title=Check+Please%21&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });

    it("Should properly normalize a URL with a comma in it", function (){
        var url = "http://api.pbs.org/cove/v1/programs/?filter_title=Check, Please";
            correctly_normalized = 'http://api.pbs.org/cove/v1/programs/?consumer_key=Public-Destination-07c5773f-344f-4dd4-a3d1-e1e85157f821&filter_title=Check%2C+Please&nonce=66486f690b8030fa661e315749ff5d95&timestamp=1430872773';

        var normalized_url = coveAPI.normalizeUrl(url, '1430872773', '66486f690b8030fa661e315749ff5d95');

        normalized_url.must.be.equal.to(correctly_normalized);
    });




    it("Should make a successful request and retrieve data (Promises)", function (finished){
        var url = 'http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images';

        coveAPI.setAuth(sandbox_options);
        var options = {};
        coveAPI.request(url, options)
        .then(function(data){
            data.must.be.an.object();
            data.results.must.be.an.array();
            data.results.length.must.be.at.least(1);
            data.count.must.be.at.least(1);
            finished();
        })
        .catch(function(err){
            err.statusCode.must.be(200);
            finished();
        })
        .done();
    });

    it("Should make a successful request and retrieve data (Async)", function (finished){
        var url = 'http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images';

        coveAPI.setAuth(sandbox_options);
        var options = {};
        coveAPI.request_async(url, options, function(err, data){
            if (err) {
                err.statusCode.must.be(200);
                finished();
            } else {
                data.must.be.an.object();
                data.results.must.be.an.array();
                data.results.length.must.be.at.least(1);
                data.count.must.be.at.least(1);
                finished();
            }
        });
    });

    it("Should return a COVE error on a bad request (Async)", function (finished){
        var url = 'http://api.pbs.org/cove/v1/programs/?order_by=-available_datetime&filter_availability_status=Available&filter_title=Nova';

        coveAPI.setAuth(sandbox_options);

        var options = {};
        coveAPI.request_async(url, options, function(err, data){
            if (err) {
                err.statusCode.must.be(500);
                err.must.be.an.object();
                err.statusCode.must.be.a.number();
                finished();
            } else {
                data.must.not.be.an.object();
                finished();
            }
        });
    });
});