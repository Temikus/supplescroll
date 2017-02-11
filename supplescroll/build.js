// supplescroll.js: make supplescroll from a markdown file

"use strict"

var path = require( "path" )
var fs = require( "fs-extra" )
var commonmark = require('commonmark');
var yamlFront = require('yaml-front-matter')
var mustache = require( "mustache" )
var cheerio = require( "cheerio" )
var _ = require("lodash")


let template =
`<html>
<head>
    <meta content="initial-scale=1.0" name="viewport"/>
    <title>{{ title }}</title>
    <script> window.is_rename = {{ is_rename }} </script>
</head>
<body>
    <div id="banner">{{ banner }}</div>
    {{{ content }}}
</body>
</html>`


function convertUnicodeCharsToHtml(str) {
    let strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    let result = '';
    let i = 0;
    while (i < strLength) {
        let c = str.charCodeAt(i);
        if (c <= 127) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++
    }
    return result;
}


function convertCommonmarkToHtml(text) {
    let reader = new commonmark.Parser();
    let writer = new commonmark.HtmlRenderer();
    let parsed = reader.parse(text);
    return convertUnicodeCharsToHtml(writer.render(parsed));
}


function convertMarkdownToHtml( markdownText ) {
    let page = {
        'banner': '',
        'is_rename': true,
        'title': ''
    }
    _.assign( page, yamlFront.loadFront( markdownText, 'content' ) );
    page.content = convertCommonmarkToHtml( page.content );
    return mustache.render( template, page );
}


function insertIncludes( html, theme ) {
    let $ = cheerio.load( html )

    let root = $.root()

    let body = $( 'body' )
    if ( body.length == 0 ) {
        body = root
    }

    let head = $( 'head' )
    if ( head.length == 0 ) {
        head = root
    }

    if ( $( 'link[href="supplescroll.css"]').length == 0 ) {
        head.append( 
            `<link href="supplescroll.css" rel="stylesheet"/>` )
    }

    let theme_css = `${theme}.css`
    if ( $( `link[href="${theme}.css"]`).length == 0 ) {
        head.append( 
            `<link href="${theme}.css" rel="stylesheet"/>` )
    }

    if ( $( `script[src="supplescroll.min.js"]`).length == 0 ) {
        body.append( `<script src="supplescroll.min.js"></script>` )
    }

    return $.html()
}


function processFile( fname, theme, outFname ) {
    let outDir = path.dirname( outFname )

    let html = fs.readFileSync( fname )
        .toString()

    if ( path.extname( fname )
        .toLowerCase() == '.md' ) {
        html = convertMarkdownToHtml( html )
    }

    html = insertIncludes( html, theme )
    fs.writeFile( outFname, html )

    console.log( `${outFname}` )

    let bases = [
        'supplescroll.min.js',
        'supplescroll.css',
        theme + '.css'
    ]
    for ( let base of bases ) {
        let inFname = path.join( __dirname, base )
        let outFname = path.join( outDir, base )
        fs.copy( inFname, outFname )
        console.log( ` - ${inFname} -> ${outFname}` )
    }
}


module.exports = { processFile }



