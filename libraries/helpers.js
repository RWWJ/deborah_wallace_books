//
//	        Helpers.js
//
//        Misc Helper Classes and functions
//
//  RWWJ  26 Dec 2021	Created
//
//  RWWJ   1 Apr 2022	Added fullscreenToggle()
//              			Version 1.1
//
//  RWWJ   2 Jul 2022  Fixed pageName() for Atom editor preview html, it seems to append a (second) .html extension
//                     Added decodeURI() to convert %20 back to a space (for html filenames with spaces, "Contact Us.html" et.al.)
//                     Fixed hostName() "." to "," conversion and eating last digit of IP. Remove port #
//			               Version 1.5
//
//  RWWJ  21 Jul 2022  Fixed capitalizeWords() (more like finished it, is was totaly not correct/working)
//                     Version 1.6
//
//  RWWJ  10 Aug 2022  Fixed infinite recursion in cloneObj() by adding check for hasOwnProperty()
//                     Version 1.7
//  RWWJ  15 Aug 2022  Removed redundant .replace(".html", "") in pageName()
//  RWWJ  31 Aug 2022  Added pathFromURL()
//                     Removed cloneObj_OLD()
//                     Fixed capitalizeWords()
//  RWWJ   4 Sep 2022  Fixed playSoundFileWebAudio(), playSoundFile(), playSoundFile2() to use fileName param and return sound element
//                     Version 1.8
//  RWWJ   5 Sep 2022  Added hash() function (I did not write it)
//
//


let HelpersJsVersion = "1.8";


// Import all with this statement (NOTE: change the directory as appropriate)
//import {fullscreenToggle, hostName, pageName, capitalizeWords, isCellPhone, cloneObj,
//        daysInMonth, loadScript, playSoundFile} from "../Javascript-Libraries/Helpers-Module.js";


// export {fullscreenToggle, pageName, hostName, capitalizeWords, isCellPhone, cloneObj, daysInMonth, loadScript, playSoundFile};


//        Functions
//
// fullscreenToggle( )
// hostName( )
// pageName( )
// capitalizeWords( str )
// isCellPhone( )
// cloneObj( src )
// daysInMonth( theDate = null )
// loadScript( jsFileName, callback = null )
// playSoundFileWebAudio( fileName, volume = 0.01 )
// playSoundFile( fileName, volume = 0.01 )
// playSoundFile2( fileName, volume = 0.01 )
// pathFromURL( url )
// hash( string )




//
//
// Toggle Fullscreen mode
//
function fullscreenToggle( ) {
  if( document.fullscreenElement )  document.exitFullscreen();  // Exit is done on the document
  else document.documentElement.requestFullscreen();            // Enter is done on an element, which the document is not. The <html> tag is however.
}



//
// Returns the webpage name, i.e. the URL, minus the, server, port, extension, anchors ("#pageMarker" et.al.) and search string ("?string" if any)
//
// So we return, for example, "index", "About", etc..
//
// Browsers load index.html if the URL does not have a file name, so this routine does as well
//
// Could use location.pathname() instead of .href(), but still need to .split("/"), so code is no shorter
//
function pageName( ) {
  // FIX: For Atom editor preview html, it seems to append a (second) .html extension
  return  decodeURI(location.href.split("/").slice(-1).toString().replace(".html", "").replace(".html", "").split("?")[0].split("#")[0] || "index");
}



//
// Returns the webpage host name, i.e. the URL, minus the, protocol, port, path, page name, and search string ("?" if any)
//
// So we return, for example, just "google.com", "RipsPics.com", etc..
//
function hostName( ) {
  // return location.href.split("/").slice(2,3).toString().replace("www.", "").split(".").slice(0,-1).toString();

  // Fixes the .'s in domain names and ip address being replaced by ,'s (i.e. amzon.com bacame amazon,com, http://127.0.0.1:59730/index.html, becoming 127,0,0)
  // Also was eating the last digit of the ip address
  // And remove port
  return location.hostname.replace( "www.", "" );
}



//
// Capitalize all words that start with a character (i.e. not with a # or symbol)
//
function capitalizeWords( str ) {
  return str.replace( /\b(\w)/g , match => match.toUpperCase() );
}



//
// RWWJ Check userAgent for word "Mobi" (i.e. Mobile) or "Phone"
//   Most phone browsers include Mobile but NOT Phone
//   Some iPhone browsers include Phone but NOT Mobile
//   Some versions of Opera include Mobi but NOT Mobile, so we just use Mobi for our search string
//
// Seems to be no good way to check for cell phone, but if I just want to run my test code on my phone...
//
function isCellPhone( ) {
  return (navigator.userAgent.indexOf("Mobi") > 0) || (navigator.userAgent.indexOf("Phone") > 0);
}



//
// Returns a copy of the objects (sub-objects are copied too, not just their references)
//
// Recursive
//
// NOTE: This is similar to the first routine I wrote, but is a variation on code from a video by Dave Gray
//       It is more concise and fixes a couple of bugs that my routine had
//       Among other modifications, I added code for dates and catching non-cloneable items (functions et.al.)
//
function cloneObj( src ) {
  let dst;

  // Basic type, not an array, not null (is the typeof "object") not a date and not an object
  if( typeof src != "object" || src == null )  dst = src;
  else if(src instanceof Date) {  // Handle Dates, I don't use them, but may as well cover it
    dst = new Date();
    dst.setTime(src.getTime());
  }
  else if( typeof src == "object" ) { // Handle arrays ([]) and "real" objects (i.e. {})
    let next;
    dst = Array.isArray(src) ? [] : {};

    for( next in src ) {
      if( src.hasOwnProperty(next) ) {
        dst[next] = cloneObj(src[next]);
      }
    }
  }
  else    console.error("ERROR cloneObj(): Unexpected data type"); // Can not clone functions, etc..

  return dst;
}



//
// Defaults to today, but can pass in value valid for the Date constructor
// i.e. dateString, dateObject, or milliseconds since January 1, 1970, 00:00:00 UTC
//
function daysInMonth( theDate = null ) {
  var dt;
  dt = theDate ? new Date(theDate) : new Date();

  // Specifying a day of 0 makes us go to the last day of the month previous to the specified one
  return new Date( dt.getFullYear(), dt.getMonth()+1, 0 ).getDate();
}



//
// Load a .js script file by injecting a <script> tag into the <head> of the dom
//
// Since it loads asynchronously, we can provide a callback if we need to know when variables and functions
// in the file are ready to be used
//
function loadScript( jsFileName, callback = null ) {
    var scriptElement = document.createElement("script");

    if( callBack ) scriptElement.onload = callback;	// The callback function can use the newly loaded .js file

    scriptElement.src = jsFileName;

    // Trigger the load by adding it to the <head>
    document.head.appendChild(jsScript);
}



// Play sound files (mp3, wav, etc..)
//
// NOTE Does NOT work for .mp3 nor .ogg
//    Does work for .wav, m4a
function playSoundFileWebAudio( soundFileName, volume = 0.01 ) {
  var buffer = null;
  var sndContext = new AudioContext();

  // soundFileName = "Sounds/aliencom.wav";  // Works
  // soundFileName = "Sounds/Dry Leaves Walking - RWWJ.m4a";  // Works
  // soundFileName = "Sounds/Charity Rag-BudShank-Saxophone.mp3"; // NOT working
  // soundFileName = "Sounds/kindland - PublicDomain - Dark_Rainy_Night(ambience).ogg"; // NOT working
  // soundFileName = "Sounds/natural_bound-ElectronicBackgroundMusic.mp3"; // NOT working

  fetch(soundFileName)
  .then( response => {
    if(response.ok) return response.arrayBuffer();
    else throw new Error("playSoundFileWebAudio() Could not open file: <"+soundFileName+">");
  })
  .then (data => {
    console.log("playSoundFile(): Array Data");
    console.log(data);
    return sndContext.decodeAudioData( data );
  })
  .then( decodedData => {
    var sourceNode = sndContext.createBufferSource( );
    buffer = decodedData;
    sourceNode.buffer = buffer;

    sourceNode.connect( sndContext.destination );

    sourceNode.start( 0 );
    sourceNode.stop( 2 ); // Play for 2 seconds
  })
  .catch( error => console.log(error)
  );

}



//
// Play sound files (mp3, wav, etc..)
//
// Returns the Sound Element, so caller can use .pause(), .play(), .volume, .muted, .loop
//
// Works with .wav, .mp3, .m4a
// Does NOT work with the .ogg file I have
//
function playSoundFile( fileName, volume = 0.01 ) {
  var sndElement = document.createElement( "audio" );

  // fileName = "Sounds/aliencom.wav";  // Works
  // fileName = "Sounds/Charity Rag-BudShank-Saxophone.mp3"; // Works
  // fileName = "Sounds/Dry Leaves Walking - RWWJ.m4a";  // Works
  // fileName = "Sounds/kindland - PublicDomain - Dark_Rainy_Night(ambience).ogg"; // NOT working


  // NOTE: 0.5 is supposedly half volume. I don't believe it!
  sndElement.volume = volume;

  // Can set .autoplay in place of .play()
  // sndElement.autoplay=true;

  sndElement.src = fileName;

  // NOTE: Instead, we could set .autoplay=true BEFORE setting .src above
  sndElement.play();
//  setTimeout(()=>sndElement.pause(),3000); // Play for 2 seconds

  // We can also pause the playback
  // Do NOT know how to auto-repeat (loop forever)
  // sndElement.pause();

  // We can also rewind the playback
  // sndElement.currentTime = 0;

  // Can mute it without changing the volume (that is, .volume=0 also mutes)
  // sndElement.muted = true;

  // We can loop forever
  // sndElement.loop = true;

  return sndElement;
}


//
// Play sound files (mp3, wav, etc..)
//
// Returns the Sound Element, so caller can use .pause(), .play(), .volume, .muted, .loop
//
// Works with .wav, .mp3, .m4a
// Does NOT work with the .ogg file I have
//
function playSoundFile2( fileName, volume = 0.01 ) {
  var sndElement;

  // fileName = "Sounds/aliencom.wav";  // Works
  // fileName = "Sounds/Charity Rag-BudShank-Saxophone.mp3"; // Works
  // fileName = "Sounds/Dry Leaves Walking - RWWJ.m4a";  // Works
  // fileName = "Sounds/kindland - PublicDomain - Dark_Rainy_Night(ambience).ogg"; // NOT working

  // Browser starts loading file imediatly, if a fileName is specified
  sndElement = new Audio( fileName );

  // NOTE: 0.5 is supposedly half volume. I don't believe it!
  sndElement.volume = volume;

  // Can set .autoplay in place of .play()
  sndElement.autoplay=true;

  // NOTE: Instead, we could set .autoplay=true
  // sndElement.play();
  // setTimeout(()=>sndElement.pause(),5000); // Play for 5 seconds

  // We can also pause the playback
  // sndElement.pause();

  // We can also rewind the playback
  // sndElement.currentTime = 0;

  // Can mute it without changing the volume (that is, .volume=0 also mutes)
  // sndElement.muted = true;

  // We can loop forever
  // sndElement.loop = true;

  return sndElement;
}



//
// e.g. "http://127.0.0.1:3000/Images/Chris_Hamons-PublicDomain-DungeonCrawl_ProjectUtumnoTileset-32x32.png"
//     becomes "Images/Chris_Hamons-PublicDomain-DungeonCrawl_ProjectUtumnoTileset-32x32.png"
//
function pathFromURL( url ) {
  let path = decodeURI( url );
  let foundAt = url.indexOf("://"); // See if there is a "http://" prefix

  // Ensure it is a url
  if( foundAt != -1 ) {
    path = path.slice( foundAt+3 );
    if( path.indexOf("/") != -1 ) {
     path = path.substring(path.indexOf("/")+1);
    }
  }

  return path;
}



//
//    Create a hash number from a string
//
//    RWWJ This function is verbatum (except name change from cyrb53() to hash()) from:
//        https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
//        "...cyrb53, a simple but high quality 53-bit hash. It's quite fast, provides very good* hash distribution"
//      You can read more of what Bryc says about it on StackOverflow.com by search for cyrb53 at:
//        https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
//
//    cyrb53 (c) 2018 bryc (github.com/bryc)
//    A fast and simple hash function with decent collision resistance.
//    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
//    Public domain. Attribution appreciated.
//
function hash( str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
}






//
