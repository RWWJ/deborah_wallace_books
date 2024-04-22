//
//     books.js
//
//
// 22 Apr 2024  Fixed displayNovels() to not fail if blurb txt file is missing (failed to fetch text)
//              v1.1
//



let BooksJsVersion = "1.1";



var BookListElement = document.querySelector(".BookList");


// // DEBUG
// function verifyAscii( string ) {
//   for( let index = 0; index < string.length; ++ index ) {
//     let ascii = string.charCodeAt(index)
//
//     if( ascii > 128 || (ascii < 20 && ascii != "\n".charCodeAt(0)) ) {
//       if( index < string.length-3 ) {
//         let ascii_2 = string.charCodeAt(index+1)
//         let ascii_3 = string.charCodeAt(index+2)
//
//         if( ascii == 239 && ascii_2 == 191 && ascii_3 == 189 ) {
//           console.log( `Char ${index} thru ${index+2} should be '`)
//
//           index += 2
//         }
//         else console.log( `Char ${index} is ${ascii} of: ${string[index-2]}${string[index-1]}${string[index]}${string[index+1]}${string[index+2]}`)
//       }
//       else console.log( `Char ${index} is ${ascii} of: ${string[index-2]}${string[index-1]}${string[index]}${string[index+1]}${string[index+2]}`)
//     }
//   }
// }



//
// Build a database of books as they are loaded
//  Sorting (?) by series and seriesNumber
//    books = [{series:"", number:0, title:"", amazon:"", image:"", tagline:"", genre:"", blurb:""}, {...}, ...]
//
// Also redraw the book database to the DOM each time another book finishes loading
// No need to wait for anything
//
function displayNovels( novelListFile ) {
//  let path = "../novels/";
  let path = BaseUrl + "novels/";  // NOTE The ../novels/ above was failing on github pages
  let books = [];
  let nextBook = 0;
  let newNovels = [];

  newNovels = fileReadText( novelListFile, content => {
    // Ensure we successfully read the file
    if( content.text ) {
      let fileList = content.text.split("\n");

      for( let nextFile of fileList ) {
        // Init books[] next entry with object defaults
        books[nextBook] = {file:path+nextFile, series:"", number:0, title:"", amazon:"", image:"", tagline:"", genre:"", blurb:""};
        // Default title, in case it is not specified (<title>) in the blurb file
        books[nextBook].title = nextFile.replace( ".txt", ""  ).replace( / - [bB]lurb/, ""  );
        // Use the temp title as the basis for the image filename
        books[nextBook].image = books[nextBook].title + ".jpg";

        ++nextBook;

        fileReadText( path + nextFile, content => {
          let lines;
          let nextLine = 0;
          let bookNum;
          let token;
          let tokenEnd;
          let value;

          // Ensure we successfully read the file
          if( content.text ) {
            lines = content.text.split("\n");

// // DEBUG
// verifyAscii( content.text )

            // Find the books[] entry for this file
            for( bookNum = 0; bookNum < books.length && books[bookNum].file != content.fileName; ++bookNum ) {}

            // Make sure we found the books entry
            if( bookNum < books.length ) {
              // Eat blank lines
              while( nextLine < lines.length && !lines[nextLine].trim() ) ++nextLine;

              // Process all the lines that start with "<" (<amzon>, <series>, etc...)
              while( lines[nextLine].startsWith("<") && nextLine < lines.length ) {
                tokenEnd = lines[nextLine].indexOf( ">" );
                if( tokenEnd != -1 ) {
                  token = lines[nextLine].slice( 1, tokenEnd ).toLowerCase();
                  value = lines[nextLine].slice( tokenEnd+1 ).trim();

                  if( token == "amazon" ) books[bookNum].amazon = value;
                  else if( token == "series" ) books[bookNum].series = value;
                  else if( token == "number" ) books[bookNum].number = parseInt(value);
                  else if( token == "title" ) books[bookNum].title = value;
                  else if( token == "genre" ) books[bookNum].genre = value;
                }
                ++nextLine;

                // Eat blank lines
                while( nextLine < lines.length && !lines[nextLine].trim() ) ++nextLine;
              }

              // Presume next line is a tagline
              books[bookNum].tagline = lines[nextLine++].trim();

              // Eat blank lines
              while( nextLine < lines.length && !lines[nextLine].trim() ) ++nextLine;

              // Collect all the blurb paragraphs
              books[bookNum].blurb = [];

              for( let nextPara = 0; nextLine < lines.length; ++nextPara ) {
                books[bookNum].blurb[nextPara] = "";

                // Grab the next paragraph (seperated by blank lines)
                while( nextLine < lines.length && lines[nextLine].trim() ) {
                  books[bookNum].blurb[nextPara] += lines[nextLine++] + "\n";
                }
                // Eat the blank line
                if( nextLine < lines.length ) ++nextLine;
              }


              addBooksToDOM( books );
            }
          }
        } );  // END OF fileReadText( "./novels/" + nextFile, ... )

      } // END OF for( of fileList )

    } // END if(content.text)
    else {
      // Display some error info
      books[0] = {series:"ERROR", number:0, title:novelListFile, amazon:"", image:"", tagline:"", genre:"", blurb:"COULD NOT READ FILE"};
      addBooksToDOM( books );
    }
  } ); // END OF fileReadText( "novels.txt", ... )
}


//
// Walk the books data structure adding them to the DOM
//
// NOTE: We now have the psuedo series of .series:"Standalone Books" with no .number (just for grouping)
//
function addBooksToDOM( books ) {
  let nextBook;
  let seriesClass;
  let htmlContent = "";  // Build up the HTML here, then add it to the DOM all at once
  let currentSeriesName = "";
  let firstOfSeries = true;

  for( nextBook = 0; nextBook < books.length; ++nextBook ) {
    // Indent if it is part of a Series
    if( books[nextBook].series ) {
      seriesClass = "Series";
      if( books[nextBook].series != currentSeriesName ) {
        currentSeriesName = books[nextBook].series;
        firstOfSeries = true;
      }
      else firstOfSeries = false;
    }
    else seriesClass = "NoSeries";

    // Start the blurb
    htmlContent += `<div class="ColumnContent ">\n`;

    // Series name
    // Only display Series Name IF this IS a series and it is the first one
    if(books[nextBook].series && firstOfSeries ) {
      htmlContent += `<h1 class="SeriesName FirstOfSeries"> ${books[nextBook].series} </h1>\n`;
    }
    else htmlContent += `<h1 class="SeriesName"> ${books[nextBook].series} </h1>\n`;

    // Display book name
    htmlContent += `<h1 class="BookName ${seriesClass}"> ${books[nextBook].title}`;
    // Append series name & number if part of a Series
    if( books[nextBook].number ) htmlContent += `<sub> - ${books[nextBook].series} ${books[nextBook].number}</sub>`;
    // Append genre
    htmlContent += `<sup class="Genre"> (${books[nextBook].genre}) </sup>`;
    htmlContent += `</h1>\n`;

    // Amazon idString (i.e. B07X74WKS4)
    // AND cover image file
    // NOTE The ../novels was failing on github pages
    let path = BaseUrl + "novels/";
    // htmlContent += `<a class="${seriesClass}" target="_blank" href="https://www.amazon.com/dp/${books[nextBook].amazon}"> <img src="../novels/${+books[nextBook].image}">Available on Amazon</a>\n`;
    htmlContent += `<a class="${seriesClass}" target="_blank" href="https://www.amazon.com/dp/${books[nextBook].amazon}"> <img src="${BaseUrl}novels/${books[nextBook].image}">Available on Amazon</a>\n`;

    // Bold the tagline
    htmlContent += `<p class="${seriesClass}"><strong>${books[nextBook].tagline}</strong></p>\n`;

    // Output the blurb content paragraphs
    for( let nextPara = 0; nextPara < books[nextBook].blurb.length; ++nextPara ) {
      htmlContent += `<p class="${seriesClass}">${books[nextBook].blurb[nextPara]}</p>\n`;
    }

    // End the blurb
    htmlContent += `</div>\n`;
  }

  // Actually put it all in the DOM
  BookListElement.innerHTML = htmlContent;
}





//
