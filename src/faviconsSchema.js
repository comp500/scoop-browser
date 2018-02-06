/*
	This code copied from @meltwater/fetch-favicon
	Copyright (c) 2016 geneconnolly <gene.connolly@meltwater.com>
*/

module.exports = {
	selectors: [
	  'link[rel=apple-touch-icon-precomposed][href]',
	  'link[rel=apple-touch-icon][href]',
	  'link[rel="shortcut icon"][href]',
		'link[rel=icon][href]'
//	  'meta[name=msapplication-TileImage][content]',
//	  'meta[name=twitter\\:image][content]',
//	  'meta[property=og\\:image][content]'
	],
  
	predicates: [
	  (f, s) => f.name === 'apple-touch-icon-precomposed' && f.size >= s,
	  (f, s) => f.name === 'apple-touch-icon' && f.size >= s,
	  (f, s) => f.name === 'twitter:image' && f.size >= s,
	  (f, s) => f.name === 'shortcut icon' && f.size >= s,
	  (f, s) => f.name === 'icon' && f.size >= s,
	  (f, s) => f.name === 'og:image' && f.size >= s,
	  (f, s) => f.name === 'msapplication-TileImage' && f.size >= s,
  
	  (f, s) => f.name === 'apple-touch-icon-precomposed',
	  (f, s) => f.name === 'apple-touch-icon',
	  (f, s) => f.name === 'twitter:image',
	  (f, s) => f.name === 'shortcut icon',
	  (f, s) => f.name === 'icon',
	  (f, s) => f.name === 'og:image',
	  (f, s) => f.name === 'msapplication-TileImage',
	  (f, s) => f.name === 'favicon.ico'
	]
  }