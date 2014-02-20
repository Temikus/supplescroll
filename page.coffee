
# set hrefs to the page
text_href = '#main-text'
toc_href = '#table-of-contents'
figlist_href = '#figure-list'

# responsive web settings
two_column_width = 1200
one_columnn_width = 480

# declare module variables
text = null
text_width = null
toc = null
figlist = null


# resize callback for the window
resize_window = () ->
  window_width = $(window).width()

  if window_width <= one_columnn_width
    toc.css('display','none')
    figlist.css('display','none')

    supplescroll.set_left(text, 0)
    supplescroll.set_outer_width(text, window_width)

  else if window_width <= two_column_width
    toc.css('display','none')
    figlist.css('display','block')

    half_window_width = Math.round(window_width/2)
    supplescroll.set_left(text, 0)
    supplescroll.set_outer_width(text, half_window_width)

    figlist_width = window_width - half_window_width
    supplescroll.set_left(figlist, half_window_width)
    supplescroll.set_outer_width(figlist, figlist_width)

  else # three columns
    toc.css('display','block')
    figlist.css('display','block')

    # this function allows for some padding in the 
    # body to be filter through the resize function
    body_padding_left = parseInt($(document.body).css('padding-left'))
    body_padding_right = parseInt($(document.body).css('padding-right'))

    supplescroll.set_outer_width(text, text_width)
    supplescroll.set_left(toc, body_padding_left)

    left = supplescroll.get_right(toc)
    supplescroll.set_left(text, left)

    left = supplescroll.get_right(text)
    supplescroll.set_left(figlist, left)

    figlist_width = \
        window_width \
        - body_padding_left \
        - body_padding_right \
        - supplescroll.get_outer_width(toc) \
        - supplescroll.get_outer_width(text)
    supplescroll.set_outer_width(figlist, figlist_width)

  if window_width >= one_columnn_width
    for img_dom in $('img')
      img_elem = $(img_dom)
      parent_width = figlist_width - supplescroll.get_spacing_width(img_elem.parent())
      make_resize_fn = (img_dom, parent_width) ->
          () -> supplescroll.resize_img_dom(img_dom, parent_width)
      resize_fn = make_resize_fn(img_dom, parent_width)
      resize_fn(img_dom, parent_width)
      if init == true
        # in case image has not been loaded yet!
        img_elem.load(resize_fn)


init = () ->
  text = $(text_href)
  toc = $(toc_href)
  figlist = $(figlist_href)
  # let's grab the text_width from the initial width
  # of the element so that we can use it later
  text_width = supplescroll.get_outer_width(text)

  supplescroll.init_touchscroll()
  supplescroll.build_page(toc_href, text_href, figlist_href)

  $(window).resize(resize_window)
  resize_window()


$(window).ready(init)


