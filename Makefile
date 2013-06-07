SOURCES = index.js lib/*.js
TESTS = test/*.test.js
#TESTS = test/umd-commonjs-amd.test.js

# ==============================================================================
# Node Tests
# ==============================================================================

MOCHA = ./node_modules/.bin/mocha

test: test-node
test-node:
	@NODE_PATH=.. \
	$(MOCHA) \
		--reporter spec \
		--require test/bootstrap/node $(TESTS)

# ==============================================================================
# Static Analysis
# ==============================================================================

JSHINT = jshint

hint: lint
lint:
	$(JSHINT) $(SOURCES)


.PHONY: test test-node hint lint
