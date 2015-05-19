function noop() {}

function fnWithOnlyReturn() {
  return true;
}

function fnWithNoReturnAndInnerFnWithReturn() {
  function innerFn() {
    return true;
  }

  innerFn();
}

function fnWithReturnAndInnerFnWithNoReturn() {
  function noop() {

  }

  noop();
  return true;
}


function fnWithReturnWithinIfBlock(val) {
  if(val) {
    return true;
  }
}

function fnWithNoReturnWithinIfBlock(val) {
  if(val) {
    var x = true;
  }
}

function fnWithReturnWithinWhileBlock() {
  while(true) {
    return true;
  }
}

function fnWithNoReturnWithinWhileBlock() {
  var x = true;
  while(x) {
    x = false;
  }
}

function fnWithReturnDeepWithinIfBlocks(val1, val2, val3, val4) {
  if(val1) {
    if(val2) {
      if(val3) {
        if(val4) {
          return true;
        }
      }
    }
  }
}
