function assertArray() {
    _validateArguments(2, arguments);
    var expected = nonCommentArg(1, 2, arguments);
    var actual = nonCommentArg(2, 2, arguments);
    var msg = commentArg(2, arguments) || "";
    var failureMsg = "expected " + (expected ? expected.toString() : "null") + 
        " but was " + (actual ? actual.toString() : "null");
    
	//assertEquals( msg + ".constructor", expected.constructor, actual.constructor );
	_assert("actual has no 'length' attribute", (actual.length != undefined && actual.length != null), failureMsg);
	_assert( msg + ".length", expected.length == actual.length, failureMsg);
	for(var i = 0; i < expected.length; i++) {
		var expItem = expected[i];
		if (expItem == null) {
			if (actual[i] != null)
				fail(msg + "[" + i + "]" + " expected is null but actual is " + actual[i]);
		} else if (expItem == undefined) {
			if (actual[i] != undefined)
				fail(msg + "[" + i + "]" + " expected is undefined but actual is " + actual[i]);
		} else if ((expItem) && (expItem.constructor == Array)) {
			assertArray( msg + "[" + i + "]", expItem, actual[i]);
		} else {
			_assert( msg + "[" + i + "]", expected[i] == actual[i], failureMsg);
		}
	}
}

function assertAttributes() {
    _validateArguments(2, arguments);
    var expected = nonCommentArg(1, 2, arguments);
    var actual = nonCommentArg(2, 2, arguments);
    var msg = commentArg(2, arguments) || "";

	for(var prop in expected) {
		var expectedValue = expected[prop];
		var actualValue = actual[prop];
		if (expectedValue.constructor == Array)
    		assertArray( msg + "." + prop, expectedValue, actualValue);
        else
    		assertEquals( msg + "." + prop + " unmatch", expectedValue, actualValue);
	}
}

function _element_identify_string(element) {
    if (!element)
        return "null element";
    return element.tagName + "[" + element.id + "]("+ element.className +")";
}

function assertElement() {
    _validateArguments(2, arguments);
    var expected = nonCommentArg(1, 2, arguments);
    var actual = nonCommentArg(2, 2, arguments);
    var msg = commentArg(2, arguments) || "";
    var failureMsg = "expected " + _element_identify_string(expected) + 
        " but was " + _element_identify_string(actual);
    _assert(msg, expected == actual, failureMsg);
}
