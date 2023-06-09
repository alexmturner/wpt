// Appends a list item with `innerHTML` to the document's 'list' element.
function log(innerHTML) {
  const li = document.createElement('li');
  li.innerHTML = innerHTML;
  document.getElementById('list').appendChild(li);
}

// Returns a string with the label and bounds of screen `s` for logging.
function screenLog(s) {
  return `'${s.label}': (${s.left},${s.top} ${s.width}x${s.height})`;
}

// Returns a string with the bounds of window `w` for logging.
function windowLog(w) {
  return `(${w.screenLeft},${w.screenTop} ${w.outerWidth}x${w.outerHeight})`;
}

// Appends a button with `innerHTML` to the document's `list` element.
// Waits for a test driver or manual click, and disables the button afterwards.
async function buttonClick(test, innerHTML) {
  const button = document.createElement('button');
  button.innerHTML = innerHTML;
  const li = document.createElement('li');
  li.appendChild(button)
  document.getElementById('list').appendChild(li);
  const click = new EventWatcher(test, button, ['click']).wait_for('click');
  try {  // Support manual testing where test_driver is not running.
    await test_driver.click(button);
  } catch {
  }
  await click;
  button.disabled = true;
}

// Grants `window-management` permission and caches `window.screenDetails`.
async function setUpWindowManagement(test) {
  assert_true(
    'getScreenDetails' in self && 'isExtended' in screen,
    `API not supported; use Chrome or Chromium (not content_shell)`);
  if (!screen.isExtended)
    log(`WARNING: Use multiple screens for full test coverage`);
  if (window.location.href.startsWith('file'))
    log(`WARNING: Run via 'wpt serve'; file URLs lack permission support`);

  try {  // Support manual testing where test_driver is not running.
    await test_driver.set_permission({ name: 'window-management' }, 'granted');
  } catch {
  }
  await buttonClick(test, 'Request screen details');
  window.screenDetails = await window.getScreenDetails();
  assert_true(!!window.screenDetails, 'Error getting screen details');
}

// Polls until `condition` is true, with the given `interval` and `duration`.
// Returns a promise that will be resolved on success or timeout.
async function poll(condition, interval = 100, duration = 3000) {
  const timeout = Date.now() + duration;
  const loop = async (resolve) => {
    if (condition() || Date.now() > timeout)
      resolve();
    else
      step_timeout(loop, interval, resolve);
  }
  return new Promise(loop);
}

// Open and return a popup on screen `s`, optionally asserting placement.
async function openPopupOnScreen(s, assertPlacement = true) {
  const left = s.availLeft + Math.floor(s.availWidth / 2) - 150;
  const top = s.availTop + Math.floor(s.availHeight / 2) - 50;
  const f = `left=${left},top=${top},width=300,height=100`;
  log(`Opening a popup with features '${f}' targeting ${screenLog(s)}`);
  // Window.open() synchronously returns a Window with estimated screenLeft|Top,
  // which may be clamped to the opener's screen or incompletely initialized.
  let p = window.open('/resources/blank.html', '', f);
  const initialBounds = windowLog(p);
  log(`<div style='margin-left: 40px'>Initial: ${initialBounds}</div>`);

  if (assertPlacement) {
    // Assert the popup is eventually placed at the expected location.
    // This may occur after window load, document ready and visible, etc.
    await poll(() => { return p.screenLeft == left && p.screenTop == top });
    p.document.write(`Requested: (${left},${top} 300x100) <br> \
        Initial: ${initialBounds} <br> \
        Resolved: ${windowLog(p)}`);
    log(`<div style='margin-left: 40px'>Resolved: ${windowLog(p)}</div>`);
    const context = `popup: ${windowLog(p)}, ${screenLog(s)}`;
    assert_equals(p.screenLeft, left, context);
    assert_equals(p.screenTop, top, context);
  }

  return p;
}

// Returns true if window `w` bounds are on screen `s` with error `e`.
function isWindowOnScreen(w, s, e = 100) {
  return (w.screenLeft >= s.left - e) && (w.screenTop >= s.top - e) &&
          (w.screenLeft + w.outerWidth <= s.left + s.width + e) &&
          (w.screenTop + w.outerHeight <= s.top + s.height + e);
}

// Asserts window `w` currentScreen matches screen `s`. Awaits pending changes,
// e.g. fullscreen promises may resolve before screen change: crbug.com/1330724.
async function assertWindowHasCurrentScreen(w, s) {
  log(`assertWindowHasCurrentScreen w: ${windowLog(w)} s: ${screenLog(s)}`);
  await poll(() => { return s === w.screenDetails.currentScreen; });
  assert_equals(screenLog(s), screenLog(w.screenDetails.currentScreen));
}

// Asserts window `w` bounds roughly match screen `s`. Awaits pending changes,
// e.g. fullscreen promises may resolve before bounds change: crbug.com/1330724.
async function assertWindowBoundsOnScreen(w, s) {
  log(`assertWindowBoundsOnScreen w: ${windowLog(w)} s: ${screenLog(s)}`);
  await poll(() => { return isWindowOnScreen(w, s); });
  assert_true(isWindowOnScreen(w, s), `${windowLog(w)} on ${screenLog(s)}`);
}

// Asserts window `w` bounds and currentScreen match screen `s`.
async function assertWindowOnScreen(w, s) {
  await assertWindowHasCurrentScreen(w, s);
  await assertWindowBoundsOnScreen(w, s);
}
