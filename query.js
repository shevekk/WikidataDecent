class Query 
{
  /*
   * Map class
   * @property {string}                         endPoint                        End point url
   */
  constructor()
  {
    this.endPoint = "https://query.wikidata.org/sparql";
    this.nbResult = 0;
    this.nbResultWithCoords = 0;
    this.nbResultWithDate = 0;

    this.minYearDate = 0;
    this.maxYearDate = 0;
  }

  /*
   * Launch a query
   * @param {string}                         wikidataElement                 Wikidata element 
   * @param {function}                       callback                        The callback function
   */
  launch(wikidataElement, callback)
  {
    let me = this;

    // Query for get numbers of elements
    let queryCount = `SELECT (COUNT(?item) as ?nbElement) 
      WHERE
      {
        SERVICE gas:service {
          gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
                      gas:in wd:${wikidataElement};
                      gas:out ?item ;
                      gas:out1 ?generation ;
                      gas:linkType wdt:P40 .
        }
        SERVICE wikibase:label {bd:serviceParam wikibase:language "fr" }
      }`;

    let queryURL = me.endPoint + "?" + "query="+encodeURIComponent(queryCount) + "&format=json";

    let ajaxRequest = $.ajax({
      method: "GET",
      url:queryURL
    });
    
    // Request fails
    ajaxRequest.fail(function(error)
    {
      //console.log("Query : " + query);

      console.log("Query : " + queryCount);

      var distance = new Date().getTime() - timeBefore;
      var seconds = Math.floor(distance / 1000);

      if(seconds > 29)
      {
        alert(Dictionary.get("QUERY_LOADIND_TOO_LONG"))
      }
      else
      {
        alert(Dictionary.get("QUERY_FAIL"));
        
        let ajaxRequest = $.ajax({
          url:"log/log.php",
          dataType: 'json',
          method: "POST",
          data: { wikidataElement: wikidataElement, lang: "", nbResult : 0, nbResultWithCoords : 0, nbResultWithDate : 0, state: "Fail" }
        });
      }

      $("#loadingBar").css("display", "none");
    });

    // Send request and creta result element
    ajaxRequest.done(function(data)
    {
      me.nbResult = data.results.bindings[0]["nbElement"]["value"];

      // Query for get 
      let query = `SELECT ?item ?itemLabel ?place ?placeLabel ?coords (MIN(?birthDates) as ?birthDate) (MIN(?deathDates) as ?deathDate)
        WHERE
        {
          ?item wdt:P19 ?place .
          ?place wdt:P625 ?coords .
          OPTIONAL {?item wdt:P569 ?birthDates}
          OPTIONAL {?item wdt:P570 ?deathDates}
          SERVICE gas:service {
            gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
                        gas:in wd:${wikidataElement};
                        gas:out ?item ;
                        gas:out1 ?generation ;
                        gas:linkType wdt:P40 .
          }
          SERVICE wikibase:label {bd:serviceParam wikibase:language "[AUTO_LANGUAGE],fr,en" }
        }
        GROUP BY ?item ?itemLabel ?place ?placeLabel ?coords`;
      let queryURL = me.endPoint + "?" + "query="+encodeURIComponent(query) + "&format=json";

      let ajaxRequest = $.ajax({
        method: "GET",
        url:queryURL
      });
      
      // Request fails
      var timeBefore = new Date().getTime();
      ajaxRequest.fail(function(error)
      {
        console.log("Query : " + query);

        var distance = new Date().getTime() - timeBefore;
        var seconds = Math.floor(distance / 1000);

        if(seconds > 29)
        {
          alert(Dictionary.get("QUERY_LOADIND_TOO_LONG"))
        }
        else
        {
          alert(Dictionary.get("QUERY_FAIL"));
          
          let ajaxRequest = $.ajax({
            url:"log/log.php",
            dataType: 'json',
            method: "POST",
            data: { wikidataElement: wikidataElement, lang: "", nbResult : 0, nbResultWithCoords : 0, nbResultWithDate : 0, state: "Fail" }
          });
        }

        $("#loadingBar").css("display", "none");
      });

      // Send request and creta result element
      ajaxRequest.done(function(data)
      {
        let resultElement = [];

        //me.nbResult = data.results.bindings.length;
        me.nbResultWithCoords = 0;
        me.nbResultWithDate = 0;
        
        for(let i = 0; i < data.results.bindings.length; i++)
        {
          if(data.results.bindings[i].coords.value)
          {
            me.nbResultWithCoords ++;
            resultElement.push(new Element(data.results.bindings[i]));

            if(resultElement[resultElement.length - 1].birthDate)
            {
              me.nbResultWithDate ++;
            }
          }
        }

        me.getMinMaxDates(resultElement);

        callback(resultElement);
      });
    });
  }

  /**
   *
   */
  getMinMaxDates(resultElement)
  {
    this.minYearDate = 10000;
    this.maxYearDate = -10000;
    for(let i = 0; i < resultElement.length; i++)
    {
      if(resultElement[i].birthDate)
      {
        let minYear = parseInt(resultElement[i].birthDate.split("-")[0]);
        if(minYear < this.minYearDate)
        {
          this.minYearDate = minYear;
        }
      }

      if(resultElement[i].deathDate)
      {
        let maxYear = parseInt(resultElement[i].deathDate.split("-")[0]);
        if(maxYear > this.maxYearDate)
        {
          this.maxYearDate = maxYear;
        }
      }
    }
  }
}