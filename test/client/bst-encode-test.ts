/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTEncode} from "../../lib/client/bst-encode";

const awsAccessKeyId = process.env["AWS_ACCESS_KEY_ID"];
const awsSecretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"];

describe("BSTEncode", function() {

    describe("#encodeAndPublishURL()", function() {
        it("Encodes and Publishes a URL", function (done) {
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/xapp-alexa/UnitTestOutput.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL that is m4a", function (done) {
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/bespoken/encoded/ContentPromoPromptGood.m4a", function(error: Error, url: string) {
                assert(!error);
                assert.equal(url, "https://s3.amazonaws.com/bespoken/encoded/ContentPromoPromptGood-encoded.mp3");
                done();
            });
        });

        it("Tries to encode bad URL", function (done) {
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/xapp-alexa/UnitTestNotThere.mp3", function(error: Error, url: string) {
                assert(error);
                done();
            });
        });
    });

    describe("#encodeAndPublishFile()", function() {
        it("Encodes and Publishes a file", function (done) {
            this.timeout(10000);
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeFileAndPublish("test/resources/ContentPromoPrompt.m4a", function (error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken/encoded/ContentPromoPrompt-encoded.mp3");
                done();
            });
        });
    });
});

function doNotRun(test: any, done: Function): boolean {
    if (awsAccessKeyId === undefined || awsSecretAccessKey === undefined) {
        assert(false, "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set for these tests\n" +
            " OR AWS_SKIP_TESTS must be set to true.");
        return true;
    }
}
