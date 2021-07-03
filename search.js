class Search 
{
  constructor()
  {
    
  }

  display(main)
  {
    let me = this;

    let predefinedHtml = `<b class="predifinedElement" id="Q720">Gengis Khan</b>
                          <b class="predifinedElement" id="Q151869">Carlos Bonaparte</b>
                          <b class="predifinedElement" id="Q346">Louis IX of France</b>
                          <b class="predifinedElement" id="Q346"></b>
                          <b class="predifinedElement" id="Q346"></b>`;

    let searchDivContent = `<div id="register_search">${Dictionary.get("PREDIFINED_ELEMENT")} : ${predefinedHtml}</div>
      <label for="searchText">${Dictionary.get("SEARCH")} :</label>
      <input type="text" id="searchText" name="searchText" />
      <button id="searchOk">Ok</button>
      <div id="searchResults"></div>
      <div id="loadingBar"><h3>${Dictionary.get("LOADING")}</h3></div>
      <div id="textNbElements"></div>
      <label for="enableDateFilter">${Dictionary.get("ENABLE_FILTER_DATE")} :</label><input type="checkbox" id="enableDateFilter">`;

    $("#searchDiv").html(searchDivContent);

    $("#searchOk").click(function() 
    {
      me.search(main, $("#searchText").val());
    });

    $(".predifinedElement").click(function(e)
    {
      //alert(e.currentTarget.id);
      let uri = e.currentTarget.id;
      $("#loadingBar").css("display", "block");
      
      main.reloadData(uri);
    });
  }

  /**
   * Search from a text value
   * @param {String}           searchValue          The target search value
   * @param {Function}         callback             Callback with search result in params
   */
  search(main, searchValue, callback)
  {
    let me = this;

    $("#loadingBar").css("display", "block");

    let queryUrl = `https://tools.wmflabs.org/openrefine-wikidata/en/api?query={"query":"${searchValue}","limit":10,"type" : "Q5"}`; 

    me.launchQuery(queryUrl, function(data)
    {
      $("#loadingBar").css("display", "none");

      let htmlContent = "";
      for(let i = 0; i < data.result.length; i++)
      {
        htmlContent += `<div class='searchResultsLine' uri='${data.result[i].id}' label='${data.result[i].name}'><b>${data.result[i].name}</b><br/></div>`;
      }

      $("#searchResults").html(htmlContent);

      $('.searchResultsLine').click(function()
      {
        let uri = $(this).attr("uri");
        let label = $(this).attr("label");

        $("#searchResults").html("");

        main.reloadData(uri);
      });
    });
  }

  /**
   * Launch the query
   * @param {String}           queryURL          The URL
   * @param {Function}         callback          The callback
   */
  launchQuery(queryURL, callback)
  {
    let ajaxRequest = $.ajax({
      type: "GET",
      url:queryURL,
      dataType: 'json'
    });

    var timeBefore = new Date().getTime();
    

    ajaxRequest.fail(function(error)
    {
      $("#loadingBar").css("display", "none");
      alert(Dictionary.get("SEARCH_FAIL"))
    });

    // Send request
    ajaxRequest.done(function(data)
    {
      callback(data);
    });
  }
}