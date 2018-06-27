// Copyright 2009 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

(function () {
  var VanillaLargeDBCompact = new BenchmarkSuite('VanillaLargeDBCompact', 814.65,
    'third_party/todomvc/vanilla-idb/index.html?open=0',
    new Benchmark("VanillaLargeDBCompact", [Setup, OpenDatabase])
  );
  BenchmarkSuite.suites.push(VanillaLargeDBCompact);

  async function Setup(iframe) {
    let thisIframe = iframe;

    // Delete and recreate a populated database, then close the DB.
    await thisIframe.contentWindow.todo.storage.deleteDatabase();
    await thisIframe.contentWindow.todo.storage.open({
      populated: true
    }, function () {});
    thisIframe.contentWindow.todo.storage.closeDatabase();

    // Navigate away from the page and wait for the backing store to
    // close.
    await BenchmarkSuite.Navigate('third_party/todomvc/vanilla-idb/index.html?open=0', async function (iframe) {
      thisIframe = iframe;
      await waitForIndexedDBShutdown();
      await pageLoaded(thisIframe);
    });

    // Open the DB so that compaction can begin.
    await thisIframe.contentWindow.todo.storage.open({
      populated: false
    }, function () {});
    await sleep(500);
    thisIframe.contentWindow.todo.storage.closeDatabase();

    // Navigate away from the page and wait for the backing store to
    // close.
    await BenchmarkSuite.Navigate('third_party/todomvc/vanilla-idb/index.html?open=0', async function (iframe) {
      thisIframe = iframe;
      await waitForIndexedDBShutdown();
      await pageLoaded(thisIframe);
    });

    // Do not count this step in the elapsed time.
    return false;
  }

  async function OpenDatabase(iframe) {
    await iframe.contentWindow.todo.storage.open({
      populated: false
    }, function () {});
  }
})();