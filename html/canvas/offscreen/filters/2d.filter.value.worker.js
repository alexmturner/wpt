// DO NOT EDIT! This test has been generated by /html/canvas/tools/gentest.py.
// OffscreenCanvas test in a worker:2d.filter.value
// Description:test if ctx.filter works correctly
// Note:

importScripts("/resources/testharness.js");
importScripts("/html/canvas/resources/canvas-tests.js");

var t = async_test("test if ctx.filter works correctly");
var t_pass = t.done.bind(t);
var t_fail = t.step_func(function(reason) {
    throw reason;
});
t.step(function() {

var canvas = new OffscreenCanvas(100, 50);
var ctx = canvas.getContext('2d');

_assert(ctx.filter == 'none', "ctx.filter == 'none'");
ctx.filter = 'blur(5px)';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.save();
ctx.filter = 'none';
_assert(ctx.filter == 'none', "ctx.filter == 'none'");
ctx.restore();
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");

ctx.filter = 'blur(10)';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.filter = 'blur 10px';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");

ctx.filter = 'inherit';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.filter = 'initial';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.filter = 'unset';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");

ctx.filter = '';
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.filter = null;
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");
ctx.filter = undefined;
_assert(ctx.filter == 'blur(5px)', "ctx.filter == 'blur(5px)'");

ctx.filter = 'blur(  5px)';
assert_equals(ctx.filter, 'blur(  5px)');
t.done();

});
done();