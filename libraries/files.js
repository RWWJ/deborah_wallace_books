//
//        Files.js
//
//        File Handling Class and functions
//        Images, Json, Text, etc...
//
//  Written for use with reading/writing Images (Sprite Sheets), and Level Maps (Json), Text
//
//  Includes waiting for all files to finish loading
//
//  RWWJ 29 Dec 2021  Created Originaly for The Hike game
//  RWWJ 10 Mar 2022  Edited for more generic use and adding file lists of files functionality
//  RWWJ  9 Aug 2022  Added error handling to fileReadJson() so bad .json files don't fail silently
//  RWWJ 21 Aug 2022  Changed LocalStorage functions, to use LocalStoragePrefix global string variable IF it is defined
//  RWWJ 29 Aug 2022  Fixed fileReplaceExt() to handle filenames with NO extension
//  RWWJ 30 Aug 2022  Added clearLocalStorage()
//
//
//
//  NEEDS/REQURIES/USES:
//    Creates FileWaitingOnFiles global variable for keep tracking of pending file operations
//

var FileJsVersion = "1.7";


// Import all with this statement (NOTE: change the directory as appropriate)
//import {fileReplaceExt, fileFileOfImageTextFiles, loadNextImage, fileFileOfTextFiles, fileReadText, fileSaveText, fileSaveLargeText,
//        fileSaveJson, fileSaveCanvas, fileReadJson, fileNamePrompt, fileLoadImage, jsonFromLocalStorage, jsonToLocalStorage}
//        from "../Javascript-Libraries/Files-Module.js";


// export {fileReplaceExt, fileFileOfImageTextFiles, loadNextImage, fileFileOfTextFiles, fileReadText, fileSaveText, fileSaveLargeText,
//         fileSaveJson, fileSaveCanvas, fileReadJson, fileNamePrompt, fileLoadImage, jsonFromLocalStorage, jsonToLocalStorage };


//
//  Methods
//
// fileTestFileFunctions()
// fileReplaceExt( fileName, newExt )
// fileFileOfImageTextFiles( fileName, callback )
// loadNextImage( next, max, fileList, callback )
// fileFileOfTextFiles( fileName, callback )
// fileReadText( fileName, callback )
// fileReadTextPrompt( fileName, callback )
// fileSaveText( defaultFileName, text )
// fileSaveLargeText( defaultFileName, text )
// fileSaveJson( defaultFileName, jsonObj )
// fileSaveCanvas( defaultFileName, canvas )
// createImgElement( idSubtring )
// fileReadJson( fileName, callback )
// fileReadJsonPrompt( callback=null )
// fileNamePrompt( extensions=".json", callback=null )
// fileLoadImage( fileName, callback=null )
// fileLoadImageCore( fileName, callback )
// jsonFromLocalStorage( variableName )
// jsonToLocalStorage( variable, variableName )
// clearLocalStorage( variableName )



var FileWaitingOnFiles = 0;


//
// Test all the functions in File.js
//
function fileTestFileFunctions() {
    var textArea = "";
    var menuEntries = [
      {name:"Test One", action:()=>{
        textArea.value += "\nExecuted Test 1";
      }},

      {name:"Test cloneObj()", action:()=>{
        let then = new Date();
        let obj1 = {a:1,b:{z:7,x:0},c:[3,4,{y:5,t:9}]};
        let arr1 = [45, {a:then,b:{z:7,x:0},c:[3,4,{y:5,t:9}]}, 12];
        let obj2 = cloneObj(obj1);

        textArea.value = `obj1:  ${JSON.stringify(obj1)}\n`;
        textArea.value += `clone: ${JSON.stringify(obj2)}\n\n`;
        obj2.b.z = 666;
        textArea.value += `obj1:  ${JSON.stringify(obj1)}\n`;
        textArea.value += `edit: ${JSON.stringify(obj2)}\n\n`;

        textArea.value += `arr1:  ${JSON.stringify(arr1)}\n`;
        let dummyForDelay = document.querySelectorAll("button");
        console.log(dummyForDelay);
        let now = new Date();

        let arr2 = cloneObj(arr1);
        textArea.value += JSON.stringify(now) + "\n";
        textArea.value += `clone: ${JSON.stringify(arr2)}\n\n`;

        arr2[1].c[2].y = 888;
        arr2[2] = 222;
        textArea.value += `arr1:  ${JSON.stringify(arr1)}\n`;
        textArea.value += `edit: ${JSON.stringify(arr2)}\n\n`;
      }},

      {name:"Test: fileLoadImage()", action:()=>{
        fileLoadImage( "", resultObj => {
          resultObj.element.width = 400;
          resultObj.element.length = 400;
          // Can use the image URL as the source for an image element
          if( resultObj.image ) document.getElementById("ImageID").src = resultObj.image;
          // Or can use image element itself to draw on a canvas
          document.getElementById("CanvasID").getContext("2d").drawImage( resultObj.element, 0, 0, 300, 300 );

          textArea.value = "<" + resultObj.fileName + "> Image Element " + resultObj.element.id + ": " +
              resultObj.element.width +","+ resultObj.element.height;
        } );
      }},
      {name:"Test: saveCanvas()", action:()=>{
        let canvas = document.getElementById("CanvasID").getContext("2d");
        canvas.fillStyle = "yellow";
        canvas.fillRect( 50, 120, 200, 50 );
        canvas.fillStyle = "blue";
        canvas.fillRect( 150, 10, 15, 280 );
        fileSaveCanvas( "Some Canvas.png", canvas );
      }},

      {name:"Test: fileFileOfImageTextFiles()", action:()=>{
        let element = document.getElementById("TestAreaID");

        // We get a callback for every file loaded from the filelist in our specified file
        //
        fileFileOfImageTextFiles( "TestFiles/ImageList.txt", (results) => {
          // results is {image:imageElement, text:text}
          element.innerHTML += "<h1>NEXT FILE</h1>";
          if( results.text ) element.innerHTML += "<p>" + results.text + "</p>";
          else element.innerHTML += "<p> ERROR: FAILED TO LOAD TEXT</p>";
          if( results.image ) {
            results.image.style.maxWidth = "100px";
            results.image.style.maxHeight = "100px";
            element.appendChild(results.image);
          }
          else element.innerHTML += "<p> ERROR: FAILED TO LOAD IMAGE</p>";
        } );
      }},
      {name:"Test: fileFileOfTextFiles()", action:()=>{
        let element = document.getElementById("TestAreaID");

        // We get a callback for every file loaded from the filelist in our specified file
        //
        fileFileOfTextFiles( "TestFiles/FileList.txt", (textObj) => {
          if( textObj.fileName && textObj.text ) element.innerHTML += `<h1>NEXT FILE: ${textObj.fileName}</h1> <p>${textObj.text} </p>`;
          else if( textObj.fileName ) element.innerHTML += `<h1>NEXT FILE: ${textObj.fileName}</h1> ERROR: FAILED TO LOAD </p>`;
          else  element.innerHTML += "<h1>NEXT FILE</h1> <p> ERROR: FAILED TO LOAD </p>";
        } );
      }},
      {name:"Test: fileReadText()", action:()=>{
        fileReadText( "TestFiles/FileList.txt", result => {
        // fileReadText( "https://icanhazdadjoke.com/", result => {
       // fileReadText( "https://jsonplaceholder.typicode.com/todos/1", result => {
          textArea.value = "<" + result.fileName + "> Contents: " + result.text;
        } );
      }},
      {name:"Test: fileReadTextPrompt()", action:()=>{
        fileReadTextPrompt( result => {
          textArea.value = "<" + result.fileName + "> Contents: " + result.text;
        } );
      }},
      {name:"Test: fileSaveText()", action:()=>{
        fileSaveText( "Test - fileSaveText.txt", `
          If you ever go back into Wooly Swamp son you better not go at night
          There's things out there in the middle of them woods
          That'd make a strong man die from fright
          There's things that crawl and things that fly
          And things that creep around on the ground
          And they say the ghost of Lucias Clay gets up and it walks around.
        `);
      }},
      {name:"Test: fileSaveLargeText()", action:()=>{
        fileSaveLargeText( "Test - fileSaveLargeText.txt", `
          Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty,
          and dedicated to the proposition that all men are created equal.

          Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated,
          can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field,
          as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting
          and proper that we should do this.

          But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men,
          living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note,
          nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather,
          to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us
          to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that
          cause for which they gave the last full measure of devotion -- that we here highly resolve that these dead shall not have died in vain --
          that this nation, under God, shall have a new birth of freedom -- and that government of the people, by the people, for the people,
          shall not perish from the earth.

          Abraham Lincoln
          November 19, 1863
        `);
      }},
      {name:"Test: fileSaveJson()", action:()=>{
        fileSaveJson( "Test - fileSaveJson.json", {title:"Test",name:"fileSaveJson()",stuff:[1,2,3]} );
      }},
      {name:"Test: fileReadJson()", action:()=>{
        // fileReadJson( "TestFiles/Test - fileSaveJson.json", resultObj => {
        //   textArea.value = `<${resultObj.fileName}> Title: ${resultObj.jsonObj.title} Name: ${resultObj.jsonObj.name} Stuff: ${resultObj.jsonObj.stuff}`;
        //   textArea.value += "\n\n<" + resultObj.fileName + "> Contents: " + JSON.stringify(resultObj.jsonObj);
        // fileReadJson( "https://icanhazdadjoke.com/", resultObj => {
        //   textArea.value = `<${resultObj.fileName}> Joke: ${resultObj.jsonObj.joke}`;
        // fileReadJson( "https://jsonplaceholder.typicode.com/todos/1", resultObj => {
        //   textArea.value = `<${resultObj.fileName}> Title: ${resultObj.jsonObj.title}`;
        fileReadJson( "https://www.themealdb.com/api/json/v1/1/random.php", resultObj => {
          textArea.value = `<${resultObj.fileName}> Recipe for: ${resultObj.jsonObj.meals[0].strMeal}`;
          document.getElementById("ImageID").src = resultObj.jsonObj.meals[0].strMealThumb;
        } );
      }},
      {name:"Test: fileReadJsonPrompt()", action:()=>{
        fileReadJsonPrompt( result => {
          textArea.value = "<" + result.fileName + "> Contents: " + JSON.stringify(result.jsonObj);
        } );
      }},
      {name:"Test: fileNamePrompt()", action:()=>{
        fileNamePrompt( "*.js,*.json", filename => {
          textArea.value = filename;
        } );
      }},
      {name:"Test: fileLoadImageCore()", action:()=>{
        fileLoadImage( "TestFiles/icon.png", resultObj => {
          // resultObj might be null if image file could not be loaded (not found etc...)
          if( resultObj ) {
            resultObj.element.width = 400;
            resultObj.element.length = 400;
            document.body.appendChild(resultObj.element);

            textArea.value = "<" + resultObj.fileName + "> Image Element " + resultObj.element.id + ": " + resultObj.element.width +","+ resultObj.element.height;
          }
          else textArea.value = 'ERROR fileTestFileFunctions(): fileLoadImageCore("icon.png") failed.';
        } );
      }},
      {name:"Test: fileLoadImage()", action:()=>{
        fileLoadImage( "", resultObj => {
          resultObj.element.width = 400;
          resultObj.element.length = 400;
          document.body.appendChild(resultObj.element);

          // Can use the image dataURL as the source for an image element
          if( resultObj.image ) document.getElementById("ImageID").src = resultObj.image;

          textArea.value = "<" + resultObj.fileName + "> Image Element " + resultObj.element.id + ": " + resultObj.element.width +","+ resultObj.element.height;
        } );
      }},
      {name:"Test: jsonToLocalStorage()", action:()=>{
        // Start clean (i.e. remove a possibly prevoiusly stored variable)
        removeFromLocalStorage( "FileTestStorage" );

        jsonToLocalStorage( "Something to say about jsonToLocalStorage()", "FileTestStorage" );
        textArea.value = "Run next text, jsonFromLocalStorage(), to verify this one";
      }},
      {name:"Test: jsonFromLocalStorage()", action:()=>{
        textArea.value = jsonFromLocalStorage( "FileTestStorage" );
      }},
      {name:"Test: removeFromLocalStorage()", action:()=>{
        removeFromLocalStorage( "FileTestStorage" );

        let value = jsonFromLocalStorage( "FileTestStorage" );
        textArea.value = "Remove " + (value ? "FAILED" : "SUCCEEDED");
      }},

    ];

    textArea = DialogActions( "File.js Test", menuEntries, 400, 0 );
}



//
// Return fileName with it's extension replaced with newExt
//
// newExt is a string like ".json", ".txt", ".png", etc...
//
function fileReplaceExt( fileName, newExt ) {
  // Handle filenames with NO extension
  if( fileName.lastIndexOf('.') == -1 ) return fileName + newExt;
  else return fileName.slice(0,fileName.lastIndexOf('.')) + newExt;
}



//
// Specified fileName contains a list of fileNames of matching image and text files
//
// Return an object to the callback, with the image and text, {image:imageElement, text:text}
//
// NOTE: If either file could not be read, it's respective value (image or text) will be null
//
function fileFileOfImageTextFiles( fileName, callback ) {
  var next;
  var fileNames = [];
  var nextFile;

  fileReadText( fileName, (textObj) => {
    // Make sure the file was successfully loaded
    if( textObj.text ) {
      fileNames = textObj.text.trim().split("\n");

      // Setup for some recursion, so we processor the list in list order, not an asynchronous order
      loadNextImage( 0, fileNames, callback );
    }
    else callback( {image:null, text:null} ); // Indicate we didn't/couldn't read anything
  } );
}

//
// Helper function for fileFileOfImageTextFiles()
//
function loadNextImage( next, fileList, callback ) {
  if( next < fileList.length ) {
    // First load the image from the filelist
    fileLoadImage( fileList[next], imageObj => {
      // imageObj might be null if image file could not be loaded (not found etc...)
      if( imageObj ) {
        // Then replace the .ext and read the text file with the same name as the image file
        fileReadText( imageObj.fileName.slice(0,imageObj.fileName.lastIndexOf('.'))+".txt", (textObj) => {
          // Finally, return both the imageElement and the text (if there was a text file)
          callback( {image:imageObj.element, text: (textObj ? textObj.text : null)} );

          // Recursion until we're done
          loadNextImage( ++next, fileList, callback );
        } );
      }
      else {
        callback( {image:null, text:null} ); // Indicate we didn't/couldn't read anything

        // Recursion until we're done
        loadNextImage( ++next, fileList, callback );
      }
    } );
  }
}



//
// Return an object with fileName and content (text) to the callback,
// i.e. {fileName:"",text:""}
//
// NOTE: If either file could not be read, their respective value will be null
//
function fileFileOfTextFiles( fileName, callback ) {
  var next;
  var fileNames = [];

  fileReadText( fileName, (textObj) => {
    // Make sure the file was successfully loaded
    if( textObj.text ) {
      fileNames = textObj.text.trim().split("\n");

      loadNextFile( 0, fileNames, callback );
    }
    else callback({fileName:null,text:null}); // Indicate we didn't/couldn't read anything
  } );
}

//
// Helper function for fileFileOfTextFiles()
//
function loadNextFile( next, fileList, callback ) {
  if( next < fileList.length ) {
    fileReadText( fileList[next], (textObj) => {
      callback( textObj );

      // Recursion until we're done
      loadNextFile( ++next, fileList, callback );
    } );
  }
}



//
// An object with fileName (or url) and text of file (url), is passed to the callback,
// i.e. callback({fileName:"",text:""})
//
// Takes either a url OR a fileName
//
function fileReadText( fileName, callback ) {
  let returnText = null;
  // Deal with some funky characters (smart quotes etc..) cut/pasted from MS Word docs
  let decoder = new TextDecoder("iso-8859-1");  // Fixes most but not all of MS Word funky characters

  // If we need to get a fileName from user, then use a tottally different function to prompt and read json
  if( !fileName )  fileReadTextPrompt( callback );
  else {
    ++FileWaitingOnFiles; // File operation about to be pending

//    fetch( fileName, {headers:{Accept:"text/plain"}} )
    fetch( fileName, {headers:{Accept:"text/plain; charset=ISO-8859-1"}} )
    .then( response => {
      let textStream = null;

//      if(response.ok) textStream = response.text(); // .status is in the range 200-299
      // Get an arrayBuffer so we can deal with funky characters (smart quotes, em-dash, etc..) cut/pasted from MS Word docs
      if(response.ok) textStream = response.arrayBuffer(); // .status is in the range 200-299
      else if(response.status==404)  console.log("WARNING: <"+fileName+"> not found. " + response.statusText);
      else  console.log("ERROR: Could not open file or url: <"+fileName+">" + response.statusText);

      return textStream;
    } )
    .then( data => {
      // TextDecoder to Deal with funky characters (smart quotes, em-dash, etc..) cut/pasted from MS Word docs
      // Standardize EOL (\n vs \r\n). And remove blank lines at file extremities
      if( data ) returnText = decoder.decode(data).replace(/\r\n/g,"\n").trim();
    } )
    .finally( () => {
      --FileWaitingOnFiles; // File operation no longer pending

      callback( {fileName:fileName,text:returnText} );  // Return the results
    } );
  }
}



//
// Shows a file dialog for user to select text file
// Reads the selected file
//
// Calls the specified callback, passing back an object with filename and text ({fileName:"",text:""})
//
// NOTE NOTE Use fileReadText("",) to get here!!!
//
function fileReadTextPrompt( callback=null ) {
  let inputFileElement = document.createElement( 'input' );
  let fileName = "";

  inputFileElement.type = 'file';
  inputFileElement.accept = ".txt, .json, text/*, text/html";

  // Wait for onchange (i.e. User selected a file)
  inputFileElement.onchange = (event) => {
    // NOTE Chrome seems to reuse it's event object, so we need to store .files[0].name for use inside fileReader.onload()
    fileName = event.target.files[0].name;

    event.target.files[0].text( )  // Get a promise for the text
    .then( text => {
      if( callback )  callback( {fileName:fileName,text:text.replace(/\r\n/g,"\n").trim()} );
    });
  };

  inputFileElement.click();  // Initiate the File dialog box
}



//
// Shows a file dialog for user to select text file name and folder
// Writes text to the selected file
//
// NO indication of failure, success, done writing or canceling by user
//
function fileSaveText( defaultFileName, text ) {
  // Create a <a> tag (hyperlink), with a dataURL, then "click() on it"
  var aElement = document.createElement( "a" );

  aElement.download = defaultFileName;  // The download attribute causes the browser to download instead of navigate

  // Create a dataURL out of our string, and set it as the hyperlink address
  // Force Windows EOL (\r\n vs \r)
  // NOTE: Need encodeURIComponent() to encode whitespace (and other special chars)
  //       Otherwise the invalid url can silently fail (no save dialog box will be shown)
  aElement.href = "data:text/plain," + encodeURIComponent(text.replace(/\n/g,"\r\n"));

  aElement.click( );  // Trigger the save dialog
}



//
// Shows a file dialog for user to select text file name and folder
// Writes text to the selected file
//
// NO indication of failure, success, done writing or canceling by user
//
function fileSaveLargeText( defaultFileName, text ) {
  let fileURL;
  let aElement = document.createElement( "a" );  // Create a <a> tag (hyperlink)

  aElement.download = defaultFileName;  // The download attribute causes the browser to download instead of navigate

  // Force Windows EOL (\r\n vs \r)
  // let fileData = new Blob( text );
  fileURL = URL.createObjectURL( new Blob([text.replace(/\n/g,"\r\n")]) );

  aElement.href = fileURL;

  aElement.click( );  // Trigger the save dialog

  URL.revokeObjectURL( fileURL );
}



//
// Shows a file dialog for user to select json file
// Writes json to the selected file
//
// NO indication of failure, success, done writing or canceling by user
//
function fileSaveJson( defaultFileName, jsonObj ) {
  var jsonString = JSON.stringify( jsonObj, null, "  " );  // The "" causes formating

  defaultFileName = fileReplaceExt( defaultFileName, ".json" );  // Force the .json file extension

  // Create a <a> tag (hyperlink), with a dataURL, then "click() on it"
  var aElement = document.createElement( "a" );

  // Create a dataURL out of our string, and set it as the hyperlink address
  // NOTE: Need encodeURIComponent() to encode whitespace (and other special chars)
  //     in any jsonObj attribute strings (like {"name":"Ray Wallace"})
  aElement.href = "data:application/json," + encodeURIComponent(jsonString);

  aElement.download = defaultFileName;  // The download attribute causes the browser to download instead of navigate

  aElement.click( );  // Trigger the save json dialog
}



//
// Shows a file dialog to user
// Writes image in canvas to the selected file
//
// NO indication of failure, success or canceling by user
//
// Accepts a default filename and either a <canvas> element or a <canvas> context
//
function fileSaveCanvas( defaultFileName, canvas ) {
  // If a canvas context was passed in, then get it's canvas element
  if( "canvas" in canvas )  canvas = canvas.canvas;

  canvas.toBlob( blob => {
    let linkElement = document.createElement( "a" );

    linkElement.download = defaultFileName;  // The download attribute causes the browser to download instead of navigate
    linkElement.href = URL.createObjectURL(blob);

    linkElement.click();  // Save as dialog box will let user save the data to a file
    URL.revokeObjectURL( linkElement.href ); // Remove connection to file blob, to allow garbage collection
  },"image/png" );  // Could use "image/png" (the default), "image/jpeg", "image/tiff", "image/bmp" or "image/gif"
}



//
// Support function
// Base code for creating <img> tag for functions that do "new Image()"
//
// idSubtring is added to the ID name, to make it reusable but unique. Image file name is perfect for this!!
//
// Returns image element (<img>)
//
function createImgElement( idSubtring ) {
  // Reusable ID
  var ImageID = "__Img_"+idSubtring+"ID";

  // Attempt to get the <img> that we may have previously created
  var imgElement = document.getElementById( ImageID );

  if( !imgElement ) {
   // Haven't previously created the <img>, so create it now and set it up
    imgElement = new Image();
    imgElement.id = ImageID;
  }

  return imgElement;
}



//
// The read json object is passed to the callback, i.e. callback(jsonObj)
//
// Calls the specified callback, passing back an object with filename (or url) and json obj ({fileName:"",jsonObj:""})
//
// Takes either a url OR a fileName
//
function fileReadJson( fileName, callback ) {
  var returnJson = {};  // Need to save the results for the .finally() clause, since it does NOT take parameters like .then() does

  // If we need to get a fileName from user, then use a tottally different function to prompt and read json
  if( !fileName )  fileReadJsonPrompt( callback );
  else {
    ++FileWaitingOnFiles; // File operation about to be pending

    fetch( fileName, {headers:{Accept:"application/json"}} )
    .then( response => {
      let jsonStream = null;

      if(response.ok) jsonStream = response.json(); // .status is in the range 200-299
      else if(response.status==404)  console.log("WARNING: <"+fileName+"> not found. " + response.statusText);
      else  console.log("ERROR: Could not open file or url: <"+fileName+">" + response.statusText);

      return jsonStream;
    } )
    .then( jsonObj => returnJson = jsonObj, error => {console.error("Bad .json file: "+error)} )  // Save json for .finally()
    .finally( () => {
      --FileWaitingOnFiles; // File operation no longer pending

      callback( {fileName:fileName,jsonObj:returnJson} );  // Return the results
    } );
  }
}



//
// Shows a file dialog for user to select json file
// Reads the selected file
//
// Calls the specified callback, passing back an object with filename and json text ({fileName:"",jsonObj:""})
//
// NOTE NOTE Use fileReadText("",) to get here!!!
//
function fileReadJsonPrompt( callback=null ) {
  let inputFileElement = document.createElement( 'input' );
  let fileName = "";

  inputFileElement.type = 'file';
  inputFileElement.accept = ".json";

  // Wait for onchange (i.e. User selected a file)
  inputFileElement.onchange = (event) => {
    // NOTE Chrome seems to reuse it's event object, so we need to store .files[0].name for use inside fileReader.onload()
    fileName = event.target.files[0].name;

    event.target.files[0].text( )  // Get a promise for the text
    .then( text => {
      if( callback )  callback( {fileName:fileName,jsonObj:JSON.parse(text)} );
    });
  };

  inputFileElement.click();  // Initiate the File dialog box
}



//
// Prompts user for a filename.
//
// Pass in comma seperated list of extensions or mime types (i.e. ".txt, .json, image/*, text/*")
//
// Return filename to callback
//
// NOTE Caller must prepend appropriate path (i.e. "Images/") if needed, as we can NOT get the path of selected filename
//
function fileNamePrompt( extensions=".*", callback=null ) {
  var inputFileElement = document.createElement( 'input' );

  inputFileElement.type = 'file';
  inputFileElement.accept = extensions;

  // Wait for onchange (i.e. User selected a file)
  inputFileElement.onchange = (event) => {
    if( callback )  callback( event.target.files[0].name );
  };

  inputFileElement.click();  // Initiate the File dialog box
}



//
// If empty fileName (""), then show a file open dialog box
// Reads the specified/selected file
//
// Return null to callback on error, otherwise return {fileName,element,image} object
//
function fileLoadImage( fileName, callback=null ) {
  // Prompt for fileName? Or go directly to core code?
  if( fileName ) fileLoadImageCore( fileName, callback );
  else {
    var inputFileElement = document.createElement( 'input' );

    inputFileElement.type = 'file';
    inputFileElement.accept = "image/png, image/*";

    inputFileElement.onchange = (event) => {  // Wait for our faked .click() below
      let fileName = event.target.files[0].name;
      let imageElement = createImgElement( fileName ); // NOTE: fileName is just for creating an ID

      // Create a URL refernce to the file blob (just a refernce, it is not the actual data like a dataURL)
      let objectURL = URL.createObjectURL( event.target.files[0] ); // Must be the whole file structure, not just fileName

      imageElement.onload = () => {
        URL.revokeObjectURL( objectURL );  // The file blob can not be garbage collected until we break the association with objectURL
        if( callback ) callback( {fileName:fileName, element:imageElement, image:objectURL} );
      };

      imageElement.src = objectURL;  // Trigger file load
    };

    // Initiate the File dialog box
    inputFileElement.click();
  }
}



//
// Just need to load the fileName into an <img> image element and pass the image element to the callback
//
// NOTE: Only get here fom fileLoadImage()
//
// Return null to callback on error, otherwise return {fileName,element,image:null} object
//
function fileLoadImageCore( fileName, callback ) {
    var imageElement = createImgElement( fileName ); // NOTE: fileName is just for the ID for the created reusable html <img> element

    // Add 1 any time we initiate a file read (img or json files)
    // Subtract 1 any time we finish reading a file
    ++FileWaitingOnFiles;

    imageElement.onload = () => {
      --FileWaitingOnFiles;

      callback( {fileName:fileName, element:imageElement,image:null} );
    };

    // Handle failure/errors
    imageElement.onerror = (event) => {
      --FileWaitingOnFiles;

      console.log("WARNING fileLoadImageCore(): FAILED to load <"+fileName+">: "+event.type);

      callback( null );
    };

    // Setting the .src will cause the image file to load asynchronousely
    imageElement.src = fileName;
}



//
// Remove a variable from localStorage (browser "internal" storage)
//
function removeFromLocalStorage( variableName ) {
  let prefix = (typeof LocalStoragePrefix != "undefined") ? LocalStoragePrefix + "_" : "RWWJ_";

  localStorage.removeItem(prefix + variableName);
}



//
// Read localStorage (browser "internal" storage) and return new object from stored json
//
function jsonFromLocalStorage( variableName ) {
  let prefix = (typeof LocalStoragePrefix != "undefined") ? LocalStoragePrefix + "_" : "RWWJ_";

  return JSON.parse(localStorage.getItem(prefix + variableName));
}



//
// Write variable contents to localStorage (browser "internal" storage) in json format
//
function jsonToLocalStorage( variable, variableName ) {
  let prefix = (typeof LocalStoragePrefix != "undefined") ? LocalStoragePrefix + "_" : "RWWJ_";
  var jsonStr = JSON.stringify( variable, null, "  " );

  localStorage.setItem(prefix + variableName, jsonStr);
}



//
// Either delete variable from localStorage, or clear ALL of localStorage
//
// NOTE: Clearing ALL localStorage, could effect other web pages/sites
//
function clearLocalStorage( variableName = null ) {
  let prefix = (typeof LocalStoragePrefix != "undefined") ? LocalStoragePrefix + "_" : "";

  if( variableName ) localStorage.removeItem(prefix + variableName);
  else localStorage.clear( );
}






//
