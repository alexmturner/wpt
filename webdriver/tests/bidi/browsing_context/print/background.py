import base64
import pytest

from tests.support.image import px_to_cm
from tests.support.pdf import assert_pdf


pytestmark = pytest.mark.asyncio


INLINE_BACKGROUND_RENDERING_TEST_CONTENT = """
<style>
:root {
    background-color: black;
}
</style>
"""

PAGE_WITH_BLACK_DOT_PNG = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAbFJREFUeF7t1cFtAmEQxWC2ZRqhFjqgMjZKrlEuzCAT6eP+j7W2njjO8zwvfpmBQ4DM/Q9YgNa/ALF/AQSoDcR8/wECxAZivAUIEBuI8RYgQGwgxluAALGBGG8BAsQGYrwFCBAbiPEWIEBsIMZbgACxgRhvAQLEBmK8BQgQG4jxFiBAbCDGW4AAsYEYbwECxAZivAUIEBuI8RYgQGwgxluAAL8NPB6Py/1+f4ua2+32lruvHv3IBXxLul6vr37Tn++O47g8n8/1u5ODAkzsLbwVYEHi5IQAE3sLbwVYkDg5IcDE3sJbARYkTk4IMLG38FaABYmTEwJM7C28FWBB4uSEABN7C28FWJA4OSHAxN7CWwEWJE5OCDCxt/BWgAWJkxMCTOwtvBVgQeLkhAATewtvBViQODkhwMTewtuPDLDwXf/mhABxKgEEiA3EeAsQIDYQ4y1AgNhAjLcAAWIDMd4CBIgNxHgLECA2EOMtQIDYQIy3AAFiAzHeAgSIDcR4CxAgNhDjLUCA2ECMtwABYgMx3gIEiA3EeAsQIDYQ4y1AgNhAjLcAAWIDMd4CBIgNxPgveGwI/9dm758AAAAASUVORK5CYII="
PAGE_WITH_WHITE_DOT_PNG = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAU1JREFUeF7t1cEJADAMw8B2/6Fd6BL3URYQSJjcbTsdM3ALwNx/cAGs/wJg/wUogDaA+f2AAmADGN8CCoANYHwLKAA2gPEtoADYAMa3gAJgAxjfAgqADWB8CygANoDxLaAA2ADGt4ACYAMY3wIKgA1gfAsoADaA8S2gANgAxreAAmADGN8CCoANYHwLKAA2gPEtoADYAMa3gAJgAxjfAgqADWB8CygANoDxLaAA2ADGt4ACYAMY3wIKgA1gfAsoADaA8S2gANgAxreAAmADGN8CCoANYHwLKAA2gPEtoADYAMa3gAJgAxjfAgqADWB8CygANoDxLaAA2ADGt4ACYAMY3wIKgA1gfAsoADaA8S2gANgAxreAAmADGN8CCoANYHwLKAA2gPEtoADYAMa3gAJgAxjfAgqADWB8CygANoDxLaAA2ADGt4ACYAMY/wDqB37wfELAlwAAAABJRU5ErkJggg=="


@pytest.mark.parametrize(
    "print_with_background, expected_image",
    [
        (None, PAGE_WITH_WHITE_DOT_PNG),
        (True, PAGE_WITH_BLACK_DOT_PNG),
        (False, PAGE_WITH_WHITE_DOT_PNG),
    ],
)
async def test_background(
    bidi_session,
    top_context,
    inline,
    compare_png_bidi,
    render_pdf_to_png_bidi,
    print_with_background,
    expected_image,
):
    page = inline(INLINE_BACKGROUND_RENDERING_TEST_CONTENT)
    await bidi_session.browsing_context.navigate(
        context=top_context["context"], url=page, wait="complete"
    )

    print_value = await bidi_session.browsing_context.print(
        context=top_context["context"],
        background=print_with_background,
        margin={
            "top": 0,
            "bottom": 0,
            "right": 0,
            "left": 0
        },
        page={
            "width": px_to_cm(96),
            "height": px_to_cm(96),
        },
    )

    assert_pdf(print_value)

    png = await render_pdf_to_png_bidi(print_value)
    comparison = await compare_png_bidi(png, base64.b64decode(expected_image))
    assert comparison.equal()
