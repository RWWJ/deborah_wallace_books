//
//    main.js
//
//
// 22 Apr 2024  Added code in setPageTitle() to make the Banner bigger on the first page
//              V3.22.04.2024
//



const Version = "V3.22.04.2024";  // Last was "V3.10.09.2022"  // V.month.day.year

const FirstYear = "2021";


const MenuEntries = [
        {url:"index.html", button:"Home"},
        {url:"books.html", button:"Books"},
        {url:"about.html", button:"About"},
        {url:"contact_us.html", button:"Contact Us"},
        {url:"free_book.html", button:"FreeBook"},
        {url:"404.html", button:"404"}
      ];

var ContentElement = document.querySelector(".MainContent");
var ActivePage = "";
let BaseUrl = "";


addMenu( );
setPageTitle( );  // Need addMenu() to set ActivePage first
updateCopyrightYear( );
setVersion( );

runPage( );


function addMenu( ) {
  let menusHtml = "";
  var menuElement = document.querySelector('nav');
  let pageUrl = pageName( ) + ".html";

  for( let menu of MenuEntries ) {
    // <a href="index.html" target="_self">Home</a>
    if( menu.url == pageUrl ) {
      ActivePage = menu.button;

      BaseUrl = window.location.pathname.replace(menu.url, ""); // This is part of a fix for github pages not dealing with relative paths correctly

      // Include Selected class
      // NOTE: No menu for 404.html (File Not Found)
      if( menu.button != "404" ) menusHtml += `<a href="${menu.url}" class="Selected">${menu.button}</a>`;
    }
    // NOTE: No menu for 404.html (File Not Found)
    else if( menu.button != "404" ) menusHtml += `<a href="${menu.url}">${menu.button}</a>`;
  }

  menuElement.innerHTML = menusHtml;
}


function setPageTitle( ) {
  document.querySelector( "title" ).innerText = `${ActivePage} - Deborah Wallace Books`;

  // Debby wants the Banner bigger on the Home page (index.html)
  if( ActivePage == "Home" ) document.querySelector(".Banner").classList.add( "HomePage" );
}


function updateCopyrightYear( ) {
  document.getElementById("CopyrightYearID").innerText = `${FirstYear}-${new Date().getFullYear()}`;
}


function setVersion( ) {
  document.getElementById( "VersionID" ).innerText = Version;
}


function runPage( ) {
  // ALL PAGES
  mouseHandler();
  keyboardHandler();

  // SPECIFIC PAGE
  if( ActivePage == "Home" ) {
    displayNovels( "novels_new.txt" );
  }
  else if( ActivePage == "Books" ) {
    displayNovels( "novels.txt" );
  }
  else if( ActivePage == "About" ) {

  }
  else if( ActivePage == "Contact Us" ) {

  }
  else if( ActivePage == "FreeBook" ) {

  }
  else if( ActivePage == "404" ) {

  }
  else {
    ContentElement.innerHTML += `NO CONTENT FOR [${ActivePage}].`;
  }
}


function mouseHandler() {

  // No longer using this, worked great tho
  document.querySelector("header").onclick = event => {
    if( event.altKey ) {
      event.preventDefault();

      event.target.classList.toggle( "BackgroundAlternate" );
    }
  };
}


function keyboardHandler() {

}






//
