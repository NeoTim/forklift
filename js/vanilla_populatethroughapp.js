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
  Benchmark.Add(new Benchmark('VanillaPopulateThroughApp', 975.21,
    'third_party/todomvc/vanilla-idb/index.html?open=0',
    [new BenchmarkStep(Setup),
     new BenchmarkStep(OpenDatabase)],
  ));

  // Configuration.
  const numberOfItemsToAdd = 100;

  async function Setup(iframe) {
    await iframe.contentWindow.todo.storage.deleteDatabase();
    await iframe.contentWindow.todo.storage.open({
      populated: false
    }, function () {});

    let newTodo = iframe.contentDocument.querySelector('.new-todo');
    let todoList = iframe.contentDocument.querySelector('.todo-list');
    if (!todoList) {
      throw new DOMException('missing .todo-list');
    }
    if (todoList.children.length > 0) {
      throw new DOMException('expected 0 children');
    }

    let numberOfItemsAdded = 0;
    while (todoList.children.length < numberOfItemsToAdd) {
      if (numberOfItemsAdded !== numberOfItemsToAdd && todoList.children.length === numberOfItemsAdded) {
        // Add the next item.
        newTodo.value = `Something to do ${numberOfItemsAdded}`;
        newTodo.dispatchEvent(new Event('change'));
        sendEnterKeypress(newTodo);
        numberOfItemsAdded++;
      }
      // We're either waiting for the item we added in a
      // previous call or waiting for the item we just added.
      await waitForRequestAnimationFrame();
    }

    iframe.contentWindow.todo.storage.closeDatabase();

    await Benchmark.Navigate('third_party/todomvc/vanilla-idb/index.html?open=0', async function (iframe) {
      await pageLoaded(iframe);
      await waitForIndexedDBShutdown();
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
